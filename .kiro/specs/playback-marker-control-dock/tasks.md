# Implementation Plan: Playback and Marker Control Dock

## Overview

This plan derives a phased, dependency-ordered implementation from
[`design.md`](./design.md) and [`requirements.md`](./requirements.md). It builds pure logic and
store state first (the `Inner_Loop_State` derivations and the net-new `cycleInnerLoop` action, with
full unit and property coverage), then the shared dock component scaffolding and `MainContent.tsx`
phone-branch wiring, then the responsive 2×8 grid and the dominant 2×2 play/pause block, then the
explicit marker controls, the tri-state inner-loop control, the whole-song range auto-init, the
independent repeat interaction, the shared toast, the reserved placeholders, and the playback-speed
contract. Pure logic and state are separated from UI integration throughout, and the dock lands as a
single phone-only `ControlDock` that replaces the former `AudioControls` + `MarkerButton` rows while
the desktop branch keeps those two components unchanged.

All code is TypeScript / React Native, matching the existing codebase and
[`coding-standards.md`](../../steering/coding-standards.md). All timestamps are integer milliseconds
(ADR-009); all global state stays in the single store `useStudioStore` (ADR-001); all colours come
from `src/styles/common.ts` (ADR-006). This feature changes NO `useAudioPlayer.ts` loop logic — the
dock only changes which store fields the UI sets and when. No playlist, shuffle, or native
time-stretch engine work is included (see Out of Scope in the spec).

### Scope boundary

This is layout, interaction, state-wiring, accessibility, and feedback for the phone control dock
only. The playlist/queue data model, the shuffle engine, the native pitch-preserving playback-speed
engine (`modules/audio-time-stretch/`), a persisted `playbackSpeed` field, moving loop handles into
the wrapped gutter, and desktop layout redesign are all out of scope. Reserved controls and the
playback-speed button are stable contracts only.

### Verification checkpoints

Each phase ends with an explicit checkpoint using the project build gate:

- TypeScript: `npx tsc --noEmit`
- Unit: `npx jest --testPathPatterns=unit`
- Playwright E2E: `npm test` (use `PLAYWRIGHT_PORT=8082 npm test` when a simulator Metro server is
  already serving on port 8081)
- iOS XCTest: `npm run test:ios:ui` (focused with `IOS_TEST_ONLY=<test-name> npm run test:ios:ui`)
- A physical-device acceptance gate is the final task before the feature is called done.

### Testing strategy alignment

Per [`testing-strategy.md`](../../steering/testing-strategy.md): unit-test the net-new store action
and the pure derivations against a fresh `create()` store; cover dock geometry, interaction, toast,
and responsive reflow as cohesive Playwright and XCTest workflows. Do NOT add trivial render-only or
implementation-detail assertions, and remove any superseded tests rather than keeping them for
historical counts.

### Resolved product decisions

The implementation follows the product decisions resolved in the requirements and design:

- The authoritative playback-speed set and default shape the `PlaybackSpeedControl`
  `options`/`value` defaults in Task 10.1; the control accepts them as props so a later decision
  needs no redesign.
- Playback-speed behaviour before the engine ships shapes Task 10.1's
  label-only + toast behaviour.
- Landscape toast placement follows the resolved waveform-facing rail-edge rule in Task 8.1.
- The reserved-control accessible pattern shapes Task 11.1 and is confirmed in the
  physical-device gate (Task 15.2).
- The strict `< 100` ms vs `<= 100` ms nearby-marker boundary (requirements R4 note) is reconciled in
  Task 4.1.

## Tasks

### Phase 1 — State model and playback precedence

