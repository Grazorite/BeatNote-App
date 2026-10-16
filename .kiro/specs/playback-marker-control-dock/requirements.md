# Requirements Document

## Introduction

BeatNote's phone editor currently renders two separate transport-related control rows inside the
mobile control dock (`MainContent.tsx`): the five-button `AudioControls` row (skip-back, play/pause,
skip-forward, whole-track repeat, custom-range loop) and the five-button `MarkerButton` row
(remove-last, previous-marker, add/remove-marker, next-marker, marker-loop). The two rows duplicate
transport concepts, scatter the loop controls across two components, and give the context-sensitive
add/remove marker button ambiguous behaviour.

This feature replaces those two rows with ONE coherent **Control_Dock**: a fixed two-row,
eight-column grid. Play/pause is the dominant control, occupying a 2×2 block in columns 4–5 across
both rows, which visually divides marker and playlist actions (left, columns 1–3) from playback
modes and modifiers (right, columns 6–8). The dock consolidates the existing store-backed behaviours
(markers, navigation, whole-track repeat, the two mutually exclusive inner loops, custom-range
editing) into direct, explicit controls, reserves clearly-marked placeholders for future
playlist/shuffle work, introduces a tri-state inner-loop control, adds a playback-speed button
contract, and provides one shared transient toast for dock feedback.

This feature is layout, interaction, state-wiring, accessibility, and feedback for the control dock.
It is NOT the implementation of playlist navigation, a shuffle engine, or the native
pitch-preserving playback-speed engine. Those are reserved controls or deferred backlog items (see
Out of Scope).

### Verified current state

The following facts were verified from the code before this spec was written and constrain the
requirements:

- `MainContent.tsx` composes the phone dock from `AudioControls` and `MarkerButton`. The portrait
  dock container has `testID="portrait-control-dock"` and the landscape rail has
  `testID="landscape-control-rail"`; `styles.mobileControlDock` / `styles.landscapeControlRail`
  (`src/styles/layout/mainContent.ts`) hold their layout. The wrapped waveform canvas and the
  `LoopRangeOverview` strip sit above the dock inside `styles.mobileCanvas`.
- `AudioControls.tsx` renders skip-back (`testID="skip-back"`), play/pause
  (`testID="play-pause"`), skip-forward (`testID="skip-forward"`), whole-track repeat
  (`testID="repeat-toggle"`, store `isRepeatActive` / `toggleRepeat`), and the custom-range loop
  toggle (`testID="loop-region-toggle"`, store `isLoopRangeEnabled` / `toggleLoopRangeEnabled`,
  gated by `isValidLoopRange(state, songDuration)`). It also hosts the hidden
  `testID="playback-current-time"` probe. Button sizing comes from `audioControlsStyles`
  (`button` 80×80, `buttonMobile` 52×52, `buttonCompact` 44×44). Icons are `lucide-react-native`
  (`Play`, `Pause`, `SkipBack`, `SkipForward`, `Repeat2`, `Brackets`).
- `MarkerButton.tsx` renders remove-last-marker (`testID="remove-last-marker"`, store
  `removeLastMarker`), previous-marker navigation (`testID="navigate-left-marker"`, store
  `navigateToLeftMarker`), the context-sensitive add/remove marker button
  (`testID="add-marker"`), next-marker navigation (`testID="navigate-right-marker"`, store
  `navigateToRightMarker`), and the marker-loop toggle (`testID="loop-marker-toggle"`, store
  `isLoopMarkerActive` / `toggleLoopMarker`). The add/remove button toggles its icon and operation
  based on `hasNearbyMarker` (an active-layer marker within `Math.abs(marker - currentTime) < 100`
  milliseconds) and on `isActiveLayerVisible`. Navigation enablement reads `layerSpecificNavigation`,
  `allLayersData`, `ghostPlayheadTime`, and `songDuration`.
- `useStudioStore.ts` already enforces mutual exclusion between the two inner loops: `toggleLoopMarker`
  sets `isLoopRangeEnabled: false` when enabling marker loop, and `toggleLoopRangeEnabled` /
  `setLoopRangeEnabled` set `isLoopMarkerActive: false` when enabling the range loop. `toggleRepeat`
  flips `isRepeatActive` independently and touches no loop state. `setSongLoaded(false)` resets
  `isLoopMarkerActive` to `false`.
- `useAudioPlayer.ts` polls every `PLAYBACK_UPDATE_INTERVAL_MS = 50` ms with
  `END_OF_TRACK_TOLERANCE_MS = 100`. Its loop logic computes `effectiveLoopStartMs/EndMs` from the
  range when `isLoopRangeEnabled`, otherwise from `markerLoopRangeAtTime` when `isLoopMarkerActive`;
  `loopIsEnabled = isLoopRangeEnabled || isLoopMarkerActive`. The inner loop governs playback while
  enabled; whole-track `isRepeatActive` repeat is applied only at end-of-track when no inner wrap
  occurs. Seeking suspends loop decisions via `loopDecisionSuspendedRef`.
- `LoopRangeOverview.tsx` (`testID="loop-overview"`) is the full-song range editor. It owns
  `loop-overview-handle-start` / `loop-overview-handle-end` (`LoopRangeLayer.tsx`), a track region
  (`testID="loop-overview-track-region"`), accessible actions `setLoopStart` / `setLoopEnd` /
  `clearLoop`, and web action probes `loop-overview-action-start` / `loop-overview-action-end`. It
  does not seek and is hidden when `showTimeline` is false.
