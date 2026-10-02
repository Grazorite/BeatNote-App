# Requirements Document

## Introduction

The Wrapped Waveform Canvas replaces BeatNote's primary waveform presentation with a wrapped
timeline. Time flows left to right across one row, then continues on the row below, like lines of
text or a musical score, so a choreographer can read a whole song top to bottom without constant
horizontal panning. Each row is a deterministic time range, ideally a whole number of dance phrases
(eight-counts).

The wrapped view is the primary workspace. A continuous detailed waveform (the repurposed
`WaveformCanvas`) is retained as a precision editing mode. Both views are projections of the same
underlying state — identical timestamps, markers, annotations, playback position, loop bounds,
selected layer, and waveform peaks. Rows carry only derived geometry (`startMs`/`endMs` plus optional
phrase metadata), computed by pure functions and never persisted.

These requirements are derived from the approved design document
(`.kiro/specs/wrapped-waveform-canvas/design.md`) in a Design-First workflow. Acceptance criteria are
numbered as X.Y so the design's correctness properties can cite them. All timestamps are integer
milliseconds (ADR-009); all global state lives in the single Zustand store (ADR-001).

## Glossary

- **Wrapped_View**: The primary presentation that divides a song into stacked rows, each covering a
  contiguous time range, rendered top to bottom.
- **Wrapped_Row**: A projection of one contiguous time range onto a single row, carrying only derived
  geometry (`index`, `startMs`, `endMs`, optional `phraseNumber`, optional `countLabel`). It stores no
  markers, annotations, or peaks.
- **Gutter**: The fixed-width left region of a row that displays the row start time (`mm:ss`) and,
  when phrase-aware, the phrase number and count label.
- **Active_Row**: The single row whose time range contains the current playback position
  (`startMs <= currentTime < endMs`, or the final row when `currentTime === songDuration`).
- **Playhead**: The visual indicator of the current playback position; it appears only on the
  Active_Row.
- **Follow_Playhead**: The behaviour that auto-scrolls the Active_Row into view during playback,
  controlled by the persisted `followPlayhead` preference.
- **Phrase / Eight_Count**: A standard dance phrase of `countSize` beats; an eight-count is a phrase
  of 8 beats.
- **Count_Size**: The number of counts per phrase, one of 4, 6, or 8 (`countSize`), default 8.
- **Detail_Mode**: The precision editing presentation hosting the repurposed continuous
  `WaveformCanvas` for a selected row's time range.
- **Boundary_Ownership**: The rule that every row is the half-open interval `[startMs, endMs)` and the
  final row is inclusive of `songDuration`, so a boundary timestamp renders in exactly one row (the
  later row that it starts).
- **AB_Loop**: An explicit A/B loop defined by `loopStartMs` and `loopEndMs`; active when both bounds
  are non-null.
- **Timing_Bar**: A flat colour bar spanning a row, split at the progress point into active and muted
  colours; the real fallback when no peak data is available.
- **Row_Layout_Engine**: The pure utility (`computeRows` in `rowLayout.ts`) that computes
  Wrapped_Row geometry from a configuration.
- **Timeline_Mapper**: The pure utility (`timelineMapping.ts`) that maps between timestamps, rows, and
  pointer positions and computes progress and loop segments.
- **Overscan**: The number of extra rows rendered above and below the visible window during
  virtualization (OVERSCAN = 3).

## Requirements

### Requirement 1: Wrapped rendering of the song into rows

**User Story:** As a choreographer, I want the song presented as stacked rows that read top to bottom,
so that I can see the whole structure at a glance without horizontal panning.

#### Acceptance Criteria

1. WHEN a song with a known duration is loaded, THE Wrapped_View SHALL divide the song into
   contiguous Wrapped_Row entries and render them stacked from top to bottom.
2. WHERE a Wrapped_Row is rendered, THE Wrapped_View SHALL display a Gutter containing the row start
   time formatted as `mm:ss`.
3. WHERE a Wrapped_Row is phrase-aware, THE Gutter SHALL display the phrase number and the count label
   for the first count of that row.
4. WHILE a Wrapped_Row is the Active_Row, THE Wrapped_View SHALL render the elapsed portion of that
   row in the active layer colour and the upcoming portion in the muted colour, split at the current
   playback position.
5. WHILE a Wrapped_Row precedes the Active_Row in time, THE Wrapped_View SHALL render that row
   entirely in the active layer colour.
6. WHILE a Wrapped_Row follows the Active_Row in time, THE Wrapped_View SHALL render that row entirely
   in the muted colour.
