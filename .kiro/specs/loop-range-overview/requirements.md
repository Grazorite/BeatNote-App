# Requirements Document

## Introduction

BeatNote's waveform timeline scrollbar (`src/components/ui/controls/TimelineScrollbar.tsx`) is
repurposed into a compact, full-song Loop Overview. The Loop Overview is a loop-range editor and is
never a scrollbar or a seeking surface. Wrapped rows remain the primary seeking surface, the Loop
Overview owns loop-range manipulation, and marker creation stays exclusive to the bottom marker
controls.

The feature keeps three distinct loop behaviours with explicit, predictable precedence:

- The existing session-only `loopStartMs` / `loopEndMs` store fields become the single Loop Range,
  set only through validating setters, and a single `isLoopRangeEnabled` flag is added.
- The session-only marker-segment loop (`isLoopMarkerActive` / `toggleLoopMarker`) remains available
  from the bottom marker controls. It and the Loop Range are mutually exclusive; enabling either
  disables the other. Keyboard `L` toggles the Loop Range and `Shift+L` toggles marker looping.
- Whole-song repeat (`isRepeatActive` / `toggleRepeat`) is kept with defined precedence: the Loop
  Range wins while enabled and the playhead is inside it; repeat applies only at song end.

### Verified current state

The following facts were verified from the code before this spec was written and constrain the
requirements:

- The phone wrapped canvas (`WrappedWaveform.tsx`, mobile branch) is fixed and non-scrolling, renders
  every row, uses `ceil(containerHeight / MOBILE_TARGET_ROW_HEIGHT)` rows, and partitions the full
  song. Tablet/desktop use a virtualized scrollable wrapped list. Detail mode (`WaveformDetailPanel`
  hosting `WaveformCanvas`) uses `viewportStartTime` / `viewportDuration`.
