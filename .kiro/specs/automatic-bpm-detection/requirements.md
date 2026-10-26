# Requirements Document — Automatic BPM Detection

> **Release status:** planned for M2 (dance-specific depth, toward V2 Pro). This feature is a
> choreography-assistance addition that extends the existing dance-count workflow described in
> [`.kiro/steering/choreography-features.md`](../../steering/choreography-features.md). It does not
> resume or depend on the deferred stem-separation work. No code is implemented by this document.
>
> Tiering note: automatic analysis maps naturally to a future Pro capability, but V1 ships behind the
> non-enforcing preview entitlement provider (see
> [`.kiro/steering/release-roadmap.md`](../../steering/release-roadmap.md) and ADR-017). This spec
> reserves a product-capability key but must not introduce a paywall before V2 acceptance.

## Introduction

BeatNote today derives dance counts from a **manually configured BPM** and the assumption that
**beat 1 occurs at song time zero** (`danceCountAtTime` in `src/utils/danceCount.ts`, grid lines in
`src/utils/magneticSnapping.ts`). That produces a mathematically consistent grid that is almost never
aligned to the actual recording: real songs have leading silence, pickup beats, intros that are not on
the grid, and tempos the user has to guess.

This feature analyses eligible imported audio in the background and helps the user align BeatNote's
beat-and-phrase grid to the music. It treats alignment as **four separate problems**, each with its
own confidence and its own manual override:

1. **Tempo/BPM estimation** — how fast the song is.
2. **Beat-phase detection** — where the actual beats fall in time, and therefore the first useful
   beat offset (the beat-grid anchor). BPM alone cannot determine this.
3. **Downbeat / phrase-start detection** — which beat is "Count 1" of a phrase. This is strictly
   harder and less reliable than tempo, and the spec never claims BPM detection identifies Phrase 1.
4. **Manual correction** — the user can always override tempo, anchor, and phrase start when analysis
   is uncertain or musically inappropriate (half-time vs double-time, a different counting
   interpretation, a deliberate pickup).

Analysis is **local-first**, **background**, **cancellable**, and **non-destructive**. It never blocks
import, playback, or song switching; it never silently overwrites a value the user edited; and its
failure never degrades normal annotation.

## Glossary

- **Analyzer** — the provider-neutral orchestration surface (`bpmAnalysisService`) that schedules,
  runs, caches, cancels, and reports audio analysis. It selects a platform provider but exposes a
  single contract to the rest of the app.
- **Analysis_Provider** — a platform implementation behind the Analyzer boundary
  (`bpmAnalysis.web.ts`, `bpmAnalysis.ios.ts`, default `bpmAnalysis.ts` no-op), mirroring the existing
  `waveformExtraction.*` provider pattern (ADR-003).
- **Analysis_Result** — the immutable raw output of one analysis run: `detectedBpm`, `confidence`,
  `bpmAlternatives`, optional `detectedBeatTimes`, `suggestedAnchorMs`, optional
  `suggestedDownbeatMs`, `analyzerId`, `analyzerVersion`, and the `audioFingerprint` it was computed
  from.
- **Analysis_Cache** — a per-Music-Item store of the latest `Analysis_Result` keyed by Music Item ID,
  so multiple projects for one song never repeat expensive work. Cache lives in the library layer, not
  in draft/project content.
- **Applied_Grid** — the per-draft/per-project authored values that actually drive the grid:
  `appliedBpm`, `beatAnchorMs`, and (optionally) `phraseStartMs`, plus the existing `countSize`.
- **Beat_Anchor** (`beatAnchorMs`) — the timestamp of the first grid beat. Replaces the current
  implicit assumption that beat 1 is at `0 ms`. All beat/phrase math offsets from this value.
- **Phrase_Start** (`phraseStartMs`) — the timestamp treated as Count 1 of a phrase. When unset, the
  phrase grid falls back to the Beat_Anchor as Count 1 (current behaviour, generalised by the offset).
- **Confidence** — a normalized `0..1` score plus a coarse band (`high | medium | low`) describing how
  trustworthy a detection is. Reported separately for tempo and for downbeat.
