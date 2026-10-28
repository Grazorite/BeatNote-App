# Implementation Plan — Automatic BPM Detection

> M2 implementation began on 2026-10-27 by explicit user direction, superseding the earlier
> sequencing behind physical-iPhone V1 acceptance. Phases remain ordered so each is independently
> verifiable and safe to roll back.
> Every task notes whether it can be delegated to its own workflow agent. Build gate throughout:
> `npx tsc --noEmit`, the retained Playwright journeys (`npm test`), temporary Jest/`fast-check`
> checks removed after verification (testing-strategy.md), and focused XCTest for native surfaces.

## Phase 1 — Research spike and architecture decision

- [ ] 1. Tempo-analysis spike: confirm or amend design decisions D-2 (web) and D-3 (iOS)
  - 2026-10-27: web synthetic benchmark and package/licence comparison completed; D-2 confirmed.
    Native 150-second peak-memory/cancellation measurements, browser decode/long-task metrics, and
    representative real-song evidence remain before this task can be checked.
  - Prototype the self-contained web detector (decode → mono ~11.025 kHz downsample → ACF tempo +
    onset-peak anchor) and, for comparison, measure `realtime-bpm-analyzer` and `essentia.js` on the
    synthetic click-track set; record BPM accuracy, bundle size, licence, memory, and cancellation.
  - Prototype `modules/beatnote-tempo` reusing the `AVAssetReader` streaming decode from
    `modules/beatnote-waveform`, computing an onset envelope + Accelerate autocorrelation; measure
    accuracy, peak memory on the 150 s fixture, and cancellation latency.
  - **Dependencies:** none. **Affected:** throwaway spike branch only; no app wiring.
  - Measure, on a 4-minute song and on the longest supported file, for both platforms: decode time,
    analysis time, peak memory, main-thread blocking (web long tasks over 50 ms), and time from import
    to visible suggestion. Compare windowed analysis (D-5) with full-song analysis for accuracy and
    time.
  - **Acceptance:** written decision (append to `design.md` §8 and open an ADR stub) selecting the web
    library and confirming the separate iOS module, with measured evidence for each trade-off. Must
    state which accuracy band (§12) each candidate meets, record the measurements above, and set the
    web maximum duration limit if peak memory requires one.
  - **Tests:** spike measurement script against generated click tracks; not retained.
  - **Rollback / failure:** spike is disposable; if no candidate meets band A, escalate as an open
    question (OQ-1) with the fallback of shipping manual anchor + no auto-BPM.
  - **Delegable:** yes — self-contained investigation; ideal for `bundled://investigate` or a coder
    spike agent. No production code changes.

## Phase 2 — Pure analysis result and data contracts

- [x] 2. Add analysis types and anchor-aware grid math (no UI, no persistence wiring)
  - 2026-10-27: added the provider/cache contracts and backward-compatible anchor/phrase-start
    parameters. Temporary property and deterministic checks passed 3/3; `npx tsc --noEmit` passed.
  - Create `src/services/bpmAnalysis.types.ts` (`AnalysisResult`, `BpmAlternative`, `TempoModel`,
    `ConfidenceBand`, `AnalysisRequest`, `BpmAnalysisProvider`) and `src/types/analysis.ts`
    (`AnalysisCacheEntry`).
  - Generalise `src/utils/danceCount.ts` and `src/utils/magneticSnapping.ts` to accept
    `beatAnchorMs` and optional `phraseStartMs`, defaulting to current behaviour at anchor 0.
  - **Dependencies:** 1 (for field shapes). **Affected:** `danceCount.ts`, `magneticSnapping.ts`, new
    type files, their call sites (pass `0` until later phases).
  - **Acceptance:** `npx tsc --noEmit` clean; all existing callers compile with anchor `0`.
    _Requirements: 2, 3.3, 3.4, 9.5_
  - **Tests (temporary):** fast-check equivalence — for any time/bpm/countSize, anchor-aware output at
    anchor 0 equals the current output; offset-by-anchor shifts counts by the expected beats.
  - **Rollback / failure:** pure additive; revert the two util diffs and new type files.
  - **Delegable:** yes — pure logic, fully unit-testable in isolation.