- `src/utils/loopRange.ts` defines `MIN_LOOP_DURATION_MS = 500`, `LOOP_BOUNDARY_TOLERANCE_MS = 30`,
  `RESTORE_WINDOW_MS = 5000`, and the validating helpers (`isValidLoopRange`, `normalizeLoopRange`,
  `reclampLoopRangeToDuration`, `moveLoopRange`, `resizeLoopBound`). Store setters
  (`setLoopRange`, `setLoopStartAtPlayhead`, `setLoopEndAtPlayhead`, `nudgeLoopBound`,
  `clearLoopRange`) are the only validated mutation path.
- Custom loop ranges persist in projects. `project.ts` declares optional
  `settings.loopRange: { startMs; endMs } | null` and `settings.loopEnabled?: boolean`.
  `projectManager.ts` uses `PROJECT_VERSION = '1.1.0'` and `normalizePersistedLoop`, which clears the
  range for projects older than `1.1.0` and re-clamps or rejects out-of-range persisted bounds.
- There is NO `playbackSpeed` store field, no `setPlaybackSpeed` action, and no speed control today.
  The `modules/audio-time-stretch/` native module does not exist. The deferred playback-speed feature
  (`playbackSpeed: 0.5 | 0.75 | 1.0`, pitch preservation) lives in the steering backlog
  (`choreography-features.md`, `release-roadmap.md`). This dock's chooser uses the finer-grained set
  `0.75×, 0.8×, 1×, 1.25×, 2×` for the button contract, while the native pitch-preserving engine
  (future) will map onto whichever subset it supports; the dock contract does not depend on the
  engine's set.
- There is NO shared toast mechanism in the dock today.
- Timestamps are integer milliseconds (ADR-009). All global state lives in the single Zustand store
  `useStudioStore` (ADR-001). Platforms: web (primary dev/test, Playwright), iOS (XCTest), Android
  (secondary via Expo).

## Glossary

- **Control_Dock**: The consolidated transport-and-marker control surface that replaces the former
  `AudioControls` and `MarkerButton` rows, using a portrait 2×8 grid and landscape two-column rail
  with a central 2×2 play block. Root
  testID `control-dock`.
- **Grid_Cell**: One of the sixteen logical column×row positions in the Control_Dock. Columns are
  numbered 1–8 left to right; rows are numbered 1 (top) and 2 (bottom).
- **Play_Pause_Control**: The dominant control spanning columns 4–5 across rows 1 and 2 (a 2×2
  block). testID `play-pause`. Store `isPlaying`, action handled by the existing `togglePlayback`.
- **Add_Marker_Control**: The explicit control that places a marker at the current playhead. testID
  `add-marker`. Store `addMarker`.
- **Remove_Previous_Marker_Control**: The explicit control that removes the most recent marker before
  the playhead. testID `remove-last-marker`. Store `removeLastMarker`.
- **Previous_Marker_Control** / **Next_Marker_Control**: Direct, permanently-visible marker navigation
  controls. testIDs `navigate-left-marker` / `navigate-right-marker`. Store `navigateToLeftMarker` /
  `navigateToRightMarker`.
- **Repeat_Control**: The independent whole-track repeat toggle. testID `repeat-toggle`. Store
  `isRepeatActive` / `toggleRepeat`.
- **Inner_Loop_Control**: The single tri-state control cycling Off → Loop between markers → Loop
  custom range → Off. testID `inner-loop-cycle`. Backed by store `isLoopMarkerActive` /
  `toggleLoopMarker` and `isLoopRangeEnabled` / `toggleLoopRangeEnabled`.
- **Inner_Loop_State**: One of `off`, `markers`, or `range`, derived from `isLoopMarkerActive` and
  `isLoopRangeEnabled`.
- **Playback_Speed_Control**: The dock button that displays the current playback speed and opens a
  speed chooser. testID `playback-speed`.
- **Annotation_Control**: The dock button that opens a draft-based annotation editor for the marker
  within 100 milliseconds of the playhead. testID `annotation-control`.
- **Shuffle_Control**: The reserved future shuffle placeholder. testID `shuffle-control`.
- **First_Track_Control** / **Previous_Track_Control** / **Next_Track_Control**: The reserved future
  playlist placeholders. testIDs `first-track-control` / `previous-track-control` /
  `next-track-control`.
- **Reserved_Control**: Any of First_Track_Control, Previous_Track_Control, Next_Track_Control, or
  Shuffle_Control. A control that is visibly present, accessibly marked as in development, and
  pressable only to surface an in-development message.
- **Dock_Toast**: The single shared transient feedback element rendered above the Loop_Overview.
  testID `dock-toast`.
- **Loop_Overview**: The existing full-song range editor component `LoopRangeOverview`
  (`testID="loop-overview"`) that remains the primary editor for custom loop ranges.
- **Studio_Store**: The single Zustand store `useStudioStore` (ADR-001).

## Requirements

### Requirement 1: Two-row eight-column dock geometry

**User Story:** As a dancer annotating on a phone, I want all transport and marker controls arranged
in one coherent grid, so that I can find every action in a single predictable layout.

#### Acceptance Criteria

1. WHEN the Control_Dock renders on a portrait phone layout, THE Control_Dock SHALL render exactly 2 rows by 8
   columns (16 cell positions), with row 1 columns 1, 2, and 3 holding Previous_Marker_Control,
   Add_Marker_Control, and Next_Marker_Control in that left-to-right order.
2. WHEN the Control_Dock renders on a portrait phone layout, THE Control_Dock SHALL place Repeat_Control at
   row 1 column 6, Inner_Loop_Control at row 1 column 7, and Shuffle_Control at row 1 column 8.
3. WHEN the Control_Dock renders on a portrait phone layout, THE Control_Dock SHALL place First_Track_Control,
   Previous_Track_Control, and Next_Track_Control at row 2 columns 1, 2, and 3 in that left-to-right
   order.