7. THE Wrapped_View SHALL render the Playhead on the Active_Row only.

### Requirement 2: Deterministic row calculation

**User Story:** As a dancer, I want rows aligned to musical phrases, so that each row corresponds to a
meaningful chunk of choreography.

#### Acceptance Criteria

1. WHERE BPM is finite and greater than zero AND phrase mode is selected, THE Row_Layout_Engine SHALL
   compute phrase-aware rows whose duration equals `(60000 / bpm) * countSize * phrasesPerRow`
   milliseconds.
2. WHEN `countSize` is 4, 6, or 8, THE Row_Layout_Engine SHALL compute row boundaries using that
   `countSize` directly in the phrase duration calculation.
3. WHERE the device is in portrait orientation and phrase mode is active, THE Row_Layout_Engine SHALL
   default `phrasesPerRow` to 1.
4. WHERE the device is in landscape orientation and phrase mode is active, THE Row_Layout_Engine SHALL
   default `phrasesPerRow` to 2.
5. THE Row_Layout_Engine SHALL clamp `phrasesPerRow` to a value greater than or equal to 1.
6. WHEN called twice with identical configuration, THE Row_Layout_Engine SHALL return identical row
   output, using no clock reading and no randomness.
7. THE Row_Layout_Engine SHALL round each row `startMs` and `endMs` to integer milliseconds and reuse
   each rounded `endMs` as the next row's `startMs`.

### Requirement 3: Seeking within a row

**User Story:** As a choreographer, I want to tap or drag inside a row to move the playback position,
so that I can navigate directly to a moment in the music.

#### Acceptance Criteria

1. WHEN a user taps inside a Wrapped_Row waveform area, THE Timeline_Mapper SHALL convert the pointer
   x offset to a timestamp and THE Wrapped_View SHALL seek playback to that timestamp.
2. WHILE a user drags horizontally inside a Wrapped_Row waveform area, THE Wrapped_View SHALL update
   the playback position continuously to the timestamp mapped from the pointer x offset.
3. THE Timeline_Mapper SHALL clamp the pointer x offset to the inclusive range `[0, rowPixelWidth]`
   before mapping to a timestamp.
4. THE Timeline_Mapper SHALL clamp the resulting timestamp to the inclusive range
   `[row.startMs, row.endMs]` so a seek never crosses into an adjacent row.
5. THE Timeline_Mapper SHALL return the seek timestamp as an integer millisecond value.

### Requirement 4: Playback progress clipping per row

**User Story:** As a dancer, I want each row to clearly show how much has played, so that I can track
my position across the whole song.

#### Acceptance Criteria

1. WHILE `currentTime` is less than or equal to a row's `startMs`, THE Timeline_Mapper SHALL report
   that row's progress as 0.
2. WHILE `currentTime` is greater than or equal to a row's `endMs`, THE Timeline_Mapper SHALL report
   that row's progress as 1.
3. WHILE `currentTime` is strictly inside a row, THE Timeline_Mapper SHALL report that row's progress
   as `(currentTime - startMs) / (endMs - startMs)`, a value strictly between 0 and 1.
4. THE Timeline_Mapper SHALL report row progress as a non-decreasing function of `currentTime`.

### Requirement 5: Marker placement and selection in the wrapped view

**User Story:** As a choreographer, I want to place and select markers directly in the wrapped view,
so that I can annotate beats without switching modes.

#### Acceptance Criteria

1. WHEN a user places a marker in the Wrapped_View, THE Wrapped_View SHALL add the marker to the active
   layer at the integer-millisecond timestamp mapped from the pointer position.
2. THE Wrapped_View SHALL render each marker at its mapped x position within the row that owns its
   timestamp, in that marker's layer colour.
3. WHEN a user selects a marker in the Wrapped_View, THE Wrapped_View SHALL mark that marker as the
   selected marker in the store.
4. WHEN a marker is added or selected in the Wrapped_View, THE Wrapped_View SHALL leave markers on
   other layers unchanged.

### Requirement 6: Annotation display without crowding

**User Story:** As a choreographer, I want annotated markers shown compactly, so that dense sections
on narrow rows stay readable.

#### Acceptance Criteria

1. WHERE a marker has an annotation, THE Wrapped_View SHALL render an indicator at the marker's x
   position in the marker's layer colour rather than inline annotation text.
2. WHERE multiple annotated markers cluster within a few pixels on a row, THE Wrapped_View SHALL render
   a count badge indicating the number of clustered annotated markers.
3. WHEN a user taps an annotation indicator, THE Wrapped_View SHALL open the annotation using the
   existing annotation UI.
