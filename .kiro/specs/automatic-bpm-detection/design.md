# Design — Automatic BPM Detection

> Planned M2 feature. This design follows the existing provider-boundary pattern
> (`waveformExtraction.*`, ADR-003), the single-store rule (ADR-001), the per-key persistence
> pipeline (ADR-013), the source/product capability split (ADR-015/ADR-017), and millisecond
> timestamps (ADR-009). It introduces no new global store and no new persistence engine.

## 1. Goals and non-goals

**Goals.** Analyse eligible local audio in the background; estimate tempo with confidence; locate the
first beat (anchor) and offer phrase-start assistance; let the user apply, decline, pick a
half/double alternative, set Count 1 at the playhead, nudge the anchor, and restore prior values;
cache raw analysis per song; keep applied grid values per draft/project; never block import/playback;
never silently overwrite manual edits; degrade gracefully where audio cannot be decoded.

**Non-goals.** Live tempo tracking, full tempo-map editing, audio modification, cloud analysis for
V1, auto-moving markers.

## 2. The four problems, kept separate

A recurring failure in tempo tooling is conflating these. The contract keeps them distinct so the UI
can express confidence independently and the user can override each one.

| Problem | Output field | Confidence | Can be applied automatically? |
|---|---|---|---|
| Tempo/BPM | `detectedBpm`, `bpmAlternatives`, `tempoModel` | tempo confidence | Only as a declinable suggestion |
| Beat phase (anchor) | `suggestedAnchorMs`, optional `detectedBeatTimes` | folded into tempo confidence | As a declinable suggestion |
| Downbeat / phrase start | `suggestedDownbeatMs` | **separate** downbeat confidence | No — user confirms or sets it |
| Manual correction | user action | n/a | Always available, always wins |

BPM alone never asserts Phrase 1. Downbeat has its own, lower-trust confidence and a mandatory manual
path.

## 3. Architecture overview

```text
 import commit ─▶ bpmAnalysisService (Analyzer, pure TS, single-flight queue)
                      │  reads Analysis_Capability from sourceResolver
                      │  reads/writes Analysis_Cache via analysisRepository (AsyncStorage)
                      ▼
          bpmAnalysis.ts  (default no-op provider)
          bpmAnalysis.web.ts  (Web Audio decode + downsample + detection, WASM/JS lib under eval)
          bpmAnalysis.ios.ts  (native Expo Module: AVAssetReader streaming + Accelerate)
                      ▲
                      │  Analysis_Result (immutable)
                      ▼
 useStudioStore (ADR-001): analysisByItem snapshot + applied-grid actions + restore snapshot
                      ▼
 grid consumers: danceCount.ts (anchor-aware), magneticSnapping.ts (anchor-aware),
                 RhythmicGrid, RowGutter, DanceCountDisplay, exportEngineCore
                      ▼
 UI: BpmSuggestionCard, AlternativesSheet, GridPreviewOverlay, SetCount1 + AnchorNudge controls
```

The Analyzer is **pure TypeScript** orchestration (no React, no store import) so it is unit-testable
and matches the `importPipeline`/`persistencePipeline` style. The Store subscribes to the Analyzer and
holds only a session projection plus authored applied-grid values.

## 4. Provider boundary

Mirror `src/services/waveformExtraction.*`.