- [x] 1. Add the pure inner-loop derivations and the `cycleInnerLoop` store action
  - [x] 1.1 Create `src/utils/innerLoop.ts` with the pure state derivations
    - Export the `InnerLoopState = 'off' | 'markers' | 'range'` type and `deriveInnerLoopState`,
      `nextInnerLoopState`, `canEnterRangeState`, and `formatSpeedLabel` with the signatures and
      behaviour in the design "Store additions" and "Data Models" sections.
    - `deriveInnerLoopState(isLoopMarkerActive, isLoopRangeEnabled)` returns `markers`, `range`, or
      `off`; `nextInnerLoopState` follows off → markers → range → off; `canEnterRangeState(songDuration, hasValidRange)`
      is true only when `songDuration >= MIN_LOOP_DURATION_MS` or a valid range already exists.
    - `formatSpeedLabel(value)` returns `${value}×` (for example `0.75` → `0.75×`).
    - No React / React Native imports, no I/O, no store access; equal inputs give equal outputs.
    - Files: `src/utils/innerLoop.ts`.
    - _Requirements: 8.1, 8.2, 11.7, 11.8, 3.3, 14.1_

  - [x] 1.2 Add the net-new `cycleInnerLoop` action to the single store
    - Implement `cycleInnerLoop(): InnerLoopState` in `src/hooks/useStudioStore.ts`, composing the
      existing `toggleLoopMarker`, `toggleLoopRangeEnabled`, and `setLoopRange` so the tri-state
      advances off → markers → range → off and returns the resulting `Inner_Loop_State`.
    - On entering `range` with no valid range, auto-init via `setLoopRange(0, songDuration)` guarded
      by `canEnterRangeState`; when the guard rejects or `setLoopRange` fails validation, do not call
      `toggleLoopRangeEnabled` and leave the state unchanged (R8.10, R11.1, R11.2, R11.7, R11.8).
    - Never write `isRepeatActive`; rely on the existing store mutual-exclusion so
      `isLoopMarkerActive` and `isLoopRangeEnabled` are never both true (R8.8, R9.2).
    - Use the `set((state) => ...)` form where new state derives from existing state.
    - Files: `src/hooks/useStudioStore.ts`.
    - _Requirements: 8.2, 8.8, 8.10, 9.2, 11.1, 11.2, 11.7, 11.8_

  - [x] 1.3 Confirm `useAudioPlayer.ts` loop logic is unchanged
    - Verify by inspection that no edit to `src/hooks/useAudioPlayer.ts` is required: the dock sets
      the same `isLoopMarkerActive`, `isLoopRangeEnabled`, `isRepeatActive`, `loopStartMs`, and
      `loopEndMs` fields the existing actions already set, so the 50 ms poll, `effectiveLoop*`
      resolution, `loopDecisionSuspendedRef`, and `failedLoopRangeKeyRef` behave identically.
    - Record this as a documented no-op (no file change) so later tasks do not touch playback
      precedence.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 2. Checkpoint — state model
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2 — Shared dock component structure

- [x] 3. Scaffold the dock container, the shared button primitive, and the phone wiring
  - [x] 3.1 Create the `DockButton` presentational primitive and its styles
    - Create `src/components/ui/controls/DockButton.tsx` with the `DockButtonState =
      'active' | 'inactive' | 'unavailable' | 'reserved'` type and the `DockButtonProps` shape from
      the design, owning the square icon-button look, a ≥ 44×44 touch target via `hitSlop`, and the
      four-state styling where each state carries a distinct non-colour cue in addition to colour
      (R3.1, R3.6, R3.7).
    - Render icons from the shared custom family in `src/components/icons`, and use only colour
      tokens from `src/styles/common.ts` (R3.5).
    - Add the mirrored style file `src/styles/components/controls/dockButton.ts`.
    - Files: `src/components/ui/controls/DockButton.tsx`,
      `src/styles/components/controls/dockButton.ts`.
    - _Requirements: 3.1, 3.5, 3.6, 3.7_

  - [x] 3.2 Create the `ControlDock` container shell and its styles
    - Create `src/components/ui/controls/ControlDock.tsx` with root `testID="control-dock"` and the
      `ControlDockProps` (`isLandscape`, `onTogglePlayback`, `onSeek`, `onAddMarker`) from the
      design; choose the `portrait-control-dock` or `landscape-control-rail` container by
      `isLandscape` and render a placeholder grid shell with no store subscription of its own.
    - Add the mirrored style file `src/styles/components/controls/controlDock.ts`.
    - Keep the component ≤ 150 lines (coding standards).
    - Files: `src/components/ui/controls/ControlDock.tsx`,
      `src/styles/components/controls/controlDock.ts`.
    - _Requirements: 1.1, 16.2, 16.3_

  - [x] 3.3 Wire the phone branch of `MainContent.tsx` to render `ControlDock`
    - In `src/components/layout/MainContent.tsx`, replace the phone-branch composition of
      `AudioControls` + `MarkerButton` with `ControlDock`, passing the existing `onTogglePlayback`,
      `onSeek`, and the add-marker handler; keep the `LoopRangeOverview` strip positioned directly
      above the dock inside `styles.mobileCanvas` (R18.5).
    - Leave the desktop branch rendering `AudioControls` + `AnnotationField` + `MarkerButton`
      unchanged, so zero elements from either prior row appear on the phone layout (R1.7).
    - Files: `src/components/layout/MainContent.tsx`.
    - _Requirements: 1.7, 18.5_

- [x] 4. Checkpoint — dock scaffolding
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3 — Grid geometry and the 2×2 play/pause control