4. THE Wrapped_View SHALL NOT render annotation text inline within a Wrapped_Row.

### Requirement 7: Active-row playhead behaviour

**User Story:** As a dancer, I want the playhead to appear only where playback currently is, so that I
am not confused by multiple position indicators.

#### Acceptance Criteria

1. THE Wrapped_View SHALL render the Playhead on exactly one row, the Active_Row, at any time during
   playback.
2. WHEN playback advances from one row's time range into the next, THE Wrapped_View SHALL move the
   Playhead to the newly Active_Row and remove it from the previously Active_Row.

### Requirement 8: Follow-playhead auto-scroll

**User Story:** As a choreographer, I want the view to follow the music during playback, so that the
current row stays visible without manual scrolling.

#### Acceptance Criteria

1. WHILE `followPlayhead` is enabled AND playback advances into a new Active_Row, THE Wrapped_View
   SHALL scroll that Active_Row into view.
2. WHERE a follow toggle is provided, WHEN a user toggles it, THE Wrapped_View SHALL set the persisted
   `followPlayhead` preference to the new value.
3. WHEN a user manually scrolls the Wrapped_View, THE Wrapped_View SHALL suspend follow auto-scroll
   using a transient flag that is not persisted.
4. WHEN a user re-enables the follow toggle after suspension, THE Wrapped_View SHALL resume follow
   auto-scroll.
5. WHILE follow is suspended AND the Active_Row scrolls back into the visible window during playback,
   THE Wrapped_View SHALL re-arm follow auto-scroll.

### Requirement 9: Phrase alignment in the gutter

**User Story:** As a dancer, I want the gutter counts to match the music, so that I can trust the
phrase and count labels for rehearsal.

#### Acceptance Criteria

1. WHERE rows are phrase-aware, THE Gutter SHALL compute `phraseNumber` for a row as
   `floor(startMs / phraseDurationMs) + 1`, where `phraseDurationMs = (60000 / bpm) * countSize`.
2. WHERE rows are phrase-aware, THE Gutter SHALL compute the row count label as the number of the first
   count of that row, equal to `(phraseNumber - 1) * countSize + 1`.
3. WHEN `countSize` changes between 4, 6, and 8, THE Gutter SHALL recompute phrase numbers and count
   labels using the new `countSize`.

### Requirement 10: Fixed-duration fallback when BPM is unusable

**User Story:** As a choreographer, I want the wrapped view to still work without a valid tempo, so
that I can annotate songs whose BPM is unknown.

#### Acceptance Criteria

1. IF BPM is not finite, is less than or equal to zero, or is NaN, THEN THE Row_Layout_Engine SHALL
   compute fixed-duration rows instead of phrase-aware rows.
2. WHERE phrase mode is disabled by the user, THE Row_Layout_Engine SHALL compute fixed-duration rows.
3. WHERE fixed-duration rows are computed in portrait orientation, THE Row_Layout_Engine SHALL default
   the row duration to 5000 milliseconds.
4. WHERE fixed-duration rows are computed in landscape orientation, THE Row_Layout_Engine SHALL default
   the row duration to 10000 milliseconds.
5. THE Row_Layout_Engine SHALL clamp the fixed row duration to a value greater than or equal to 2000
   milliseconds.
6. WHILE rows are fixed-duration, THE Gutter SHALL omit the phrase number and count label.

### Requirement 11: Marker preservation under reflow

**User Story:** As a choreographer, I want my markers to stay exactly where I placed them when the
layout changes, so that reflow never corrupts my work.

#### Acceptance Criteria

1. WHEN orientation, available width, detail zoom, BPM, `countSize`, or `rowDensity` changes, THE
   Wrapped_View SHALL recompute Wrapped_Row geometry.
2. WHEN Wrapped_Row geometry is recomputed, THE Wrapped_View SHALL leave every layer's marker and
   annotation data unchanged.
3. THE Wrapped_View SHALL store markers only as absolute integer-millisecond timestamps and project
   them per row at render time rather than storing per-row copies.

### Requirement 12: A/B loop spanning multiple rows

**User Story:** As a dancer, I want a rehearsal loop that spans several rows highlighted correctly, so
that I can see exactly which section repeats.

#### Acceptance Criteria

1. WHILE an AB_Loop is active, THE Timeline_Mapper SHALL compute, for each row the loop overlaps, a
   per-row segment clipped to `[max(loopStartMs, row.startMs), min(loopEndMs, row.endMs)]` where that
   range is non-empty.