```typescript
// src/services/bpmAnalysis.types.ts
export type TempoModel = 'constant' | 'variable';
export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface BpmAlternative {
  bpm: number;
  /** relative likelihood 0..1; half/double alternatives flagged for UI labelling */
  likelihood: number;
  relation: 'primary' | 'half' | 'double' | 'other';
}

export interface AnalysisResult {
  detectedBpm: number;
  confidence: number;          // tempo confidence 0..1
  confidenceBand: ConfidenceBand;
  tempoModel: TempoModel;
  bpmAlternatives: BpmAlternative[];
  suggestedAnchorMs: number;   // first usable beat
  detectedBeatTimes?: number[]; // optional; only if a consumer uses it (Req 3.2)
  suggestedDownbeatMs?: number;
  downbeatConfidence?: number; // separate from tempo confidence (Req 4.1)
  analyzerId: string;          // e.g. 'web-acf-v1' | 'ios-accelerate-v1'
  analyzerVersion: number;     // bump invalidates cached suggestions (Req 6.4)
  audioFingerprint: string;    // MusicItem.contentHash at analysis time
  analyzedAt: string;          // ISO
}

export interface AnalysisRequest {
  audioUri: string;
  audioFingerprint: string;
  minBpm?: number;  // default 40
  maxBpm?: number;  // default 220
  /** Time ranges to analyse (D-5). Omitted = provider default windows; short songs use the full file. */
  windows?: { startMs: number; durationMs: number; purpose: 'tempo' | 'anchor' | 'downbeat' }[];
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export interface BpmAnalysisProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult | null>; // null = unsupported platform
}
```

`bpmAnalysis.ts` returns `null` (unsupported), exactly like the default `waveformExtraction.ts`. Web
and iOS files provide real implementations. Metro resolves the platform file automatically.

## 5. The Analyzer (`bpmAnalysisService`)

A singleton orchestrator with a single-flight queue (one job at a time, Req 1.6), modelled on
`importPipeline`.

Responsibilities:

- `enqueue(musicItemId)` — fire-and-forget; checks Analysis_Cache validity first (fingerprint +
  analyzerVersion), checks `decodedAudioAnalysis` capability, skips if invalid reasons apply.
- Resolves the playable URI through `sourceResolver.resolveSource` and reads capabilities from
  `capabilitiesFor(item)`.
- Runs the platform provider with an `AbortController`; forwards progress.
- On success, writes the `AnalysisResult` to the Analysis_Cache **atomically** (only on completion,
  Req 7.2) and notifies subscribers; on cancel/failure, writes nothing.
- `cancel(musicItemId)`, `retry(musicItemId)`, `invalidate(musicItemId)`.
- Exposes `subscribe(listener)` emitting a map of `musicItemId -> AnalysisJobView` with status in
  `queued | running | success | unavailable | cancelled | failed` plus progress and the latest result.

The Analyzer never imports the store. A thin adapter (`src/features/analysis/bpmAnalysisBridge.ts`)
subscribes to the Analyzer and mirrors the job view into the store, exactly like
`subscribeImportJobs` → store mirror in `importPipeline.ts`.

## 6. Data model and ownership

This is the crux. Two homes, deliberately split.

### 6.1 Analysis_Cache — belongs to the Music Item (library layer)

Raw, song-intrinsic, reusable across projects. Stored in its own AsyncStorage key family (not inside
the library record, to avoid whole-record contention), one key per item:

```text
beatnote.analysis.v1.<musicItemId>
```

```typescript
// src/types/analysis.ts
export interface AnalysisCacheEntry {
  schemaVersion: 1;
  musicItemId: string;
  result: AnalysisResult;   // includes analyzerId/Version, audioFingerprint, analyzedAt
}
```

Validity rules (Req 6.4/6.5): an entry is valid iff
`result.audioFingerprint === musicItem.contentHash` **and**
`result.analyzerVersion === CURRENT_ANALYZER_VERSION`. Invalid entries are ignored for suggestions and
may be recomputed; they never touch applied values.

Reads/writes go through a new `analysisRepository.ts` that reuses `enqueueWrite` /
`persistencePipeline` with `family: 'analysis'` (a new `PersistenceKeyFamily`) so a read failure
blocks only analysis writes, consistent with ADR-013.

### 6.2 Applied_Grid — belongs to draft/project content (authored, per-project)

What actually drives the grid, and what two projects for the same song may legitimately disagree on
(half/double, different counting). Added to `PersistedContent.settings` so it flows through the
existing `extractPersistedContent` / `applyPersistedContent` / `splitProjectEnvelope` path with
**zero new persistence code**:

