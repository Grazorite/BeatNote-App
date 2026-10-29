# Design Document — App Performance Optimisation

> Companion to [`requirements.md`](./requirements.md). This design describes measurement method,
> instrumentation, analysis, and the shape of candidate optimisations. Candidate optimisations are
> hypotheses until the Results Register (§9) confirms the bottleneck they target.

## 1. Overview

The work has two halves:

1. **Measure.** Add lightweight, removable instrumentation; define reference songs and projects;
   capture baselines in `Debug+Metro`, `Release-local`, and later `TestFlight`; profile React,
   Hermes, and native layers on a physical iPhone.
2. **Reduce.** Apply small, separately committed optimisations in ascending order of risk, each
   with before/after numbers and an explicit rollback rule.

No architecture migration is in scope. ADR-001 (single Zustand store), ADR-007 (no navigation
library), ADR-011 (expo-audio for pitch-preserved playback), and ADR-016 (custom bottom sheet)
remain in force unless a decision record (§8) with measured evidence supersedes one.

## 2. Relevant code surfaces

The investigation starts from these files. The list is a map, not a claim that each is slow.

| Area | Files |
|---|---|
| Global state | `src/hooks/useStudioStore.ts` |
| Studio composition | `src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx` |
| Audio player boundary | `src/hooks/useAudioPlayer.ts` (`useCustomAudioPlayer`) |
| Waveform | `src/components/ui/waveform/WrappedWaveform.tsx`, `WrappedRow.tsx`, `RowGutter.tsx`, `RhythmicGrid.tsx`, `GridPreviewOverlay.tsx`, `WaveformWorkspace.tsx`; `src/hooks/useWrappedRows.ts`, `useWaveformData.ts`, `useViewportFollow.ts` |
| Overview and loop | `src/components/ui/controls/LoopOverviewTrack.tsx`, `LoopRangeOverview.tsx`, `LoopRangeLayer.tsx`; `src/hooks/useLoopRangeGesture.ts` |
| Dock and transport | `ControlDock.tsx`, `DockButton.tsx`, `PlayPauseControl.tsx`, `QueueTrackButton.tsx`, `MarkerDockButton.tsx`, `PlaybackSpeedControl.tsx`, `PlaybackTimeProbe.tsx`, `DanceCountDisplay.tsx` (all under `src/components/ui/controls/`) |
| Annotation | `AnnotationDockButton.tsx`, `AnnotationField.tsx`, `AnnotationCallout.tsx` |
| Library and persistence | `src/features/library/trackSwitch.ts`, `draftAutosave.ts`, `persistencePipeline.ts`, `useLibraryLifecycle.ts` |
| Native | `modules/beatnote-waveform/`, `modules/beatnote-tempo/`, `modules/library-storage/` |
| Existing helper | `src/hooks/usePerformanceMonitor.ts` (render-time averaging, used by `StudioScreen.tsx`) |

## 3. Reference fixtures

### 3.1 Songs

| ID | Duration | Format | Source |
|---|---|---|---|
| S-short | 30–60 s | M4A/AAC 256 kbps | Generated click/tone track (redistributable) |
| S-medium | 3–4 min | MP3 320 kbps and M4A | Local representative song, path + SHA-256 only |
| S-long | 150 s | M4A | Existing `long-test-track.m4a` fixture |
| S-stress | ≥ 8 min | WAV 44.1 kHz stereo and M4A | Local representative recording, path + SHA-256 only |

Fixture metadata lives in `.kiro/specs/app-performance-optimization/fixtures.md` (created in
task 1.1). Audio files that cannot be redistributed stay out of git.

### 3.2 Projects

For each song, three projects with 0, 50, and 500 markers evenly distributed, 20% of markers
annotated, one loop range, and dance counts enabled in one variant. A temporary development-only
generator script creates them deterministically from a seed so before/after runs use identical data.

## 4. Instrumentation

### 4.1 JS timing marks

A small module `src/utils/perfMarks.ts` (pure, no React imports) exposes
`perfBegin(name, id)` / `perfEnd(name, id)` and a ring buffer of the last N intervals. It is gated
by a build-time flag `BEATNOTE_PERF` (default on for Debug and internal Release, off for store
builds). When off, functions are no-ops that the bundler can strip.

Marks bracket: touch handler entry → store update → commit of the affected component
(`useLayoutEffect` in the receiving component) for tap seek, marker add/remove, annotation
open/save, play/pause, and track switch.

### 4.2 Native signposts