- **Half/Double_Alternatives** — common tempo ambiguities (e.g. 64 ↔ 128 BPM, or ×1.5/÷1.5 for some
  styles) offered alongside the primary detection.
- **Manual_Override** — a flag (`manuallyOverriddenBpm`, `manuallyOverriddenAnchor`) recorded in
  draft/project content when the user edits BPM or the anchor by hand, so suggestions never silently
  clobber a deliberate choice.
- **Audio_Fingerprint** — the content hash already computed at import (`MusicItem.contentHash`), reused
  to decide whether a cached `Analysis_Result` is still valid for the current audio.
- **Analysis_Capability** — a playback/source capability flag (`decodedAudioAnalysis`) on
  `PlaybackCapabilities`, indicating whether a source exposes analysable PCM. DRM/streaming providers
  (future Apple Music/Spotify) set it false. This is a **source** capability, separate from the
  **product** entitlement capability `analysis.autoBpm`.
- **Store** — the single Zustand store (`src/hooks/useStudioStore.ts`), per ADR-001.
- **Music_Item** — a durably imported song with a stable UUID (ADR-012).
- **Song_Draft / Saved_Project** — per-song authored content records (ADR-013); the home of
  `Applied_Grid` values.

## Requirements

### Requirement 1: Eligibility and background scheduling

**User Story:** As a choreographer, I want BeatNote to figure out a song's tempo on its own after I
import it, without making me wait, so that a useful grid is ready when I start annotating.

#### Acceptance Criteria

1. WHEN a Music_Item is durably committed by the import pipeline (`importPipeline.onCommitted`), THE
   Analyzer SHALL enqueue a background analysis job for that Music_Item if it has no valid
   Analysis_Cache entry.
2. THE Analyzer SHALL NOT delay, block, or serialize behind import completion, playback start, or song
   switching; enqueuing SHALL be fire-and-forget from the caller's perspective.
3. WHEN the current source's Analysis_Capability `decodedAudioAnalysis` is false, THE Analyzer SHALL
   mark the Music_Item analysis status `unavailable` and SHALL NOT attempt decoding.
4. WHEN an import is a duplicate of an existing Music_Item, THE Analyzer SHALL reuse the existing
   Analysis_Cache entry and SHALL NOT re-run analysis.
5. WHEN a Music_Item is relinked and its Audio_Fingerprint changes, THE Analyzer SHALL invalidate the
   stale Analysis_Cache entry and MAY enqueue a fresh job; THE Analyzer SHALL NOT invalidate any
   Applied_Grid values or markers/annotations as a result.
6. THE Analyzer SHALL run at most one analysis job at a time per device and SHALL process additional
   eligible items sequentially, prioritising the currently loaded song.
7. WHEN the currently loaded song is queued for analysis, THE Analyzer SHALL start that job only after
   the song's waveform extraction has completed or failed, so analysis never delays the visible
   waveform or playback readiness.
8. WHEN many songs are imported together, THE Analyzer SHALL analyse non-current items one at a time at
   low priority and SHALL NOT start more than one decode concurrently.

### Requirement 2: Tempo/BPM estimation

**User Story:** As a choreographer, I want an accurate tempo estimate with a sense of how sure it is,
so that I can trust it or know to check it.

#### Acceptance Criteria

1. WHEN analysis runs on eligible audio, THE Analysis_Provider SHALL produce a `detectedBpm` in a
   plausible musical range (configurable, default 40–220 BPM) and a `confidence` in `0..1`.
2. THE Analysis_Provider SHALL produce zero or more `bpmAlternatives`, each with its own relative
   likelihood, and SHALL include the applicable Half/Double_Alternatives when the primary detection's
   half or double also lies in the plausible range.
3. WHERE the Analysis_Provider computes a constant global tempo, THE Analysis_Result SHALL record that
   the tempo model is `constant`; WHERE it detects significant tempo variation, THE Analysis_Result
   SHALL record `variable` and MAY include a representative/median BPM with reduced confidence.
4. THE Analysis_Result SHALL NOT, by tempo estimation alone, assert a Phrase_Start or downbeat.

### Requirement 3: Beat-phase detection and the beat anchor