4. WHEN the Control_Dock renders on a portrait phone layout, THE Control_Dock SHALL place
   Annotation_Control, Playback_Speed_Control, and Remove_Previous_Marker_Control at row 2 columns
   6, 7, and 8 in that left-to-right order.
5. IN portrait, THE Control_Dock SHALL render row 1 columns 4 and 5 and row 2 columns 4 and 5 as the single 2×2
   Play_Pause_Control block that preserves the fixed 2×8 column alignment.
6. WHILE a phone layout is active, THE Control_Dock SHALL render neither the former `AudioControls`
   row nor the former `MarkerButton` row, such that zero elements from either prior row are present in
   the rendered output.

### Requirement 2: Dominant play/pause 2×2 control

**User Story:** As a user, I want play/pause to be the obvious central action, so that I can start and
stop playback without hunting among small buttons.

#### Acceptance Criteria

1. THE Play_Pause_Control SHALL occupy columns 4 and 5 across both rows as a single contiguous 2×2
   Grid_Cell block.
2. THE Play_Pause_Control SHALL render with each side at least 2.0 times the side length of an
   ordinary square icon button in the Control_Dock.
3. THE Play_Pause_Control SHALL scale its icon so the icon bounds remain fully within the 2×2 block
   with no clipped or overflowing pixels.
4. WHILE `isPlaying` is true, THE Play_Pause_Control SHALL display the pause icon and SHALL NOT
   display the play icon; WHILE `isPlaying` is false, THE Play_Pause_Control SHALL display the play
   icon and SHALL NOT display the pause icon.
5. WHILE `songLoaded` is false, THE Play_Pause_Control SHALL expose a disabled accessibility state and
   present a reduced-emphasis disabled appearance.
6. IF the user activates Play_Pause_Control WHILE `songLoaded` is false, THEN THE Play_Pause_Control
   SHALL NOT toggle playback and SHALL leave `isPlaying` unchanged.
7. THE Play_Pause_Control SHALL sit between the left marker/playlist controls (columns 1-3) and the
   right playback-mode controls (columns 6-8) so the two groups never share a column with each other.

### Requirement 3: Icon-only buttons with the playback-speed text exception

**User Story:** As a user, I want a clean grid of recognizable icons, so that the dock stays compact
and uncluttered.

#### Acceptance Criteria

1. THE Control_Dock SHALL render every ordinary control as a square icon button whose touch target
   measures at least 44 points on each side.
2. THE Control_Dock SHALL render no visible text label inside any button EXCEPT Playback_Speed_Control.
3. THE Playback_Speed_Control SHALL display the current playback speed as its visible content
   formatted as the numeric multiplier followed by a multiplication sign (×).
4. THE Playback_Speed_Control SHALL display each of the values `1×`, `0.8×`, `0.75×`, `1.25×`, and
   `2×` fully within its Grid_Cell with no character clipped, wrapped to a second line, or extending
   beyond the cell bounds.
5. WHEN a control is rendered, THE Control_Dock SHALL apply colour values drawn only from the existing
   BeatNote colour tokens defined in `src/styles/common.ts` and SHALL render every icon using a
   `lucide-react-native` icon component.
6. THE Control_Dock SHALL represent each of the four control states (active, inactive, unavailable,
   future-reserved) with a distinct combination of at least one non-colour cue (such as icon fill,
   outline, opacity, or disabled affordance) in addition to any colour cue, such that no two of the
   four states share an identical non-colour presentation.
7. IF a control is in the unavailable or future-reserved state, THEN THE Control_Dock SHALL render it
   so that activating it produces no playback, navigation, or ordering state change (a Reserved_Control
   may still surface its in-development Dock_Toast per Requirement 7).

### Requirement 4: Add a marker at the playhead

**User Story:** As a choreographer, I want an explicit button to drop a marker where I am, so that I
can mark a beat without worrying about toggling off a nearby one.

#### Acceptance Criteria

1. WHILE `songLoaded` is true AND the active layer (`activeLayerId`) is visible
   (`isActiveLayerVisible`), THE Add_Marker_Control (testID `add-marker`) SHALL be enabled.
2. WHILE `songLoaded` is false, THE Add_Marker_Control SHALL be disabled and SHALL NOT change any
   marker.
3. WHILE the active layer is not visible (`isActiveLayerVisible` is false), THE Add_Marker_Control
   SHALL be disabled and SHALL NOT change any marker.
4. WHEN the user activates Add_Marker_Control AND no existing marker on the active layer lies within
   100 milliseconds (inclusive) of `currentTime`, THE Studio_Store SHALL add one marker on the active
   layer (`activeLayerId`) at `currentTime` via `addMarker`.
5. WHEN the user activates Add_Marker_Control AND an existing marker on the active layer lies within
   100 milliseconds (inclusive) of `currentTime`, THE Studio_Store SHALL remove that nearest existing
   marker via `removeMarker` rather than adding a new marker, consistent with the existing `tapToBeat`
   toggle behaviour.
6. WHEN the user activates Add_Marker_Control AND `currentTime` equals 0 OR `currentTime` equals
   `songDuration`, AND no existing marker on the active layer lies within 100 milliseconds (inclusive)
   of `currentTime`, THE Studio_Store SHALL add one marker at that `currentTime` via `addMarker`.
7. WHEN Add_Marker_Control adds a marker, THE Dock_Toast SHALL show a successful-addition message.

> Note: the current `add-marker` control is a context-sensitive toggle (`tapToBeat`) that removes a
> nearby marker within 100 ms. The toggle semantics in criterion 5 preserve that existing behaviour;
> whether the consolidated dock should split this into a pure add plus the separate
> Remove_Previous_Marker_Control is a design-phase refinement. The button's `hasNearbyMarker`
> uses a strict `< 100` ms comparison while `tapToBeat`/`removeMarker` use `<= 100` ms; this boundary
> inconsistency should be reconciled during design.

