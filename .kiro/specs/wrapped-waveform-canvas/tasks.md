# Implementation Plan: Wrapped Waveform Canvas

## Overview

This plan derives a phased, dependency-ordered implementation from
`design.md` and `requirements.md`. It builds pure logic first (row layout and
timestamp mapping with full unit and property coverage), then the single Zustand
store additions, then the thin hook, then wrapped rendering, gestures, and seeking
to reach a Minimum Viable wrapped timeline. Later phases add follow-playhead,
detail mode, A/B loop highlighting, annotations, density presets, responsive
styling, accessibility, persistence, and automated iOS acceptance.

All code is TypeScript / React Native, matching the existing codebase and
`.kiro/steering/coding-standards.md`. All timestamps are integer milliseconds
(ADR-009); all global state stays in the single store (ADR-001). No
stem-separation or monetisation work is included (see Non-Goals in the spec).

Verification checkpoints appear at the end of each phase using the project build
gate: TypeScript (`npx tsc --noEmit`), unit tests
(`npx jest --testPathPatterns=unit`), Playwright E2E (`npm test`), and iOS XCTest
(`npm run test:ios:ui`).

## Tasks

### Phase 1 — Pure core utilities + tests

- [x] 1. Implement the pure row-layout engine
  - [x] 1.1 Create `src/utils/rowLayout.ts` with types and `computeRows`
    - Define `WrappedRow`, `RowDensityMode`, `RowDensity`, and `RowLayoutConfig`
      types as specified in the design Data Models section.
    - Implement `computeRows(config)` per the design algorithm: zero/unknown
      duration yields `[]`; phrase-aware vs fixed-duration selection via
      `bpmUsable`; contiguous non-overlapping rows; final row inclusive of
      `songDuration`; integer-ms rounding reusing each `endMs` as the next
      `startMs`; phrase number and count label when phrase-aware.
    - Implement `phraseRowDurationMs(bpm, countSize, phrasesPerRow)` as
      `(60000 / bpm) * countSize * phrasesPerRow`.
    - Clamp `phrasesPerRow` to `>= 1` and fixed `rowDurationMs` to `>= 2000`.
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 9.1, 9.2, 10.1, 10.2, 10.5, 15.1, 15.3, 17.4, 19.1, 19.2, 19.4_

  - [x]* 1.2 Write unit tests for `rowLayout.ts`
    - Cover partition/contiguity/final-row-inclusive; phrase vs fallback paths;
      `countSize` 4/6/8; zero, unknown, very-short, and long durations; invalid
      BPM; `phraseRowDurationMs` numeric values; `phrasesPerRow` and
      `rowDurationMs` clamping.
    - Place at `tests/unit/rowLayout.test.ts`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 10.3, 10.4, 10.5, 15.1, 15.3_

  - [x]* 1.3 Write property tests for `rowLayout.ts` (fast-check)
    - **Property 1: Partition** — contiguous, non-overlapping, covering
      `[0, songDuration]`.
    - **Property 8: Determinism** — identical config yields identical output.
    - **Validates: Requirements 2.6, 2.7, 19.4**