A Swift helper in the existing `library-storage` module (to avoid adding a fourth module solely for
instrumentation) exposes `signpostBegin(name, id)` and `signpostEnd(name, id)` using
`OSSignposter` with subsystem `com.beatnote.app` and category `PointsOfInterest`. JS marks in §4.1
forward to it on iOS when the flag is on. Native code in `BeatNoteWaveform` and `BeatNoteTempo`
emits its own intervals around decode/extraction windows and analysis windows.

Signpost names: `seek.tap`, `seek.scrub`, `annotation.open`, `annotation.save`, `track.switch`,
`waveform.decode`, `bpm.analysis`, `draft.write`.

Overhead check: compare a 60 s playback Time Profiler trace with the flag on and off (requirement
5.3).

### 4.3 Render accounting

- React DevTools Profiler connected to the device in Debug for "why did this render" data.
- For Release-profiling builds, a development-only `useRenderCounter(name)` writes counts into the
  `perfMarks` buffer. It is temporary, used during the audit, and removed before completion
  (testing strategy: no permanent render-count tests).
- Path-regeneration counters wrap the functions that build SVG path strings; gesture-reconstruction
  counters wrap `Gesture.*()` construction sites.

### 4.4 Latency capture

Two methods, recorded per result:

1. **Video:** 240-fps external camera, iOS "Show Touches"-equivalent indicator (development-only
   touch overlay if needed). Count frames from contact to visible response. Resolution ≈ 4.2 ms.
2. **Trace:** Instruments with Points of Interest plus the Animation Hitches template; latency is
   from the touch event to the first frame commit after the relevant signpost ends.

Video is authoritative for first feedback; traces explain where the time went.

## 5. Build types and profiling method

| Build type | How | Use |
|---|---|---|
| `Debug+Metro` | Xcode Run, Debug, dev client, wired local Metro (see iOS steering) | React DevTools, Hermes sampling, diagnosis only |
| `Release-local` | Xcode, Release configuration, embedded bundle, local signing; Profile action for Instruments | Acceptance measurements, Instruments |
| `TestFlight` | `eas build --profile preview` once the Apple account exists | Confirmation that Release-local results hold |

Hermes profiling: in Debug, use React Native DevTools' profiler; in Release, enable Hermes sampling
profiler via a profiling build variant and pull the `.cpuprofile` with the documented command. Both
procedures are written into `profiling-guide.md` in this spec folder (task 1.4).

Every scenario uses the same written script (task 1.3) so build types are comparable. Device
preparation: Low Power Mode off, brightness fixed, charging state recorded, 5 minutes idle cool-down
between thermal runs, app force-quit and relaunched before each set.

## 6. Analysis areas

### 6.1 Zustand subscription audit

Enumerate every `useStudioStore(...)` call. For each record component, selected fields, whether the
selector returns a new object/array (needs `useShallow` or splitting), and how often the selected
value changes during playback. Output: a table in `findings.md`. Fix candidates are only granular
selector splits and `useShallow`; no new stores (ADR-001).

### 6.2 Parent renders and unstable props

From profiler commits, list parents that render during playback or interactions and children that
re-render only because of new callback/object identities. Fix candidates: move state down, stabilise
callbacks passed to memoised children, or remove a memo that has no effect. `React.memo` additions
must cite the measured render they remove (coding standards).

### 6.3 SVG and waveform paths

Confirm whether row paths, overview path, and rhythmic grid are rebuilt on position, selection, or
loop changes. Fix candidates: key path memoisation only on data/geometry/zoom/dimensions; split
static path layers from dynamic overlays so overlays render in separate components.

### 6.4 Gesture reconstruction

Count `Gesture.Tap()/Pan()` constructions per second during playback. Fix candidates: stable gesture
objects with handlers that read current values from refs or the store's `getState()` inside the
handler (permitted in event handlers by coding standards).

### 6.5 Interaction path latency

For tap seek and controls, split IVL into: touch delivery → JS handler → store update → React
commit → Fabric mount → frame. Candidate fixes, in order of risk: give pressed states native
feedback (Pressable style/opacity without waiting for store work); update the playhead position
optimistically before the player seek resolves; defer non-visual work (persistence, analytics,
queue bookkeeping) with `requestAnimationFrame` or `InteractionManager`-style scheduling. A move to
Reanimated shared values for the playhead is a §8 decision, not a default.

### 6.6 Modal and keyboard transitions

Profile annotation open/save and library sheet with Core Animation and layout signposts. Verify that
the C-3 fix (deferring store publication until modal dismissal, removing whole-studio keyboard
avoidance) still holds and that no full-tree layout happens. Fix candidates are local: keyboard
handling scoped to the editor; deferring heavy children until the transition ends.

### 6.7 Native time, memory, and leaks