### Requirement 5: Remove the previous marker

**User Story:** As a user, I want a dedicated remove button, so that I can undo my last placement
without ambiguity.

#### Acceptance Criteria

1. WHEN the user activates Remove_Previous_Marker_Control (testID `remove-last-marker`) while a
   previous marker exists, THE
   Studio_Store SHALL remove exactly one marker — the one with the greatest timestamp among markers
   strictly less than `currentTime` within the active navigation scope — via `removeLastMarker`.
2. THE Remove_Previous_Marker_Control SHALL be disabled when neither a previous marker nor a
   restorable deletion exists; it SHALL remain available for long-press recovery while deletion
   history exists.
3. IF no marker exists strictly before `currentTime` within the active navigation scope, THEN a tap
   on Remove_Previous_Marker_Control SHALL leave marker state unchanged.
4. WHEN Remove_Previous_Marker_Control removes a marker, THE Studio_Store SHALL set `lastRemovedMarker`
   (enabling `redoLastMarker`) and clear `selectedMarker` only when it matched the removed marker, and
   THE Dock_Toast SHALL show a successful-removal message.
5. WHERE `layerSpecificNavigation` is enabled, THE Remove_Previous_Marker_Control SHALL evaluate
   markers from the active layer only and remove from that layer; otherwise it SHALL evaluate markers
   across all layers and remove from the layer that contains the removed marker, matching the existing
   navigation scope.
6. WHEN one or more markers are deleted, THE Studio_Store SHALL retain a bounded deletion history
   including each removed annotation, and an Undo toast action SHALL restore the latest deletion.
7. WHEN the user long-presses Remove_Previous_Marker_Control, THE app SHALL offer restoration of the
   latest deletion and deletion of all markers before the playhead; bulk deletion SHALL require a
   destructive confirmation and SHALL itself be reversible.

### Requirement 6: Permanently visible marker navigation

**User Story:** As a user rehearsing a section, I want previous and next marker jumps always
available, so that I can move between cues quickly.

#### Acceptance Criteria

1. THE Previous_Marker_Control (testID `navigate-left-marker`) and Next_Marker_Control (testID
   `navigate-right-marker`) SHALL remain visible at all times when the Control_Dock is shown.
2. WHEN the user activates Previous_Marker_Control, THE Studio_Store SHALL set `currentTime` to the
   greatest navigable position strictly less than the current `currentTime` via `navigateToLeftMarker`,
   where navigable positions are the markers in the active navigation scope (active layer when
   `layerSpecificNavigation` is true, otherwise all layers), the `ghostPlayheadTime` when non-null,
   and song start (0 ms), and the Control_Dock SHALL follow with `onSeek` to that position.
3. WHEN the user activates Next_Marker_Control, THE Studio_Store SHALL set `currentTime` to the least
   navigable position strictly greater than the current `currentTime` via `navigateToRightMarker`,
   where navigable positions are the markers in the active navigation scope, the `ghostPlayheadTime`
   when non-null, and song end (`songDuration`), and the Control_Dock SHALL follow with `onSeek` to
   that position.
4. WHILE `songLoaded` is false, THE Previous_Marker_Control and Next_Marker_Control SHALL be disabled.
5. IF no navigable target exists strictly before `currentTime`, THEN THE Previous_Marker_Control SHALL
   be disabled; IF no navigable target exists strictly after `currentTime`, THEN THE
   Next_Marker_Control SHALL be disabled.
6. THE Previous_Marker_Control and Next_Marker_Control SHALL NOT emit a Dock_Toast on navigation.
7. WHEN the playhead reaches the first or last navigable target so that a navigation control is
   disabled per criterion 5, THE Control_Dock SHALL emit no Dock_Toast and no other edge feedback,
   because the disabled control itself conveys that no further target exists.

### Requirement 7: Reserved playlist and shuffle placeholders

**User Story:** As a user, I want to see where track-list and shuffle features will live, so that the
layout is stable and I understand what is coming.

#### Acceptance Criteria

1. THE Control_Dock SHALL render First_Track_Control, Previous_Track_Control, Next_Track_Control, and
   Shuffle_Control with a reserved visual treatment whose rendered styling is pairwise distinct from
   both the active-control styling and the disabled-control styling.
2. WHEN the user activates a Reserved_Control, THE Dock_Toast SHALL display within 200 milliseconds the
   matching in-development message: "First track is in development", "Previous track is in
   development", "Next track is in development", or "Shuffle is in development".
3. WHEN the user activates a Reserved_Control, THE Reserved_Control SHALL leave playback status,
   current track, and playback position unchanged and SHALL perform no playback, navigation, or
   ordering action.
4. THE Reserved_Control SHALL remain pressable (not natively disabled) so that activation surfaces its
   in-development Dock_Toast.
5. THE Reserved_Control SHALL be a pressable button (accessibility role button, not natively disabled)
   whose accessibility description and state announce "coming soon" (reserved / in development),
   distinct from a disabled control's "temporarily unavailable", while keeping the control operable to
   trigger its Dock_Toast message.

### Requirement 8: Tri-state inner-loop control

**User Story:** As a dancer, I want one button to cycle through my inner-loop options, so that I can
switch between looping markers and looping a custom range without separate buttons.

#### Acceptance Criteria

1. THE Inner_Loop_Control SHALL present exactly three mutually exclusive states derived from the
   Studio_Store: `off` (`isLoopMarkerActive` false AND `isLoopRangeEnabled` false), `markers`
   (`isLoopMarkerActive` true AND `isLoopRangeEnabled` false), and `range` (`isLoopRangeEnabled` true
   AND `isLoopMarkerActive` false).