- [x] 5. Lay out the portrait grid, landscape rail, and dominant play/pause block
  - [x] 5.1 Implement the responsive portrait 2×8 grid in `ControlDock`
    - In `src/components/ui/controls/ControlDock.tsx` and
      `src/styles/components/controls/controlDock.ts`, render exactly two rows of eight columns (16
      cell positions) with the exact cell assignment from the design: row 1 c1–c3 prev/add/next
      marker, c6–c8 repeat/inner-loop/shuffle; row 2 c1–c3 first/prev/next track, c6–c8
      speed/remove-previous/empty-cell; the 2×2 play/pause block spanning c4–c5 on both rows
      (R1.1–R1.6).
    - Fit phone portrait widths 320–480 px and landscape 480–932 px with no horizontal scrollbar and
      no clipped control; resize controls to stay fully visible rather than overflow while preserving
      the 2×8 arrangement (R16.1, R16.4, R16.7).
    - Render the `dock-empty-cell` at row 2 column 8 with the identical cell width/height as adjacent
      cells, no touch handler, no button role, and no activation affordance (R1.5).
    - Files: `src/components/ui/controls/ControlDock.tsx`,
      `src/styles/components/controls/controlDock.ts`.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 16.1, 16.4, 16.7_

  - [x] 5.2 Create the `PlayPauseControl` 2×2 block and its styles
    - Create `src/components/ui/controls/PlayPauseControl.tsx` (`testID="play-pause"`) occupying
      columns 4–5 across both rows as one contiguous 2×2 block, each side ≥ 2.0× an ordinary square
      button side, with the icon scaled fully within the block and no clipping (R2.1, R2.2, R2.3).
    - Subscribe narrowly to `isPlaying` and `songLoaded`; show `Pause` when `isPlaying`, else `Play`,
      never both (R2.4); present a reduced-emphasis disabled appearance and disabled accessibility
      state while `!songLoaded`, and do not toggle on a press while `!songLoaded` (R2.5, R2.6).
    - Position it so the left marker/playlist group (c1–c3) and the right playback-mode group
      (c6–c8) never share a column (R2.7).
    - Add the mirrored style file `src/styles/components/controls/playPauseControl.ts`.
    - Files: `src/components/ui/controls/PlayPauseControl.tsx`,
      `src/styles/components/controls/playPauseControl.ts`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 5.3 Preserve orientation state and verify both-orientation geometry
    - Ensure the dock renders the portrait 2×8 grid and the landscape two-column rail with three rows,
      a full-width 2×2 play block, and three more rows inside `portrait-control-dock` and
      `landscape-control-rail`, and that an orientation change retains
      every playback, marker, loop, repeat, and speed value with no reset to defaults (R16.4, R16.5,
      R16.6).
    - Constrain the dock height so the waveform region keeps at least its current phone height
      (R16.5).
    - Files: `src/components/ui/controls/ControlDock.tsx`,
      `src/styles/components/controls/controlDock.ts`.
    - _Requirements: 16.3, 16.4, 16.5, 16.6_

- [x] 6. Checkpoint — grid geometry
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

  > Pending geometry decision: eight non-overlapping 44-point columns require at least 352 points
  > before gaps or padding, so the stated 320-point minimum cannot satisfy Task 5.1 literally.
  > Portrait is verified at 393 points. Landscape uses a separate 96-point, two-column rail with
  > near-square 36-point-tall visual controls and hit slop preserving a 44-point effective target, protecting waveform
  > width without forcing the portrait grid into landscape.

### Phase 4 — Explicit marker add and remove controls