- `TimelineScrollbar` renders an 80px SVG with a full-song waveform, marker indicators, playhead,
  ghost playhead, and draggable viewport handles; tap/drag seeks. It hosts
  `testID="playback-current-time"` and `testID="timeline-gesture-area"` (used by
  `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, and four places in
  `tests/ios/BeatNoteUITests.swift`). It contains the playback auto-follow effect for the viewport
  when `isViewportLocked` is true. It is hidden when `showTimeline` is false. On phones, its waveform
  falls back to a synthetic sine when `useWaveformData` returns source `'synthetic'`.
- `useStudioStore.ts` already holds session-only `loopStartMs`, `loopEndMs`, and an unvalidated
  `setLoopRange`. They are not persisted; `tests/unit/projectManager.wrapped.test.ts` asserts their
  absence from settings. `loopSegmentsForRows` in `src/utils/timelineMapping.ts` projects a range
  onto half-open rows, and `WrappedRow` draws a 0.15-opacity accent (`wrapped-row-loop-{index}`).
  Nothing sets the range and `useAudioPlayer` does not loop on it.
- `useAudioPlayer` polls every `PLAYBACK_UPDATE_INTERVAL_MS = 50` with
  `END_OF_TRACK_TOLERANCE_MS = 100`, applying marker-loop then end-of-track repeat/pause logic. The
  interval effect closes over `isLoopMarkerActive` / `allLayersData` and restarts when they change.
- The first `AudioControls` row is skip-back, play-pause, skip-forward, repeat.
- `ProjectManager` uses `PROJECT_VERSION = '1.0.0'`; `withWrappedViewDefaults` fills optional
  settings on load. `loadProject` sets `songDuration` from metadata and `useAudioPlayer` later sets
  it from `player.duration * 1000`. `loadSong` does not reset loop state.
- Timestamps are integer milliseconds (ADR-009). The proven gesture pattern is
  `Gesture.Pan().runOnJS(true).activeOffsetX([-6, 6]).failOffsetY([-12, 12])`.

## Glossary

- **Loop_Overview**: The compact full-song component that replaces `TimelineScrollbar` on all
  platforms. Root testID `loop-overview`.
- **Loop_Track**: The editable full-song strip inside Loop_Overview, excluding the reserved
  Clear_Control action slot. `overviewWidth` means this strip's measured width; its left and right
  edges map to 0ms and `songDuration`.
- **Loop_Range**: The single pair `{ loopStartMs, loopEndMs }` of integer milliseconds held in the
  Studio_Store, or the absent state where both are `null`.
- **Valid_Loop_Range**: A Loop_Range where both bounds are finite integers,
  `0 ≤ loopStartMs < loopEndMs ≤ songDuration`, and `loopEndMs − loopStartMs ≥ MIN_LOOP_DURATION_MS`.
- **Loop_Enabled_Flag**: The Studio_Store boolean `isLoopRangeEnabled`.
- **Loop_Range_Utils**: Pure functions in `src/utils/` that normalise, clamp, move, resize, and
  validate Loop_Range values. No React imports and no side effects.
- **Studio_Store**: The single Zustand store in `src/hooks/useStudioStore.ts` (ADR-001).
- **Playback_Engine**: The `useAudioPlayer` / `useCustomAudioPlayer` hooks that poll playback time
  and perform seeks, repeat, and pause.
- **Wrapped_Canvas**: The wrapped-row waveform (`WrappedWaveform` / `WrappedRow`), fixed on phone
  and virtualized on tablet/desktop.
- **Detail_View**: The precision detail mode (`WaveformDetailPanel` hosting `WaveformCanvas`).
- **Transport_Row**: The first row of `AudioControls`.
- **Loop_Toggle**: The Transport_Row button with testID `loop-region-toggle`.
- **Start_Handle** / **End_Handle**: Draggable Loop_Overview controls with testIDs
  `loop-overview-handle-start` and `loop-overview-handle-end`.
- **Range_Body**: The highlighted region between the handles, testID `loop-overview-range`.
- **Clear_Control**: The icon-only Loop_Overview control with testID `loop-overview-clear`, using a
  trash icon for clear and an undo icon with accessibility label "Restore" during Restore_Window.
- **Restore_Window**: The 5000ms period after a clear during which a single-level undo is available.
- **Project_Manager**: `src/utils/projectManager.ts`, which serialises and loads `BeatNoteProject`.
- **Range_Gesture**: Any Loop_Overview pointer, touch, or mouse gesture (create, move, resize).
- **Beat_Step**: `60000 / bpm` ms rounded to an integer when `bpm` is finite and `> 0`; otherwise
  250ms.

## Constants and Invariants

```text
MIN_LOOP_DURATION_MS          = 500
LOOP_BOUNDARY_TOLERANCE_MS    = 30      (< PLAYBACK_UPDATE_INTERVAL_MS = 50)
RESTORE_WINDOW_MS             = 5000
FALLBACK_KEY_STEP_MS          = 250
LARGE_STEP_MULTIPLIER         = 10
OVERVIEW_HEIGHT_PHONE_PX      = 36      (allowed band 32–40)
OVERVIEW_MAX_HEIGHT_WIDE_PX   = 40
HANDLE_VISUAL_MIN_WIDTH_PX    = 8
HANDLE_TOUCH_HIT_MIN_WIDTH_PX = 44
HANDLE_POINTER_HIT_MIN_PX     = 16
TOUCH_TARGET_MIN_PX           = 44 × 44
PAN_ACTIVE_OFFSET_X_PX        = ±6      (exact)
PAN_FAIL_OFFSET_Y_PX          = ±12
PROJECT_VERSION               = '1.1.0'

ARMED-WRAP  A loop wrap fires only when the previous position sample satisfies
            loopStartMs ≤ previousSampleMs < loopEndMs and the current sample satisfies
            currentTime ≥ loopEndMs − LOOP_BOUNDARY_TOLERANCE_MS, for any overshoot
            past loopEndMs. Positions that start or land at or after loopEndMs are not
            armed and play on to song end (10.1, 10.4).

INV-1  Loop_Range is either (null, null), a Valid_Loop_Range, or — only while songDuration
       is 0 or non-finite — a pending range exempt from the songDuration bound (13.5).
INV-2  loopStartMs and loopEndMs are integers whenever non-null.
INV-3  isLoopRangeEnabled is true only while Loop_Range is a Valid_Loop_Range.
INV-4  A move operation preserves loopEndMs − loopStartMs exactly.
INV-5  No Range_Gesture changes currentTime, ghostPlayheadTime, or any layer's markers.
INV-6  No wrapped-row seek gesture changes Loop_Range or isLoopRangeEnabled.
INV-7  The phone fixed workspace has no vertical page scroll with the Loop_Overview visible.
INV-8  The Loop_Overview never writes viewportStartTime, viewportDuration, or
       isViewportLocked (18.5).
```

## Requirements

### Requirement 1: Replace the scrollbar with the Loop Overview

**User Story:** As a dancer, I want a compact full-song strip dedicated to loop selection, so that I
can set up a practice section without losing waveform space on my phone.

#### Acceptance Criteria

1. THE Loop_Overview SHALL replace `TimelineScrollbar` on phone, tablet, and desktop web:
   `TimelineScrollbar` is rendered on no platform, the Loop_Overview occupies the screen position
   `TimelineScrollbar` previously occupied, and the Loop_Track's horizontal extent spans the full
   song (left edge = 0ms, right edge = `songDuration`).
2. WHILE the viewport is a phone (web window width < 768px, or native `min(width, height)` < 768pt),
   THE Loop_Overview SHALL render with a total height of 36px, measured as the bounding-box height
   of the `loop-overview` element including any caption, with a permitted measurement band of
   32–40px.
3. WHILE the viewport is a tablet or desktop (web window width ≥ 768px, or native `min(width,
   height)` ≥ 768pt), THE Loop_Overview SHALL render with a total height of at least 32px and at
   most 40px, measured as the bounding-box height of the `loop-overview` element including any
   caption.
4. WHILE the Loop_Overview is visible on a phone in portrait or landscape at any viewport of 375×667
   or larger, THE fixed workspace SHALL keep the Loop_Overview, Wrapped_Canvas, Transport_Row,
   bottom marker controls, annotation field, and project action row each fully inside the visible
   viewport and below the safe area at the same time, with zero vertical page scroll offset and zero
   action-row scroll overflow (INV-7).
5. THE Loop_Overview SHALL expose each of the stable testIDs `loop-overview`,
   `loop-overview-handle-start`, `loop-overview-handle-end`, `loop-overview-range`, and
   `loop-overview-clear` on at most one element. `loop-overview` SHALL be present whenever the
   Loop_Overview is visible. `loop-overview-handle-start`, `loop-overview-handle-end`, and
   `loop-overview-range` SHALL be present whenever the Loop_Range is a Valid_Loop_Range.
   `loop-overview-clear` SHALL be present whenever the Loop_Range is a Valid_Loop_Range or the
   Restore_Window is active.
6. WHILE a song is loaded, THE application SHALL render no visible current-time caption. It MAY
   retain one non-layout test probe with testID `playback-current-time`; when retained, its text
   SHALL use "Current: m:ss" and reflect `currentTime` within 1000ms during playback.
7. THE application SHALL render no element with testID `timeline-gesture-area`, and THE Playwright
   suites (`tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`) and the XCTest suite
   (`tests/ios/BeatNoteUITests.swift`) SHALL contain no reference to `timeline-gesture-area` and
   SHALL use the Loop_Overview testIDs from criterion 5 in its place.
8. WHILE `showTimeline` is false, THE application SHALL render no element with any of the testIDs
   `loop-overview`, `loop-overview-handle-start`, `loop-overview-handle-end`, `loop-overview-range`,
   or `loop-overview-clear`.
9. THE `CanvasOptionsToggle` SHALL label the `showTimeline` toggle with the exact text "Show Loop
   Overview", and SHALL show no toggle labelled "Show Timeline".
10. WHILE the Loop_Overview is hidden, THE Studio_Store SHALL keep `loopStartMs`, `loopEndMs`, and
    `isLoopRangeEnabled` at their values from the moment it was hidden. THE Wrapped_Canvas SHALL
    continue to render a `wrapped-row-loop-{index}` segment on every row that intersects a
    Valid_Loop_Range.
11. WHILE `isViewportLocked` is true and playback is running, THE application SHALL continue to
    auto-follow the Detail_View viewport to the playhead, preserving the pre-replacement
    `TimelineScrollbar` behaviour, regardless of whether the Loop_Overview is visible.
12. WHEN `showTimeline` changes from false to true, THE Loop_Overview SHALL render the unchanged
    Loop_Range, placing the Start_Handle at `loopStartMs` and the End_Handle at `loopEndMs`, and
    SHALL not modify `loopStartMs`, `loopEndMs`, `isLoopRangeEnabled`, or `currentTime`.

### Requirement 2: Overview content

**User Story:** As a choreographer, I want to see the whole song, the playhead, and my markers in the
overview, so that I can choose a loop that matches my annotated sections.

#### Acceptance Criteria

1. WHILE a song is loaded, `songDuration` is finite and `> 0`, and `useWaveformData` returns source
   `'decoded'` with at least one peak, THE Loop_Overview SHALL draw a single waveform path whose
   first peak is at x = 0 and last peak at x = full width, covering 0 to `songDuration` and not
   limited to the Detail_View viewport window.
2. WHILE a song is loaded, `songDuration` is finite and `> 0`, and `useWaveformData` returns source
   `'synthetic'`, returns an empty peak array, or has not yet returned peaks, THE Loop_Overview
   SHALL draw a solid timing bar from x = 0 to x = full width and SHALL draw no waveform path,
   including no synthetic sine shape.
3. WHILE a song is loaded and `songDuration` is finite and `> 0`, THE Loop_Overview SHALL draw
   exactly one playhead at x = `clamp(currentTime, 0, songDuration) / songDuration × width`, with
   the rendered 2px stroke centre clamped to `[1px, width − 1px]` so it remains fully visible at
   both song edges, and SHALL reposition it within 100ms of each `currentTime` change, including
   during playback.
4. WHILE a song is loaded and `songDuration` is finite and `> 0`, THE Loop_Overview SHALL draw
   exactly one indicator per marker on every layer whose `isVisible` is true (including layers that
   are not the active layer and layers not selectable in the V1 phone editor), at x = `timestamp /
   songDuration × width`, in that layer's `color`, across the full song regardless of the
   Detail_View viewport, and SHALL draw no indicators for layers whose `isVisible` is false.
5. THE Loop_Overview SHALL treat marker indicators as display-only: a tap or drag that starts on a
   marker indicator SHALL behave as the region beneath it per the Interaction Rules, and SHALL not
   select, seek to, create, move, or delete any marker.
6. WHILE `songDuration` is 0, non-finite, or no song is loaded, THE Loop_Overview SHALL show a
   full-width placeholder bar, SHALL hide the waveform path, playhead, marker indicators, both
   handles, the Range_Body, and the Clear_Control, and SHALL ignore Range_Gestures without changing
   Loop_Range or Loop_Enabled_Flag.
7. IF a marker's timestamp is non-finite, below 0, or above `songDuration`, THEN THE Loop_Overview
   SHALL omit that marker's indicator, draw indicators for all other markers, and leave the marker's
   stored data unchanged.
8. WHEN `useWaveformData` changes source from `'synthetic'` (or no peaks) to `'decoded'` for the
   loaded song, or a layer's `isVisible` or markers change, THE Loop_Overview SHALL update the drawn
   content to match criteria 2.1, 2.2, and 2.4 without changing Loop_Range, Loop_Enabled_Flag, or
   currentTime.

### Requirement 3: Range display in the overview

**User Story:** As a dancer, I want the selected section highlighted, so that I can see exactly what
will repeat.

#### Acceptance Criteria

1. WHILE a Valid_Loop_Range exists and songDuration is finite and greater than 0, THE Loop_Overview
   SHALL render the Range_Body (testID `loop-overview-range`) with its left edge at `loopStartMs /
   songDuration × overviewWidth` and its right edge at `loopEndMs / songDuration × overviewWidth`,
   each within ±1px. It SHALL reposition to the new bounds in the first render after any Loop_Range
   change.
2. WHILE a Valid_Loop_Range exists, THE Loop_Overview SHALL render waveform (or timing-bar) content
   and marker indicators outside the Range_Body at an opacity no greater than 0.5 × the opacity of
   the same content inside the Range_Body. Inside content and the playhead SHALL stay undimmed, and
   no marker indicator SHALL be hidden.
3. WHILE a Valid_Loop_Range exists and Loop_Enabled_Flag is false, THE Loop_Overview SHALL render
   the Range_Body with non-zero opacity, keep both handles and the outside-range dimming from
   criterion 3.2, and use a disabled treatment that differs from the enabled treatment in fill
   colour token, opacity, or stroke style. All colours SHALL come from the tokens in
   `src/styles/common.ts`.
4. WHILE no Valid_Loop_Range exists, THE Loop_Overview SHALL render the full song with no dimming.
   No element with testID `loop-overview-range`, `loop-overview-handle-start`, or
   `loop-overview-handle-end` SHALL be present.
5. WHILE a Valid_Loop_Range exists, THE Loop_Overview SHALL render the Start_Handle centred on the
   Range_Body's left edge and the End_Handle centred on its right edge, each within ±1px.
6. THE Range_Body SHALL expose an automated-test-readable state indicator. It SHALL read `enabled`
   while Loop_Enabled_Flag is true, `disabled` while it is false, and update in the first render
   after Loop_Enabled_Flag changes.
7. IF the computed Range_Body width for a Valid_Loop_Range is less than 2px, THEN THE Loop_Overview
   SHALL render the Range_Body at a width of 2px, centred on the computed midpoint, without changing
   loopStartMs or loopEndMs.

### Requirement 4: Range projection onto wrapped rows and detail view

**User Story:** As a dancer, I want the loop shown on the main waveform rows, so that I can relate it
to the waveform I seek on.

#### Acceptance Criteria

1. WHILE a Valid_Loop_Range exists, THE Wrapped_Canvas SHALL render one `wrapped-row-loop-{index}`
   segment on each mounted row whose index appears in `loopSegmentsForRows(rows, loopStartMs,
   loopEndMs)`. Each segment spans from `(fromMs − row.startMs) / (row.endMs − row.startMs)` to
   `(toMs − row.startMs) / (row.endMs − row.startMs)` of the row's waveform width, within ±1px. On
   the phone fixed canvas this applies to every row. On the virtualized tablet/desktop list it
   applies to every row that is mounted, including rows mounted later by scrolling.
2. THE Wrapped_Canvas SHALL follow the half-open row invariant `[row.startMs, row.endMs)`, with
   `songDuration` owned by the final row. Under that invariant, a loop bound equal to a row boundary
   belongs to the later row, and no zero-width loop segment is rendered on the earlier row (for
   example, `loopEndMs` equal to row N's `startMs` renders no segment on row N).
3. WHILE a Valid_Loop_Range exists and Loop_Enabled_Flag is true, THE Wrapped_Canvas SHALL render
   waveform and marker content outside the range at a lower opacity than content inside it. This
   includes all content on rows that do not intersect the range. Content inside the range SHALL
   render at the same opacity as it does when no Loop_Range exists.
4. WHILE a Valid_Loop_Range exists and the Detail_View is active, THE Detail_View SHALL highlight
   the intersection of `[loopStartMs, loopEndMs]` with `[viewportStartTime, viewportStartTime +
   viewportDuration]`. If that intersection is empty, it SHALL show no loop highlight. (Refinement
   priority; this may ship after criteria 4.1–4.3.)
5. THE Wrapped_Canvas SHALL keep marker x-positions (within ±1px), marker tap selection, and
   waveform seek gestures the same whether or not a range is displayed. A tap or drag that starts
   inside a loop segment SHALL seek or select exactly as it would without a range, and SHALL leave
   Loop_Range and Loop_Enabled_Flag unchanged (INV-6).
6. WHILE no Valid_Loop_Range exists, THE Wrapped_Canvas and Detail_View SHALL render no
   `wrapped-row-loop-{index}` segment, no Detail_View loop highlight, and no outside-range
   de-emphasis.
7. WHILE a Valid_Loop_Range exists and Loop_Enabled_Flag is false, THE Wrapped_Canvas SHALL keep
   rendering the loop segments from criterion 4.1 with an outline-only disabled treatment that
   looks different from the enabled state, and SHALL render no outside-range de-emphasis. This
   distinguishes a saved inactive selection from the region that will actively repeat.
8. WHEN Loop_Range changes because of a create, move, resize, clear, restore, duration re-clamp, or
   project load, THE Wrapped_Canvas SHALL show the new segments on all mounted rows by the next
   rendered frame. No segment from the previous range SHALL remain.

### Requirement 5: Creating a range

**User Story:** As a dancer, I want to drag across the overview to pick a section, so that I can set
a loop in one motion.

#### Acceptance Criteria

1. WHEN a horizontal Range_Gesture activates while no Valid_Loop_Range exists, THE Loop_Overview
   SHALL begin a creation drag whose anchor is the drag-start timestamp, defined as the timestamp at
   the initial touch-down or pointer-down x position (not the later activation position), and whose
   moving edge is the current pointer timestamp.
2. WHEN a horizontal Range_Gesture activates with a touch-down point outside the Range_Body and
   outside both handle hit areas while a Valid_Loop_Range exists, THE Loop_Overview SHALL begin a
   creation drag as defined in criterion 5.1, and THE Studio_Store SHALL keep the pre-gesture
   Loop_Range unchanged until the creation span first reaches MIN_LOOP_DURATION_MS.
3. THE Loop_Range_Utils SHALL map a pointer x position to a timestamp as `round(clamp(x /
   overviewWidth, 0, 1) × songDuration)` and SHALL normalise a created range from timestamps a and b
   so that `loopStartMs = min(a, b)` and `loopEndMs = max(a, b)`, both integers within `[0,
   songDuration]`.
4. WHILE a creation drag spans less than MIN_LOOP_DURATION_MS, THE Loop_Overview SHALL show a
   provisional range between the anchor and the pointer timestamp, and THE Studio_Store SHALL hold
   the pre-gesture Loop_Range (null/null when none existed), including when the span drops back
   below MIN_LOOP_DURATION_MS after having reached it.
5. WHILE a creation drag spans at least MIN_LOOP_DURATION_MS, THE Studio_Store SHALL hold the
   normalised creation range, written at most once per gesture update event.
6. IF a creation gesture ends, is cancelled by the system, or is cancelled by an orientation change
   with a span below MIN_LOOP_DURATION_MS, THEN THE Loop_Overview SHALL remove the provisional range
   and THE Studio_Store SHALL hold the pre-gesture Loop_Range and pre-gesture Loop_Enabled_Flag.
7. WHEN a tap occurs anywhere in the Loop_Overview other than the Clear_Control, where a tap is a
   gesture that ends with less than 4px of horizontal movement, THE Loop_Overview SHALL leave
   Loop_Range, Loop_Enabled_Flag, currentTime, ghostPlayheadTime, and all markers unchanged.
8. WHEN the "Set loop start at playhead" action is invoked, THE Studio_Store SHALL set loopStartMs
   to the playhead P (currentTime rounded to an integer and clamped to `[0, songDuration]`) and
   SHALL set loopEndMs to the existing loopEndMs if a Valid_Loop_Range exists and `loopEndMs − P ≥
   MIN_LOOP_DURATION_MS`, otherwise to `min(songDuration, P + MIN_LOOP_DURATION_MS)`.
9. WHEN the "Set loop end at playhead" action is invoked, THE Studio_Store SHALL set loopEndMs to
   the playhead P (currentTime rounded to an integer and clamped to `[0, songDuration]`) and SHALL
   set loopStartMs to the existing loopStartMs if a Valid_Loop_Range exists and `P − loopStartMs ≥
   MIN_LOOP_DURATION_MS`, otherwise to `max(0, P − MIN_LOOP_DURATION_MS)`.
10. IF a set-at-playhead action would produce a range that is not a Valid_Loop_Range (including P
    within MIN_LOOP_DURATION_MS of the song end for set-start, or of 0 for set-end), THEN THE
    Studio_Store SHALL leave Loop_Range and Loop_Enabled_Flag unchanged and log a `console.warn`
    containing the rejected start and end values.
11. WHERE a hardware keyboard is available, WHILE no text input is focused and a song is loaded,
    WHEN `[` or `]` is pressed, THE application SHALL invoke "Set loop start at playhead" or "Set
    loop end at playhead" respectively.
12. IF `songDuration` is less than MIN_LOOP_DURATION_MS, THEN THE Loop_Overview SHALL show no
    provisional range, THE Studio_Store SHALL reject creation drags and set-at-playhead actions
    leaving Loop_Range null, and THE Loop_Toggle SHALL remain disabled.
13. WHEN a creation drag or set-at-playhead action replaces an existing Valid_Loop_Range, THE
    Studio_Store SHALL keep isLoopRangeEnabled at its pre-action value; WHEN either creates a range
    where none existed, THE Studio_Store SHALL leave isLoopRangeEnabled false (criterion 9.7).
14. WHEN a creation drag or set-at-playhead action first writes a new Valid_Loop_Range to the
    Studio_Store, THE Studio_Store SHALL discard any restore snapshot (criterion 8.6), and a
    creation gesture that ends below MIN_LOOP_DURATION_MS SHALL leave the restore snapshot intact.

### Requirement 6: Moving a range

**User Story:** As a dancer, I want to slide the loop along the song, so that I can practise the next
section with the same length.

#### Acceptance Criteria

1. WHEN a horizontal Range_Gesture starts inside the Range_Body and outside both handle hit areas,
   THE Loop_Overview SHALL record the gesture-start loopStartMs, loopEndMs, and pointer x, and on
   each gesture update event SHALL compute the candidate loopStartMs as the gesture-start
   loopStartMs plus `round((pointerX − gestureStartPointerX) / overviewWidthPx × songDuration)`,
   measuring the delta from the gesture start rather than accumulating per-event deltas.
2. THE Loop_Range_Utils SHALL set loopEndMs during a move to loopStartMs plus the gesture-start
   duration (`loopEndMs − loopStartMs` at gesture start), so that the duration is identical on every
   update event and after the gesture ends, and both bounds remain integers (INV-4, INV-2).
3. IF a move's candidate loopStartMs is below 0, THEN THE Loop_Range_Utils SHALL set loopStartMs to
   0 and loopEndMs to the gesture-start duration.
4. IF a move's candidate loopStartMs plus the gesture-start duration is above songDuration, THEN THE
   Loop_Range_Utils SHALL set loopEndMs to songDuration and loopStartMs to `songDuration −
   duration`.
5. WHILE loopStartMs equals 0 and loopEndMs equals songDuration, WHEN a move gesture update event
   occurs, THE Loop_Overview SHALL leave Loop_Range unchanged.
6. WHEN a move gesture update returns the pointer to the gesture-start pointer x, THE
   Loop_Range_Utils SHALL produce a Loop_Range equal to the gesture-start Loop_Range.
7. WHILE isLoopRangeEnabled is true and playback is active, WHEN a move update writes a new
   Loop_Range, THE Playback_Engine SHALL continue playback without pausing or seeking as a result of
   the write, and SHALL apply criteria 10.1, 10.3, and 10.4 against the newly written range on its
   next poll (within PLAYBACK_UPDATE_INTERVAL_MS = 50ms), including continuing to song end per 10.4
   when currentTime is at or after the new loopEndMs.
8. WHEN a move gesture ends, THE Studio_Store SHALL hold the range written by the last update event
   as the committed Loop_Range and SHALL keep isLoopRangeEnabled equal to its gesture-start value.

### Requirement 7: Resizing a range with handles

**User Story:** As a dancer, I want to drag either edge of the loop, so that I can fine-tune where
the section begins and ends.

#### Acceptance Criteria

1. WHILE a Valid_Loop_Range exists, THE Start_Handle and End_Handle SHALL each render a visual width
   of at least 8px (HANDLE_VISUAL_MIN_WIDTH_PX), horizontally centred on the x-position of
   loopStartMs and loopEndMs respectively.
2. WHERE the application runs on native iOS or Android, THE Start_Handle and End_Handle SHALL each
   provide a hit area at least 44px wide and at least 44px tall, horizontally and vertically centred
   on the visual handle, extending beyond the 36px phone Loop_Overview strip by at least 4px above
   and 4px below.
3. WHERE the application runs on web, THE Start_Handle and End_Handle SHALL each provide a hit area
   at least 16px wide (HANDLE_POINTER_HIT_MIN_PX), horizontally centred on the visual handle and
   spanning the full Loop_Overview height, regardless of whether the input device is mouse, pen, or
   touch.
4. WHEN a Range_Gesture that started in the Start_Handle hit area updates, THE Loop_Range_Utils
   SHALL set loopStartMs to `startBoundAtGestureStart + (pointerTimestamp −
   pointerTimestampAtGestureStart)` clamped to `[0, loopEndMs − MIN_LOOP_DURATION_MS]`, and SHALL
   leave loopEndMs and isLoopRangeEnabled unchanged.
5. WHEN a Range_Gesture that started in the End_Handle hit area updates, THE Loop_Range_Utils SHALL
   set loopEndMs to `endBoundAtGestureStart + (pointerTimestamp − pointerTimestampAtGestureStart)`
   clamped to `[loopStartMs + MIN_LOOP_DURATION_MS, songDuration]`, and SHALL leave loopStartMs and
   isLoopRangeEnabled unchanged.
6. IF both handle hit areas overlap at the gesture start point, THEN THE Loop_Overview SHALL select
   the handle whose visual centre is nearer the pointer x.
7. IF both handle hit areas overlap at the gesture start point and both handle centres are
   equidistant from the pointer x, THEN THE Loop_Overview SHALL select the Start_Handle when the
   activating horizontal movement is to the left and the End_Handle when it is to the right.
8. THE Loop_Range_Utils SHALL round every resized bound to the nearest integer millisecond before
   clamping and before writing to the Studio_Store (INV-2).
9. WHILE a handle has accessibility or keyboard focus, WHEN an increment or decrement action occurs,
   THE Loop_Range_Utils SHALL change that handle's bound by exactly one Beat_Step, and by exactly
   `LARGE_STEP_MULTIPLIER × Beat_Step` (10 × Beat_Step) on large increment or decrement, with the
   result clamped per criteria 7.4–7.5 and the other bound unchanged.
10. IF a handle's centred hit area would extend past the left (x = 0) or right (x = Loop_Overview
    width) edge, THEN THE Loop_Overview SHALL shift that hit area inward so it lies entirely within
    the Loop_Overview horizontal bounds, keeps its full minimum width from criterion 7.2 or 7.3, and
    still contains the handle's visual centre.
11. WHEN a gesture starts inside the vertical hit-area extension of a handle that lies outside the
    Loop_Overview strip, THE Loop_Overview SHALL treat it as a handle Range_Gesture and THE
    Wrapped_Canvas and adjacent controls SHALL not receive that gesture; WHILE no Valid_Loop_Range
    exists, THE Loop_Overview SHALL provide no handle hit-area extension.

### Requirement 8: Clearing and restoring a range

**User Story:** As a dancer, I want to remove a loop explicitly and undo an accidental clear, so that
I never lose a carefully set section by mistake.

#### Acceptance Criteria

1. WHILE a Valid_Loop_Range exists or the Restore_Window is open, THE Loop_Overview SHALL show the
   Clear_Control with a hit area of at least 44 × 44px, and SHALL hide the Clear_Control at all
   other times.
2. WHEN the Clear_Control or the "Clear loop" accessibility action is activated while a
   Valid_Loop_Range exists, THE Studio_Store SHALL set loopStartMs and loopEndMs to null and
   isLoopRangeEnabled to false in a single store write.
3. WHEN a clear completes, THE Studio_Store SHALL replace any existing restore snapshot with a
   single-level snapshot containing the cleared Loop_Range, the cleared Loop_Enabled_Flag, and an
   expiry timestamp equal to the clear time plus RESTORE_WINDOW_MS (5000ms), where the clear time is
   supplied to the store action as an argument so that the store action performs no timer or clock
   side effect.
4. WHILE the Restore_Window is open, THE Clear_Control SHALL display the label "Restore" and expose
   the accessibility label "Restore loop"; WHILE the Restore_Window is closed and a Valid_Loop_Range
   exists, THE Clear_Control SHALL display the label "Clear loop".
5. WHEN "Restore" is activated at a time earlier than the snapshot expiry timestamp, THE
   Studio_Store SHALL normalise the snapshot range with the same Loop_Range_Utils used by the
   setters against the current songDuration, set Loop_Range to the normalised range, set
   isLoopRangeEnabled to the snapshot Loop_Enabled_Flag, and discard the snapshot.
6. WHEN the snapshot expiry timestamp is reached, a new range is created, a project is loaded, or a
   different audio file is loaded through `loadSong`, THE Studio_Store SHALL discard the restore
   snapshot, and THE Clear_Control SHALL stop displaying "Restore" within 100ms of expiry, driven by
   a component-owned timer that is cancelled when the Loop_Overview unmounts or the snapshot is
   discarded.
7. WHEN a project is loaded, THE Studio_Store SHALL restore the saved Loop_Range and
   Loop_Enabled_Flag per Requirement 14.
8. IF the snapshot range, after normalisation against the current songDuration, is not a
   Valid_Loop_Range (including when songDuration is 0, non-finite, or less than
   MIN_LOOP_DURATION_MS), THEN THE Studio_Store SHALL leave Loop_Range null and isLoopRangeEnabled
   false, discard the snapshot, and log a `console.warn` containing the snapshot range and the
   current songDuration.
9. IF "Restore" is activated at or after the snapshot expiry timestamp, or when no snapshot exists,
   THEN THE Studio_Store SHALL leave Loop_Range and isLoopRangeEnabled unchanged and discard any
   expired snapshot.
10. THE Project_Manager SHALL exclude the restore snapshot from saved project files, so that a
    project saved during the Restore_Window writes `settings.loopRange` as `null` and
    `settings.loopEnabled` as `false`, and no snapshot survives an app relaunch.
11. THE Loop_Overview SHALL reserve a dedicated action slot beside the Loop_Track for the
    Clear_Control, and the Clear_Control's visual bounds and hit area SHALL NOT cover the waveform,
    playhead, marker indicators, Range_Body, or handles in the Loop_Track.

### Requirement 9: Loop toggle in the transport row

**User Story:** As a dancer, I want a loop button next to play, so that I can switch looping on and
off without opening menus.

#### Acceptance Criteria

1. THE Transport_Row SHALL contain the Loop_Toggle as its last control, after the repeat button,
   with testID `loop-region-toggle`, `accessibilityRole` button, accessibility label "Loop selected
   range", and an icon that differs from the repeat button's icon.
2. THE Loop_Toggle SHALL expose `accessibilityState.checked` equal to isLoopRangeEnabled and
   `accessibilityState.disabled` equal to the negation of "a Valid_Loop_Range exists and a song is
   loaded", and on web SHALL render these states as `aria-pressed` ("true"/"false") and
   `aria-disabled` ("true"/"false") respectively.
3. WHILE no Valid_Loop_Range exists, no song is loaded, or `songDuration` is less than
   MIN_LOOP_DURATION_MS, THE Loop_Toggle SHALL render with a disabled visual treatment, SHALL expose
   disabled per criterion 9.2, and SHALL leave isLoopRangeEnabled, Loop_Range, currentTime,
   isPlaying, and isRepeatActive unchanged when pressed, tapped, or activated by an assistive
   technology.
4. WHEN the enabled Loop_Toggle is activated by tap, click, or assistive-technology activation, THE
   Studio_Store SHALL invert isLoopRangeEnabled, SHALL leave Loop_Range, currentTime, isPlaying, and
   isRepeatActive unchanged, and THE Loop_Toggle SHALL reflect the new checked state on the next
   render.
5. WHEN keyboard `L` or `l` is pressed without Ctrl, Cmd, Alt, or Meta modifiers while no text input
   is focused, a song is loaded, and a Valid_Loop_Range exists, THE Studio_Store SHALL invert
   isLoopRangeEnabled; IF any of those conditions is not met, THEN THE application SHALL leave
   isLoopRangeEnabled unchanged. When it becomes enabled it SHALL disable marker-segment looping.
6. WHILE the viewport is a phone with a width of 320px or 375px, THE Transport_Row SHALL render
   skip-back, play-pause, skip-forward, repeat, and the Loop_Toggle in that order on one row with no
   wrapping, no horizontal overflow, and no overlapping hit areas, each with an effective touch
   target of at least 44 × 44px.
7. WHEN a Valid_Loop_Range is committed while Loop_Range was absent (first creation in a session,
   after a clear, or after loading audio with no saved range), THE Studio_Store SHALL set
   isLoopRangeEnabled to false.
8. WHEN an existing Valid_Loop_Range is replaced (Requirement 5.2), moved, resized, or changed by a
   set-at-playhead action, THE Studio_Store SHALL leave isLoopRangeEnabled at its value before the
   change.
9. THE Transport_Row repeat button SHALL expose testID `repeat-toggle`, `accessibilityRole` button,
   accessibility label "Repeat song", and `accessibilityState.checked` equal to isRepeatActive
   (rendered as `aria-pressed` on web), and activating it SHALL leave isLoopRangeEnabled unchanged.

### Requirement 10: Playback while looping is enabled

**User Story:** As a dancer, I want the music to jump back to the loop start seamlessly, so that I
can rehearse a section repeatedly.

#### Acceptance Criteria

1. WHILE isLoopRangeEnabled is true, a Valid_Loop_Range exists, and playback is active, WHEN a poll
   samples currentTime such that the previous position sample satisfies `loopStartMs ≤
   previousSampleMs < loopEndMs` (the "armed" condition) and the current sample satisfies
   `currentTime ≥ loopEndMs − LOOP_BOUNDARY_TOLERANCE_MS`, THE Playback_Engine SHALL issue exactly
   one seek to exactly `loopStartMs / 1000` seconds, continue or resume playing, set Studio_Store
   currentTime to exactly loopStartMs, and record loopStartMs as the new previous position sample.
   This applies for any overshoot past loopEndMs, including a single poll whose sample is later than
   loopEndMs or at songDuration after delayed or throttled timers. The seek target SHALL NOT be
   adjusted by the overshoot amount, so iteration N seeks to the same target as iteration 1.
2. WHILE isLoopRangeEnabled is true and a Valid_Loop_Range exists, THE Playback_Engine SHALL
   evaluate the loop-range decision before end-of-track repeat or pause logic in each poll. It SHALL
   skip end-of-track repeat and pause logic for any poll where the armed condition holds, including
   when the player reports that the track has finished. A range with `loopEndMs = songDuration`
   therefore wraps to loopStartMs and never pauses or applies whole-song repeat, even though
   END_OF_TRACK_TOLERANCE_MS (100 ms) is larger than LOOP_BOUNDARY_TOLERANCE_MS (30 ms).
3. WHEN playback starts, or a seek lands, at a position before loopStartMs while looping is enabled,
   THE Playback_Engine SHALL record that position as the previous position sample, play normally
   without seeking until a sample falls inside `[loopStartMs, loopEndMs)`, and then wrap according
   to criterion 1.
4. WHEN playback starts, or a seek lands, at a position at or after loopEndMs while looping is
   enabled, THE Playback_Engine SHALL record that position as the previous position sample and
   continue normally to song end without seeking to loopStartMs, because the armed condition is
   false (decision D-7).
5. WHEN isLoopRangeEnabled changes from false to true while playback is active, THE Playback_Engine
   SHALL keep playing without pausing and SHALL apply criterion 1 from the first poll after the
   change, using the most recent position sample as the previous position sample. If that sample is
   at or after loopEndMs, THE Playback_Engine SHALL apply criterion 4 and SHALL NOT seek.
6. THE Playback_Engine SHALL read Loop_Range and Loop_Enabled_Flag at poll time. WHEN either value
   changes, THE Playback_Engine SHALL keep the playback interval running at
   PLAYBACK_UPDATE_INTERVAL_MS (50 ms) without pausing playback or changing currentTime.
7. WHILE isLoopRangeEnabled is true and isRepeatActive is true, WHEN the playhead reaches song end
   within END_OF_TRACK_TOLERANCE_MS while the armed condition is false, THE Playback_Engine SHALL
   apply whole-song repeat.
8. WHILE isLoopRangeEnabled is true and isRepeatActive is false, WHEN the playhead reaches song end
   within END_OF_TRACK_TOLERANCE_MS while the armed condition is false, THE Playback_Engine SHALL
   pause as it does today.
9. THE Loop_Range_Utils SHALL expose the loop-wrap decision as a pure function. Its inputs are the
   enabled flag, playing state, loopStartMs, loopEndMs, previous position sample, current sample,
   and tolerance. It returns either "wrap" with target loopStartMs or "no wrap". Jest unit tests
   SHALL cover: an in-range sample before the threshold returns no wrap; samples at exactly
   `loopEndMs − LOOP_BOUNDARY_TOLERANCE_MS`, at loopEndMs, and beyond loopEndMs (including
   songDuration) return wrap when armed; a previous sample at or after loopEndMs returns no wrap; a
   previous sample before loopStartMs returns no wrap; a disabled flag returns no wrap; a paused
   state returns no wrap; a null range returns no wrap.
10. IF the seek issued by criterion 1 throws or rejects, THEN THE Playback_Engine SHALL log the
    error and the attempted target with `console.error`, set Studio_Store currentTime from the
    player's next reported position, record that position as the previous position sample, and
    attempt no further loop seeks until a later sample again satisfies the armed condition (one seek
    attempt per boundary crossing, no per-poll retry loop), leaving Loop_Range and
    isLoopRangeEnabled unchanged.
11. WHEN the user seeks or scrubs on the Wrapped_Canvas while looping is enabled, THE
    Playback_Engine SHALL suspend loop-wrap decisions until the scrub or seek completes, record the
    landed position as the previous position sample, and then apply criterion 1, 3, or 4 based on
    that position. Loop_Range and isLoopRangeEnabled SHALL remain unchanged (INV-6).

### Requirement 11: Playback while looping is disabled

**User Story:** As a dancer, I want to keep my loop selection while playing straight through, so
that I can switch back to looping later.

#### Acceptance Criteria

1. WHILE isLoopRangeEnabled is false and playback is active, THE Playback_Engine SHALL perform no
   seek to loopStartMs when currentTime reaches or passes `loopEndMs − LOOP_BOUNDARY_TOLERANCE_MS`,
   and SHALL advance currentTime past loopEndMs without pausing.
2. WHILE isLoopRangeEnabled is false and a Valid_Loop_Range exists, THE Loop_Overview SHALL continue
   to display the Range_Body with the disabled treatment defined in criterion 3.3, and THE
   Wrapped_Canvas SHALL continue to draw the outline-only range segments defined in criterion 4.7
   without outside-range de-emphasis.
3. WHILE isLoopRangeEnabled is false, THE Studio_Store SHALL keep loopStartMs and loopEndMs
   unchanged across playback, pause, seek, and song-end handling, so that setting isLoopRangeEnabled
   to true restores looping on the same Loop_Range with no re-selection.
4. WHEN isLoopRangeEnabled changes from true to false while playback is active and currentTime is
   inside the Loop_Range, THE Playback_Engine SHALL keep playing from the current position with no
   seek and no pause, and SHALL continue past loopEndMs on subsequent polls.
5. WHILE isLoopRangeEnabled is false, WHEN the playhead reaches song end within
   END_OF_TRACK_TOLERANCE_MS, THE Playback_Engine SHALL apply whole-song repeat IF isRepeatActive is
   true, and SHALL pause IF isRepeatActive is false, identically to playback with no Loop_Range.

### Requirement 12: Gesture isolation

**User Story:** As a dancer, I want loop editing and seeking to never interfere, so that adjusting a
loop never moves my playback position or adds markers.

#### Acceptance Criteria

1. THE Range_Gesture handlers SHALL leave currentTime, ghostPlayheadTime, and every layer's markers
   unchanged from gesture start through gesture end or cancellation. They SHALL call none of
   `onSeek`, `setCurrentTime`, `addMarker`, or scrubbing start (INV-5).
2. WHEN a pointer pressed inside the Loop_Overview has moved at least 6px horizontally from its
   press point in either direction, before moving 12px vertically, THE Range_Gesture SHALL activate.
   IF that pointer moves at least 12px vertically from its press point before it activates, THEN THE
   Range_Gesture SHALL fail and SHALL make no Studio_Store write.
3. THE Range_Gesture SHALL run its React and Studio_Store callbacks on the JS thread.
4. THE wrapped-row and gutter gestures, including taps, horizontal row seeks, and drags, SHALL leave
   Loop_Range and Loop_Enabled_Flag unchanged (INV-6).
5. WHEN a second touch begins during an active Range_Gesture, THE Loop_Overview SHALL track only the
   first pointer. The second touch SHALL not change the Range_Gesture's operation (create, move, or
   resize), its anchor timestamp, or the Loop_Range.
6. WHEN the pointer moves past the left or right edge of the Loop_Overview during a Range_Gesture,
   THE Loop_Overview SHALL clamp the pointer timestamp to `[0, songDuration]`. It SHALL keep
   tracking the pointer until release or cancellation.
7. IF the system cancels a Range_Gesture, THEN THE Loop_Overview SHALL end the gesture. For a resize
   or move gesture, and for a creation gesture whose span is at least MIN_LOOP_DURATION_MS at
   cancellation, THE Loop_Overview SHALL keep the Valid_Loop_Range most recently written to the
   Studio_Store (the last committed Valid_Loop_Range) rather than reverting to the range that
   existed at gesture start. For a creation gesture whose span is below MIN_LOOP_DURATION_MS at
   cancellation, criterion 5.6 applies: THE Loop_Overview SHALL discard the provisional range and
   THE Studio_Store SHALL hold the pre-gesture Loop_Range and Loop_Enabled_Flag.
8. IF the device orientation changes during a Range_Gesture, THEN THE Loop_Overview SHALL cancel the
   gesture and keep the last committed Valid_Loop_Range, as defined in criterion 12.7. No pointer
   movement after the orientation change SHALL modify the Loop_Range until a new Range_Gesture
   starts.
9. WHILE a Range_Gesture is active, THE Range_Gesture SHALL commit each Valid_Loop_Range it produces
   to the Studio_Store live, during the drag. It SHALL make at most one Studio_Store write per
   gesture update event and no write for an update event whose resulting Loop_Range equals the
   current stored Loop_Range.
10. WHILE a Range_Gesture is active, THE Wrapped_Canvas SHALL not start a row seek, gutter,
    marker-selection, or drag gesture.
11. WHILE a wrapped-row or gutter gesture is active, THE Loop_Overview SHALL not start a
    Range_Gesture.
12. WHILE a Range_Gesture is active on desktop web, THE page SHALL keep its horizontal and vertical
    scroll offsets unchanged from their values when the gesture activated.

### Requirement 13: Duration changes and audio changes

**User Story:** As a dancer, I want my loop to stay correct when the song's measured duration
changes, so that the loop never points past the end of the audio.

#### Acceptance Criteria

1. WHEN setSongDuration receives a finite value greater than 0, THE Studio_Store SHALL round it to
   the nearest integer millisecond (halves round up) before storing it as songDuration and before
   any Loop_Range comparison.
2. WHEN songDuration changes to a finite positive value and a non-null Loop_Range exists, THE
   Studio_Store SHALL set loopStartMs to `min(loopStartMs, songDuration)` and loopEndMs to
   `min(loopEndMs, songDuration)`, and SHALL keep isLoopRangeEnabled at its prior value if the
   result is a Valid_Loop_Range (for example, a range ending at 180000 becomes one ending at 179987
   when the player reports 179987.4ms).
3. IF the range produced by criterion 13.2 is shorter than MIN_LOOP_DURATION_MS or loopStartMs ≥
   songDuration, THEN THE Studio_Store SHALL set loopStartMs and loopEndMs to null, set
   isLoopRangeEnabled to false, and log one `console.warn` containing the previous loopStartMs,
   previous loopEndMs, and new songDuration.
4. WHEN `loadSong` loads a user-selected audio file, THE Studio_Store SHALL set loopStartMs and
   loopEndMs to null, set isLoopRangeEnabled to false, and discard the restore snapshot.
5. WHILE songDuration is 0 or non-finite, THE Studio_Store SHALL hold isLoopRangeEnabled false and
   SHALL retain any existing loopStartMs and loopEndMs values unchanged as a pending range, which is
   exempt from the songDuration bound of INV-1 until a finite positive songDuration arrives.
6. IF any loop setter receives NaN, Infinity, −Infinity, or a non-number, THEN THE Studio_Store
   SHALL leave Loop_Range and isLoopRangeEnabled unchanged and log one `console.warn` containing the
   rejected input.
7. WHEN `loadProject` or `loadProjectAudio` loads the audio belonging to the loaded project, THE
   Studio_Store SHALL keep the project-restored Loop_Range and SHALL change it only through criteria
   13.2 and 13.3 once the player reports a duration.
8. WHEN songDuration changes from 0 or non-finite to a finite positive value and the pending range
   validates under criterion 13.2, THE Studio_Store SHALL set isLoopRangeEnabled to the value it
   held immediately before songDuration became 0 or non-finite, or to the project-restored value if
   a project load set the pending range.
9. IF songDuration changes but the rounded value equals the current songDuration, THEN THE
   Studio_Store SHALL leave Loop_Range and isLoopRangeEnabled unchanged and log no warning.

### Requirement 14: Persistence

**User Story:** As a choreographer, I want my loop saved with the project, so that reopening the
project returns me to the section I was rehearsing.

#### Acceptance Criteria

1. WHEN a project is saved, THE Project_Manager SHALL write `settings.loopRange` as `{ startMs,
   endMs }` with integer millisecond values equal to the Studio_Store loopStartMs and loopEndMs, or
   as `null` when no Valid_Loop_Range exists, and SHALL write `settings.loopEnabled` as a boolean
   equal to isLoopRangeEnabled (decision D-2 default: the flag persists), writing `false` whenever
   `settings.loopRange` is `null`.
2. WHEN a project whose loaded version is `'1.1.0'` or older, or a project that has never been
   saved, is saved, THE Project_Manager SHALL write `version: '1.1.0'`.
3. WHEN a project with version `'1.0.0'`, or a project missing `settings.loopRange` or
   `settings.loopEnabled`, is loaded, THE Studio_Store SHALL set Loop_Range to null and
   isLoopRangeEnabled to false, and THE Project_Manager SHALL complete the load with all other
   project fields unchanged and without reporting an error.
4. WHEN a project with a non-null persisted loop range is loaded, THE Studio_Store SHALL normalise
   it with the same Loop_Range_Utils used by the setters: round both bounds to integers and clamp
   them to `[0, songDuration]` using the loaded songDuration, keeping the clamped range when it
   remains a Valid_Loop_Range (consistent with Requirement 13.2).
5. IF a persisted loop range has a non-finite or non-number bound, has startMs ≥ endMs before
   clamping, has startMs ≥ songDuration, or is shorter than MIN_LOOP_DURATION_MS after clamping,
   THEN THE Studio_Store SHALL load the project with Loop_Range null and isLoopRangeEnabled false,
   log a `console.warn` containing the persisted range and the loaded songDuration, and complete the
   load with markers, layers, and all other settings intact (consistent with Requirement 13.3).
6. IF a project's version is newer than `'1.1.0'` by numeric comparison of its major, minor, and
   patch components (so that `'1.10.0'` is newer than `'1.2.0'`), THEN THE Project_Manager SHALL
   load known fields without rewriting the stored project and SHALL keep the original version string
   in memory.
7. FOR ALL Valid_Loop_Range values paired with either Loop_Enabled_Flag value, and for a null
   Loop_Range paired with a false Loop_Enabled_Flag, saving then loading a project with the same
   songDuration SHALL produce identical integer loopStartMs and loopEndMs values and an identical
   Loop_Enabled_Flag (round-trip property).
8. THE `tests/unit/projectManager.wrapped.test.ts` expectation that settings omit loop fields SHALL
   be replaced with expectations for `loopRange` and `loopEnabled`.
9. IF a loaded project has `settings.loopEnabled` set to a non-boolean value, or set to `true` while
   its loop range is null or rejected by criterion 14.5, THEN THE Studio_Store SHALL set
   isLoopRangeEnabled to false (INV-3) and complete the load.
10. WHEN a project loaded with a version newer than `'1.1.0'` is saved, THE Project_Manager SHALL
    keep the original newer version string and SHALL preserve any unrecognised top-level and
    `settings` fields from the loaded project unchanged, rather than writing `'1.1.0'`.
11. IF the loaded songDuration is 0 or non-finite when a project with a non-null persisted loop
    range is loaded, THEN THE Studio_Store SHALL hold isLoopRangeEnabled false (Requirement 13.5)
    and SHALL apply criteria 14.4 and 14.5 to the persisted range when songDuration first becomes a
    finite positive value.

### Requirement 15: Preserve marker-segment looping alongside range looping

**User Story:** As a dancer, I want quick marker-bounded looping as well as a precise custom range,
so that I can use the fastest loop tool for the rehearsal task.

#### Acceptance Criteria

1. THE Studio_Store SHALL expose session-only `isLoopMarkerActive` and `toggleLoopMarker` state.
2. THE `MarkerButton` component SHALL show an accessible `LoopMarkerIcon` button with testID
   `loop-marker-toggle` after the four marker-editing/navigation controls.
3. WHEN marker looping is enabled, THE Playback_Engine SHALL loop the segment containing the prior
   playback sample, using 0 and songDuration as implicit outer boundaries and the selected layer's
   markers when layer-specific navigation is enabled.
4. WHEN the Loop Range is enabled, THE Studio_Store SHALL disable marker looping; WHEN marker
   looping is enabled, it SHALL disable the Loop Range. Whole-song repeat remains independent and
   applies only when neither bounded loop wraps first.
5. THE `HelpScreen` SHALL list `L` as "Toggle loop range", `Shift+L` as "Toggle loop between
   markers", and `[` / `]` as "Set loop start / end at playhead".
6. THE marker-segment loop SHALL remain session-only and SHALL not be persisted or migrated.
7. WHILE a song is loaded in the portrait phone layout at a 375×667 viewport and on the iPhone
   simulator, THE bottom marker row SHALL show all five controls without horizontal overflow or
   page/action-row scrolling, with each control retaining at least a 44×44px target.

### Requirement 16: Responsive layout and input modes

**User Story:** As a user on any device, I want the overview to fit and respond to my input method,
so that loop editing works the same everywhere.

#### Acceptance Criteria

1. WHILE the viewport width is below 768px and the device is in portrait, THE Loop_Overview SHALL
   render directly below the Wrapped_Canvas (or the Detail_View when it replaces the
   Wrapped_Canvas), above the control dock, inside the fixed workspace and the safe-area
   insets, with a width equal to the canvas width within ±1px.
2. WHILE the viewport width is below 768px and the device is in landscape, THE Loop_Overview SHALL
   render directly below the Wrapped_Canvas inside the canvas column and the safe-area insets, with
   a width equal to the canvas column width within ±1px, and with a bounding box that does not
   overlap the control rail or a docked Detail_View panel.
3. WHILE the viewport width is 768px or greater (tablet or desktop web), THE Loop_Overview SHALL
   render directly below the Wrapped_Canvas with a width equal to the Wrapped_Canvas width within
   ±1px.
4. WHERE input is mouse, THE Loop_Overview SHALL show cursor `ew-resize` while the pointer is over a
   Start_Handle or End_Handle hit area, `grab` while the pointer is over the Range_Body outside both
   handle hit areas, and `grabbing` from the start of a move Range_Gesture until the mouse button is
   released.
5. WHEN the window size or device orientation changes, THE Loop_Overview SHALL re-project the
   Range_Body, both handles, the playhead, and marker indicators to the new width (each within ±1px
   of `timestamp / songDuration` of the new width) after layout completes, and SHALL leave
   Loop_Range values and Loop_Enabled_Flag unchanged.
6. WHILE the Detail_View is active in portrait (replacing the Wrapped_Canvas) or in landscape
   (docked as a panel), THE Loop_Overview SHALL remain visible and SHALL continue to represent the
   full song from 0 to `songDuration` rather than the Detail_View viewport.
7. WHERE input is a keyboard on web, WHEN the Start_Handle, End_Handle, or Clear_Control receives
   keyboard focus, THE Loop_Overview SHALL display a visible focus indicator on that control that is
   removed when focus leaves the control.

### Requirement 17: Accessibility

**User Story:** As a screen-reader or keyboard user, I want to create, adjust, and clear loops
without dragging, so that rehearsal looping is fully accessible.

#### Acceptance Criteria

1. WHILE a Valid_Loop_Range exists, THE Start_Handle and End_Handle SHALL each expose role
   adjustable (native `accessibilityRole`) or slider (web ARIA `role`), value min 0, value max
   songDuration, value now equal to the handle's bound in integer milliseconds, and value text
   formatted `Loop start m:ss.s` or `Loop end m:ss.s`, where `m:ss.s` is the bound truncated to the
   lower tenth of a second, minutes unpadded and seconds zero-padded to two digits (e.g. 61,250ms →
   `1:01.2`), mirrored to `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` on
   web.
2. THE Loop_Overview SHALL expose a summary accessibility label formatted `Loop m:ss.s to m:ss.s, N
   seconds` while a Valid_Loop_Range exists, where both times use the format in criterion 17.1 and N
   is `(loopEndMs − loopStartMs) / 1000` rounded half-up to one decimal place and always shown with
   one decimal (e.g. `2.0`), and SHALL expose `No loop selected` while no Valid_Loop_Range exists.
3. WHILE a song is loaded and songDuration is at least MIN_LOOP_DURATION_MS, THE Loop_Overview SHALL
   expose the accessibility actions "Set loop start at playhead" and "Set loop end at playhead", and
   WHILE a Valid_Loop_Range exists it SHALL additionally expose "Clear loop"; WHILE neither
   condition holds, THE Loop_Overview SHALL expose none of these actions.
4. WHEN a handle's bound changes through an accessibility action, adjustable increment or decrement,
   or keyboard step, THE application SHALL announce the handle's updated value text from criterion
   17.1 exactly once per change; IF the requested change is clamped so that the bound is unchanged,
   THEN THE application SHALL announce the current value text without modifying the Loop_Range.
5. THE Start_Handle, End_Handle, Range_Body edges, Clear_Control, and Loop_Toggle SHALL use colours
   from the shared tokens in `src/styles/common.ts` that achieve a contrast ratio of at least 3:1
   against their adjacent background for non-text graphics and at least 4.5:1 for any text label, in
   every state (enabled, disabled treatment per criterion 3.3, focused); compliance is verified by
   manual measurement of the rendered token pairs, not by automated tests.
6. WHILE a handle has web keyboard focus, THE handle SHALL be reachable in tab order (Start_Handle
   before End_Handle), SHALL change its bound by one Beat_Step on ArrowLeft/ArrowDown (decrement) or
   ArrowRight/ArrowUp (increment), by `LARGE_STEP_MULTIPLIER × Beat_Step` on PageDown/PageUp or
   Shift+Arrow, and SHALL set its bound to its lower clamp limit on Home and its upper clamp limit
   on End, using the clamp limits defined in criteria 7.4–7.5.
7. WHEN a range is cleared through the Clear_Control, the "Clear loop" action, or keyboard while
   focus is on a handle or the Clear_Control, THE Loop_Overview SHALL move accessibility and
   keyboard focus to the Clear_Control (now labelled "Restore"), and WHEN the Restore_Window closes
   without restore, THE Loop_Overview SHALL move focus to the Loop_Overview summary element so focus
   is never lost to the document root.

### Requirement 18: Detail-view follow preservation

**User Story:** As a producer using detail mode, I want the detail view to keep following the
playhead, so that removing the scrollbar does not break precision editing.

#### Acceptance Criteria

1. WHILE isViewportLocked is true and playback is active, WHEN Studio_Store currentTime changes to a
   value outside the closed interval `[viewportStartTime, viewportStartTime + viewportDuration]`,
   THE Detail_View SHALL set viewportStartTime to `max(0, min(currentTime, songDuration −
   viewportDuration))` and leave viewportDuration unchanged, reproducing the auto-follow behaviour
   previously embedded in `TimelineScrollbar`.
2. THE auto-follow behaviour SHALL run independently of whether the Loop_Overview is visible,
   including WHILE `showTimeline` is false, and independently of whether the Detail_View panel is
   currently shown.
3. THE viewport setters SHALL continue to enforce `0 ≤ viewportStartTime ≤ songDuration −
   viewportDuration`, so that a follow page requested within the final viewportDuration of the song
   sets viewportStartTime to exactly `songDuration − viewportDuration`.
4. WHILE isViewportLocked is true and playback is active, WHEN the Playback_Engine wraps currentTime
   to loopStartMs (Requirement 10.1) and loopStartMs lies outside `[viewportStartTime,
   viewportStartTime + viewportDuration]`, THE Detail_View SHALL page viewportStartTime to `max(0,
   min(loopStartMs, songDuration − viewportDuration))` on the same currentTime update that reports
   the wrap; IF loopStartMs lies inside the viewport, THEN THE Detail_View SHALL leave
   viewportStartTime unchanged.
5. THE Loop_Overview SHALL never write viewportStartTime, viewportDuration, or isViewportLocked from
   any gesture, accessibility action, or effect (INV-8), verifiable by comparing the three values
   before and after each Loop_Overview interaction.
6. WHILE isViewportLocked is false and playback is active, WHEN currentTime changes to a value
   inside `[viewportStartTime, viewportStartTime + viewportDuration]`, THE Detail_View SHALL set
   isViewportLocked to true without changing viewportStartTime or viewportDuration; WHILE
   isViewportLocked is false and currentTime is outside that interval, THE Detail_View SHALL leave
   viewportStartTime unchanged.
7. THE Detail_View SHALL provide its existing pinch (touch) and wheel (mouse/trackpad) zoom as the
   only user path that changes viewportDuration after `TimelineScrollbar` is removed, with no
   replacement viewport strip or resize handles (decision D-6), and each zoom SHALL produce a
   viewport satisfying criterion 18.3.

### Requirement 19: Architecture and performance

**User Story:** As a developer, I want the loop logic pure and the overview efficient, so that it is
testable and smooth during playback.

#### Acceptance Criteria

1. THE Loop_Range state (loopStartMs, loopEndMs, isLoopRangeEnabled) and its actions SHALL live in
   the Studio_Store, and THE application SHALL add no new global store and no module-level mutable
   loop state outside the Studio_Store (ADR-001).
2. THE Loop_Range_Utils SHALL implement normalise, clamp, move, resize, validate, duration-reclamp,
   ms-to-pixel mapping, pixel-to-ms mapping, and a loop-wrap decision as pure functions that import
   no React or React Native module, perform no I/O or store access, and return equal outputs for
   equal inputs, each covered by Jest unit tests under `tests/unit/`.
3. WHILE a Range_Gesture is active, THE Loop_Overview SHALL perform zero waveform path
   recomputations, recomputing the waveform path only when peaks, width, or songDuration change.
4. WHILE playback is active, THE Loop_Overview SHALL subscribe to the Studio_Store with granular
   per-field selectors so that currentTime updates at the 50ms PLAYBACK_UPDATE_INTERVAL_MS cause
   zero waveform path recomputations and update only the playhead.
5. THE Loop_Overview SHALL reuse `useCustomAudioPlayer` for playback state and introduce no second
   audio player.
6. FOR ALL inputs to the Loop_Range_Utils normalise function (any pair of numbers including
   negative, non-integer, reversed, non-finite, and beyond-songDuration values, and any finite
   songDuration ≥ 0), applying normalise twice SHALL equal applying it once, and every output SHALL
   be either the null range or a range satisfying INV-1 and INV-2 (fast-check property test).
7. FOR ALL Valid_Loop_Range inputs and any finite pointer delta, the Loop_Range_Utils move function
   SHALL return a range with `loopEndMs − loopStartMs` equal to the input duration (INV-4) that
   satisfies INV-1 (fast-check property test).
8. FOR ALL Valid_Loop_Range inputs, either handle, and any finite pointer timestamp, the
   Loop_Range_Utils resize function SHALL return a range with `loopEndMs − loopStartMs ≥
   MIN_LOOP_DURATION_MS` that satisfies INV-1 and INV-2 (fast-check property test).
9. FOR ALL finite songDuration > 0, overview width > 0, and timestamps in `[0, songDuration]`, the
   Loop_Range_Utils pixel-to-ms mapping SHALL return an integer clamped to `[0, songDuration]`,
   SHALL be monotonically non-decreasing in pixel x, and pixel-to-ms of ms-to-pixel of a timestamp
   SHALL differ from that timestamp by at most `ceil(songDuration / width)` ms; IF songDuration or
   width is non-finite or ≤ 0, THEN both mapping functions SHALL return 0 (fast-check property
   test).

## Interaction Rules

```text
Gesture origin                     | Horizontal drag             | Tap
-----------------------------------|-----------------------------|-----------
Start_Handle hit area              | Resize start (7.4)          | No effect (5.7)
End_Handle hit area                | Resize end (7.5)            | No effect (5.7)
Overlapping handle hit areas       | Nearer handle; tie → dir    | No effect (5.7)
Range_Body (outside handles)       | Move range (6.1)            | No effect (5.7)
Outside range / no range           | Create range (5.1, 5.2)     | No effect (5.7)
Marker indicator                   | Same as region beneath it   | No effect (2.5)
Clear_Control                      | n/a                         | Clear/Restore (8.2, 8.5)
Any vertical-first movement ≥12px  | Gesture fails; no change    | n/a (12.2)
```

## Edge Cases

1. A range equal to the full song (`0` to `songDuration`) is valid, cannot move, and wraps at song
   end before end-of-track logic (10.2).
2. A range starting at 0 clamps a leftward move to 0 without shrinking (6.3).
3. A range ending at songDuration wraps to loopStartMs instead of pausing (10.2).
4. Loop bounds exactly on a row boundary are owned by the later row (4.2).
5. A creation drag below MIN_LOOP_DURATION_MS is provisional and discarded on release, restoring the
   pre-gesture range (5.4, 5.6).
6. A song shorter than MIN_LOOP_DURATION_MS permits no range and keeps the Loop_Toggle disabled
   (5.12).
7. Dragging beyond the overview clamps to `[0, songDuration]` (12.6).
8. A second finger during a gesture is ignored (12.5).
9. Orientation change mid-drag cancels and keeps the last committed range (12.8).
10. System gesture cancellation keeps the last committed range for resize/move; a below-minimum
    creation restores the pre-gesture range (12.7, 5.6).
11. A wrapped-row seek past loopEndMs while looping is not armed, so playback continues to song end
    with no jump (10.1 armed rule, 10.4).
12. Repeat plus loop: the range wins inside it; repeat applies at song end outside it (10.7).
13. A marker exactly on a loop boundary is unchanged and remains display-only (2.5).
14. NaN, Infinity, or non-number inputs are rejected with a warning (13.6).
15. A player-reported duration shorter than metadata duration reclamps or clears the range (13.2,
    13.3).
16. A throttled or backgrounded timer overshoot past loopEndMs still wraps when armed (10.1).
17. A seek failure at wrap does not spin; one attempt per boundary crossing (10.10).
18. A project saved during the Restore_Window persists no loop (8.10).
19. A player duration slightly shorter than metadata clamps the range rather than clearing it
    (13.2).
20. A project with a newer version is saved with its version and unknown fields preserved (14.10).

## Non-Goals

- Stem separation or multi-layer mobile UI.
- Marker creation or editing from the Loop_Overview.
- Seeking from the Loop_Overview, including taps.
- Reintroducing scrolling to the fixed phone canvas.
- 8-count or phrase features, including phrase-snapped loop bounds.
- Multiple simultaneous loop ranges.
- Monetisation or entitlement gating.
- Replacing the audio engine or adding sample-accurate gapless looping.
- Native waveform extraction.

## Manual Acceptance Targets

These targets are verified by hand and are not automated acceptance criteria:

- Smooth (60fps target) range drag and playback on the iPhone 17 Pro / iOS 26.2 simulator and on a
  physical iPhone.
- VoiceOver adjustment of the Start_Handle and End_Handle, including value announcements (17.4).
- Contrast measurement of the rendered token pairs in every state (17.5).
- Audibility of the loop boundary on a physical device, confirming the wrap is acceptable for
  rehearsal.

## Unresolved Product Decisions

1. D-1: MIN_LOOP_DURATION_MS is defaulted to 500ms; confirm with dancers.
2. D-2: Whether `loopEnabled` persists (default: persists) or projects always load with looping
   disabled.
3. D-3: Whether to add "Set range from surrounding markers" as a replacement for the retired
   marker-segment loop (default: not included).
4. D-4: Whether a tap outside the range should ever seek (default: no).
5. D-5: The final clear/restore affordance form (default: Clear_Control becomes "Restore" for
   5000ms).
6. D-6: Whether tablet/desktop detail mode needs a separate viewport strip now that the scrollbar is
   removed (default: no; detail view keeps its own navigation).
7. D-7: Whether playback started at or after loopEndMs with looping enabled should jump to
   loopStartMs (default: no jump; plays to song end).
8. D-8: Whether the Restore_Window should be 5000ms and whether focus should move to Restore (17.7).
9. D-9: Whether newer-version projects should be writable at all (14.10 default: preserve version
   and unknown fields).