2. WHEN the user activates Inner_Loop_Control, THE Inner_Loop_Control SHALL advance exactly one state
   following the cyclic order off → markers → range → off, invoking `toggleLoopMarker` and/or
   `toggleLoopRangeEnabled` as required to reach the next state.
3. WHEN the user performs a single tap on Inner_Loop_Control, THE Inner_Loop_Control SHALL advance
   exactly one state and SHALL NOT require a long press, double tap, or present a mode picker.
4. THE Inner_Loop_Control SHALL use LoopMarkerIcon for both off and markers, distinguishing those
   states through the inactive outlined versus active filled button treatment, and SHALL use the
   Brackets glyph for range so every transition remains visually explicit.
5. WHEN Inner_Loop_Control transitions to the off state, THE Dock_Toast SHALL display "Looping off".
6. WHEN Inner_Loop_Control transitions to the markers state, THE Dock_Toast SHALL display "Loop
   between markers".
7. WHEN Inner_Loop_Control transitions to the range state, THE Dock_Toast SHALL display "Loop selected
   range".
8. THE Inner_Loop_Control SHALL keep the markers and range states mutually exclusive by relying on the
   existing Studio_Store mutual-exclusion enforcement, such that at no time are `isLoopMarkerActive`
   and `isLoopRangeEnabled` both true.
9. THE Inner_Loop_Control SHALL expose an accessible label and an accessible value that each uniquely
   identify the active state as exactly one of off, markers, or range.
10. IF a transition to the range state is requested WHILE no valid custom range exists in the
    Studio_Store, THEN THE Inner_Loop_Control SHALL first establish a valid range per Requirement 11
    before entering the range state, and IF a valid range cannot be established, THEN THE
    Inner_Loop_Control SHALL remain in its current state and surface a Dock_Toast indicating that no
    range is available.

### Requirement 9: Independent whole-track repeat

**User Story:** As a user, I want whole-track repeat to behave independently of my inner loop, so that
my repeat setting is not silently cleared.

#### Acceptance Criteria

1. WHEN the user activates Repeat_Control, THE Studio_Store SHALL invoke `toggleRepeat` so that
   `isRepeatActive` transitions to its opposite boolean value while `isLoopMarkerActive` and
   `isLoopRangeEnabled` each retain the exact value they held immediately before the activation.
2. WHEN the user activates Inner_Loop_Control, THE Studio_Store SHALL leave `isRepeatActive` unchanged
   from the value it held immediately before the activation.
3. WHEN `toggleRepeat` sets `isRepeatActive` from false to true, THE Dock_Toast SHALL display "Repeat
   track on".
4. WHEN `toggleRepeat` sets `isRepeatActive` from true to false, THE Dock_Toast SHALL display "Repeat
   track off".
5. WHILE `isRepeatActive` is true, THE Repeat_Control (testID `repeat-toggle`) SHALL present the orange
   active button background and a selected accessibility state without filling or emboldening the
   Repeat2 glyph, and this state SHALL persist unchanged after any Dock_Toast is removed from view.
6. WHILE `songLoaded` is false, THE Repeat_Control SHALL be disabled, SHALL expose a disabled
   accessibility state, and SHALL NOT invoke `toggleRepeat` or change `isRepeatActive` when activated.

### Requirement 10: Loop precedence during playback

**User Story:** As a user, I want predictable playback when both repeat and an inner loop are set, so
that the behaviour never surprises me at section boundaries.

#### Acceptance Criteria

1. WHILE an Inner_Loop_State (`markers` or `range`) is active AND playback is running AND the playhead
   is within the active loop bounds, WHEN the sampled playback position reaches or passes the loop end
   boundary within `LOOP_BOUNDARY_TOLERANCE_MS`, THE playback engine SHALL seek the playhead back to
   the loop start within one polling interval (50 ms) and continue playing, taking precedence over
   whole-track repeat so playback never advances past the loop end to the end of the track.
2. WHILE `isRepeatActive` is true AND the Inner_Loop_State is `off`, WHEN the sampled playback position
   reaches within `END_OF_TRACK_TOLERANCE_MS` (100 ms) of song end, THE playback engine SHALL seek to
   position 0 and continue playing without pausing.
3. WHEN the user turns the active Inner_Loop_Control to `off` WHILE `isRepeatActive` is true, THE
   Studio_Store SHALL leave `isRepeatActive` true and no additional user action SHALL be required to
   keep whole-track repeat active.
4. WHEN the user seeks, THE playback engine SHALL suspend loop-wrap evaluation for the duration of that
   seek via `loopDecisionSuspendedRef` and resume loop-wrap evaluation on the next polling sample after
   the seek completes, using the post-seek position as the new previous sample.
5. WHEN the loaded song changes, THE Studio_Store SHALL set `isLoopMarkerActive` to false, set
   `isLoopRangeEnabled` and the loop bounds from the loaded project's persisted range when that range
   is valid for the new duration, and set `isLoopRangeEnabled` to false with cleared bounds when no
   valid persisted range exists.
6. IF the active custom range becomes invalid for the current song duration, THEN THE Studio_Store
   SHALL set `isLoopRangeEnabled` to false and THE playback engine SHALL perform no loop wrap for that
   invalid range (`failedLoopRangeKeyRef`), allowing playback to proceed under whole-track repeat or
   normal end-of-track behaviour.

### Requirement 11: Full-song custom-range initialization

**User Story:** As a user cycling into custom-range looping, I want an immediate usable range, so that
I can start adjusting bounds without a setup dialog.

#### Acceptance Criteria