- [x] 2. Implement the pure timeline mapper
  - [x] 2.1 Create `src/utils/timelineMapping.ts` with mapping functions
    - Define `RowRenderContext` type.
    - Implement `timestampToRow(rows, t)` as an O(log rows) binary search under
      the half-open invariant, with `songDuration` owned by the final row and
      `-1` for out-of-range.
    - Implement `pointerToTimestamp(ctx, xPx)`: clamp x to `[0, rowPixelWidth]`,
      map to ms within the row span, clamp to `[row.startMs, row.endMs]`, return
      integer ms.
    - Implement `clipRowProgress(row, currentTime)`: 0 at/below `startMs`, 1
      at/above `endMs`, linear fraction strictly inside.
    - Implement `loopSegmentsForRows(rows, loopStartMs, loopEndMs)`: per-row
      clipped segments via the `from < to` test.
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 12.1, 12.3, 12.4, 12.5, 15.6, 15.7, 16.4, 19.1, 19.3_

  - [x]* 2.2 Write unit tests for `timelineMapping.ts`
    - Cover `timestampToRow` boundary ownership and out-of-range; `pointerToTimestamp`
      clamping and round-trip; `clipRowProgress` 0/1/partial and monotonicity;
      `loopSegmentsForRows` coverage, boundary ownership, and inactive loop when
      `loopStartMs > loopEndMs`.
    - Place at `tests/unit/timelineMapping.test.ts`.
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 12.1, 12.4, 12.5, 15.6, 15.7_

  - [x]* 2.3 Write property tests for `timelineMapping.ts` (fast-check)
    - **Property 2: Single ownership** — exactly one owning row per timestamp.
    - **Property 3: Round-trip within a row** — `pointerToTimestamp(msToX(t)) ≈ t`.
    - **Property 4: Progress monotonic + clipped** — non-decreasing, clipped to 0/1.
    - **Property 5: Loop coverage** — segments reassemble to `[loopStartMs, loopEndMs]`.
    - **Validates: Requirements 15.6, 15.7, 19.3, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 12.1, 12.3, 12.4**

- [x] 3. Checkpoint — pure core
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2 — Store fields and actions

- [x] 4. Add wrapped-view state to the single store
  - [x] 4.1 Extend `src/hooks/useStudioStore.ts` with new fields and setters
    - Add `primaryView` (default `'wrapped'`), `countSize` (default `8`),
      `rowDensity` (orientation default), `followPlayhead` (default `true`),
      `loopStartMs`/`loopEndMs` (default `null`), `selectedRowIndex` (default
      `null`), and their setters `setPrimaryView`, `setCountSize`,
      `setRowDensity`, `setFollowPlayhead`, `setLoopRange`,
      `setSelectedRowIndex`.
    - Reuse the existing `countSize` field if the 8-count feature already added
      it; otherwise introduce it with matching name and default. Do not add a
      second store.
    - Use the `set((state) => ...)` form where new state derives from existing
      state. Leave existing viewport clamping untouched.
    - _Requirements: 2.2, 8.2, 12.5, 18.1, 18.2, 18.5_

  - [x]* 4.2 Write store-action unit tests (fresh store per test)
    - Test each new setter; test switch-neutrality (**Property 7**): toggling
      `primaryView` and setting `selectedRowIndex` leaves `isPlaying`, playback
      position, markers, annotations, loop bounds, repeat/loop flags, and
      `activeLayerId` unchanged.
    - Place at `tests/unit/studioStore.wrapped.test.ts`.
    - **Validates: Requirements 13.5, 18.1**

- [x] 5. Checkpoint — store
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3 — useWrappedRows hook

- [x] 6. Implement the thin `useWrappedRows` hook
  - [x] 6.1 Create `src/hooks/useWrappedRows.ts`
    - Read `songDuration`, `bpm`, `countSize`, `rowDensity`, `currentTime` via
      granular selectors; resolve `bpmUsable`; call `computeRows`; memoize on a
      stable `recomputeKey`; derive `activeRowIndex` via `timestampToRow`;
      compute the virtualization window (`firstIndex`/`lastIndex`) from scroll
      offset and container height assuming fixed row height. Accept those metrics
      through an optional third argument so the documented two-argument call remains valid
      before the wrapped list has measured its viewport.
    - Return `UseWrappedRowsResult` as specified. Contain no layout arithmetic in
      the hook — all math stays in the pure utilities.
    - _Requirements: 11.1, 15.4, 16.2, 16.4, 16.5_

- [x] 7. Checkpoint — hook
  - Run `npx tsc --noEmit`.
  - Ensure types are clean, ask the user if questions arise.

### Phase 4 — Wrapped rendering MVP

