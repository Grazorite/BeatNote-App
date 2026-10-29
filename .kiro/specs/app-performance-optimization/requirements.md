# Requirements Document — App Performance Optimisation

> **Release status:** M2 stabilisation work. This specification is measurement-first. It authorises
> no rewrite, renderer replacement, state-library migration, or native-engine change unless a
> measured result in the Results Register (design §9) shows that a smaller change cannot meet the
> threshold. No code is implemented by this document.

## Introduction

Physical-iPhone testing of BeatNote (Expo / React Native, New Architecture and Fabric enabled) has
shown delayed waveform seeking and delayed feedback on buttons and dock controls. The 2026-10-29
stabilisation commit `ec4d9c1` already:

- reduced current-time subscriptions to the active wrapped row, the playhead overlay, and
  `PlaybackTimeProbe`;
- isolated the live playhead and made viewport following imperative;
- memoised wrapped-row gestures;
- reduced visual position sampling to 10 Hz; and
- stopped audio-status events from re-rendering the whole studio tree.

Those changes were verified by TypeScript and the retained Playwright journeys, but **not** by
physical-device latency measurements. Their effect on hardware is therefore unknown.

This feature establishes reproducible baselines on physical iPhones, separates Debug/Metro
behaviour from signed Release and TestFlight behaviour, finds the real bottlenecks with React,
Hermes, and Instruments profiling, and then reduces latency, dropped frames, unnecessary renders,
thread contention, and memory growth through small, individually reversible changes.

### Confirmed observations and hypotheses

Every suspected cause in this specification carries one of two labels. A hypothesis is promoted to
confirmed only by a recorded measurement in the Results Register.

| ID | Statement | Status | Evidence |
|---|---|---|---|
| C-1 | Waveform tap seeking feels delayed on a physical iPhone | Confirmed (observed) | Human report, Debug build, 2026-10-29; not yet quantified |
| C-2 | Button and dock-control feedback feels delayed on a physical iPhone | Confirmed (observed) | Human report, Debug build; not yet quantified |
| C-3 | Saving annotations and renaming songs crashed in Fabric/Yoga layout | Confirmed, fix pending retest | Three symbolicated crash reports (`YogaLayoutableShadowNode::layout`) |
| C-4 | Before `ec4d9c1`, audio-status events re-rendered the complete studio | Confirmed, mitigated | Code review during `ec4d9c1`; not profiled on device |
| H-1 | Remaining latency is mostly Debug/Metro overhead and disappears in Release | Hypothesis | None |
| H-2 | Broad Zustand selectors still re-render `StudioScreen`, `MainContent`, or the dock on frequent updates | Hypothesis | None |
| H-3 | Waveform SVG paths are regenerated when only playback position, selection, or loop state changes | Hypothesis | None |
| H-4 | Gesture objects are reconstructed on unrelated renders, causing handler re-attachment cost | Hypothesis | Partially addressed in `ec4d9c1` |
| H-5 | JS-thread work (seek commit, store updates, row re-render) delays the first visual response to a touch | Hypothesis | None |
| H-6 | Draft autosave serialisation blocks the JS thread on large projects | Hypothesis | None |
| H-7 | Waveform decode or BPM analysis competes with playback and interaction on long songs | Hypothesis | BPM analysis runs at utility priority; contention not measured |
| H-8 | Modal presentation plus keyboard layout transitions cause frame drops on annotation open/save | Hypothesis | Related to C-3 |
| H-9 | Memory grows across track switches (waveform buffers, analysis results, player instances) | Hypothesis | None |

## Glossary

- **Build type** — one of `Debug+Metro` (development client, JS from Metro), `Release-local`
  (signed Release configuration, embedded bundle, installed from Xcode), or `TestFlight`
  (distribution build). Only `Release-local` and `TestFlight` results count towards acceptance.
- **Input-to-visual latency (IVL)** — time from the touch-down (or touch-up, where the action
  commits on release) timestamp to the first frame that displays the intended response.
- **First feedback** — the earliest visible acknowledgement of an input, such as a pressed state
  or a playhead move. **Commit** — the point at which the outcome is complete, such as audio
  playing from the new position.
- **Dropped frame** — a display refresh in which neither the UI thread nor the render server
  delivered a new frame while an animation or interaction was in progress (Core Animation hitch).
- **Hitch ratio** — total hitch time in milliseconds per second of interaction (ms/s), as reported
  by Instruments' Animation Hitches template.
- **Reference songs** — the fixed audio set defined in Requirement 1.
- **Reference device** — the iPhone 15 Pro Max on iOS 27.0.1 used for current physical acceptance.
  A **floor device** is the oldest supported iPhone available for testing.
- **Signpost** — an `os_signpost` interval emitted by native or bridged JS code so Instruments can
  bracket an operation.