**User Story:** As a choreographer, I want the grid lines to land on the actual beats of the song,
even when it starts with silence or a pickup, so that counts match what I hear.

#### Acceptance Criteria

1. THE Analysis_Provider SHALL estimate a `suggestedAnchorMs` — the time of the first usable beat —
   independent of song time zero.
2. WHERE the Analysis_Provider retains per-beat positions, THE Analysis_Result MAY include
   `detectedBeatTimes`; storing them SHALL be justified by a concrete consumer (anchor refinement,
   phrase assistance, or snapping) and SHALL be omitted when no consumer uses them, to bound cache
   size.
3. THE Store and persistence SHALL support a `beatAnchorMs` on Applied_Grid that shifts all grid and
   count math by a constant offset; WHEN `beatAnchorMs` is `0`, behaviour SHALL be identical to the
   current time-zero grid.
4. WHEN `beatAnchorMs` is non-zero, THE grid generators (`generateSnapTargets`, rhythmic grid, row
   gutters, dance-count readouts, exports) SHALL offset beat and phrase positions by `beatAnchorMs`.

### Requirement 4: Downbeat / phrase-start assistance

**User Story:** As a choreographer, I want help finding Count 1 of a phrase, while understanding it's a
guess I can fix.

#### Acceptance Criteria

1. WHERE the Analysis_Provider attempts downbeat detection, THE Analysis_Result SHALL include a
   `suggestedDownbeatMs` and a **separate** downbeat `confidence`, distinct from tempo confidence.
2. THE UI SHALL present downbeat/phrase-start detection as confidence-based assistance and SHALL NOT
   apply a detected Phrase_Start automatically at high stakes; the user SHALL confirm or set it.
3. THE user SHALL always be able to set or correct Phrase_Start manually regardless of detection
   confidence or availability.
4. WHEN downbeat detection is unavailable or low confidence, THE phrase grid SHALL fall back to the
   Beat_Anchor as Count 1 and SHALL clearly indicate the phrase start is unconfirmed.

### Requirement 5: Non-destructive application and manual-override protection

**User Story:** As a choreographer, I want my hand-tuned BPM and anchor to stay put, so that a late
background result never wrecks a project I already aligned.

#### Acceptance Criteria

1. WHEN the user manually edits BPM, THE Store SHALL set `manuallyOverriddenBpm = true` on the active
   Applied_Grid.
2. WHEN the user manually edits the Beat_Anchor or Phrase_Start, THE Store SHALL set
   `manuallyOverriddenAnchor = true`.
3. WHEN an Analysis_Result becomes available for a song whose Applied_Grid has
   `manuallyOverriddenBpm` or `manuallyOverriddenAnchor` set, THE Analyzer SHALL NOT overwrite those
   values; it MAY surface a dismissible suggestion only.
4. WHERE no manual override exists and the project is still at authored defaults (never grid-edited),
   THE UI MAY offer a one-tap Apply; it SHALL NOT silently apply without a visible suggestion the user
   can decline.
5. WHEN the user applies a suggestion, THE Store SHALL record the prior BPM/anchor so the user can
   restore it in the same session (Requirement 10).
6. WHEN a suggestion is applied, THE applied values SHALL NOT set the manual-override flags (they were
   applied from analysis, not hand-edited), but a subsequent manual edit SHALL.

### Requirement 6: Per-item cache and per-project applied values

**User Story:** As a choreographer, I want two projects for the same song to be able to disagree about
tempo interpretation, while the expensive analysis only runs once.

#### Acceptance Criteria

1. THE Analysis_Cache SHALL store exactly one latest Analysis_Result per Music_Item, keyed by Music
   Item ID, including `analyzerId`, `analyzerVersion`, `audioFingerprint`, and an `analyzedAt`
   timestamp.
2. THE Applied_Grid values (`appliedBpm`, `beatAnchorMs`, optional `phraseStartMs`, override flags)
   SHALL live in Song_Draft and Saved_Project content, not in the Analysis_Cache, so different
   projects for one song may differ (half-time, double-time, alternate counting).