## Phase 3 — Persistence and migration

- [x] 3. Applied_Grid in draft/project content + Analysis_Cache repository
  - 2026-10-27: optional authored-grid fields now round-trip through drafts/projects with legacy
    defaults; the per-item analysis repository uses its own key family, validates full result shape,
    quarantines corrupt JSON, and scopes failed-read write blocking to the affected analysis key.
    Temporary round-trip/read-write-remove/read-failure checks passed 4/4 and were removed.
  - Add optional `beatAnchorMs`, `phraseStartMs`, `appliedBpm`, `manuallyOverriddenBpm`,
    `manuallyOverriddenAnchor` to `BeatNoteProject['settings']` and thread them through
    `persistedContent.ts` (`createEmptyPersistedContent`, `extract`, `apply`, `splitProjectEnvelope`,
    `toProjectRecord`) with safe defaults (Req 6.6).
  - Add `family: 'analysis'` to `persistencePipeline.ts`; create `analysisRepository.ts`
    (`readAnalysis`, `writeAnalysis`, `removeAnalysis`) keyed `beatnote.analysis.v1.<musicItemId>`.
  - Decide `SAVED_PROJECT_VERSION`: **default recommendation — do not bump** (all fields optional).
  - **Dependencies:** 2. **Affected:** `types/project.ts`, `utils/persistedContent.ts`,
    `features/library/persistencePipeline.ts`, new `analysisRepository.ts`, `recordValidation.ts`
    (accept new optional settings + validate cache entry).
  - **Acceptance:** a pre-feature draft/project loads unchanged (anchor 0, overrides false,
    `appliedBpm` ← `metadata.bpm`); save/restore round-trips the new fields.
    _Requirements: 6.1, 6.2, 6.6, 5.1, 5.2_
  - **Tests (temporary):** round-trip of new settings; legacy record without fields loads with
    defaults; cache read-failure blocks only analysis writes (ADR-013).
  - **Rollback / failure:** optional fields + separate key family → revert diffs with no data loss;
    orphaned `beatnote.analysis.*` keys are harmless.
  - **Delegable:** yes — bounded to persistence; reviewer should check the validation path.

## Phase 4 — Platform provider prototype → production

- [ ] 4. Implement the analysis providers behind the boundary
  - [x] 4.1 Web provider `bpmAnalysis.web.ts` per the approved spike decision. Add a shared decode
        helper so `waveformExtraction.web.ts` and analysis use one `decodeAudioData` pass; emit
        waveform peaks first, then mono-downsample to ~11.025 kHz and release the `AudioBuffer`.
        Transfer the samples to `bpmAnalysis.worker.ts`, which computes tempo, anchor, and
        half/double alternatives over the D-5 windows, posts progress, and is terminated on cancel.
        Default `bpmAnalysis.ts` returns `null`. (Req 14.2, 14.4, 14.5)
  - [ ] 4.2 Native `modules/beatnote-tempo` (`BeatNoteTempoModule.swift`) + `bpmAnalysis.ios.ts`:
        streaming `AVAssetReader` decode restricted to the D-5 windows via `timeRange`, Accelerate
        tempo/anchor, `.utility` QoS, progress callbacks, cancel token (Req 14.1, 14.5). Register via
        `modules/` autolinking (package.json `expo.autolinking`).
  - 2026-10-28: 4.1 is production-wired and its retained browser workflow detected a generated
    120-BPM WAV at 119.71 BPM, rendered preview, applied, and restored. The exported worker is a
    separate 9.75-kB bundle. The iOS module is implemented, autolinked, windowed, cancellable, and
    compiles with `.utility` tasks. A focused iPhone 17 Pro simulator journey resolved its 60.09 BPM
    primary estimate to the offered 120.19 BPM double-tempo alternative (both within ±0.5 BPM), then
    previewed, applied, and restored it. 4.2 remains unchecked pending long-fixture memory and
    cancellation measurements.
  - **Dependencies:** 1, 2. **Affected:** `src/services/bpmAnalysis.*`, `modules/beatnote-tempo/*`.
  - **Acceptance:** each provider returns a well-formed `AnalysisResult` on a fixture; `null`/throw
    maps cleanly to `unavailable`/`failed`; cancellation leaves no partial state; web waveform appears
    no later than it does today; no main-thread task over 50 ms comes from analysis.
    _Requirements: 2, 3.1, 3.2, 7.1, 14.1, 14.2, 14.3_
  - **Tests:** temporary Jest for the web detector on generated click tracks (bands A); focused XCTest
    for the native module (plausible BPM, cancellation, long-fixture memory).
  - **Rollback / failure:** providers are isolated; reverting leaves `bpmAnalysis.ts` no-op →
    everything reports `unavailable`, no regression.
  - **Delegable:** 4.1 and 4.2 are independent and can run as parallel agents (different files, no
    shared state). Native work needs the simulator per ios-testflight.md.