- **Optimisation** — one change set, tracked as one task, with its own before/after measurement and
  rollback criteria.

## Requirements

### Requirement 1 — Reproducible physical-device baselines

**User Story:** As the developer, I want repeatable measurements on a physical iPhone, so that I can
tell whether a change made BeatNote faster rather than relying on impressions.

#### Acceptance Criteria — Requirement 1

1. THE project SHALL define a reference song set with at least: a short song (30–60 s), a medium
   song (3–4 min), and a long song (≥ 150 s, plus one ≥ 8 min stress track), in at least M4A/AAC
   and MP3, plus one WAV. Each entry records duration, format, sample rate, channel count, bit
   rate, and file size. Fixtures must be redistributable or generated; copyrighted songs are
   referenced only by local path and checksum.
2. THE project SHALL define a fixed reference project per song with a documented marker count
   (0, 50, and 500 markers) and annotation count, so render cost can be compared across densities.
3. EACH baseline run SHALL record device model, iOS version, build type, BeatNote commit, Low Power
   Mode state, thermal state at start, battery level, and whether the device was charging.
4. EACH measured interaction SHALL be repeated at least 20 times per configuration. Results SHALL
   report median (p50), p90, and maximum.
5. Baselines SHALL be captured for `Debug+Metro`, `Release-local`, and, when an Apple Developer
   account exists, `TestFlight`. Debug results SHALL be stored but SHALL NOT be used to pass or fail
   acceptance.
6. Baselines SHALL be captured on commit `ec4d9c1` (or its successor before any optimisation in
   this spec), so that later results compare against a fixed reference.

### Requirement 2 — Input-to-visual latency measurement

**User Story:** As a choreographer, I want every tap and drag to respond immediately, so that I can
mark and rehearse in time with the music.

#### Acceptance Criteria — Requirement 2

1. THE project SHALL measure first-feedback and commit latency for:
   1. waveform tap seeking (wrapped canvas and overview);
   2. waveform scrubbing (drag start latency and per-frame tracking lag during the drag);
   3. play/pause, First/Previous/Next/Shuffle, repeat, inner-loop, and speed step controls;
   4. marker creation and removal from the dock marker controls;
   5. opening, saving, and dismissing the annotation editor;
   6. opening the Music Library and switching tracks from it, through to first playable audio and
      first rendered waveform.
2. Latency SHALL be measured by at least one of: 240-fps external video with a visible touch
   indicator, or signposts paired with Instruments touch events. Method and its resolution SHALL be
   recorded with each result.
3. In `Release-local` on the reference device, with the medium song and the 50-marker project,
   the following thresholds SHALL pass at p90:

   | Interaction | First feedback | Commit |
   |---|---:|---:|
   | Button/dock pressed state | ≤ 50 ms | n/a |
   | Play/pause (visual state) | ≤ 100 ms | audio audible ≤ 150 ms |
   | Waveform tap seek (playhead moved) | ≤ 100 ms | audio from new position ≤ 200 ms |
   | Scrub tracking lag (playhead behind finger) | ≤ 2 frames at 60 Hz (≤ 33 ms) | n/a |
   | Marker create/remove (marker visible/removed) | ≤ 100 ms | n/a |
   | Annotation open (editor visible and focused) | ≤ 300 ms | n/a |
   | Annotation save/dismiss (editor gone, callout updated) | ≤ 300 ms | n/a |
   | Library open (sheet begins moving) | ≤ 100 ms | sheet settled ≤ 500 ms |
   | Track switch (title updated) | ≤ 200 ms | playable ≤ 1 s; waveform ≤ 2 s (medium song) |

4. With the long (≥ 150 s) song and the 500-marker project, the thresholds above SHALL be met with a
   relaxation of no more than 1.5× each value. A miss is recorded as a finding, not hidden.
5. Seeking SHALL remain accurate: after a tap seek, the reported audio position SHALL be within
   ±20 ms of the tapped timestamp at the next status update, unchanged from current behaviour.

### Requirement 3 — Frame-time and dropped-frame targets

**User Story:** As a dancer, I want playback and gestures to stay smooth, so that the playhead is a
trustworthy timing reference.

#### Acceptance Criteria — Requirement 3

1. THE project SHALL measure UI-thread and JS-thread frame times during: 60 s of playback, 10 s of
   continuous scrubbing, opening and closing the Music Library, and opening and saving an
   annotation with the keyboard.
2. In `Release-local` on the reference device:
   1. during steady playback, the Core Animation hitch ratio SHALL be < 5 ms/s and no single hitch
      SHALL exceed 50 ms;
   2. during scrubbing and sheet/modal transitions, the hitch ratio SHALL be < 10 ms/s;
   3. JS-thread tasks longer than 50 ms SHALL NOT occur during steady playback, and SHALL occur at
      most once per interaction elsewhere;
   4. the device SHALL be measured at its native refresh rate; ProMotion results SHALL also be
      reported as frames at 120 Hz.