```typescript
// extends BeatNoteProject['settings'] and PersistedContent.settings
beatAnchorMs?: number;            // default 0 (Req 6.6)
phraseStartMs?: number | null;    // default null -> anchor is Count 1
appliedBpm?: number;              // mirrors metadata.bpm; kept for clarity/migration
manuallyOverriddenBpm?: boolean;  // default false
manuallyOverriddenAnchor?: boolean; // default false
```

`appliedBpm` is intentionally redundant with the existing `metadata.bpm` / store `bpm`: the store's
`bpm` remains the single source of truth for rendering; `appliedBpm` is a persisted mirror that makes
override reasoning and future migration explicit. The split-envelope/`toProjectRecord` logic keeps
`metadata.bpm` authoritative; `appliedBpm` is carried in `settings`.

**Why this split:** the cache is expensive and song-intrinsic → Music Item. The applied values are
cheap, authored, and project-specific → draft/project. This directly satisfies Req 6 ("multiple
projects for one song do not repeat work" + "different projects may intentionally use half-time").

### 6.3 Store (session) state (ADR-001, no new store)

```typescript
beatAnchorMs: number;                 // authored, default 0
phraseStartMs: number | null;         // authored, default null
manuallyOverriddenBpm: boolean;
manuallyOverriddenAnchor: boolean;
analysisByItem: Record<string, AnalysisJobView>; // session mirror from the bridge
gridRestoreSnapshot: {                // for Req 10, session-only
  bpm: number; beatAnchorMs: number; phraseStartMs: number | null;
  manuallyOverriddenBpm: boolean; manuallyOverriddenAnchor: boolean;
} | null;

// actions
setBpmManual(bpm): sets bpm + manuallyOverriddenBpm=true
setBeatAnchorManual(ms): sets beatAnchorMs + manuallyOverriddenAnchor=true
setPhraseStartAtPlayhead(ms): sets phraseStartMs + manuallyOverriddenAnchor=true
nudgeBeatAnchor(steps, stepMs): manual anchor adjust
applyAnalysisSuggestion(bpm, anchorMs, downbeatMs?): snapshots prior, applies, leaves overrides false
restoreGridSnapshot(): atomic restore (Req 10.3)
```

`setBpmManual` replaces direct `setBpm` wiring from the BPM control so every hand edit records the
override flag; `setBpm` stays for internal/project-load use (no flag) to preserve load semantics.

## 7. Anchor-aware grid math

Today `danceCountAtTime` and `generateSnapTargets` assume beat 1 at 0 ms. Generalise by subtracting
the anchor before the modulo, defaulting to current behaviour when `beatAnchorMs = 0`.

```typescript
// danceCount.ts (anchor + phrase-start aware, backward compatible)
const effectiveStart = phraseStartMs ?? beatAnchorMs ?? 0;
const beatIndex = Math.floor((safeTime - effectiveStart) / msPerBeat);
// clamp negative pre-anchor region; phrase/count computed from max(0, beatIndex)
```

`generateSnapTargets` offsets its phrase-boundary loop origin by `beatAnchorMs` (phase) so grid lines
land on real beats; marker snap targets are unchanged. All existing callers pass `beatAnchorMs = 0`
until wired, so no visual change ships before the controls do. This is covered by deterministic tests
(tasks.md §2) that assert identical output at anchor 0.

## 8. Platform providers — evaluation and decisions

The requirement is explicit: do not pick by popularity; document evidence and trade-offs. Decisions
below are the **approved defaults**; the Task 1 spike confirms or amends them with measurements before
provider implementation.

### D-1 — Local-first, no cloud for V1 (approved)

Cloud tempo analysis would add a managed backend, secrets, latency, and cost for a problem that is
tractable on-device. It also conflicts with ADR-010's no-bundled-key stance and the privacy posture.
Rejected for V1. Local analysis works offline and keeps audio on device.

### D-2 — Web provider (approved default: self-contained ACF/onset detector; evaluate `realtime-bpm-analyzer` and `essentia.js`)

Candidates considered:

- **Hand-rolled autocorrelation + onset-energy detector (plain TS).** Pro: zero dependency, MIT-clean,
  tiny, full control over cancellation and downsampling, deterministic for click-track tests. Con: we
  own accuracy; downbeat detection is weak. Memory: bounded by our own downsample to mono ~11 kHz.
- **`realtime-bpm-analyzer` (npm).** Pro: small, Apache-2.0, actively maintained, designed for Web Audio.
  Con: tuned for streaming/real-time, returns tempo candidates not beat phase/downbeat; still need our
  own anchor logic. Evaluate accuracy on the synthetic suite in the spike.
- **`essentia.js` (WASM).** Pro: research-grade `RhythmExtractor2013` gives BPM + beat positions +
  (some) downbeat. Con: large WASM payload (multi-MB) inflating web bundle, heavier memory, build
  integration, and licence is AGPL/Affero-style for parts — **licensing and binary size are
  disqualifying unless the spike proves the size/accuracy trade worthwhile and the licence is
  compatible with a commercial release.** Documented, not chosen by default.

**Approved default:** ship the self-contained detector for V1 (BPM + anchor). Treat downbeat as
best-effort/low-confidence. Reconsider `essentia.js` only if the spike shows our accuracy misses the
real-song threshold and the licence/size are acceptable. Record the spike result in this file.

#### Phase 1 evidence — 2026-10-29 (web decision confirmed; native simulator measurements complete)

The disposable `scripts/spikes/tempo/benchmark.mjs` prototype generated 30-second click tracks at
60, 90, 120, 150, and 180 BPM with 347 ms of leading silence, downsampled them from 44.1 kHz to
11.025 kHz, then ran onset-envelope peak detection plus autocorrelation. On Node 24.11.1 / Apple
Silicon it detected all five within 0.175 BPM and placed the anchor within 9.179 ms, meeting band A.
The 150-second and 240-second 120-BPM runs took 9.04 ms and 15.60 ms respectively for analysis after
downsampling; the 240-second process RSS increase was 51.1 MiB including the 40.4 MiB source PCM.
The entire disposable benchmark was 7.8 kB raw / 2.3 kB gzip, an upper bound that also includes
fixture generation and reporting rather than only production detector logic.

`realtime-bpm-analyzer` 5.0.15 returned an octave-resolved correct candidate for all five click
tracks in a headless Chromium comparison (14.9–32.1 ms per 30-second track), but normalized 60 BPM to
120 and 180 BPM to 90. Its published ESM is 35.0 kB raw / 6.8 kB gzip, is Apache-2.0 licensed, and
still provides no beat anchor, so adopting it would retain the hardest BeatNote-specific phase work
while adding a dependency. `essentia.js` 0.1.3 was rejected before runtime comparison: the npm
package is AGPL-3.0, 10.1 MB unpacked, and its web deployment includes a 2.0 MB WASM binary (about
526 kB gzip) plus JS glue. Those licence obligations are incompatible with the planned commercial
distribution without separate licensing.

**Decision:** confirm D-2's self-contained web detector. Keep half/double alternatives explicit and
run analysis in a worker; do not adopt either evaluated package. This evidence is synthetic only.
Browser `decodeAudioData` time, real-song band B accuracy, main-thread long tasks, and import-to-
suggestion latency remain unverified. D-3's separate streaming iOS module is confirmed by the
simulator evidence below; physical-device performance and representative real-song accuracy remain
open before Phase 1 is complete.

Production integration evidence on 2026-10-28 retained a generated 12-second, 120-BPM WAV in the
Playwright workflow. Chromium decoded it once for waveform plus analysis, ran the detector in the
split worker, and returned 119.71 BPM (0.29 BPM error, band A) before preview/apply/restore. Static
web export emitted the worker as a separate 9.75-kB bundle. This confirms bundling and one synthetic
browser path, not the still-open long-task, peak-memory, import-latency, or real-song measurements.

**Web execution model (main thread decodes, worker analyses):**

1. `decodeAudioData` runs on the main thread. It is asynchronous and does not block rendering, but
   browsers do not reliably expose `AudioContext`/`OfflineAudioContext` decoding inside workers, so
   decoding stays here.
2. **Share the decode with waveform extraction.** `waveformExtraction.web.ts` already decodes the full
   file for peaks. Decoding a second time for analysis doubles CPU time and peak memory. Introduce a
   shared web decode step that produces both waveform peaks and the mono analysis signal from one
   `AudioBuffer`, then releases the buffer. Waveform peaks are emitted first so the waveform never
   waits on analysis.
3. Immediately mix down to mono and downsample to ~11.025 kHz (`Float32Array`), then drop all
   references to the `AudioBuffer` so it can be garbage-collected (Req 14.2).
4. Transfer the downsampled array to a **dedicated Web Worker** (`postMessage` with a transferable
   buffer, zero-copy). The worker computes the onset envelope, autocorrelation, alternatives, and
   anchor, posts progress, and honours a cancel message. Cancellation terminates the worker outright.
5. Peak memory is dominated by the decoded `AudioBuffer` (about 85 MB for 4 min stereo at 44.1 kHz,
   scaling linearly with duration). Because the waveform already pays this cost today, sharing the
   decode means analysis adds only the small downsampled array. The spike must measure peak memory and
   decode time on a long file. `decodeAudioData` cannot partially decode compressed audio, so the
   windowing in D-5 reduces web *analysis* work but not *decode* memory. If the longest supported file
   exceeds an acceptable peak, report `unavailable` above a measured duration limit rather than risk a
   tab crash.

### D-3 — iOS provider: **separate** tempo-analysis Expo Module (approved), not an extension of `BeatNoteWaveform`

Evaluated extending `modules/beatnote-waveform` vs a new `modules/beatnote-tempo`:

- The waveform module's job is peak extraction for rendering: it streams PCM via `AVAssetReader` and
  accumulates min/RMS peaks. Tempo analysis needs a different pipeline (onset envelope, autocorrelation
  / comb filtering via Accelerate `vDSP`), different outputs, and its own cancellation.
- Reusing one module would entangle two unrelated concerns, two output shapes, and two cancellation
  lifetimes in one Swift file, against the coding-standards "one thing" guidance and ADR-003's clean
  module boundaries.

**Decision:** create `modules/beatnote-tempo` (`BeatNoteTempoModule.swift`) that **reuses the proven
streaming `AVAssetReader` decode approach** from the waveform module (so large files never fully
reside in memory, Req 14.1) but computes an onset envelope and tempo/anchor with `Accelerate`. It
exposes `analyzeTempoAsync(audioUri, { minBpm, maxBpm })` returning BPM, confidence, beat
times/anchor, and progress callbacks, with a cancel token. Rationale recorded here and to be added as
an ADR when implementation starts.

A separate module means iOS decodes the file twice: once for waveform peaks, once for analysis. That
is acceptable because both passes stream, and the windowed reads in D-5 make the analysis pass a
fraction of the file. Set `AVAssetReader.timeRange` per window so only the needed audio is decoded.
Run the analysis on a `.utility` quality-of-service task so it never competes with playback or UI.

The 2026-10-27 web spike did not implement the native prototype. This decision is therefore
confirmed structurally but remains conditional on the Phase 1 iOS memory and cancellation
measurements; see proposed ADR-018.

On 2026-10-28 the production module was implemented with bounded `AVAssetReader.timeRange` windows,
11.025-kHz mono streaming, Accelerate autocorrelation, explicit cancellation checks, progress events,
and per-window `Task.detached(priority: .utility)` execution. The autolinked `BeatNoteTempo` pod
compiles for the arm64 iOS Simulator. Runtime XCTest on 2026-10-29 then resolved a synthetic
120-BPM track from the 60.09-BPM primary to the offered 120.19-BPM double-tempo alternative, within
band A. A retained cancellation/retry journey cancelled a request during a DEBUG-only ten-second
delay, reached the no-change state, and completed retry in under eight seconds, proving the native
request released the single-flight queue before the delay expired. The 150-second fixture reached a
visible suggestion in 9.414 seconds with 261,950.992 kB peak physical app memory (about 255.8 MiB)
on an iPhone 17 Pro iOS 26.2 simulator. These measurements confirm the bounded provider design on
the simulator; playback coexistence, physical-device heat/battery, and real-song accuracy remain open.

### D-4 — Android

Out of scope for the first delivery (secondary platform per project-overview). The default provider
(`bpmAnalysis.ts`) returns `null`, so Android cleanly reports `unavailable` until a provider is added.
No behaviour regression.

### D-5 — Load priority and windowed analysis (approved)

Users want to hear and see the song immediately. Analysis is the least urgent of the load stages and
is ordered last:

| Stage | Needs decode? | Typical readiness | Blocks the next stage? |
|---|---|---|---|
| 1. Playback ready | No (player streams the file) | Immediate | No |
| 2. Timing-bar fallback grid | No | Immediate | No |
| 3. Waveform peaks | Yes | About 1–3 s | No |
| 4. Tempo/anchor suggestion | Yes (windows) | After waveform | No |
| 5. Refined result (optional) | More windows | Later, if confidence is low | No |

The user can play, scrub, place markers, and annotate during stages 3–5. The suggestion appears when
ready and never moves the grid on its own (Req 5.4).

**Analysis does not need the whole song.** Each sub-problem needs different audio:

- **Tempo:** a few representative windows are enough for constant-tempo music. Default: three 20 s
  windows at roughly 25%, 50%, and 75% of the duration. Windows avoid intros and outros, which are often
  ambient or rubato. Disagreement between windows is how variable tempo is detected (`tempoModel:
  'variable'`) without scanning everything.
- **Beat anchor:** needs the **start** of the song, because the first beat is there. Default: the
  first 30 s, plus a phase check against the tempo windows so a quiet intro does not mislead the
  anchor.
- **Downbeat:** benefits from more phrases, so it may use more windows when it runs (Phase 8).
- **Short songs** (under about 90 s) are analysed in full, since windowing saves little.

**Progressive result.** If the first window pass returns low confidence, the Analyzer may run a
second pass with more windows and update the suggestion. A suggestion is replaced only while the user
has not acted on it. Once the user taps Apply or Keep Current, later passes never change the visible
state except to offer a new dismissible suggestion.

On iOS, windowing reduces both decode time and work. On web, the full decode is already shared with
the waveform (D-2), so windowing only reduces worker analysis time.

## 9. Capability model (two independent axes)

- **Source capability** (`PlaybackCapabilities.decodedAudioAnalysis`): can we get analysable PCM from
  this source? Local = true; no-source = false; future Apple Music/Spotify/DRM = false. Added to
  `sourceResolver.ts` `LOCAL_CAPABILITIES` / `NO_SOURCE_CAPABILITIES`. This gates whether the Analyzer
  even attempts work (Req 13.1/13.2).
- **Product capability** (`ProductCapability` `'analysis.autoBpm'`): is the user entitled to the
  feature? Added to `PRODUCT_CAPABILITIES` (Pro). Gated only through the entitlement provider; V1's
  preview provider grants it without a paywall (ADR-017). UI asks the capability service, never a
  purchase SDK (Req 13.3).

Keeping these separate means a Pro user on a DRM source still correctly sees "analysis unavailable for
this source", and a Lite user (post-V2) on a local file sees an upgrade path — orthogonally.

## 10. Lifecycle and concurrency

- **Single-flight queue** (Req 1.6): one active job; others queued FIFO, with the **currently loaded
  song prioritised** over background library items.
- **Load ordering** (Req 1.7): a job for the current song starts only after its waveform extraction
  completes or fails, so analysis never delays the visible waveform.
- **Batch imports** (Req 1.8): importing many songs queues them; analysis of non-current items runs one
  at a time with low priority to limit heat and battery drain.
- **App backgrounded** (Req 7.6): BeatNote keeps running in the background for audio playback, so an
  unpaused job would keep consuming battery. Pause queued work when the app backgrounds and resume on
  foreground. A running job is cancelled cleanly and re-run later rather than continuing in the
  background.
- **Cancellation** (Req 7.1): `AbortSignal` passed to the provider; web aborts the decode/loop, native
  sets a cancel flag checked between `AVAssetReader` buffers; no partial cache write.
- **Backgrounding/termination** (Req 7.2): cache write is the last step and atomic; an interrupted job
  simply leaves no entry — the item re-qualifies for analysis next launch.
- **Deletion** (Req 7.3): `libraryActions` deletion path calls `bpmAnalysisService.cancel(id)` and
  `analysisRepository.remove(id)`.
- **Relink** (Req 1.5): when `contentHash` changes, invalidate the cache entry but leave Applied_Grid
  and markers intact; optionally enqueue fresh analysis.
- **Concurrent edit during analysis** (Req 12): the store applies the user edit immediately and sets
  the override flag; when the bridge later delivers a result, `applyAnalysisSuggestion` is **not**
  auto-invoked because an override is set — the result is shown only as a dismissible suggestion.

## 11. UI surfaces

Reuse existing restrained liquid-glass surfaces and controls; no new global state.

- **`BpmSuggestionCard`** — non-blocking card/row: "Detected 127.9 BPM · High confidence" with
  **Apply**, **Keep Current**, **Alternatives**, **Retry**. Hidden when a manual override exists except
  as a subtle "suggestion available" affordance (Req 5.3). States: running (progress), success,
  low-confidence (muted, extra caution copy), unavailable, cancelled, failed.
- **`AlternativesSheet`** — lists primary + half/double + other alternatives, each Apply-able; labels
  the ×½/×2 relation (Req 8.2).
- **`GridPreviewOverlay`** — renders proposed beat/phrase lines over the waveform with Apply/Cancel
  before committing (Req 9.3). Reuses `RhythmicGrid` rendering with preview styling.
- **Anchor controls** — **"Set Count 1 Here"** at the playhead and an earlier/later nudge pair
  (±5 ms + beat-fraction), modelled on the loop-bound nudge in the control dock (Req 9.1/9.2).
- **Restore previous** — appears while `gridRestoreSnapshot` exists (Req 10.2).
- Placement: BPM/count area in the sidebar (desktop) and the mobile Settings page plus the control
  dock for "Set Count 1 Here", following the phone full-screen-utility and trailing-edge conventions
  in coding-standards.

### Accessibility (coding-standards)

- Every control ≥ 44×44 touch target; accessible name/role/state/value; icons never the sole signal.
- Confidence communicated by **text band + icon + colour**, never colour alone.
- VoiceOver labels: e.g. "Detected tempo 127.9 beats per minute, high confidence. Apply.";
  "Set Count 1 at current position, 0.42 seconds."; anchor nudge announces the new offset.
- Dynamic Type: suggestion card and alternatives list reflow and remain readable at the largest sizes
  (same bar already cleared by other M2 work).
- Reduce Motion: progress and preview use opacity/stepwise updates, no continuous animation.
- Portrait and landscape: suggestion/preview respect safe areas and the home-indicator clearance
  already established for the landscape overview.

## 12. Accuracy thresholds (separated, not one-size-fits-all)

Three distinct bars, because synthetic exactness, real-song tolerance, and phrase usefulness are not
the same problem:

- **A. Strict synthetic-fixture accuracy.** Generated click tracks at known BPM: detected BPM within
  **±0.5 BPM** (after resolving octave/half-double) for constant-tempo clicks; anchor within
  **±15 ms** of the first click. Deterministic, must pass in CI.
- **B. Representative real-song evaluation.** A small curated set spanning styles: detected BPM within
  **±2 BPM or ±1.5%** (whichever larger) of a human-tapped reference for ≥ **80%** of tracks, counting
  a correct half/double as correct when offered as an alternative. Measured in the spike and physical
  acceptance, not asserted as a hard CI gate (real audio is not committed).
- **C. Subjective phrase/downbeat usefulness.** Downbeat is assistance: target that a human agrees the
  suggested Count 1 is "right or one nudge away" for a majority of 4/4 pop tracks, with **no claim**
  for waltz/odd-meter/rubato styles. Reported qualitatively; never gated as pass/fail.

The spec explicitly avoids claiming one tolerance fits every style; variable-tempo and non-4/4
material are expected to land in band B/C with lower confidence and rely on manual correction.

## 13. Migration and backward compatibility

- New `settings` fields are all optional with safe defaults; `applyPersistedContent` already tolerates
  missing settings via `?? default`. Existing drafts/projects load unchanged (Req 6.6):
  `beatAnchorMs = 0`, `phraseStartMs = null`, overrides false, `appliedBpm` falls back to
  `metadata.bpm`.
- No change to `SAVED_PROJECT_VERSION` is required for additive optional settings; if the spike adds a
  field that must be distinguished on load, bump to `1.3.0` with a documented default. Default
  recommendation: **do not bump**; keep fields optional.
- Analysis_Cache is a brand-new key family; absence is normal and simply triggers (eligible) analysis.
- A future-version project (`NewerLegacyProject`) is still never rewritten by this build.

## 14. Testing strategy (summary; full breakdown in tasks.md)

Per testing-strategy.md: keep the permanent suite small; prefer extending an existing critical journey;
use temporary Jest/`fast-check` tests during implementation and remove them after TypeScript + the
retained journey prove the behaviour.

- **Pure deterministic (temporary Jest + fast-check):** anchor-aware `danceCount`/`magneticSnapping`
  equivalence at anchor 0; detector on generated click tracks at several BPM; leading silence and
  pickup beats; half/double disambiguation; constant vs variable tempo; cache validity
  (fingerprint/version); override preservation.
- **Edge inputs:** very short, silent, noisy, corrupt, unsupported — all resolve to a clean
  `failed`/`unavailable` without crashing or blocking playback.
- **Permanent Playwright:** extend the existing library/project journey with the full
  suggest → apply → alternatives → Set Count 1 → nudge → restore workflow, plus "analysis failure
  leaves annotation usable" and "`showDanceCounts` toggle does not trigger/erase analysis".
- **Native XCTest (focused):** the `beatnote-tempo` module decodes a bundled fixture, reports a
  plausible BPM, honours cancellation, and does not exhaust memory on the long-track fixture.
- **Physical-device acceptance:** performance, heat, battery, interruptions, backgrounding, Bluetooth
  playback during analysis, and accuracy on representative real music (bands B/C).

## 15. Key file touch map

- New: `src/services/bpmAnalysis.types.ts`, `bpmAnalysis.ts`, `bpmAnalysis.web.ts`,
  `bpmAnalysis.ios.ts`, `bpmAnalysis.worker.ts` (web analysis worker), a shared web decode helper
  used by both waveform extraction and analysis; `src/features/analysis/bpmAnalysisService.ts`, `analysisRepository.ts`,
  `bpmAnalysisBridge.ts`; `src/types/analysis.ts`; `modules/beatnote-tempo/*`; UI components
  (`BpmSuggestionCard`, `AlternativesSheet`, `GridPreviewOverlay`, anchor controls) + mirrored styles.
- Changed: `src/services/waveformExtraction.web.ts` (consume the shared decode), `src/utils/danceCount.ts`, `src/utils/magneticSnapping.ts` (anchor-aware);
  `src/types/project.ts` + `src/utils/persistedContent.ts` (new optional settings); `src/hooks/
  useStudioStore.ts` (anchor/override/analysis state + actions); `src/features/library/sourceResolver.ts`
  (`decodedAudioAnalysis`); `src/features/library/importPipeline.ts` (enqueue on commit) and
  `libraryActions.ts` (cancel/remove on delete); `src/features/entitlements/types.ts` +
  `capabilityService.ts` (`analysis.autoBpm`); `src/features/library/persistencePipeline.ts` (new
  `'analysis'` family); grid render consumers (`RhythmicGrid`, `RowGutter`, `DanceCountDisplay`) and
  `exportEngineCore.ts`. `app.json`/native config only if the tempo module needs it (expected: none
  beyond autolinking in `modules/`).