## Phase 5 — Import and lifecycle integration

- [x] 5. Wire the Analyzer orchestrator and lifecycle
  - 2026-10-28: added the single-flight cache-aware queue, source capability, import/relink/delete
    hooks, current-item priority, store mirror, and AppState pause/resume. Temporary checks passed
    for single-flight ordering, capability-off, cache reuse, and delete-mid-flight cleanup.
  - Create `bpmAnalysisService.ts` (single-flight queue, capability check, cache validity, cancel/
    retry/invalidate, subscribe) and `bpmAnalysisBridge.ts` (mirror job views into the store).
  - Add `decodedAudioAnalysis` to `PlaybackCapabilities` + `LOCAL_CAPABILITIES`/`NO_SOURCE_CAPABILITIES`.
  - Enqueue analysis from `importPipeline.onCommitted`; cancel + `removeAnalysis` on song deletion in
    `libraryActions`; invalidate on relink fingerprint change.
  - Prioritise the current song; start its job only after its waveform extraction settles; run other
    items one at a time at low priority; pause on app background and resume on foreground.
  - **Dependencies:** 3, 4. **Affected:** new service/bridge, `sourceResolver.ts`, `types/library.ts`,
    `importPipeline.ts`, `libraryActions.ts`, store (`analysisByItem`).
  - **Acceptance:** import never waits on analysis; deletion cancels + clears cache; relink invalidates
    cache but preserves markers/anchor; duplicate import reuses cache.
    _Requirements: 1.1–1.8, 7.2–7.6, 13.1, 13.2, 14.6_
  - **Tests (temporary):** queue is single-flight; capability-off → `unavailable` without decode;
    delete mid-flight → cancelled + no entry; duplicate → no re-run.
  - **Rollback / failure:** gate enqueue behind a const flag; disabling it leaves import/playback
    untouched.
  - **Delegable:** yes — one agent; must not change provider internals (Phase 4) concurrently.

## Phase 6 — BPM suggestion UI

- [x] 6. `BpmSuggestionCard` + `AlternativesSheet` and apply/keep/retry/restore actions
  - 2026-10-28: the capability-gated card now exposes progress, confidence, alternatives, keep,
    retry, preview/apply/cancel, and atomic restore. Manual BPM changes cancel previews and suppress
    the suggestion surface. Alternatives use the same in-card responsive action surface rather than
    a separate modal sheet.
  - Build the non-blocking suggestion surface and alternatives sheet; add store actions
    `applyAnalysisSuggestion`, `setBpmManual`, `restoreGridSnapshot`, `gridRestoreSnapshot`.
  - Route the existing BPM control through `setBpmManual` so manual edits set `manuallyOverriddenBpm`.
  - Gate visibility by product capability `analysis.autoBpm` (preview provider grants it) and show the
    unavailable/low-confidence/failed/cancelled states.
  - **Dependencies:** 5. **Affected:** new UI + styles, store actions, BPM control wiring,
    `entitlements/types.ts` + `capabilityService.ts` (`analysis.autoBpm`).
  - **Acceptance:** suggestion shows confidence band; Apply updates grid/counts/snaps; Keep Current
    changes nothing; override hides auto-apply; Restore returns prior values; analysis failure leaves
    annotation/playback fully usable.
    _Requirements: 5.3–5.6, 8.1–8.6, 10.1–10.3, 12.1–12.3, 13.3_
  - **Tests (temporary):** override prevents overwrite when a late result arrives; restore is atomic.
  - **Rollback / failure:** capability-gated UI; hide the card to disable the surface with no data risk.
  - **Delegable:** yes, after Phase 5 lands; UI-only against stable store actions.