3. Thresholds are initial targets. A threshold MAY be revised only with a recorded rationale and
   human approval, never silently to make a result pass.

### Requirement 4 — React render profiling

**User Story:** As the developer, I want to know which components render and why, so that I remove
render work that has no visible effect.

#### Acceptance Criteria — Requirement 4

1. THE project SHALL audit every `useStudioStore` subscription and classify each as granular,
   broad (object or array selector without equality), or derived-in-selector, with update frequency
   during playback.
2. THE project SHALL record, with React DevTools Profiler (or an equivalent commit log), render
   counts per component during 10 s of playback, one tap seek, one marker add, one annotation save,
   and one track switch.
3. During steady playback with the 50-marker project, components other than the playhead overlay,
   the active wrapped row, `PlaybackTimeProbe`, the dance-count display (when enabled), and the
   loop/overview position indicator SHALL NOT render more than once per second.
4. THE audit SHALL identify unstable callbacks or props passed to memoised children, and SHALL
   record which ones cause measurable extra renders.
5. Waveform path generation (`WrappedRow`, `WrappedWaveform`, overview, `RhythmicGrid`) SHALL be
   instrumented. Paths SHALL be regenerated only when waveform data, row geometry, zoom, or
   dimensions change, never because of position, selection, or loop updates alone.
6. Gesture handlers SHALL be instrumented for reconstruction. A gesture object SHALL NOT be rebuilt
   on playback position updates.
7. Modal presentation and keyboard transitions SHALL be profiled for layout passes. Opening or
   saving an annotation SHALL NOT cause a full studio re-layout, and SHALL NOT regress the C-3
   crash fix.

### Requirement 5 — Native profiling with Instruments

**User Story:** As the developer, I want native traces of the slow interactions, so that I can see
whether time is spent in JS, Fabric, layout, rendering, audio, or decoding.

#### Acceptance Criteria — Requirement 5

1. THE project SHALL capture, on a physical iPhone in `Release-local` (profiled with debug symbols),
   traces using Time Profiler, Allocations, Leaks, Animation Hitches/Core Animation, and
   os_signpost (Points of Interest).
2. THE project SHALL emit signpost intervals for: tap seek, scrub session, annotation modal open
   and save, track switch, waveform decode/extraction, BPM analysis, and draft autosave write.
3. Signposts SHALL be compiled into Debug and internal Release builds, and SHALL be removable or
   disabled in App Store builds through one configuration flag, with no measurable overhead when
   disabled (≤ 1% CPU difference in a 60 s playback trace).
4. EACH trace SHALL be stored outside the repository (traces are large) with its path, commit,
   device, and build type recorded in the Results Register.

### Requirement 6 — Hermes and build-type comparison

**User Story:** As the developer, I want to compare Debug, Release, and TestFlight builds with the
same method, so that I do not optimise problems that only exist in development.

#### Acceptance Criteria — Requirement 6

1. THE project SHALL document how to capture a Hermes sampling profile on a physical device in
   Debug and in a Release-profiling build, and how to load it in Chrome DevTools or React Native
   DevTools.
2. THE project SHALL document how to build and install a signed `Release-local` build that loads
   the embedded bundle without Metro.
3. THE same measurement script SHALL be run against every build type, and the Results Register
   SHALL show the build types side by side.
4. IF an interaction passes in `Release-local` but fails only in `Debug+Metro`, THEN it SHALL be
   recorded as development-only and SHALL NOT trigger an optimisation task.
5. `TestFlight` measurements are blocked on the Apple Developer account. Until it exists,
   `Release-local` is the acceptance build, and the gap SHALL be stated explicitly.

### Requirement 7 — Memory and thermal behaviour

**User Story:** As a choreographer running a long rehearsal, I want BeatNote to stay responsive and
not heat the phone or get killed in the background.

#### Acceptance Criteria — Requirement 7

1. THE project SHALL measure resident memory (physical footprint), CPU, energy impact, and thermal
   state during 5-, 15-, and 30-minute sessions using a scripted mix: continuous playback with loop,
   a seek every 10 s, a marker every 30 s, an annotation every 2 min, and a track switch every 5 min.
2. THE project SHALL repeat the measurement with the ≥ 150 s song and the ≥ 8 min stress track.
3. In `Release-local` on the reference device:
   1. physical footprint after the 30-minute session SHALL be within 15% (or 40 MB, whichever is
      larger) of the footprint at minute 5;
   2. ten consecutive track switches across the reference songs SHALL NOT grow the footprint by
      more than 30 MB after returning to the first song;
   3. Leaks SHALL report no leaked BeatNote-owned objects that grow with session length;
   4. thermal state SHALL NOT reach `serious` in 30 minutes at room temperature with the screen on;
   5. average CPU during steady playback SHALL be recorded; a target is set after the baseline.