1. WHEN the user cycles Inner_Loop_Control into `range` AND no valid custom range exists AND
   `songDuration` is greater than or equal to `MIN_LOOP_DURATION_MS` (500 ms), THE Studio_Store SHALL
   invoke `setLoopRange` with `loopStartMs` = 0 and `loopEndMs` = `songDuration`.
2. IF `setLoopRange` is invoked with values that fail validation, THEN THE Studio_Store SHALL leave
   `loopStartMs` and `loopEndMs` unchanged and THE Inner_Loop_Control SHALL NOT enter the `range`
   state.
3. WHEN a whole-song range is auto-created, THE Loop_Overview (testID `loop-overview`) SHALL render the
   start handle (testID `loop-overview-handle-start`) at the left strip edge aligned to 0 ms and the
   end handle (testID `loop-overview-handle-end`) at the right strip edge aligned to `songDuration`.
4. WHEN a whole-song range is auto-created, THE Loop_Overview SHALL enable both handles for drag
   adjustment with no intermediate disabled or loading state.
5. WHEN a whole-song range is auto-created, THE Dock_Toast SHALL display a message indicating the whole
   song was selected as the initial range.
6. THE custom-range initialization SHALL complete without presenting any separate setup dialog, modal,
   or confirmation prompt.
7. IF `songDuration` is zero, unknown, or audio is not loaded, THEN THE Studio_Store SHALL NOT invoke
   `setLoopRange` and THE Inner_Loop_Control SHALL NOT enter the `range` state.
8. IF `songDuration` is greater than zero but less than `MIN_LOOP_DURATION_MS` (500 ms), THEN THE
   Studio_Store SHALL NOT invoke `setLoopRange` and THE Inner_Loop_Control SHALL NOT enter the `range`
   state.

### Requirement 12: Overview strip owns range editing

**User Story:** As a user, I want to adjust loop bounds on the full-song overview strip, so that I can
set start and end across the whole song in one continuous coordinate space.

#### Acceptance Criteria

1. THE Loop_Overview SHALL remain the only editor for custom loop ranges, rendering a draggable start
   handle (testID `loop-overview-handle-start`) and a draggable end handle (testID
   `loop-overview-handle-end`) within the strip identified by testID `loop-overview`.
2. THE Control_Dock SHALL NOT render any draggable loop handle inside the wrapped waveform gutter.
3. THE Loop_Overview SHALL map its full horizontal extent to a single continuous coordinate system
   spanning the whole song from 0 to `songDuration`, such that a start bound and end bound occupying
   different wrapped rows are both editable from the one strip.
4. WHEN the user drags the start or end handle, THE Loop_Overview SHALL update the corresponding loop
   bound without changing the current playback position.
5. IF a drag would move the start bound to a value greater than or equal to the end bound, or the end
   bound to a value less than or equal to the start bound, THEN THE Loop_Overview SHALL clamp the
   dragged bound so start remains strictly less than end and retain the previously valid range.

### Requirement 13: Custom-range persistence and migration

**User Story:** As a returning user, I want my saved loop range to reload, so that my rehearsal setup
survives reopening a project.

#### Acceptance Criteria

1. WHEN a project is saved, THE Studio_Store SHALL persist a valid custom range as `settings.loopRange`
   with its start and end bounds in milliseconds and persist its enabled state as the boolean
   `settings.loopEnabled`, matching the current persistence behaviour.
2. IF the current custom range is invalid or absent at save time, THEN THE Studio_Store SHALL persist
   `settings.loopRange` as null and `settings.loopEnabled` as false.
3. WHEN a project is loaded, THE Studio_Store SHALL restore a persisted range only when it passes the
   existing validation and re-clamping, where a valid range satisfies 0 ≤ start < end ≤ `songDuration`
   and end − start ≥ `MIN_LOOP_DURATION_MS`.
4. WHERE a loaded project predates `PROJECT_VERSION` 1.1.0, THE project loader SHALL clear the
   persisted range (`settings.loopRange` null) and disable range looping (`settings.loopEnabled`
   false).
5. IF a restored range is invalid for the loaded duration, THEN THE project loader SHALL discard the
   range, set `settings.loopEnabled` false, and retain all other loaded project data unchanged.
6. WHILE playback is active and the user changes the range, THE Studio_Store SHALL apply the updated
   bounds through the validated setters without interrupting the current loop evaluation beyond the
   existing seek-suspension behaviour.

### Requirement 14: Playback-speed button contract

**User Story:** As a user, I want a speed control in the dock, so that the layout is ready for
pitch-preserving slow-down when it ships.

#### Acceptance Criteria

1. THE Playback_Speed_Control (testID `playback-speed`) SHALL display the current playback speed value
   as numeric multiplier text (for example `1×`, `0.75×`, `2×`), defaulting to `1×`.
2. THE Playback_Speed_Control SHALL support exactly the ordered speed set `0.75×`, `0.8×`, `1×`,
   `1.25×`, `2×`, with `1×` as the default, and WHEN the user activates Playback_Speed_Control THE
   Playback_Speed_Control SHALL present a speed chooser popup listing exactly these five options in
   ascending order as selectable options.
3. WHEN the user selects a speed from the chooser, THE Playback_Speed_Control SHALL update its
   displayed value to the selected multiplier and dismiss the chooser popup.
4. WHEN the user selects a speed from the chooser, THE Dock_Toast SHALL display the newly selected
   speed multiplier.
5. WHILE the native pitch-preserving engine is unavailable, WHEN the user selects a speed from the
   chooser, THE Playback_Speed_Control SHALL update its displayed value and emit the Dock_Toast per
   criterion 4 but SHALL NOT change the actual audio playback rate, so the control updates its label
   and toast rather than remaining silently inert.