2. WHILE an AB_Loop is active, THE Wrapped_View SHALL highlight each computed per-row loop segment on
   its row.
3. THE Timeline_Mapper SHALL produce loop segments that reassemble to exactly `[loopStartMs,
   loopEndMs]` with no gaps and no overlaps.
4. WHERE a loop point falls exactly on a row boundary, THE Timeline_Mapper SHALL assign it to the later
   row via the `from < to` test combined with the half-open interval.
5. IF `loopStartMs` is greater than `loopEndMs`, THEN THE Timeline_Mapper SHALL treat the loop as
   inactive.

### Requirement 13: Precision detail mode

**User Story:** As a choreographer, I want a precise editing view, so that I can scrub and adjust
markers accurately while keeping my place in the wrapped view.

#### Acceptance Criteria

1. WHERE the screen is wide or in landscape orientation, WHEN a user enters Detail_Mode, THE
   Wrapped_View SHALL present Detail_Mode as a fixed panel beside or below the wrapped rows.
2. WHERE the device is a phone in portrait orientation, WHEN a user enters Detail_Mode, THE
   Wrapped_View SHALL present Detail_Mode as a full mode switch replacing the wrapped rows.
3. WHEN a user enters Detail_Mode for a selected row, THE Detail_Mode SHALL set the viewport to that
   row's `[startMs, endMs)` range.
4. WHILE in Detail_Mode, THE Detail_Mode SHALL support accurate scrubbing and marker adjustment
   equivalent to the existing continuous waveform.
5. WHEN switching between the Wrapped_View and Detail_Mode, THE system SHALL leave `isPlaying`, the
   playback position, marker data, annotations, `loopStartMs`, `loopEndMs`, `isRepeatActive`,
   `isLoopMarkerActive`, and `activeLayerId` unchanged.
6. WHEN a user returns from Detail_Mode, THE Wrapped_View SHALL restore the Wrapped_Row identified by
   `selectedRowIndex` and its scroll position.

### Requirement 14: Accessibility and test identifiers

**User Story:** As a user relying on assistive technology, I want labelled and navigable controls, so
that I can operate the wrapped view, and as a tester I want stable identifiers for automation.

#### Acceptance Criteria

1. WHERE a Wrapped_Row is rendered, THE Wrapped_View SHALL assign it an adjustable accessibility role
   and an accessibility label describing its index, time range, and phrase when phrase-aware.
2. WHILE a Wrapped_Row is the Active_Row, THE Wrapped_View SHALL expose an accessibility value
   reflecting the current playback position.
3. WHERE a marker indicator is rendered, THE Wrapped_View SHALL assign an accessibility label
   describing its layer, time, and annotated state.
4. THE Wrapped_View SHALL expose the stable test identifiers `wrapped-waveform`,
   `wrapped-row-{index}`, `wrapped-row-gutter-{index}`,
   `wrapped-row-marker-{layerId}-{timestamp}`, `wrapped-follow-toggle`, `waveform-detail-panel`,
   `waveform-detail-close`, and `row-density-preset-{name}`.

### Requirement 15: Error and fallback states

**User Story:** As a choreographer, I want the wrapped view to behave predictably in edge cases, so
that unusual songs do not break the layout.

#### Acceptance Criteria

1. WHEN `songDuration` is 0, THE Row_Layout_Engine SHALL return zero rows AND THE Wrapped_View SHALL
   show an empty placeholder state.
2. WHILE the song duration is unknown, THE Wrapped_View SHALL show a loading or placeholder state and
   SHALL NOT render synthetic rows.
3. WHEN `songDuration` is greater than 0 but less than one row duration, THE Row_Layout_Engine SHALL
   return exactly one row spanning `[0, songDuration]`.
4. WHILE a long song produces hundreds of rows, THE Wrapped_View SHALL keep the number of mounted
   Wrapped_Row components bounded and independent of the total row count.
5. IF BPM is invalid, zero, or NaN, THEN THE Row_Layout_Engine SHALL use the fixed-duration fallback
   path.
6. WHEN a marker's timestamp equals a row boundary, THE Timeline_Mapper SHALL assign the marker to the
   later row.
7. WHEN a loop point equals a row boundary, THE Timeline_Mapper SHALL assign it to the later row.

### Requirement 16: Performance

**User Story:** As a dancer, I want the wrapped view to stay responsive, so that scrolling and
following during playback feel smooth.

#### Acceptance Criteria

1. WHEN `computeRows` runs for a 10-minute song on a mid-range device, THE Row_Layout_Engine SHALL
   complete in less than 2 milliseconds.