Time Profiler for main-thread and JS-thread hot paths during each scenario; Allocations with
generation marks at each track switch; Leaks after the 30-minute session. Expect to check retained
waveform buffers, analysis results, `AudioPlayer` instances, and listeners not removed on switch.

### 6.8 Contention

Run the interaction script while waveform decode, BPM analysis, and draft autosave run
individually and together. Inspect thread priorities (QoS) in Time Profiler, main-thread blocking,
and JS-thread long tasks. Candidate fixes: lower QoS or yield more often in native loops, defer
analysis start until playback is stable or the user is idle, chunk or debounce autosave
serialisation, and ensure cancellation on switch.

## 7. Optimisation catalogue (candidates)

Each item becomes a task only after its hypothesis is confirmed. Risk: L (low), M (medium), H (high).

| ID | Candidate | Targets | Risk | Rollback signal |
|---|---|---|---|---|
| O-1 | Split broad store selectors / add `useShallow` | H-2 | L | Stale UI or missed update in any retained journey |
| O-2 | Stabilise callbacks to memoised children; remove ineffective memos | H-2, H-4 | L | Render count unchanged or behaviour change |
| O-3 | Separate static waveform path layers from dynamic overlays | H-3 | L–M | Visual misalignment of playhead/markers/loop |
| O-4 | Stable gesture objects reading refs | H-4 | M | Gesture conflict, missed tap, scrub regression |
| O-5 | Immediate native pressed feedback for dock controls | H-5 | L | Accessibility state or touch-target regression |
| O-6 | Optimistic playhead update on seek, reconcile with player status | H-5 | M | Seek accuracy outside ±20 ms, playhead jumps back |
| O-7 | Defer non-visual work after interactions | H-5, H-6 | M | Draft not saved before force-quit; lost marker |
| O-8 | Chunk/debounce draft serialisation | H-6 | M | Autosave restore failure |
| O-9 | Schedule decode/analysis to yield to playback and interaction | H-7 | M | Analysis never finishes; cancellation regression |
| O-10 | Scope keyboard/modal layout to the editor | H-8 | M | C-3 crash recurrence, keyboard overlap |
| O-11 | Release buffers/listeners on track switch | H-9 | M | Switch-back shows stale/missing waveform |
| O-12 | Structural change (Reanimated playhead, canvas renderer, RN/Expo upgrade) | Any, after O-1…O-11 | H | Requires §8 decision record |

## 8. Decision records for larger changes

A larger change requires `decisions/PDR-<n>.md` in this spec folder containing: the failing
threshold and its Results Register rows; the smaller optimisations already tried and their results;
the proposed change, cost, and risk to preserved behaviour; a time-boxed spike plan; and human
approval. An accepted record that changes architecture also updates
`.kiro/steering/architecture-decisions.md`.

## 9. Results register

The register lives in `results.md` in this spec folder so it can grow without churning this design.
Its format:

| Date | Commit | Device | iOS | Build | Song (dur/format) | Markers | Scenario | Metric | Method | n | p50 | p90 | Max | Threshold | Pass | Trace / note |
|---|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---:|---|---|---|
| _example_ | `ec4d9c1` | iPhone 15 Pro Max | 27.0.1 | Release-local | S-medium 3:32 M4A | 50 | Tap seek | First feedback ms | 240-fps video | 20 | — | — | — | ≤ 100 | — | Not yet measured |

Rules: one row per (configuration, metric); before/after rows share every configuration column;
simulator or estimated values are labelled in the note and never pass.

## 10. Behaviour preservation and verification

For every optimisation:

1. `npx tsc --noEmit` and `npm test` (retained Playwright journeys).
2. Focused iOS XCTest when native or iOS-specific behaviour is touched, for example
   `testAudioAnnotationAndProjectRestore` for persistence, loop transport and background audio cases
   for player changes.
3. Device checklist on `Release-local`: pitch-corrected speed at 0.5×, 1×, 2×; seek accuracy;
   15-minute background audio; force-quit draft restore; loop boundaries; VoiceOver labels on touched
   controls; Reduce Motion; annotation save and song rename without crash.
4. Before/after rows in the Results Register and a rollback decision per Requirement 10.4.

Temporary unit tests and render counters may be used during implementation and are removed before
completion, per the testing strategy.

## 11. Risks

- **Measurement noise.** Thermal state and background iOS activity change results. Mitigation:
  fixed device preparation, n ≥ 20, report p90, re-run baselines when iOS updates.
- **Instrumentation overhead.** Mitigated by the off-flag check in §4.2.
- **Debug-only conclusions.** Mitigated by requiring Release-local for acceptance.
- **Single reference device.** The iPhone 15 Pro Max is fast; a floor-device pass is recommended
  before TestFlight and recorded as a gap until done.