3. WHEN a second project/draft is created for a song with an existing Analysis_Cache entry, THE
   Analyzer SHALL reuse the cached result rather than re-analysing.
4. WHEN the stored `analyzerVersion` is older than the current Analyzer version, THE cached entry
   SHALL be treated as invalid for *suggestion* purposes and MAY be re-analysed; already-applied
   Applied_Grid values SHALL remain untouched.
5. WHEN the stored `audioFingerprint` does not match the Music_Item's current `contentHash`, THE
   cached entry SHALL be treated as invalid.
6. Existing drafts/projects created before this feature (no Applied_Grid anchor/override fields) SHALL
   load unchanged, defaulting `beatAnchorMs = 0`, `appliedBpm = stored bpm`, override flags false.

### Requirement 7: Lifecycle safety

**User Story:** As a user, I want analysis to behave correctly when I background the app, kill it, or
delete songs, so that nothing is corrupted or wasted.

#### Acceptance Criteria

1. THE Analyzer SHALL expose a cancel for the active job and SHALL cancel the underlying provider work
   (AudioContext decode / native reader) without leaving partial cache entries.
2. WHEN the app is backgrounded or terminated mid-analysis, THE Analyzer SHALL leave no partial or
   corrupt Analysis_Cache entry; a result is cached only on successful completion.
3. WHEN a Music_Item is deleted (made `removed`), THE Analyzer SHALL cancel any in-flight job for it
   and remove its Analysis_Cache entry.
4. WHEN a song switch occurs, in-flight analysis for the previous song SHALL continue or be
   deprioritized per Requirement 1.6 but SHALL NOT block the switch.
5. THE Analyzer SHALL be retryable after failure, cancellation, or `unavailable` without requiring a
   re-import.
6. WHEN the app moves to the background, THE Analyzer SHALL pause queued work and cleanly cancel any
   running job, resuming on foreground, so background audio playback does not also run analysis.

### Requirement 8: Suggestion, apply, and alternatives UX

**User Story:** As a choreographer, I want a clear result I can accept, reject, or adjust, with
half/double options, so that I stay in control.

#### Acceptance Criteria

1. WHEN an Analysis_Result is available and not blocked by a manual override, THE UI SHALL present a
   non-blocking suggestion such as "Detected 127.9 BPM · High confidence" with actions: **Apply**,
   **Keep Current**, **Alternatives**, and **Retry**.
2. THE Alternatives surface SHALL list Half/Double_Alternatives and any other `bpmAlternatives`, each
   selectable to apply.
3. WHILE analysis is running, THE UI SHALL show non-blocking progress and SHALL NOT disable playback,
   scrubbing, marker creation, or song switching.
4. THE UI SHALL render distinct states: running, success (with confidence band), low-confidence,
   unavailable (capability off), cancelled, and failed — each with an appropriate action (Retry where
   applicable).
5. WHEN the user applies a BPM, THE grid, dance-count readouts, and snap targets SHALL update to the
   new tempo; WHEN the user chooses Keep Current, no Applied_Grid value SHALL change.
6. IF analysis fails, THEN annotation, playback, and all existing features SHALL remain fully usable.

### Requirement 9: Beat-anchor and "Set Count 1 Here" controls

**User Story:** As a choreographer, I want to tap at the playhead to declare where counting starts, and
nudge it a hair earlier or later, so that the grid matches the recording exactly.

#### Acceptance Criteria

