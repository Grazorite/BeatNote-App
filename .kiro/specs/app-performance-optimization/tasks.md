# Implementation Plan — App Performance Optimisation

Labels: `[device]` needs a physical iPhone (usually the human), `[sim]` simulator acceptable,
`[desk]` code or documentation only. Every optimisation task is committed separately so it can be
reverted with one `git revert`. Requirement references are to [`requirements.md`](./requirements.md);
section references are to [`design.md`](./design.md).

## Phase 0 — Measurement foundation

- [x] 1. Fixtures, scripts, and tooling
  - [x] 1.1 `[desk]` Create `fixtures.md` with the S-short/S-medium/S-long/S-stress metadata,
        checksums, and local paths; generate the redistributable short track. _Req 1.1_
    - Added tracked/generated S-short and S-long fixtures plus ignored local representative
      S-medium AAC/MP3 and ten-minute S-stress WAV/AAC derivatives with measured metadata,
      absolute paths, and SHA-256 checksums.
  - [x] 1.2 `[desk]` Add a temporary, development-only project generator for 0/50/500-marker
        projects from a fixed seed. _Req 1.2_
  - [x] 1.3 `[desk]` Write the scenario script (exact steps, repetitions, device preparation) for
        every interaction in Req 2.1 and the session mix in Req 7.1. _Req 1.3–1.4, 6.3_
  - [x] 1.4 `[desk]` Write `profiling-guide.md`: Release-local build/install, Instruments
        templates, Hermes sampling in Debug and Release, React DevTools on device, 240-fps video
        method. _Req 5.1, 6.1–6.2, §5_
  - [x] 1.5 `[desk]` Create `results.md` with the §9 register header. _Req 11_

- [x] 2. Instrumentation
  - [x] 2.1 `[desk]` Add `src/utils/perfMarks.ts` behind `BEATNOTE_PERF`; bracket tap seek, scrub,
        marker add/remove, play/pause, annotation open/save, and track switch. _§4.1_
  - [x] 2.2 `[sim]` Add `OSSignposter` helper to `modules/library-storage/` and signposts in
        `BeatNoteWaveform` and `BeatNoteTempo`; forward JS marks on iOS. Verify intervals appear in
        Instruments on the simulator. _Req 5.2, §4.2_
    - Simulator Logging trace `/private/tmp/beatnote-signposts-local-gates.trace` on `e4f1900`
      contains `track.switch`, `waveform.decode`, `bpm.analysis`, and `draft.write`. Waveform and
      tempo use module-local opt-in gates because static Expo modules did not share LibraryStorage's
      in-process gate; older installed binaries remain safe through optional JS capability checks.
  - [x] 2.3 `[device]` Measure signpost overhead flag-on vs flag-off in a 60 s playback trace;
        must be ≤ 1% CPU. _Req 5.3_
    - Paired Release-local Time Profiler traces on iPhone 15 Pro Max / iOS 27.0.1 measured 46.97%
      average process CPU with the flag off and 42.95% with it on. The raw on-minus-off delta was
      -4.02 percentage points (-8.57% relative), so measured positive overhead was 0; both runs
      remained in the Fair thermal state. This single pair passes the overhead gate but is not a
      general performance baseline; the user-selected song's metadata was not captured.
  - [x] 2.4 `[desk]` Add temporary render, path-regeneration, and gesture-construction counters.
        Remove before Phase 1 completes. _§4.3_
  - Verify: `npx tsc --noEmit`, `npm test`, focused `testAudioAnnotationAndProjectRestore`.
  - Rollback: revert if any retained journey fails or overhead exceeds 1%.

## Phase 1 — Baselines and profiling (no optimisation)

- [ ] 3. Physical baselines on `ec4d9c1` or its pre-optimisation successor
  - [ ] 3.1 `[device]` Latency baselines (Req 2.1 list) for S-medium/50 and S-long/500 in
        `Debug+Metro` and `Release-local`, n ≥ 20, video plus trace. _Req 1.5–1.6, 2_
    - First Release-local S-medium/50 wrapped-seek sample: final 20 gated intervals measured
      p50 46.77 ms, p90 51.20 ms, and max 54.01 ms from handler entry through player seek
      completion and the following animation frame. It passes the instrumented completion target,
      but external first-frame video, audible-position timing, accuracy, Debug+Metro, S-long/500,
      and every other interaction remain open.
  - [ ] 3.2 `[device]` Frame-time and hitch baselines for playback, scrubbing, library sheet, and
        annotation with keyboard. _Req 3_
    - A diagnostic slow-then-rapid wrapped-seek trace recorded 32.30 ms/s hitch time and a
      550.12 ms longest hitch at Nominal thermal state; the user also observed rapid-tap lag. This
      fails the nearest interactive target as a proxy, but does not replace the four scripted 3.2
      scenarios.
    - The required Release-local S-medium/50 continuous cross-row scrub is now captured on
      `7037118`: 152 hitches summed to 7,034.902 ms in the aligned ten-second window
      (703.49 ms/s), with p90 116.69 ms and max 383.42 ms at Nominal thermal state. This fails the
      < 10 ms/s target.
    - The separate untouched 60-second playback trace on the same build recorded four hitches,
      116.692 ms total (1.94 ms/s), and a 33.34 ms maximum at Nominal thermal state. It passes both
      steady targets and localises the earlier tail to scrub/recovery behavior. Library sheet and
      annotation/keyboard remain open.
  - [ ] 3.3 `[device]` 5/15/30-minute memory, CPU, energy, and thermal runs with S-long and
        S-stress; ten-switch memory test; Leaks; 15-minute background run. _Req 7_
  - [ ] 3.4 `[device]` Contention runs: interactions during waveform decode, BPM analysis, 500-marker
        autosave, and all combined; listen for dropouts; measure BPM cancellation latency. _Req 8_
  - [ ] 3.5 `[device]` Record whether each Debug-only failure passes in Release-local and classify it
        as development-only. Resolves H-1. _Req 6.4_