- [x] 7. Place the marker and navigation controls as explicit dock buttons
  - [x] 7.1 Wire the add-marker control preserving the `tapToBeat` toggle semantics
    - Render the `add-marker` `DockButton` at row 1 column 2, subscribing to `songLoaded`,
      `activeLayerId`, `layers`, and `currentTime`; enable only while `songLoaded` and
      `isActiveLayerVisible`, and disable otherwise with a reason (R4.1, R4.2, R4.3).
    - Keep the existing `tapToBeat` toggle behaviour: add via `addMarker` when no active-layer marker
      lies within 100 ms (inclusive) of `currentTime`, otherwise remove the nearest via
      `removeMarker` (R4.4, R4.5, R4.6). Reconcile the strict `< 100` ms `hasNearbyMarker` check with
      the `<= 100` ms `tapToBeat`/`removeMarker` boundary to a single inclusive comparison and note
      the chosen boundary in the component.
    - Swap the icon between the add and remove glyphs on `hasNearbyMarker`, with a neutral disabled
      glyph (design Icon strategy).
    - Files: `src/components/ui/controls/ControlDock.tsx` (or a small marker-cell helper),
      `src/components/ui/controls/DockButton.tsx`.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.2 Wire the explicit remove-previous-marker control
    - Render the `remove-last-marker` `DockButton` at row 2 column 7, subscribing to `songLoaded`,
      `currentTime`, `allLayersData`, `activeLayerId`, and `layerSpecificNavigation`; call
      `removeLastMarker` to remove the greatest-timestamp marker strictly before `currentTime` in the
      active navigation scope (R5.1, R5.5).
    - Keep the control enabled. When no such marker exists, leave `allLayersData`, `layers`, and
      `lastRemovedMarker` unchanged and show "No previous marker to delete" (R5.2, R5.3).
    - Files: `src/components/ui/controls/ControlDock.tsx` (or the marker-cell helper).
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 7.3 Wire the permanently-visible previous/next marker navigation
    - Render the `navigate-left-marker` (row 1 column 1) and `navigate-right-marker` (row 1 column 3)
      `DockButton`s, calling `navigateToLeftMarker` / `navigateToRightMarker` and following with
      `onSeek` to the resulting position (R6.1, R6.2, R6.3).
    - Disable both while `!songLoaded`; disable previous when no navigable target exists strictly
      before `currentTime` and next when none exists strictly after; emit no toast on navigation
      (R6.4, R6.5, R6.6).
    - Files: `src/components/ui/controls/ControlDock.tsx` (or the marker-cell helper).
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 7.4 Preserve waveform/annotation workflows during consolidation
    - Confirm gutter and wrapped-waveform taps/drags still seek or select with the same mapping and
      threshold and never create a marker, and that the annotation field keeps its input,
      suggestion, save, and reopen behaviour unchanged (R18.1, R18.2, R18.3, R18.4).
    - Files: `src/components/layout/MainContent.tsx` (wiring only; no waveform redesign).
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 8. Checkpoint — marker controls
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5 — Tri-state inner-loop control