## Phase 7 — Beat-anchor and "Set Count 1 Here" controls

- [x] 7. Anchor controls, nudge, and grid preview
  - 2026-10-28: Set Count 1, ±5-ms and ±quarter-beat nudges, preview overlay, and authored-grid
    origins are wired through the detail/multitrack grid, snapping, gutters, live counts, CSV/PDF
    labels, and persistence. The retained browser journey covers preview/apply/restore and nudges.
  - Add `setBeatAnchorManual`, `setPhraseStartAtPlayhead`, `nudgeBeatAnchor`; add **"Set Count 1 Here"**
    at the playhead and an earlier/later nudge pair modelled on the loop-bound nudge; add
    `GridPreviewOverlay` for preview-before-apply.
  - Thread `beatAnchorMs`/`phraseStartMs` into `RhythmicGrid`, `RowGutter`, `DanceCountDisplay`, and
    `generateSnapTargets` call sites.
  - **Dependencies:** 2, 3, 6. **Affected:** store actions, control dock + settings UI, grid render
    consumers, preview overlay + styles.
  - **Acceptance:** Set Count 1 and nudge set `manuallyOverriddenAnchor`; preview renders proposed grid
    then Apply/Cancel commits/aborts; `countSize` composes with anchor/phrase start.
    _Requirements: 3.3, 3.4, 4.3, 9.1–9.5_
  - **Tests (temporary):** anchor offset shifts counts correctly; preview does not mutate state until
    Apply.
  - **Rollback / failure:** controls additive; with anchor 0 behaviour is identical to today.
  - **Delegable:** yes; coordinate with Phase 6 on shared store slice (same file — sequence, don't
    parallelize store edits).

## Phase 8 — Phrase/downbeat assistance

- [ ] 8. Downbeat suggestion as confidence-based, correctable assistance
  - 2026-10-28: the UI handles a provider-supplied confident downbeat and otherwise labels phrase
    start unconfirmed, but current providers intentionally emit no downbeat estimate; this phase
    remains open.
  - Surface `suggestedDownbeatMs` + separate `downbeatConfidence`; offer "Use suggested Count 1" that
    sets `phraseStartMs` (never auto-applied); fall back to anchor-as-Count-1 with an
    "unconfirmed phrase start" indicator when unavailable/low confidence.
  - **Dependencies:** 4 (provider must emit downbeat fields), 7 (phrase-start plumbing).
  - **Affected:** provider outputs already defined; UI copy + indicator; store `setPhraseStartManual`.
  - **Acceptance:** downbeat presented as assistance only; manual correction always available;
    low/absent confidence degrades to anchor Count 1 with a clear unconfirmed state.
    _Requirements: 4.1–4.4_
  - **Tests (temporary):** no auto-apply of phrase start; manual set overrides detection.
  - **Rollback / failure:** feature-flag the downbeat UI; without it, phrase start stays manual.
  - **Delegable:** yes, after Phase 7.

## Phase 9 — Browser and native automation