- [x] 8. Build the row gutter and style scaffolding
  - [x] 8.1 Create `src/components/ui/waveform/RowGutter.tsx` and mirrored styles
    - Render `mm:ss` row start time and, when phrase-aware, the phrase number and
      count label; fixed width so all rows align.
    - Add `src/styles/components/waveform/rowGutter.ts` using shared colour tokens
      from `src/styles/common.ts`.
    - _Requirements: 1.2, 1.3, 9.1, 9.2, 10.6_

- [x] 9. Build the wrapped row renderer
  - [x] 9.1 Create `src/components/ui/waveform/WrappedRow.tsx` and mirrored styles
    - Render gutter + waveform segment with active/muted split driven by
      `clipRowProgress`; render markers at their mapped x positions in layer
      colour; render the playhead only when `isActiveRow`.
    - Render the row waveform using `generateWaveformPath` for a per-row slice
      when peaks exist, otherwise render a solid timing bar (no synthetic sine
      wave).
    - Add `src/styles/components/waveform/wrappedRow.ts` using shared tokens.
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 4.1, 4.2, 4.3, 5.2, 7.1, 7.2, 17.1, 17.2, 17.3, 17.5_

- [x] 10. Build the virtualized wrapped list
  - [x] 10.1 Create `src/components/ui/waveform/WrappedWaveform.tsx` and styles
    - Use `useWrappedRows`; render only rows in the window with OVERSCAN = 3 via
      the design-approved fixed-height spacer window (or a windowed list with
      `getItemLayout`); keep mounted rows bounded and independent of song length;
      show an empty/loading placeholder when there are zero rows or an unknown duration.
    - Add `src/styles/components/waveform/wrappedWaveform.ts`.
    - _Requirements: 1.1, 15.1, 15.2, 15.4, 16.2_

  - [x] 10.2 Wire `WrappedWaveform` into the unified waveform slot
    - Render it in `src/components/layout/MainContent.tsx` where the continuous
      waveform sits for the unified path; preserve `StemsView` selection and the
      `STEM_SEPARATION_UI_ENABLED` gating and the overview `TimelineScrollbar`
      wiring unchanged.
    - _Requirements: 20.1, 20.2, 20.3_

- [x] 11. Checkpoint — wrapped rendering
  - Run `npx tsc --noEmit` and `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5 — Gestures, seeking, and marker placement

- [x] 12. Add seek and marker gestures to wrapped rows
  - [x] 12.1 Implement tap/drag seeking in `WrappedRow.tsx`
    - Use `Gesture.Pan().runOnJS(true).activeOffsetX([-6, 6]).failOffsetY([-12, 12])`
      and `Gesture.Tap().runOnJS(true).maxDuration(250)`; map pointer x via
      `pointerToTimestamp`; call `onScrubStart`/`onSeek`/`onScrubEnd`; preserve
      vertical page scroll by yielding to vertical intent.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 12.2 Implement marker placement and selection in the wrapped view
    - Add a marker to the active layer at the mapped integer-ms timestamp; select
      an existing marker into the store; leave other layers' markers unchanged.
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 13. Checkpoint — gestures and seeking
  - Run `npx tsc --noEmit` and `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

> **MVP complete** — a readable wrapped timeline: stacked rows with gutters,
> per-row progress split, markers, tap/drag seeking, basic waveform or timing-bar
> fallback, and preserved vertical page scrolling. The phases below are
> refinements.

### Phase 6 — Follow-playhead auto-scroll