- [x] 9. Consolidate marker and range looping into one tri-state control
  - [x] 9.1 Create `InnerLoopControl` driven by `cycleInnerLoop`
    - Create `src/components/ui/controls/InnerLoopControl.tsx` (`testID="inner-loop-cycle"`) at row 1
      column 7, subscribing to `isLoopMarkerActive`, `isLoopRangeEnabled`, `songLoaded`,
      `songDuration`, `loopStartMs`, and `loopEndMs`; derive the displayed state with
      `deriveInnerLoopState` and advance exactly one state per single tap by calling `cycleInnerLoop`,
      with no long press, double tap, or mode picker (R8.1, R8.2, R8.3).
    - Render `LoopMarkerIcon` for off and markers (outlined versus orange-filled button) and
      `Brackets` for range so the cycle remains explicit (R8.4).
    - On each successful transition fire the matching dock toast ("Looping off", "Loop between
      markers", "Loop selected range"), and surface "No range available" when a range entry is
      blocked (R8.5, R8.6, R8.7, R8.10 — toast added in Phase 7).
    - Add the mirrored style file `src/styles/components/controls/innerLoopControl.ts`.
    - Files: `src/components/ui/controls/InnerLoopControl.tsx`,
      `src/styles/components/controls/innerLoopControl.ts`.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.10_

  - [x] 9.2 Replace the phone loop-region and loop-marker toggles with the single control
    - Confirm the phone dock renders neither `loop-region-toggle` nor `loop-marker-toggle` and that
      their behaviour is fully served by `inner-loop-cycle`, while the desktop `AudioControls` /
      `MarkerButton` keep their original testIDs (design "Collapsed testIDs").
    - Expose an accessible value that uniquely names `off`, `markers`, or `range` (R8.9 — full
      accessibility in Phase 11).
    - Files: `src/components/ui/controls/ControlDock.tsx`.
    - _Requirements: 8.8, 8.9_

- [x] 10. Checkpoint — tri-state inner loop
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6 — Whole-song range auto-init

- [x] 11. Initialize a missing custom range to the whole song on entering range mode
  - [x] 11.1 Confirm and surface the `cycleInnerLoop` range auto-init through the control
    - Verify `InnerLoopControl` entering `range` with no valid range triggers
      `setLoopRange(0, songDuration)` only when `songDuration >= MIN_LOOP_DURATION_MS`, with no setup
      dialog, modal, or confirmation prompt (R11.1, R11.6).
    - When `songDuration` is 0, unknown, audio not loaded, or `< MIN_LOOP_DURATION_MS`, or when
      `setLoopRange` fails validation, do not enter `range` and surface the "No range available"
      toast (R11.2, R11.7, R11.8).
    - On a successful auto-init, fire the whole-song-selected toast and confirm the `LoopRangeOverview`
      shows the start handle at 0 ms and the end handle at `songDuration` with both handles enabled
      for drag and no intermediate disabled/loading state (R11.3, R11.4, R11.5).
    - Files: `src/components/ui/controls/InnerLoopControl.tsx` (wiring only; store logic from
      Task 1.2).
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [x] 11.2 Confirm the overview remains the only range editor
    - Verify `LoopRangeOverview` (`testID="loop-overview"`) keeps its draggable start/end handles and
      single continuous 0-to-`songDuration` coordinate space, that no draggable loop handle is
      rendered inside the wrapped gutter, and that dragging updates bounds without changing playback
      position and clamps so start stays strictly less than end (R12.1–R12.5).
    - This is a no-change confirmation of existing behaviour; make no edit unless a regression is
      found.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 12. Checkpoint — range auto-init
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7 — Independent repeat and the shared dock toast

- [x] 13. Add the shared transient toast and the independent repeat control
  - [x] 13.1 Create `useDockToast` and the `DockToast` overlay
    - Create `src/hooks/useDockToast.ts` holding `{ message, nonce }` with a `show(message)` that
      replaces content and restarts a single ~1.5 s (±200 ms) auto-hide timer, cleaning up on
      unmount (R15.2, R15.3).
    - Create `src/components/ui/controls/DockToast.tsx` (`testID="dock-toast"`) as a non-layout
      overlay anchored directly above the loop overview with a small vertical gap, appearing within 100 ms,
      causing zero change to the waveform/dock rendered position or size, and leaving the
      `LoopRangeOverview` handles and waveform interaction region fully hittable (R15.1, R15.5,
      R15.6).
    - Expose content as a single `aria-live="polite"` (web) / `accessibilityLiveRegion="polite"`
      (native) announcement, emitting exactly one announcement per distinct message and suppressing
      identical consecutive repeats (R15.4). Use the same canvas-side placement in both orientations.
    - Add the mirrored style file `src/styles/components/controls/dockToast.ts`.
    - Files: `src/hooks/useDockToast.ts`, `src/components/ui/controls/DockToast.tsx`,
      `src/styles/components/controls/dockToast.ts`.
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 13.2 Wire the dock message catalog and the suppression rules
    - Host `useDockToast` in `ControlDock` and route every feedback trigger through it per the design
      message catalog: inner-loop transitions, repeat on/off, speed selection, reserved activations,
      successful marker add, and successful previous-marker removal (R15.7).
    - Emit no toast for play/pause, previous-marker navigation, or next-marker navigation; show a
      no-change-plus-reason message when a marker operation fails or is unavailable (R15.8, R15.9,
      R4.7, R5.4).
    - Files: `src/components/ui/controls/ControlDock.tsx`.
    - _Requirements: 4.7, 5.4, 15.7, 15.8, 15.9_

  - [x] 13.3 Wire the independent repeat control
    - Render the `repeat-toggle` `DockButton` at row 1 column 6, subscribing to `isRepeatActive` and
      `songLoaded`; call `toggleRepeat` so `isRepeatActive` inverts while both loop flags retain
      their exact prior values (R9.1).
    - Present an active visual + selected accessibility state while `isRepeatActive`, persisting
      unchanged after any toast is removed; fire "Repeat track on"/"Repeat track off" on the
      respective transition (R9.3, R9.4, R9.5).
    - Disable while `!songLoaded` with a disabled accessibility state and no `toggleRepeat` call on
      activation (R9.6).
    - Confirm no additional user action is required to keep whole-track repeat active when the inner
      loop is turned off (R10.3 — store already satisfies this).
    - Files: `src/components/ui/controls/ControlDock.tsx`.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.3_

- [x] 14. Checkpoint — toast and repeat
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8 — Reserved placeholders

- [x] 15. Add the reserved playlist and shuffle placeholders
  - [x] 15.1 Render the four reserved controls as pressable-but-reserved buttons
    - Render `first-track-control`, `previous-track-control`, `next-track-control` (row 2 c1–c3) and
      `shuffle-control` (row 1 c8) as `DockButton`s in the `reserved` state, with a reserved visual
      treatment pairwise distinct from both active and disabled styling (R7.1).
    - Keep each pressable (not natively disabled) so activation fires its matching in-development
      toast within 200 ms ("First track is in development", "Previous track is in development", "Next
      track is in development", "Shuffle is in development") and performs no playback, navigation, or
      ordering change (R7.2, R7.3, R7.4).
    - Expose accessible semantics announcing a reserved / in-development state while staying operable
      (R7.5 — refined in Phase 11).
    - Files: `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockButton.tsx`.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 16. Checkpoint — reserved placeholders
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9 — Playback-speed button contract

- [x] 17. Add the playback-speed control contract without the native engine
  - [x] 17.1 Create `PlaybackSpeedControl` with the chooser popover
    - Create `src/components/ui/controls/PlaybackSpeedControl.tsx` (`testID="playback-speed"`) at
      row 2 column 6 — the one control that shows text, not an icon — rendering the current speed as
      `formatSpeedLabel(value)` defaulting to `1×`, fully inside its cell for every supported value
      with no clipping or wrapping (R3.2, R3.3, R3.4, R14.1).
    - Accept the stable `PlaybackSpeedControlProps` (`value`, `options`, `onSelect`, `onToast`) from
      the design so the deferred engine connects later without redesign; default `options` to the
      documented set pending Open decision 1 (R14.6).
    - Open a compact speed chooser popover on tap listing the supported speeds; selecting one updates
      the displayed label, dismisses the popover, and fires a speed toast; invoke no time-stretch
      engine (R14.2, R14.3, R14.4, R14.5, R14.7).
    - Keep the control interactive and non-blocking to the rest of the dock when the native engine is
      unavailable (R14.5).
    - Add the mirrored style file `src/styles/components/controls/playbackSpeedControl.ts`.
    - Files: `src/components/ui/controls/PlaybackSpeedControl.tsx`,
      `src/styles/components/controls/playbackSpeedControl.ts`.
    - _Requirements: 3.2, 3.3, 3.4, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [x] 18. Checkpoint — playback-speed contract
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10 — Accessibility metadata and announcements

- [x] 19. Add accessibility semantics across the dock
  - [x] 19.1 Assign roles, labels, states, and keyboard operability to every control
    - In `DockButton` and the specialised controls, assign each interactive control a non-empty
      accessibility label and role; expose a checked/pressed state on toggle and multi-state controls
      including `repeat-toggle` and `inner-loop-cycle`; expose a disabled state with a reason when a
      control cannot act (R17.1, R17.2, R17.3).
    - Distinguish a reserved control from a disabled one by announcing "reserved"/"coming soon" rather
      than "temporarily unavailable" (R17.4); retain each icon-only button's label, role,
      checked/disabled state, and ≥ 44×44 target with text hidden (R17.5).
    - On web, make every interactive control keyboard-reachable and operable, set `aria-pressed` on
      every toggle reflecting its active state, and `aria-disabled` on every control that cannot act
      (R17.6).
    - Preserve the hidden `testID="playback-current-time"` probe (or an element exposing an
      equivalent testID) so existing automated checks keep locating it (R17.7).
    - Files: `src/components/ui/controls/DockButton.tsx`,
      `src/components/ui/controls/PlayPauseControl.tsx`,
      `src/components/ui/controls/InnerLoopControl.tsx`,
      `src/components/ui/controls/PlaybackSpeedControl.tsx`,
      `src/components/ui/controls/ControlDock.tsx`.
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 20. Checkpoint — accessibility
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11 — Unit tests for store transitions and derivations

- [x] 21. Cover the pure derivations and the store action
  - [x]* 21.1 Write unit tests for `src/utils/innerLoop.ts`
    - Place at `tests/unit/innerLoop.test.ts`: `deriveInnerLoopState` for all four flag
      combinations, `nextInnerLoopState` cycling off → markers → range → off, `canEnterRangeState`
      at the `MIN_LOOP_DURATION_MS`, zero-duration, and unknown-duration boundaries, and
      `formatSpeedLabel` formatting round-trip.
    - _Requirements: 8.1, 8.2, 11.7, 11.8, 3.3, 14.1_

  - [x]* 21.2 Write `cycleInnerLoop` store-action unit tests on a fresh store
    - Place at `tests/unit/studioStore.innerLoop.test.ts`, creating a fresh store with `create()`
      directly (not the singleton). Cover the full off → markers → range → off cycle, mutual
      exclusion (never both flags true), range auto-init on entering `range` with no valid range, the
      blocked-entry guards (zero/unknown/`< MIN` duration and `setLoopRange` failure), and repeat
      independence (`cycleInnerLoop` never changes `isRepeatActive`).
    - _Requirements: 8.2, 8.8, 8.10, 9.2, 11.1, 11.2, 11.7, 11.8_

  - [x]* 21.3 Write property tests for the inner-loop invariants (fast-check, ≥ 100 iterations)
    - Place in `tests/unit/innerLoop.test.ts` / `tests/unit/studioStore.innerLoop.test.ts`, each
      tagged `Feature: playback-marker-control-dock, Property {number}: {property_text}`.
    - **Property 1: Inner-loop mutual exclusion**
    - **Validates: Requirements 8.1, 8.8**
    - **Property 2: Three taps return to the starting state**
    - **Validates: Requirements 8.2, 8.3**
    - **Property 3: Repeat independence**
    - **Validates: Requirements 9.1, 9.2, 10.3**
    - **Property 4: Range auto-init only when duration is sufficient**
    - **Validates: Requirements 11.1, 11.2, 11.7, 11.8**
    - **Property 5: Speed label formatting round-trips**
    - **Validates: Requirements 3.3, 3.4, 14.1**
    - **Property 6: At most one visible toast**
    - **Validates: Requirements 15.3, 15.5**

- [x] 22. Checkpoint — unit and property tests
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 12 — Playwright behaviour and layout coverage

- [x] 23. Cover dock workflows on the web build
  - [x]* 23.1 Add cohesive Playwright workflows for the dock
    - Dock geometry: the 2×8 grid renders with the 2×2 play/pause block and the empty cell at r2c8,
      and no `AudioControls`/`MarkerButton` row elements are present on the phone layout.
    - Inner-loop cycle: three taps return to the starting state, each transition shows the matching
      toast, and the `LoopRangeOverview` shows a whole-song range after auto-init.
    - Repeat independence: cycling the inner loop never clears an active repeat, and turning the inner
      loop off leaves repeat active.
    - Toast: appears above the overview without shifting the waveform, auto-dismisses, a second trigger
      replaces and restarts, and `aria-live` announces once.
    - Responsive reflow: portrait renders the 2×8 grid and landscape renders the paired-row/2×2-play rail, with state
      preserved across an orientation change.
    - Marker add/remove toggle and navigation follow the playhead with `onSeek`; gutter/waveform taps
      still never create a marker.
    - Place in `tests/ui-components.spec.ts` / `tests/waveform-features.spec.ts`.
    - _Requirements: 1.1, 1.7, 2.1, 8.2, 9.2, 11.5, 15.3, 16.4, 16.6, 18.1, 18.4_

  - [x]* 23.2 Update specs that referenced the collapsed loop toggles
    - Replace every phone-layout reference to `loop-region-toggle` / `loop-marker-toggle` in
      `tests/ui-components.spec.ts` and `tests/waveform-features.spec.ts` with driving
      `inner-loop-cycle` through its tri-state cycle; leave any desktop `AudioControls` /
      `MarkerButton` references intact. Remove superseded cases rather than keeping them.
    - _Requirements: 8.2, 8.8_

- [x] 24. Checkpoint — Playwright coverage
  - Run `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 13 — iOS XCTest coverage

- [x] 25. Cover dock geometry, interaction, and accessibility on iOS
  - [x]* 25.1 Extend `BeatNoteUITests.swift` with dock cases
    - Cover geometry (the dock fits both the portrait dock and the landscape rail), interaction
      (play/pause, add/remove marker, inner-loop cycle advancing one state per tap, a reserved
      control firing its in-development toast), and accessibility exposure (checked state on
      `repeat-toggle`, a unique value per `inner-loop-cycle` state, and the reserved announcement on
      the placeholders).
    - Update any XCTest case that drove the old `loop-region-toggle` / `loop-marker-toggle` on the
      phone layout to drive `inner-loop-cycle`; remove superseded cases.
    - Files: `tests/ios/BeatNoteUITests.swift`.
    - _Requirements: 1.1, 2.1, 7.2, 8.2, 9.5, 16.3, 17.2, 17.4_

- [x] 26. Checkpoint — iOS acceptance
  - Run focused cases with `IOS_TEST_ONLY=<test-name> npm run test:ios:ui`, then the aggregate
    `npm run test:ios:ui`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 14 — Regression and physical-device acceptance

- [ ] 27. Final regression and manual acceptance
  - [x] 27.1 Run the full automated gate
    - Run `npx tsc --noEmit`, `npx jest --testPathPatterns=unit`, `PLAYWRIGHT_PORT=8082 npm test`,
      and the `npm run test:ios:ui` aggregate; fix any regression before proceeding.
    - _Requirements: 1.7, 16.1, 17.7_

  - [ ] 27.2 Run physical-device acceptance
    - On a physical iPhone, verify comfortable 44 pt touch targets across the dock, VoiceOver
      announcement of the tri-state inner-loop value and the reserved controls' in-development state,
      and toast legibility over the waveform. This gate is required before the feature is called
      done.
    - _Requirements: 7.5, 8.9, 15.1, 17.2, 17.5_

### Phase 15 — Steering doc update (optional)

- [x] 28. Record the testID collapse if a rule changed
  - [x]* 28.1 Update the testing steering if the collapsed testIDs change a documented rule
    - If the phone collapse of `loop-region-toggle` / `loop-marker-toggle` into `inner-loop-cycle`
      changes a rule recorded in [`testing-strategy.md`](../../steering/testing-strategy.md) or an
      iOS/E2E convention doc, update that steering file in the same change. Make no doc edit if no
      documented rule changed.
    - No steering edit was required: the existing behavior-first testing rule already covers the
      collapsed phone controls.
    - Files: `.kiro/steering/testing-strategy.md` (only if a rule changed).
    - _Requirements: 8.8_

### Phase 16 — Marker-gated annotation and deletion safety refinement

- [x] 29. Replace the compact phone annotation field and harden marker deletion
  - [x] 29.1 Put Annotation, Speed, and Remove Previous in portrait row 2 columns 6–8 and put
    Inner Loop/Annotation in landscape row 3.
  - [x] 29.2 Enable Annotation only at a marker, edit through an explicit modal draft, and show a
    centered two-line callout above the overview.
  - [x] 29.3 Preserve deleted markers and annotations in bounded history, expose toast Undo, and
    provide long-press restore/bulk-delete actions with destructive confirmation.
  - [x] 29.4 Remeasure glass backdrops after orientation changes, reclaim the removed landscape
    annotation-row height, and apply safe-area-aware Projects header/content padding.
  - [x] 29.5 Verify TypeScript, 123 unit tests, 17 Playwright workflows, and focused native
    multi-character annotation and landscape/orientation workflows.

### Phase 17 — Timed annotation readability

- [x] 30. Keep reached annotations readable during live playback
  - [x] 30.1 Hold the newest reached annotated marker for 2 seconds, fade it over 350 milliseconds,
    replace it immediately on a successive annotated marker, and ignore unannotated markers for
    replacement.
  - [x] 30.2 Keep the lingering callout bound to its source marker for editing while leaving the
    dock Annotation action gated to the existing 100-millisecond playhead tolerance.
  - [x] 30.3 Unit-test dwell expiry, successive replacement, tie-breaking, and unannotated markers.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core
  implementation tasks are never optional.
- Each task references specific acceptance criteria from `requirements.md` for traceability.
- Property tests validate the Correctness Properties 1–6 from the design; unit tests validate
  specific examples and edge cases.
- This feature changes no `useAudioPlayer.ts` loop logic (Task 1.3); playback precedence stays as
  implemented. The dock only changes which store fields the UI sets.
- The dock is phone-only; the desktop branch of `MainContent.tsx` keeps `AudioControls` +
  `MarkerButton` unchanged.
- Post-acceptance refinements replace the compact phone annotation field with a marker-gated dock
  action, modal draft editor, and bounded callout above the overview; add reversible deletion and
  long-press bulk actions; put controls at safe-area-aware edges; anchor all toasts above the
  overview; use a dedicated landscape rail with a central full-width 2×2 play block; and preserve
  active playback across tap/drag seeking.
- The overview and clear/restore action remain unmounted until audio is loaded, and iOS uses a
  34-point minimum bottom safe-area floor to keep the lowest dock row clear of curved corners.
- Task shapes follow the resolved product decisions for the speed set, pre-engine behaviour,
  landscape toast placement, and reserved accessible pattern.
- No playlist, shuffle, native time-stretch, or persistence-schema tasks are included, per the spec
  Out of Scope.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3"] },
    { "id": 4, "tasks": ["5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3", "7.1", "7.2", "7.3"] },
    { "id": 6, "tasks": ["7.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "11.1", "11.2"] },
    { "id": 8, "tasks": ["13.1", "17.1"] },
    { "id": 9, "tasks": ["13.2", "13.3"] },
    { "id": 10, "tasks": ["15.1"] },
    { "id": 11, "tasks": ["19.1"] },
    { "id": 12, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 13, "tasks": ["23.1", "23.2"] },
    { "id": 14, "tasks": ["25.1"] },
    { "id": 15, "tasks": ["27.1"] },
    { "id": 16, "tasks": ["27.2", "28.1"] }
  ]
}
```