6. WHILE the native pitch-preserving engine is unavailable, THE Playback_Speed_Control SHALL present an
   explicit in-development affordance consistent with the Reserved_Control "coming soon" accessible
   semantics (Requirement 7 criterion 5 and Requirement 17 criterion 4), SHALL remain interactive, and
   SHALL NOT disable or block any other control within the Control_Dock.
7. THE Playback_Speed_Control contract SHALL remain stable so the deferred playback-speed feature can
   connect its state and chooser without redesigning the Control_Dock, and THE supported speed set
   SHALL be supplied as a data-driven ordered list (an `options` prop) so the set can grow without a
   contract change.
8. THE Playback_Speed_Control SHALL NOT invoke or implement the native time-stretch engine as part of
   this feature.

> The supported-speed set and default are resolved: the chooser offers `0.75×, 0.8×, 1×, 1.25×, 2×`
> with `1×` as the default. The set is intentionally extensible — the `options` prop stays data-driven
> so additional speeds can be added later without redesigning the Control_Dock.

### Requirement 15: Shared dock toast feedback

**User Story:** As a user, I want brief confirmations of my dock actions, so that I know what changed
without reading the whole screen.

#### Acceptance Criteria

1. WHEN a dock or loop-overview action triggers feedback, THE Dock_Toast (testID `dock-toast`) SHALL
   render within 100 milliseconds directly above the Loop_Overview with a small gap.
2. WHEN the Dock_Toast becomes visible, THE Dock_Toast SHALL remain visible for approximately 1.5
   seconds (±200 ms) and then hide itself.
3. WHEN a new toast is triggered WHILE a Dock_Toast is visible, THE Dock_Toast SHALL replace the
   displayed content and restart its visibility timer from zero.
4. WHEN the Dock_Toast displays or replaces content, THE Dock_Toast SHALL expose that content as a
   single accessibility announcement (web `aria-live` polite / native `accessibilityLiveRegion`
   equivalent) and SHALL emit exactly one announcement per distinct message, suppressing repeat
   announcements of identical consecutive content.
5. WHEN the Dock_Toast appears or disappears, THE Dock_Toast SHALL render as an overlay that causes
   zero change to the rendered position or size of the waveform and the Control_Dock.
6. WHILE the Dock_Toast is visible, THE Dock_Toast SHALL leave the Loop_Overview handles and the
   waveform interaction region fully hittable.
7. WHEN an inner-loop transition, a whole-track repeat change, a playback-speed change, a
   Reserved_Control activation, a successful marker addition or removal, a successful
   previous-marker removal, or a loop-range clear or restore occurs, THE Dock_Toast SHALL display a
   confirmation message naming the change.
8. IF the triggering event is play/pause, previous-marker navigation, or next-marker navigation,
   including reaching the first or last navigable target, THEN THE Dock_Toast SHALL NOT appear.
9. IF a marker operation fails or is unavailable, THEN THE Dock_Toast SHALL display a message
   indicating that no change occurred and the reason, and SHALL NOT display a success message.
10. IN both orientations, THE Dock_Toast SHALL anchor directly above the Loop_Overview on the canvas
    side, rendering as a non-layout overlay that causes zero change to the rendered position or size
    of the waveform, overview, annotation callout, or Control_Dock.
11. WHEN a reversible deletion succeeds, THE Dock_Toast MAY remain visible for up to five seconds
    and SHALL expose one labelled Undo action.

### Requirement 16: Responsive portrait and landscape layout

**User Story:** As a user holding my phone either way, I want the dock to fit and stay usable, so that
I never have to scroll sideways to reach a control.

#### Acceptance Criteria

1. THE Control_Dock SHALL fit within phone viewport widths from 320 to 480 logical pixels in portrait
   and from 480 to 932 logical pixels in landscape without rendering a horizontal scrollbar and
   without clipping any control.
2. WHERE the layout is portrait, THE Control_Dock SHALL render all controls inside the single
   container with `testID="portrait-control-dock"`.
3. WHERE the layout is the landscape phone rail, THE Control_Dock SHALL render all controls inside the
   single container with `testID="landscape-control-rail"`.
4. IN portrait, THE Control_Dock SHALL render exactly two rows of eight columns and a contiguous 2×2
   Play_Pause_Control block; IN landscape, it SHALL render Previous/Next, Add/Remove Previous, and
   Inner Loop/Annotation as three two-column rows above a full-width Play_Pause_Control that is two
   ordinary rows tall, followed by Repeat/Speed, First Track/Shuffle, and Previous Track/Next Track.
5. WHILE the Control_Dock is displayed, THE Control_Dock SHALL constrain its own height so the waveform
   region retains at least its current phone rendered height, with no reduction to accommodate
   oversized controls.
6. WHEN the orientation changes between portrait and landscape, THE Control_Dock SHALL retain the
   identical values of all playback, marker, loop, repeat, and speed states that existed immediately
   before the change, with no state reset to defaults.
7. IF a control cannot fit within the available container width at a supported viewport width, THEN THE
   Control_Dock SHALL use the orientation-specific arrangement and resize controls to remain fully
   visible within the container rather than overflow.

### Requirement 17: Accessibility across platforms

**User Story:** As a user relying on assistive technology, I want every dock control labelled and
operable, so that I can annotate without seeing the icons.

#### Acceptance Criteria

1. WHEN the Control_Dock renders, THE Control_Dock SHALL assign each interactive control a non-empty
   accessibility label and an accessibility role.
2. WHILE a toggle or multi-state control is active, THE Control_Dock SHALL expose a checked (or
   pressed) accessibility state for that control, including Repeat_Control and Inner_Loop_Control, so
   assistive technology announces the active state.