- [x] 14. Implement follow-playhead behaviour
  - [x] 14.1 Add auto-scroll, toggle, suspension, and re-arm to `WrappedWaveform.tsx`
    - When `followPlayhead` is enabled and playback enters a new active row,
      scroll that row into view; add a `wrapped-follow-toggle` that writes
      `followPlayhead`; a manual scroll suspends follow via a transient
      (non-persisted) flag; the toggle resumes follow; follow re-arms when the
      active row scrolls back into the visible window during playback.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 15. Checkpoint — follow-playhead
  - Run `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7 — Precision detail mode

- [x] 16. Build the detail panel and workspace owner
  - [x] 16.1 Create `src/components/ui/waveform/WaveformDetailPanel.tsx`
    - Wrap the repurposed `WaveformCanvas`; set the viewport to the selected
      row's `[startMs, endMs)` on open; support accurate scrubbing and marker
      adjustment equivalent to the continuous waveform; expose a
      `waveform-detail-close` control.
    - _Requirements: 13.3, 13.4_

  - [x] 16.2 Create `src/components/ui/waveform/WaveformWorkspace.tsx` switcher
    - Own the wrapped↔detail decision; responsive presentation (fixed panel on
      wide/landscape, full mode switch on phone portrait); on switch, mutate only
      `primaryView`, `selectedRowIndex`, and (on open) the viewport range; on
      return, restore the row via `selectedRowIndex` and its scroll position.
    - Render `WaveformWorkspace` in the unified slot in `MainContent.tsx` in place
      of the direct `WrappedWaveform` mount.
    - _Requirements: 13.1, 13.2, 13.5, 13.6_

- [x] 17. Checkpoint — detail mode
  - Run `npx tsc --noEmit` and `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8 — A/B loop multi-row highlight

- [x] 18. Wire multi-row A/B loop highlighting
  - [x] 18.1 Render loop segments in `WrappedRow.tsx` / `WrappedWaveform.tsx`
    - Compute per-row segments with `loopSegmentsForRows` from `loopStartMs`/
      `loopEndMs`; highlight each segment on its row; treat `loopStartMs >
      loopEndMs` as inactive; assign boundary loop points to the later row.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 15.7_

  - [x]* 18.2 Add unit tests for the loop-wiring selector/helper
    - If a non-pure helper selects active loop bounds from the store, test it;
      otherwise rely on the Phase 1 `loopSegmentsForRows` property tests.
    - _Requirements: 12.1, 12.5_

- [x] 19. Checkpoint — A/B loop
  - Run `npx jest --testPathPatterns=unit` and `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9 — Annotation display

- [x] 20. Implement compact annotation display
  - [x] 20.1 Render annotation indicators and clusters in `WrappedRow.tsx`
    - Render a dot/triangle indicator in the marker's layer colour for annotated
      markers; render a count badge when annotated markers cluster within a few
      pixels; open the annotation on tap using the existing annotation UI; never
      render annotation text inline.
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 21. Checkpoint — annotations
  - Run `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10 — Row density presets

- [x] 22. Add row density controls
  - [x] 22.1 Add density preset UI driving `rowDensity`
    - Provide explicit presets (`row-density-preset-{name}`) mapping to
      `phrasesPerRow` 1/2/3 in phrase mode or duration presets in fallback mode;
      changing density reflows rows but never changes marker timestamps.
    - Optionally add debounced, preset-snapping pinch on landscape (never
      continuous).
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 23. Checkpoint — density presets
  - Run `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11 — Responsive styling and reflow

- [ ] 24. Finalize responsive layout and reflow
  - [ ] 24.1 Apply portrait/landscape layout, safe areas, and keyboard handling
    - Portrait stacks the scroll area above the overview scrollbar and control
      dock; landscape/wide docks the detail panel beside the rows; respect
      safe-area insets and `keyboardShouldPersistTaps="handled"`; orientation
      changes trigger a row recompute (new `phrasesPerRow`/`rowDurationMs`
      default) while preserving marker timestamps.
    - _Requirements: 11.1, 11.2, 16.5_

- [ ] 25. Checkpoint — responsive styling
  - Run `npx tsc --noEmit` and `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 12 — Accessibility and test identifiers