1. THE UI SHALL provide a **"Set Count 1 Here"** action that sets Phrase_Start (and, by implication,
   aligns the Beat_Anchor's phase) to the current playhead position.
2. THE UI SHALL provide fine adjustment to nudge the Beat_Anchor earlier/later in small increments
   (default ±5 ms, and a beat-fraction step), mirroring the existing loop-bound nudge affordance.
3. WHEN the user previews a proposed grid, THE UI SHALL render the proposed beat/phrase lines over the
   waveform **before** committing, with an explicit Apply/Cancel.
4. WHEN "Set Count 1 Here" or a nudge is used, THE Store SHALL set `manuallyOverriddenAnchor = true`.
5. THE phrase-size setting (`countSize` 4/6/8) SHALL be retained and SHALL compose with the
   Beat_Anchor and Phrase_Start.

### Requirement 10: Restore prior values

**User Story:** As a choreographer, I want to undo an applied suggestion and get my previous BPM/anchor
back.

#### Acceptance Criteria

1. WHEN the user applies a detected BPM or an alternative, THE Store SHALL retain the immediately prior
   `appliedBpm`, `beatAnchorMs`, `phraseStartMs`, and override flags as a restore snapshot.
2. THE UI SHALL offer a **Restore previous** action while a restore snapshot exists for the session.
3. WHEN the user restores, THE Store SHALL return all captured Applied_Grid values and override flags
   to their prior state atomically.

### Requirement 11: Interaction with dance-count visibility

**User Story:** As a choreographer, I don't want the "Show dance counts" toggle to start, stop, or
erase analysis — it should only change what I see.

#### Acceptance Criteria

1. THE `showDanceCounts` setting SHALL remain default-off and SHALL control presentation only.
2. Toggling `showDanceCounts` SHALL NOT trigger, cancel, or invalidate analysis, and SHALL NOT change
   any Applied_Grid value.
3. Analysis, suggestion, and application SHALL be available regardless of `showDanceCounts` state.

### Requirement 12: Concurrent edits during analysis

**User Story:** As a choreographer, if I change BPM while analysis is still running, my change should
win.

#### Acceptance Criteria

1. WHEN the user edits BPM or the anchor while analysis is running for the same song, THE Store SHALL
   apply the user's edit immediately and set the corresponding Manual_Override flag.
2. WHEN that analysis later completes, THE Analyzer SHALL respect the Manual_Override and present its
   result only as a dismissible suggestion (Requirement 5.3).
3. THE in-flight edit and the arriving result SHALL never interleave into an inconsistent Applied_Grid.

### Requirement 13: Provider capability and source gating

**User Story:** As a user, I want analysis to be attempted only where the audio can actually be
decoded, so that DRM or streaming sources degrade gracefully.

#### Acceptance Criteria

1. THE `PlaybackCapabilities` contract SHALL gain a `decodedAudioAnalysis` boolean; the local provider
   SHALL set it true and the no-source provider false.
2. A future streaming/DRM source provider SHALL be able to set `decodedAudioAnalysis = false` to
   suppress analysis without changing any UI component.
3. THE product capability `analysis.autoBpm` SHALL be declared in the entitlement matrix as a Pro
   capability and SHALL be gated by the entitlement provider separately from the source capability; V1
   SHALL expose it via the non-enforcing preview provider (ADR-017).

### Requirement 14: Memory and large files

**User Story:** As a user with long recordings, I don't want analysis to exhaust memory or freeze the
app.

#### Acceptance Criteria

1. THE Analysis_Provider SHALL process audio in a streaming/chunked fashion where the platform allows,
   and SHALL NOT require the full decoded track to be resident in JavaScript memory at once for the
   native path.
2. WHERE a platform's decode API returns a full buffer (web `decodeAudioData`), THE provider SHALL
   downsample to mono and to an analysis sample rate before running detection to bound working-set
   size, and SHALL document the peak memory characteristic.
3. THE Analyzer SHALL remain cancellable during chunked processing and SHALL yield to keep the UI
   responsive.
4. WHERE the platform is web, THE detection work SHALL run in a dedicated Web Worker, and the decode SHALL be shared with
   waveform extraction rather than performed twice.
5. THE Analysis_Provider SHALL analyse representative time windows rather than the whole song by
   default (tempo windows away from the intro/outro, plus an opening window for the beat anchor), and
   SHALL analyse short songs in full.
6. WHERE a first windowed pass returns low confidence, THE Analyzer MAY run a further pass with more
   windows and update the suggestion only while the user has not acted on it.

## Out of scope

- Real-time/live tempo tracking during playback.
- Tempo-map editing for variable-tempo songs beyond a single representative BPM plus manual anchor.
- Beat-synced effects, auto-trimming, or audio modification.
- Cloud analysis (explicitly rejected for V1 default; see design decision D-1).
- Automatic correction of markers/annotations when tempo/anchor changes.