3. IF an interactive control cannot act in the current context, THEN THE Control_Dock SHALL expose a
   disabled accessibility state together with a description stating why the control is unavailable.
4. THE Control_Dock SHALL distinguish an in-development Reserved_Control from a disabled control by
   rendering the Reserved_Control as a pressable button (accessibility role button, not natively
   disabled) whose accessibility description and state announce "coming soon" (reserved / in
   development) rather than "temporarily unavailable", and THE Control_Dock SHALL apply this same
   "coming soon" accessible pattern to the Playback_Speed_Control while the native pitch-preserving
   engine is unavailable.
5. WHILE visible text labels are hidden on icon-only buttons, THE Control_Dock SHALL retain each
   control's accessibility label, role, checked and disabled states, and a touch target of at least 44
   by 44 points.
6. WHERE the platform is web, THE Control_Dock SHALL make every interactive control reachable and
   operable with the keyboard and SHALL set `aria-pressed` on every toggle control reflecting its
   active state and `aria-disabled` on every control that cannot act.
7. THE Control_Dock SHALL render the hidden `testID="playback-current-time"` probe, or an element
   exposing an equivalent testID, so existing automated checks continue to locate it.

### Requirement 18: Preserve waveform and annotation workflows

**User Story:** As a user, I want my existing waveform and annotation habits intact, so that
consolidating the controls does not break how I work.

#### Acceptance Criteria

1. WHEN a user taps or drags on the wrapped-waveform display or its gutter, THE Control_Dock SHALL seek
   the playhead or update the selection using the same mapping and threshold behaviour as before the
   consolidation, SHALL NOT create a marker, and SHALL continue playback from the new position when
   playback was active before the gesture.
2. WHILE the Control_Dock is displayed, THE app SHALL omit the persistent compact annotation field.
   Annotation_Control SHALL be enabled only while the playhead is within 100 milliseconds of a
   marker and SHALL open a modal draft editor with explicit Save and Cancel actions.
3. WHEN a user activates Add_Marker_Control, THE Control_Dock SHALL create or toggle a marker only
   through that control per Requirement 4, keeping marker mutation exclusive to the marker controls.
4. IF a user taps or drags on the gutter or wrapped-waveform display, THEN THE Control_Dock SHALL NOT
   create a marker and SHALL leave the total marker count unchanged.
5. WHILE audio is loaded, THE Control_Dock SHALL render the Loop_Overview strip (testID
   `loop-overview`) above the portrait dock, or at the bottom of the expanded landscape audio canvas
   to the left of the control rail, visible and responsive to its create,
   move, resize, toggle, clear, and restore interactions.
6. WHILE no audio is loaded, THE Control_Dock SHALL render neither the Loop_Overview strip nor its
   clear/restore action.
7. ON an iPhone layout, THE bottom dock row SHALL remain above the device bottom safe area and curved
   corners without clipping any button.
8. WHEN playback reaches an annotated marker, THE app SHALL render a centered, bounded two-line
   callout above the Loop_Overview with tail truncation, keep it readable for 2 seconds, then fade it
   out over approximately 350 milliseconds; activating the lingering callout SHALL reopen that
   marker's modal editor.
9. IF playback reaches another annotated marker while a callout is visible, THEN the newer
   annotation SHALL replace it immediately and restart the dwell period; an unannotated marker SHALL
   NOT clear the still-visible annotation.

## Out of Scope

The following are explicitly NOT part of this feature:

- The playlist and queue data model, and any actual first-track, previous-track, or next-track
  navigation behind the Reserved_Control placeholders.
- The shuffle engine behind Shuffle_Control.
- The native pitch-preserving playback-speed engine (`modules/audio-time-stretch/`) and the
  `playbackSpeed` store field; this feature defines only the Playback_Speed_Control contract.
- Moving loop handles into the wrapped waveform gutter.
- Redesigning the waveform canvas or its wrapped-row rendering.
- Unrelated desktop layout changes or project-management UI changes.

## Resolved product decisions

The five product decisions that were previously open are now resolved. Each resolution is recorded
below so the rationale is preserved alongside the requirements that implement it:

1. **Supported playback-speed set and default (Requirement 14).** The chooser offers the ordered set
   `0.75×, 0.8×, 1×, 1.25×, 2×` with `1×` as the default, following the fine-grained requirement
   examples rather than the backlog's `0.5 | 0.75 | 1.0`. The set is intentionally extensible: it is
   supplied as a data-driven ordered `options` list so additional speeds can be added without a
   contract change.
2. **Playback-speed button behaviour before the engine ships (Requirement 14).** The
   Playback_Speed_Control follows an explicit in-development path until the native pitch-preserving
   engine ships. Selecting a speed updates the displayed value and emits a Dock_Toast but does not
   change the actual audio playback rate, and the control presents a "coming soon" affordance
   consistent with the Reserved_Control accessible pattern. It is never silently inert.
3. **Toast placement (Requirement 15).** In both orientations the Dock_Toast anchors directly above
   the Loop_Overview on the canvas side as a non-layout overlay that does not shift the waveform,
   overview, annotation callout, or dock.
4. **Reserved_Control accessible pattern (Requirements 7 and 17).** Each Reserved_Control, and the
   pre-engine Playback_Speed_Control, is a pressable button (role button, not natively disabled) whose
   accessibility description and state announce "coming soon" (reserved / in development), distinct
   from a disabled control's "temporarily unavailable".
5. **Marker-navigation edge feedback (Requirements 6 and 15).** The Previous_Marker_Control and
   Next_Marker_Control stay silent at the edges: they are disabled at the first or last navigable
   target and emit no toast or other feedback, because the disabled control already conveys that no
   further target exists.