- [ ] 26. Add accessibility metadata and stable test IDs
  - [ ] 26.1 Apply roles, labels, values, and test IDs across wrapped components
    - Row container: `accessibilityRole="adjustable"` with a label describing
      index, time range, and phrase; active row exposes an accessibility value
      reflecting playback position; marker indicators labelled with layer, time,
      and annotated state.
    - Expose `wrapped-waveform`, `wrapped-row-{index}`,
      `wrapped-row-gutter-{index}`, `wrapped-row-marker-{layerId}-{timestamp}`,
      `wrapped-follow-toggle`, `waveform-detail-panel`, `waveform-detail-close`,
      and `row-density-preset-{name}`.
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 27. Checkpoint — accessibility
  - Run `npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 13 — Persistence

- [x] 28. Persist wrapped-view preferences
  - [x] 28.1 Persist preferences in `projectManager.ts` with backwards-compatible defaults
    - Persist only `primaryView`, `countSize`, `rowDensity`, `followPlayhead`
      under project settings; never persist `loopStartMs`, `loopEndMs`,
      `selectedRowIndex`, the manual-scroll-suspension flag, or derived geometry;
      loading a project without these fields defaults them (`'wrapped'`, `8`,
      orientation default, `true`).
    - _Requirements: 18.3, 18.4, 18.5_

  - [x]* 28.2 Write a save/load round-trip unit test
    - Verify persisted fields round-trip and missing fields default correctly.
    - Place at `tests/unit/projectManager.wrapped.test.ts`.
    - _Requirements: 18.3, 18.4, 18.5_

- [x] 29. Checkpoint — persistence
  - Run `npx jest --testPathPatterns=unit` and `npx tsc --noEmit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 14 — iOS XCTest acceptance

- [ ] 30. Add iOS acceptance coverage
  - [ ] 30.1 Extend `tests/ios/BeatNoteUITests.swift` with wrapped-view cases
    - Cover portrait full-mode-switch detail flow; landscape fixed-panel detail
      flow; horizontal seek within a row while preserving vertical page scroll
      (no runtime error screen); orientation change reflows rows and preserves
      markers; follow-playhead auto-scroll during background→foreground continuity
      reusing the existing audio fixture.
    - _Requirements: 3.1, 3.2, 8.1, 11.1, 11.2, 13.1, 13.2_

- [ ] 31. Checkpoint — iOS acceptance
  - Run `npm run test:ios:ui`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 15 — Cleanup and final regression

- [ ] 32. Retire superseded rendering and run the full gate
  - [ ] 32.1 Verify and retire `SimpleWaveform.tsx`
    - Confirm there are no remaining references to `SimpleWaveform`; remove it (or
      document why it must stay) once the per-row timing-bar/peaks rendering
      supersedes it.
    - _Requirements: 17.3_

- [ ] 33. Final checkpoint — full regression
  - Run `npx tsc --noEmit`, `npx jest --testPathPatterns=unit`, `npm test`, and
    `npm run test:ios:ui`.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster
  MVP; core implementation tasks are never optional.
- Each task references specific acceptance criteria from `requirements.md` for
  traceability.
- Property tests validate the universal Correctness Properties 1–5 and 8 from the
  design; unit tests validate specific examples and edge cases.
- Phases 1–5 deliver the MVP; Phases 6–15 are refinements.
- No stem-separation or monetisation tasks are included, per the spec Non-Goals.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "2.3", "4.1"] },
    { "id": 2, "tasks": ["4.2", "6.1", "8.1"] },
    { "id": 3, "tasks": ["9.1"] },
    { "id": 4, "tasks": ["10.1"] },
    { "id": 5, "tasks": ["10.2"] },
    { "id": 6, "tasks": ["12.1", "12.2"] },
    { "id": 7, "tasks": ["14.1"] },
    { "id": 8, "tasks": ["16.1"] },
    { "id": 9, "tasks": ["16.2"] },
    { "id": 10, "tasks": ["18.1"] },
    { "id": 11, "tasks": ["18.2", "20.1"] },
    { "id": 12, "tasks": ["22.1"] },
    { "id": 13, "tasks": ["24.1"] },
    { "id": 14, "tasks": ["26.1"] },
    { "id": 15, "tasks": ["28.1"] },
    { "id": 16, "tasks": ["28.2"] },
    { "id": 17, "tasks": ["30.1"] },
    { "id": 18, "tasks": ["32.1"] }
  ]
}
```