2. THE Wrapped_View SHALL bound the number of mounted Wrapped_Row components at `visibleRows + 2 ×
   OVERSCAN`, with OVERSCAN equal to 3, independent of song length.
3. WHILE a user scrolls the Wrapped_View or follow auto-scroll is active, THE Wrapped_View SHALL target
   60 frames per second.
4. THE Timeline_Mapper SHALL resolve `timestampToRow` in O(log rows) time.
5. WHEN orientation or row density changes, THE Wrapped_View SHALL recompute and repaint the mounted
   window within approximately one 16-millisecond frame budget without re-mounting the full list.

### Requirement 17: Waveform availability

**User Story:** As a choreographer, I want the row waveform to render regardless of platform
capability, so that I can use the wrapped view before native waveform extraction exists.

#### Acceptance Criteria

1. WHERE detailed cached peaks are available for a row range, THE Wrapped_View SHALL render the row
   waveform segment from a high-resolution slice of those peaks.
2. WHERE only low-resolution peaks are available, THE Wrapped_View SHALL render the row waveform
   segment from a coarse slice of those peaks.
3. IF no real peak data is available on a platform, THEN THE Wrapped_View SHALL render a Timing_Bar for
   the row and SHALL NOT render a synthetic sine-wave waveform.
4. THE Row_Layout_Engine SHALL compute row geometry from timestamps, BPM, `countSize`, and density
   only, independent of which waveform source is used.
5. WHERE the Lite tier is in effect, THE Wrapped_View SHALL retain a usable wrapped timeline with at
   least a basic waveform.

### Requirement 18: State and persistence

**User Story:** As a choreographer, I want my view preferences remembered and my timestamps precise,
so that reopening a project restores my setup without data drift.

#### Acceptance Criteria

1. THE Wrapped_View SHALL store all global state in the single existing Zustand store and SHALL NOT
   introduce an additional store.
2. THE Wrapped_View SHALL treat integer-millisecond timestamps as the single source of truth for
   markers and loop points.
3. WHEN a project is saved, THE system SHALL persist only the preferences `primaryView`, `countSize`,
   `rowDensity`, and `followPlayhead`.
4. WHEN a project is saved, THE system SHALL NOT persist `loopStartMs`, `loopEndMs`,
   `selectedRowIndex`, the manual-scroll-suspension flag, or any derived row geometry.
5. WHEN a project is loaded without the new preference fields, THE system SHALL default `primaryView`
   to `wrapped`, `countSize` to 8, `rowDensity` to the orientation default, and `followPlayhead` to
   true.

### Requirement 19: Boundary ownership invariant

**User Story:** As a developer, I want a single deterministic rule for which row owns a timestamp, so
that markers and loop points always render in exactly one row.

#### Acceptance Criteria

1. THE Row_Layout_Engine SHALL define each row as the half-open interval `[startMs, endMs)`.
2. THE Row_Layout_Engine SHALL define the final row as inclusive of `songDuration`, giving it the
   interval `[startMs, songDuration]`.
3. WHEN a timestamp `t` satisfies `0 <= t <= songDuration`, THE Timeline_Mapper SHALL return exactly
   one owning row index, assigning a boundary value to the later row it starts and assigning
   `songDuration` to the final row.
4. THE Row_Layout_Engine SHALL produce contiguous rows where `rows[i].endMs` equals
   `rows[i+1].startMs`, `rows[0].startMs` equals 0, and `rows[last].endMs` equals `songDuration`.

### Requirement 20: Preserve existing unified and multitrack behaviour

**User Story:** As a user, I want the existing waveform and stem behaviours to keep working, so that
the wrapped view adds capability without regressions.

#### Acceptance Criteria

1. THE system SHALL continue to choose between the unified waveform area and the multitrack
   `StemsView` in `MainContent` as it does today.
2. THE system SHALL continue to honour the `STEM_SEPARATION_UI_ENABLED` flag when deciding whether to
   show stem UI.
3. WHERE the unified waveform path is active, THE system SHALL render the wrapped workspace in the slot
   currently occupied by the continuous waveform without altering multitrack or overview-scrollbar
   wiring.

## Non-Goals / Out of Scope

The following are explicitly excluded from this feature:

- Demucs or any stem-separation implementation.
- Monetisation, purchase, subscription, or entitlement integration.
- Native (mobile) waveform extraction.
- Audio-engine replacement or changes to playback timing behaviour.
- Spectrogram display.
- Collaborative editing or cloud sync.
- Automatic BPM detection.
- Redesign of unrelated transport or project-management controls.