4. Background playback for 15 minutes SHALL NOT cause iOS to terminate BeatNote for memory or CPU.

### Requirement 8 — Contention between playback, decoding, persistence, and analysis

**User Story:** As a user importing or switching to a long song, I want playback and controls to
keep working while BeatNote decodes and analyses in the background.

#### Acceptance Criteria — Requirement 8

1. THE project SHALL measure interaction latency (Requirement 2) and hitches (Requirement 3) while
   each of the following runs, alone and combined: waveform extraction, BPM analysis, draft
   autosave of the 500-marker project, and track-switch persistence.
2. Audio playback SHALL have no audible dropout during any combination. Dropouts SHALL be checked
   by ear on device and by audio-session interruption/stall logs where available.
3. Latency during background work SHALL stay within 1.5× of the idle thresholds in Requirement 2.
4. Draft autosave SHALL NOT produce a JS-thread task longer than 16 ms for the 500-marker project;
   if it does, the finding SHALL be recorded with the serialisation cost.
5. BPM analysis cancellation on track switch SHALL complete within 250 ms, consistent with the
   automatic-BPM detection spec's open cancellation gate.

### Requirement 9 — Phased, low-risk optimisation

**User Story:** As the developer, I want optimisations sequenced from safest to riskiest, so that
each change has a measured benefit and can be backed out.

#### Acceptance Criteria — Requirement 9

1. Work SHALL proceed in phases: measurement tooling and baselines first; then high-confidence
   render reductions; then targeted interaction-path changes; then background-work scheduling;
   and only then, if thresholds still fail with evidence, any larger structural change.
2. EACH optimisation SHALL name the confirmed finding it addresses. An optimisation addressing only
   a hypothesis SHALL first include a measurement step that confirms or rejects it.
3. EACH optimisation SHALL be one reviewable change set with its own before/after measurement.
4. A larger change (for example moving the playhead to Reanimated shared values, replacing SVG
   rendering, changing the audio engine, or upgrading React Native/Expo) SHALL require a written
   decision record with measured evidence and human approval before implementation.

### Requirement 10 — Behaviour preservation, regression coverage, and rollback

**User Story:** As a user, I want faster BeatNote without losing any existing behaviour.

#### Acceptance Criteria — Requirement 10

1. THE following behaviour SHALL be preserved and checked after every optimisation:
   pitch-corrected playback from 0.5× to 2×; seek accuracy (Requirement 2.5); background audio;
   draft autosave and restore; loop-range behaviour; accessibility names, roles, states, and 44×44
   touch targets; Reduce Motion handling; and the C-3 crash fix.
2. EACH optimisation SHALL pass `npx tsc --noEmit` and `npm test`. Optimisations touching native
   surfaces SHALL also pass the relevant focused iOS XCTest case.
3. Regression assertions SHALL be added to the nearest retained Playwright journey or iOS XCTest
   case only when they protect a user-visible outcome, following the testing strategy. Render-count
   or timing assertions SHALL NOT become permanent tests.
4. EACH optimisation SHALL state rollback criteria. It SHALL be reverted if any of:
   1. any preserved behaviour in 10.1 regresses;
   2. its target metric does not improve by at least 10% at p90 or move a failing threshold to pass;
   3. any other measured metric in the Results Register worsens by more than 10% at p90;
   4. a new crash or hang appears in its affected flow.
5. Rollback SHALL be a single `git revert` of the optimisation's commit, so each optimisation
   SHALL be committed separately.

### Requirement 11 — Results register

**User Story:** As the next agent or a reviewer, I want every measurement in one table, so that
claims of improvement can be checked.

#### Acceptance Criteria — Requirement 11

1. THE spec SHALL maintain a results table recording: date, commit, device, iOS version, build
   type, song (duration and format), project density, interaction or scenario, metric, method,
   n, p50, p90, max, threshold, pass/fail, and trace path or note.
2. Results SHALL be entered from recorded measurements only. Estimates and simulator numbers SHALL
   be marked as such and SHALL NOT count as passes.
3. Before/after rows for an optimisation SHALL share device, iOS version, build type, song, and
   project density.

### Requirement 12 — Physical-device dependency

**User Story:** As the human tester, I want to know which tasks need my iPhone, so that I can plan
sessions.

#### Acceptance Criteria — Requirement 12

1. EACH task in `tasks.md` SHALL be labelled `[device]` (requires a physical iPhone and usually the
   human), `[sim]` (simulator acceptable), or `[desk]` (code or documentation only).
2. Simulator measurements SHALL NOT be used to pass any latency, frame-time, memory, or thermal
   threshold.