- [ ] 4. Render and native profiling
  - [x] 4.1 `[desk]` Zustand subscription audit table in `findings.md`. _Req 4.1, §6.1_
  - [ ] 4.2 `[device]` React Profiler commit counts for the five scenarios in Req 4.2; list
        unstable props. Resolves H-2. _Req 4.2–4.4_
  - [ ] 4.3 `[device]` Path-regeneration and gesture-reconstruction counts during playback.
        Resolves H-3, H-4. _Req 4.5–4.6_
    - Scrub Time Profiler evidence shows 9,564 ms of CoreGraphics-inclusive work in an 11-second
      active window while the JS thread used 857 ms. Code inspection confirms `path.wrappedRow`
      generation is memoized, but the static paths share one SVG with the changing progress and
      playhead. The deployed bundle emitted no perf markers/counters, so counter totals remain open.
  - [ ] 4.4 `[device]` IVL breakdown traces for tap seek and dock controls (§6.5). Resolves H-5.
  - [ ] 4.5 `[device]` Modal/keyboard layout traces; confirm C-3 fix holds. Resolves H-8. _Req 4.7_
  - [ ] 4.6 `[device]` Time Profiler, Allocations generations, and Leaks review. Resolves H-6, H-7,
        H-9. _Req 5, 7_
    - First Time Profiler trace captured: main thread 90.3% and CoreGraphics-inclusive stacks 88.2%
      of BeatNote's 10,847 running samples during the aligned scrub window; JS was 7.9%. Allocations,
      Leaks, and non-scrub native work remain open.
  - [ ] 4.7 `[desk]` Update the confirmed/hypothesis table in `requirements.md` and rank confirmed
        bottlenecks by threshold gap. Remove temporary counters (2.4) once data is captured.
  - Gate: Phase 2 starts only for candidates whose hypothesis is now confirmed.

## Phase 2 — High-confidence render reductions (low risk)

Each task: before/after rows in `results.md`, `npx tsc --noEmit`, `npm test`, the §10 device
checklist, and rollback per Req 10.4 (revert if no ≥ 10% p90 gain on the target metric, any other
metric worsens > 10%, any preserved behaviour regresses, or a new crash appears).

- [ ] 5. `[desk]` + `[device]` O-1 Split broad selectors / `useShallow` for components confirmed in 4.1–4.2.
  - Rollback also if any control shows stale state in a retained journey.
- [ ] 6. `[desk]` + `[device]` O-2 Stabilise callbacks to memoised children; remove memos with no
      measured effect.
- [ ] 7. `[desk]` + `[device]` O-3 Separate static waveform paths from dynamic overlays, if 4.3
      confirms H-3.
  - Rollback also on any playhead, marker, or loop misalignment in portrait or landscape.
- [ ] 8. `[desk]` + `[device]` O-5 Immediate pressed feedback for dock and transport controls.
  - Rollback also on any change to accessible name, role, state, or 44×44 target.

## Phase 3 — Interaction-path changes (medium risk)

- [ ] 9. `[desk]` + `[device]` O-4 Stable gesture objects, if 4.3 confirms H-4.
  - Extra check: tap vs scrub disambiguation and loop-range gesture isolation in the retained
    marker and loop journeys.
- [ ] 10. `[desk]` + `[device]` O-6 Optimistic playhead on seek, if 4.4 shows the player round-trip
      dominates first feedback.
  - Rollback also if seek accuracy leaves ±20 ms or the playhead visibly jumps back.
- [ ] 11. `[desk]` + `[device]` O-10 Scope keyboard/modal layout to the editor, if 4.5 confirms H-8.
  - Rollback immediately on any Fabric/Yoga crash recurrence; requires annotation save and song
    rename retests on device.

## Phase 4 — Background work and memory (medium risk)

- [ ] 12. `[desk]` + `[device]` O-7/O-8 Defer and chunk draft serialisation, if 3.4/4.6 confirm H-6.
  - Extra check: focused `testAudioAnnotationAndProjectRestore` and force-quit restore on device.
- [ ] 13. `[sim]` + `[device]` O-9 Scheduling/QoS and yielding in waveform decode and BPM analysis, if
      3.4 confirms H-7.
  - Extra check: native BPM XCTest `testAutomaticBpmSuggestionAndAnchorControls`; cancellation
    ≤ 250 ms.
- [ ] 14. `[desk]` + `[device]` O-11 Release buffers and listeners on track switch, if 3.3/4.6
      confirm H-9.
  - Extra check: switch-back waveform and draft restore in the library journey.

## Phase 5 — Acceptance and conditional structural work

- [ ] 15. `[device]` Re-run the full baseline (task 3) on the final commit in Release-local;
      record pass/fail for every threshold. _Req 2–3, 7–8, 11_
- [ ] 16. `[device]` Repeat key scenarios on a floor device if one is available; otherwise record
      the gap.
- [ ] 17. `[device]` Repeat on TestFlight once the Apple Developer account exists (blocked). _Req 6.5_
- [ ] 18. `[desk]` If any threshold still fails with evidence, write a PDR (§8) for O-12 and stop for
      human approval. Do not implement structural changes inside this spec without approval.
- [ ] 19. `[desk]` Remove temporary tests, counters, and generators; confirm signposts are disabled in
      store builds; update steering if a rule changed; update AGENTS.md.