- [ ] 9. Retained automation for the complete workflow
  - 2026-10-28: the existing seven-journey browser suite now retains synthetic worker detection,
    preview/apply/restore, Set Count 1, and both nudge sizes. An eighth retained iOS journey covers
    synthetic native detection with octave resolution, alternatives, preview/apply/restore, the
    preview overlay, Set Count 1, and both nudge sizes. Native cancellation and long-fixture memory
    coverage remain open.
  - Extend the existing library/project Playwright journey with
    suggest → apply → alternatives → Set Count 1 → nudge → restore, plus "analysis failure keeps
    annotation usable" and "`showDanceCounts` toggle does not trigger/erase analysis".
  - Add/confirm focused XCTest for `beatnote-tempo` (plausible BPM, cancellation, long-fixture memory).
  - **Dependencies:** 6, 7, 8. **Affected:** `tests/*.spec.ts`, `tests/ios/*`.
  - **Acceptance:** `npm test` green including the new assertions; focused XCTest passes on the
    simulator per ios-testflight.md.
    _Requirements: 8.3, 8.4, 8.6, 11.1–11.3, plus coverage of 9/10_
  - **Rollback / failure:** no `test.only`/`skip`; if a journey is flaky, fix the assertion, never
    skip.
  - **Delegable:** yes; keep one permanent journey, extend rather than add a parallel smoke test.

## Phase 10 — Physical-device acceptance and documentation

- [ ] 10. Hardware acceptance and steering updates
  - On a signed iPhone: accuracy on representative real music (bands B/C), performance, heat, battery,
    audio-session interruptions, backgrounding, and Bluetooth playback during analysis.
  - Update `.kiro/steering/choreography-features.md` (anchor + detection behaviour, that counts no
    longer assume time zero), add the iOS-module ADR, and update `architecture-decisions.md`
    (`decodedAudioAnalysis`, `analysis.autoBpm`). Prepend an AGENTS.md handover entry per completion.
  - **Dependencies:** 1–9. **Affected:** steering docs, AGENTS.md; no app code unless acceptance finds
    a defect.
  - **Acceptance:** documented device results separated into bands A/B/C; honest "not verified" gaps
    recorded; no claim of a single universal tolerance.
    _Requirements: 12 (hardware), 14 (device memory/perf), accuracy §12 A/B/C_
  - **Rollback / failure:** if device accuracy misses band B broadly, ship with auto-BPM behind the
    capability but default the suggestion to low-confidence and lean on manual anchor; record as OQ-1
    resolution.
  - **Delegable:** documentation is delegable; physical-device testing is a `human` task (needs Apple
    Developer account, blocked item in AGENTS.md).

## Open questions (each with an approved default so implementation need not wait)

- **OQ-1 — Web detection library.** Self-contained detector vs `realtime-bpm-analyzer` vs
  `essentia.js`. **Approved default:** ship the self-contained detector for V1; adopt a library only if
  the Phase 1 spike proves it beats band A/B with acceptable size and a commercial-compatible licence.
- **OQ-2 — Store `detectedBeatTimes`?** **Approved default:** do **not** persist per-beat arrays in the
  cache unless the anchor-refinement or snapping consumer in Phase 7 actually reads them; keep the
  field optional and omit it otherwise (Req 3.2) to bound cache size.
- **OQ-3 — Bump `SAVED_PROJECT_VERSION`?** **Approved default:** no bump; all new settings are optional
  with defaults.
- **OQ-4 — Auto-apply on a pristine, never-edited project?** **Approved default:** never silently
  apply; always show a declinable suggestion, even at high confidence (Req 5.4).
- **OQ-5 — Android provider now?** **Approved default:** out of scope for first delivery;
  `bpmAnalysis.ts` no-op reports `unavailable` cleanly.
- **OQ-7 — Existing markers when the grid changes.** Markers are absolute timestamps, so they stay
  where they are, but their count labels (and any "8-count" style text the user typed) can stop
  matching once BPM or the anchor changes. **Approved default:** never move markers; when applying a
  suggestion to a song that already has markers, state in the preview that counts will be relabelled
  and markers will not move. Restore previous undoes it.
- **OQ-6 — Variable-tempo handling.** **Approved default:** report a single representative/median BPM
  with reduced confidence and rely on the manual anchor; no tempo-map editing in this feature.
