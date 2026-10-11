# Implementation Plan: Loop Range Overview

## Overview

This plan derives a phased, dependency-ordered implementation from
[`design.md`](./design.md) and [`requirements.md`](./requirements.md). It builds pure logic first
(loop math and version comparison with full unit and property coverage), then the single Zustand
store slice, then persistence and migration, then the rewritten playback loop, then retires the
marker-segment loop and relocates viewport-follow, and only then integrates the Loop Overview UI,
gestures, wrapped-row projection, accessibility, and the detail-view highlight. Pure logic and
state are separated from UI integration and gesture work throughout, and a Minimum Viable loop
(create/move/resize/clear/restore, toggle, playback wrap, persistence) lands before the refinements.

All code is TypeScript / React Native, matching the existing codebase and
`.kiro/steering/coding-standards.md`. All timestamps are integer milliseconds (ADR-009); all global
state stays in the single store (ADR-001). No stem-separation or monetisation work is included (see
Non-Goals in the spec).

### Delegation tags

Each leaf task is tagged for routing. **(DSH-Qwen)** marks work that is safe to delegate: pure
utilities, store actions, persistence/migration, unit and property tests, and isolated non-gesture
rendering. **(direct)** marks work kept under direct implementation and review: gesture integration
(`useLoopRangeGesture`, the overview Pan, handle hit areas), audio boundary behaviour (the
`useAudioPlayer` loop-poll rewrite), and final UI/accessibility review.

### Verification checkpoints

Each phase ends with an explicit checkpoint using the project build gate:

- TypeScript: `npx tsc --noEmit`
- Unit: `npx jest --testPathPatterns=unit`
- Playwright E2E: `npm test` (use `PLAYWRIGHT_PORT=8082 npm test` when a simulator Metro server is
  already serving on port 8081)
- iOS XCTest: `npm run test:ios:ui` (focused with `IOS_TEST_ONLY=<test-name> npm run test:ios:ui`)
- A physical-device acceptance gate is the final task before the feature is called done.

### Dependence on unresolved product decisions

The MVP does not block on the unresolved decisions D-1..D-9, but a few task shapes follow their
documented defaults and must be revisited if a default changes:

- D-1 (`MIN_LOOP_DURATION_MS` = 500ms) shapes Phase 1 validation thresholds (Tasks 1.1, 1.2).
- D-2 (`loopEnabled` persists) shapes Phase 3 persistence and Property 7 (Tasks 3.1, 3.4).
- D-5 / D-8 (Clear_Control becomes "Restore" for 5000ms, focus moves to Restore) shape the restore
  affordance and focus flow (Tasks 7.4, 10.5).
- D-7 (no jump when starting at/after `loopEndMs`) shapes the armed rule in `decideLoopWrap`
  (Tasks 1.1, 4.1).

## Tasks

### Phase 1 — Pure loop math and version comparison + tests

- [x] 1. Implement the pure loop-math module and numeric version comparison
  - [x] 1.1 Create `src/utils/loopRange.ts` with constants, types, and pure functions (DSH-Qwen)
    - Export constants `MIN_LOOP_DURATION_MS = 500`, `LOOP_BOUNDARY_TOLERANCE_MS = 30`,
      `RESTORE_WINDOW_MS = 5000`, `FALLBACK_KEY_STEP_MS = 250`, `LARGE_STEP_MULTIPLIER = 10`, and
      the `LoopRange`, `LoopWrapInput`, and `LoopWrapDecision` types.
    - Implement `isValidLoopRange`, `normalizeLoopRange`, `reclampLoopRangeToDuration`,
      `moveLoopRange`, `resizeLoopBound`, `beatStepMs`, `msToOverviewX`, `overviewXToMs`,
      `resolveHandleHit`, `resolveGestureMode`, `outsideLoopSegmentsForRow`, `decideLoopWrap`,
      `formatLoopTime`, and `loopSummaryLabel` with the signatures and behaviour in the design
      "Pure utilities" section.
    - No React / React Native imports, no I/O, no store access; equal inputs give equal outputs.
    - Round every bound to the nearest integer ms before clamping (INV-2); enforce the half-open
      and armed-wrap rules exactly (D-7: start at/after `loopEndMs` is not armed).
    - Files: `src/utils/loopRange.ts`.
    - _Requirements: 5.3, 6.1, 6.2, 6.3, 6.4, 6.6, 7.4, 7.5, 7.8, 7.9, 10.1, 10.2, 10.3, 10.4, 10.5, 10.9, 13.2, 13.3, 17.1, 17.2, 19.2, 19.6, 19.7, 19.8, 19.9_

  - [x] 1.2 Add numeric `compareProjectVersion` (DSH-Qwen)
    - Add `compareProjectVersion(a, b): -1 | 0 | 1` to `src/utils/projectManager.ts`, comparing
      `major.minor.patch` numerically so `'1.10.0'` is newer than `'1.2.0'`.
    - Files: `src/utils/projectManager.ts`.
    - _Requirements: 14.6_

  - [x]* 1.3 Write unit tests for `loopRange.ts` and `compareProjectVersion` (DSH-Qwen)
    - Cover `normalizeLoopRange` ordering/clamping/null; `reclampLoopRangeToDuration` including the
      R13.2 example (`180000` → `179987` at duration `179987`); `moveLoopRange` edge clamps and
      zero-delta identity; `resizeLoopBound` min-gap clamps for each handle; `beatStepMs` fallback;
      `msToOverviewX`/`overviewXToMs` degenerate inputs returning 0; `resolveHandleHit` /
      `resolveGestureMode` overlap and tie-break; `outsideLoopSegmentsForRow`; `formatLoopTime`
      (`61250` → `1:01.2`); `loopSummaryLabel`; and the enumerated `decideLoopWrap` cases from
      R10.9 (in-range before threshold → no wrap; at `loopEndMs − tolerance`, at `loopEndMs`, and
      beyond including `songDuration` → wrap when armed; prev ≥ `loopEndMs` → no wrap; prev <
      `loopStartMs` → no wrap; disabled → no wrap; paused → no wrap; null range → no wrap).
    - Place at `tests/unit/loopRange.test.ts`.
    - _Requirements: 5.3, 6.1, 6.3, 7.4, 7.5, 10.9, 13.2, 13.3, 17.1, 17.2_

  - [x]* 1.4 Write property tests for `loopRange.ts` and version comparison (fast-check) (DSH-Qwen)
    - **Property 1: Normalisation is idempotent and well-shaped**
    - **Validates: Requirements 5.3, 19.6, INV-1, INV-2**
    - **Property 2: Move preserves duration**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6, 19.7, INV-4**
    - **Property 3: Resize keeps the minimum duration and the other bound**
    - **Validates: Requirements 7.4, 7.5, 7.8, 7.9, 19.8**
    - **Property 4: Pixel/millisecond mapping is monotonic, integral, and round-trip bounded**
    - **Validates: Requirements 5.3, 19.9**
    - **Property 5: Loop wrap fires exactly when armed and targets the loop start**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.9**
    - **Property 6: Duration re-clamp yields a Valid range or clears it**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.9, INV-3**
    - **Property 9: Project version comparison is numeric and a consistent total order**
    - **Validates: Requirements 14.6**
    - Place in `tests/unit/loopRange.test.ts` (≥ 100 iterations each).

- [x] 2. Checkpoint — pure loop math
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2 — Store loop slice

- [x] 3. Add the loop slice to the single store
  - [x] 3.1 Extend `src/hooks/useStudioStore.ts` with loop state and validating actions (DSH-Qwen)
    - Add `isLoopRangeEnabled` (default `false`) and `loopRestoreSnapshot` (default `null`,
      not persisted); keep `loopStartMs`/`loopEndMs`.
    - Implement validating `setLoopRange(startMs, endMs): boolean`, `setLoopStartAtPlayhead`,
      `setLoopEndAtPlayhead`, `nudgeLoopBound`, `clearLoopRange(nowMs)`, `restoreLoopRange(nowMs)`,
      `discardLoopRestore`, `setLoopRangeEnabled`, `toggleLoopRangeEnabled`, and
      `resetLoopForNewAudio`, routing every range write through the `loopRange` utils.
    - All clock-dependent actions take `nowMs` as an argument; the store performs no timer/clock
      side effect (R8.3). Use the `set((state) => ...)` form where new state derives from existing
      state. Maintain INV-3 (enabled only while the range is Valid).
    - Files: `src/hooks/useStudioStore.ts`.
    - _Requirements: 5.8, 5.9, 5.10, 5.13, 5.14, 7.9, 8.2, 8.3, 8.5, 8.6, 8.8, 8.9, 9.3, 9.4, 9.7, 13.4, 13.6, 17.6, 19.1_

  - [x] 3.2 Rework `setSongDuration` rounding, reclamp, and pending-range handling (DSH-Qwen)
    - Round the incoming value to the nearest integer ms (halves up) before storing or comparing;
      if the rounded value equals the stored `songDuration`, leave loop state untouched and log
      nothing (R13.9).
    - Otherwise reclamp a non-null range via `reclampLoopRangeToDuration` and set
      `isLoopRangeEnabled` consistently (INV-3); clear with one `console.warn` when the reclamp
      yields `< MIN` or `start >= duration` (R13.3).
    - While `songDuration` is 0/non-finite, retain existing bounds as a pending range (INV-1,
      R13.5) and hold the flag false; when a finite positive duration first arrives, validate the
      pending range and restore the pre-pending (or project-restored) enabled value (R13.8).
    - Preserve the existing viewport reshaping in `setSongDuration`.
    - Files: `src/hooks/useStudioStore.ts`.
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.8, 13.9_

  - [x]* 3.3 Write store-action unit tests (fresh store per test) (DSH-Qwen)
    - Create a fresh store per test with `create()` directly (not the singleton).
    - Cover validating setters; set-at-playhead success and rejection with `console.warn`
      (R5.8–5.10); `clearLoopRange`/`restoreLoopRange` with injected `nowMs` including expiry,
      no-snapshot, and invalid-after-normalise cases (R8.2–8.9); `setSongDuration`
      rounding/reclamp/pending (R13.1–13.9); the pending-range enable restoration (R13.8); and the
      R13.6 NaN/Infinity rejection.
    - Place at `tests/unit/studioStore.loop.test.ts`.
    - _Requirements: 5.8, 5.9, 5.10, 8.2, 8.3, 8.5, 8.8, 8.9, 13.1, 13.3, 13.5, 13.6, 13.8_

  - [x]* 3.4 Write the INV-3 action-sequence property test (fast-check) (DSH-Qwen)
    - **Property 10: Enabled implies a Valid range after any action sequence**
    - **Validates: Requirements 3.3, 9.3, 9.7, 13.3, 14.9, INV-3**
    - **Property 8: Set-at-playhead produces a Valid range or no change**
    - **Validates: Requirements 5.8, 5.9, 5.10**
    - Apply random finite sequences of loop actions to a fresh store (≥ 100 iterations).
    - Place at `tests/unit/studioStore.loop.test.ts`.

- [x] 4. Checkpoint — store loop slice
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3 — Persistence and migration

- [x] 5. Persist and migrate the loop
  - [x] 5.1 Add loop fields to the project schema and bump the version (DSH-Qwen)
    - Add optional `settings.loopRange?: { startMs: number; endMs: number } | null` and
      `settings.loopEnabled?: boolean` to `src/types/project.ts`.
    - Change `PROJECT_VERSION` to `'1.1.0'` in `src/utils/projectManager.ts`.
    - Files: `src/types/project.ts`, `src/utils/projectManager.ts`.
    - _Requirements: 14.1, 14.2_

  - [x] 5.2 Implement save, load normalisation, and newer-version preservation (DSH-Qwen)
    - Save: write `loopRange` from the store bounds or `null`, and `loopEnabled` forced to `false`
      whenever `loopRange` is `null`; never serialise the restore snapshot (R8.10, R14.1).
    - Load: `'1.0.0'` or missing fields → range null, flag false, no error (R14.3); normalise a
      non-null range with the same `loopRange` utils against the loaded `songDuration`, keeping it
      when Valid (R14.4); invalid persisted range → null, flag false, one `console.warn` with the
      persisted range and loaded duration, other fields intact (R14.5); non-boolean `loopEnabled`
      or `true` with a null/rejected range → false (R14.9); hold the flag false while
      `songDuration` is 0/non-finite and apply R14.4/14.5 when a finite duration arrives (R14.11).
    - Newer-than-`1.1.0` projects (by `compareProjectVersion`): load known fields without rewriting,
      keep the original version string in memory, and on save preserve that version and all
      unrecognised top-level and `settings` fields (R14.6, R14.10, D-9).
    - Wire `loadProject`/`loadProjectAudio` to keep the project-restored range (R13.7, R14.11) and
      `loadSong` to call `resetLoopForNewAudio` (R13.4) in `src/hooks/useStudioStore.ts`.
    - Files: `src/utils/projectManager.ts`, `src/hooks/useStudioStore.ts`.
    - _Requirements: 8.10, 13.4, 13.7, 14.1, 14.3, 14.4, 14.5, 14.6, 14.9, 14.10, 14.11_

  - [x]* 5.3 Update and extend persistence unit tests (DSH-Qwen)
    - Replace the `tests/unit/projectManager.wrapped.test.ts` assertion that settings omit loop
      fields with expectations for `loopRange` and `loopEnabled` (R14.8).
    - Add `tests/unit/projectManager.loop.test.ts`: `'1.0.0'` load, invalid-range load, non-boolean
      `loopEnabled`, newer-version preservation (R14.10), and the save/load round-trip.
    - Drop any `toggleLoopMarker`/`isLoopMarkerActive` references from
      `tests/unit/studioStore.wrapped.test.ts` if present (prepares R15.1).
    - **Property 7: Project save/load round-trips the loop**
    - **Validates: Requirements 14.1, 14.4, 14.7**
    - Place the property test at `tests/unit/projectManager.loop.test.ts`.
    - _Requirements: 14.3, 14.5, 14.8, 14.9, 14.10_

- [x] 6. Checkpoint — persistence and migration
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4 — Playback loop rewrite

- [x] 7. Rewrite the `useAudioPlayer` poll to drive the range loop (direct)
  - [x] 7.1 Replace the marker-loop branch with the `decideLoopWrap` armed-wrap path (direct)
    - Read `{ isLoopRangeEnabled, loopStartMs, loopEndMs, songDuration, isRepeatActive }` via
      `useStudioStore.getState()` at poll time so range/flag changes do not restart the interval
      (R10.6); reduce the effect deps to `[player, isPlaying]` plus the stable setter identities.
    - Track the previous position sample in a `previousSampleRef`; call `decideLoopWrap` before any
      end-of-track repeat/pause logic; on `wrap`, seek to exactly `loopStartMs / 1000` s, keep
      playing, `setCurrentTime(loopStartMs)`, record `loopStartMs` as the previous sample, and skip
      end-of-track logic for that poll (R10.1, R10.2).
    - Handle enable-mid-playback (R10.5), seek-failure suppression with one attempt per crossing
      and `console.error` (R10.10), and scrub/seek suspension via a suspension flag set by
      `onScrubStart`/`seekToPosition` and cleared on completion (R10.11).
    - Keep the end-of-track repeat/pause path for the `noWrap` case (R10.7, R10.8, R11.1, R11.5).
    - Files: `src/hooks/useAudioPlayer.ts`.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.10, 10.11, 11.1, 11.3, 11.4, 11.5_

  - [x]* 7.2 Add a hook-level integration note / smoke test for the poll (direct)
    - The armed-wrap matrix is already covered by `decideLoopWrap` tests (Task 1.3); add a light
      hook-level check or documented manual note covering the suspension flag and seek-failure
      resync paths that are not pure.
    - _Requirements: 10.10, 10.11_

- [x] 8. Checkpoint — playback loop
  - Run `npx tsc --noEmit` and `npx jest --testPathPatterns=unit`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5 — Retire the marker-segment loop

- [x] 9. Remove the marker-segment loop end to end
  - [x] 9.1 Remove `isLoopMarkerActive` / `toggleLoopMarker` from the store (DSH-Qwen)
    - Delete the state field and action from the state interface, initial state, and
      implementations in `src/hooks/useStudioStore.ts`; keep `isRepeatActive`/`toggleRepeat`.
    - Files: `src/hooks/useStudioStore.ts`.
    - _Requirements: 15.1, 15.5, 15.6_

  - [x] 9.2 Remove the marker-loop button and `LoopMarkerIcon` from `MarkerButton` (direct)
    - Remove the unlabelled marker-loop button and its `LoopMarkerIcon` usage while keeping the
      add-marker, navigate-left, navigate-right (`navigate-right-marker`), and remove-last controls
      with their existing testIDs, enabled/disabled rules, and press behaviour; review the compact
      row layout so the four remaining controls keep ≥ 44×44 targets with no overflow.
    - Files: `src/components/ui/controls/MarkerButton.tsx`.
    - _Requirements: 15.2, 15.8_

  - [x] 9.3 Rebind keyboard `L` and update the help text (direct)
    - Rebind `L`/`l` from `toggleLoopMarker` to `toggleLoopRangeEnabled` (guards: no modifiers,
      song loaded, Valid range, no text focus) in `src/hooks/useKeyboardShortcuts.ts`; update
      `HelpScreen` to list `L` as "Toggle loop range" and remove any "loop between markers" entry.
    - Files: `src/hooks/useKeyboardShortcuts.ts`, `src/components/ui/screens/HelpScreen.tsx`.
    - _Requirements: 9.5, 15.3, 15.4_

  - [x] 9.4 Run the zero-reference search gate (DSH-Qwen)
    - Confirm a case-sensitive search of tracked `src/` and `tests/` for `isLoopMarkerActive`,
      `toggleLoopMarker`, and `LoopMarkerIcon` returns zero matches (specs and archived docs
      excluded).
    - _Requirements: 15.7_

- [x] 10. Checkpoint — marker-segment loop retired
  - Run `npx tsc --noEmit`, `npx jest --testPathPatterns=unit`, and the zero-reference search.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6 — Relocate the viewport-follow effect

- [x] 11. Move viewport auto-follow out of the scrollbar (direct)
  - [x] 11.1 Extract `useViewportFollow` and mount it in `WaveformWorkspace` (direct)
    - Create `src/hooks/useViewportFollow.ts` reading `isViewportLocked`, `isPlaying`,
      `currentTime`, `songDuration`, `viewportStartTime`, `viewportDuration` and applying
      R18.1/18.3/18.4/18.6, independent of `showTimeline` and of whether the detail panel is shown.
    - Mount `useViewportFollow()` in `src/components/ui/waveform/WaveformWorkspace.tsx`; keep the
      follow effect in `TimelineScrollbar.tsx` until Phase 8 removes that component so follow never
      regresses mid-migration.
    - Files: `src/hooks/useViewportFollow.ts`, `src/components/ui/waveform/WaveformWorkspace.tsx`.
    - _Requirements: 11.11, 18.1, 18.2, 18.3, 18.4, 18.6_

- [x] 12. Checkpoint — viewport follow
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test` (detail-follow coverage).
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7 — Loop Overview UI and gestures (MVP)

- [x] 13. Build the Loop Overview, its gesture, and the transport toggle
  - [x] 13.1 Build `LoopOverviewTrack`, `LoopRangeLayer`, and `LoopClearControl` with styles (DSH-Qwen)
    - `LoopOverviewTrack`: full-song waveform path when `useWaveformData` source is `'decoded'`
      with ≥ 1 peak, else a solid timing bar and no synthetic sine (R2.1, R2.2); display-only
      marker indicators for every visible layer, omitting out-of-range markers (R2.4, R2.5, R2.7);
      exactly one playhead (R2.3); memoise the waveform path on `(peaks, width, songDuration)` only
      (R19.3, R19.4).
    - `LoopRangeLayer`: `loop-overview-range` body, outside-range dimming ≤ 0.5× inside opacity,
      disabled treatment, 2px-minimum body, and centred `loop-overview-handle-start` /
      `loop-overview-handle-end`; expose the `enabled`/`disabled` state indicator (R3.1–3.7).
    - `LoopClearControl`: `loop-overview-clear` with a ≥ 44×44 hit area, "Clear loop" vs "Restore",
      owning the 5000ms expiry timer cancelled on unmount or snapshot discard (R8.1, R8.4, R8.6).
    - Add mirrored style files under `src/styles/components/controls/` using tokens from
      `src/styles/common.ts`. Keep rendering free of gesture logic for direct review.
    - Files: `src/components/ui/controls/LoopOverviewTrack.tsx`,
      `src/components/ui/controls/LoopRangeLayer.tsx`,
      `src/components/ui/controls/LoopClearControl.tsx`, mirrored `src/styles/components/controls/`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.1, 8.4, 8.6, 19.3, 19.4_

  - [x] 13.2 Implement the single Pan gesture in `useLoopRangeGesture` (direct)
    - Build exactly one `Gesture.Pan().runOnJS(true).activeOffsetX([-6, 6]).failOffsetY([-12, 12])
      .maxPointers(1)`; record touch-down x at `onBegin`, then classify
      create/move/resize-start/resize-end when horizontal movement activates using that touch-down x
      plus the activating movement direction via `resolveGestureMode`; commit live with per-update dedupe through the store
      setters; handle provisional-below-MIN creation, cancel/orientation semantics, second-touch
      ignore, and edge clamping per R5–R7 and R12.
    - Never call `onSeek`, `setCurrentTime`, `addMarker`, scrub-start, or any viewport setter
      (INV-5, INV-8); set `touch-action: none` and keep page scroll unchanged on web (R12.12).
    - Files: `src/hooks/useLoopRangeGesture.ts`.
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7, 6.1, 6.5, 6.6, 7.6, 7.7, 7.11, 12.1, 12.2, 12.3, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12_

  - [x] 13.3 Compose `LoopRangeOverview` with handle hit areas (direct)
    - Create `src/components/ui/controls/LoopRangeOverview.tsx` (root `loop-overview`): measure
      width via `onLayout`, own `useLoopRangeGesture`, compose the three children, render only when
      `showTimeline` is true, and keep loop state untouched while hidden (R1.5, R1.8, R1.10, R1.12).
    - Implement the handle hit areas as a sibling layered above the track inside the overview root:
      44×44 extended native hit area (≥ 4px above/below the strip), ≥ 16px web pointer area, inward
      shift at edges, and no extension while no Valid range exists (R7.1, R7.2, R7.3, R7.10, R7.11).
    - Files: `src/components/ui/controls/LoopRangeOverview.tsx`.
    - _Requirements: 1.1, 1.5, 1.8, 1.10, 1.12, 7.1, 7.2, 7.3, 7.10, 7.11_

  - [x] 13.4 Mount the overview in `MainContent` and re-home `playback-current-time` (direct)
    - Render `LoopRangeOverview` where `TimelineScrollbar` sat in
      `src/components/layout/MainContent.tsx` (below the canvas/detail, above the marker status),
      keeping `TimelineScrollbar` deleted only in Phase 8.
    - Render exactly one `playback-current-time` element while a song is loaded (Transport_Row or
      overview caption), present even when `showTimeline` is false, formatted `Current: m:ss` from
      `floor(currentTime / 1000)` (R1.6).
    - Files: `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AudioControls.tsx`.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.9, 16.1, 16.2, 16.3_

  - [x] 13.5 Add the Loop_Toggle and repeat testID to the transport row (direct)
    - Add the Loop_Toggle as the last Transport_Row control after repeat: `loop-region-toggle`,
      role button, label "Loop selected range", a distinct icon (`Brackets`), `checked =
      isLoopRangeEnabled`, `disabled = !(validRange && songLoaded)` mirrored to
      `aria-pressed`/`aria-disabled` on web; give repeat `testID="repeat-toggle"`, label "Repeat
      song", `checked = isRepeatActive`.
    - Keep all five controls on one row at 320/375px with ≥ 44×44 targets and no overflow (R9.6).
    - Files: `src/components/ui/controls/AudioControls.tsx`,
      `src/styles/components/controls/audioControls.ts`.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.9_

  - [x] 13.6 Wire keyboard `[` / `]` and the toggle label (direct)
    - Add `[` → "Set loop start at playhead" and `]` → "Set loop end at playhead" (guards: no text
      focus, song loaded) in `src/hooks/useKeyboardShortcuts.ts`; keep the `L` rebind from Task 9.3.
    - Change the `CanvasOptionsToggle` label to the exact text "Show Loop Overview" and ensure no
      "Show Timeline" label remains.
    - Files: `src/hooks/useKeyboardShortcuts.ts`,
      `src/components/ui/controls/CanvasOptionsToggle.tsx`.
    - _Requirements: 1.9, 5.11, 9.5_

  - [x]* 13.7 Add Playwright coverage for the MVP overview flows (direct)
    - Overview replaces the scrollbar and spans the full song; create by drag; move; resize each
      handle; clear then restore within 5s; Loop_Toggle enable/disable and disabled state;
      `[`/`]`/`L` keyboard; a tap on the overview changes nothing; `playback-current-time` present
      with `showTimeline` false.
    - Place in `tests/ui-components.spec.ts` / `tests/waveform-features.spec.ts`.
    - _Requirements: 1.6, 5.5, 5.7, 7.4, 7.5, 8.2, 8.5, 9.4_

- [x] 14. Checkpoint — Loop Overview MVP
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

> **MVP complete** — a dedicated full-song Loop Overview that creates, moves, resizes, clears, and
> restores a loop range, a transport toggle that enables looping, drift-free playback wrap, and
> project persistence. The phases below are refinements.

### Phase 8 — Delete `TimelineScrollbar` and re-home testIDs

- [x] 15. Remove the scrollbar and update the suites
  - [x] 15.1 Delete `TimelineScrollbar` and its style file (DSH-Qwen)
    - Remove `src/components/ui/controls/TimelineScrollbar.tsx` and
      `src/styles/components/controls/timelineScrollbar.ts` and any remaining imports now that
      follow lives in `useViewportFollow` (Phase 6) and the overview replaced its render slot.
    - Files: `src/components/ui/controls/TimelineScrollbar.tsx` (removed),
      `src/styles/components/controls/timelineScrollbar.ts` (removed).
    - _Requirements: 1.1, 1.7_

  - [x] 15.2 Replace `timeline-gesture-area` references in the test suites (DSH-Qwen; direct review)
    - Replace every `timeline-gesture-area` reference in `tests/ui-components.spec.ts`,
      `tests/waveform-features.spec.ts`, and the four spots in `tests/ios/BeatNoteUITests.swift`
      with the `loop-overview*` testIDs; confirm no suite references `timeline-gesture-area`.
    - Files: `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`,
      `tests/ios/BeatNoteUITests.swift`.
    - _Requirements: 1.7_

- [x] 16. Checkpoint — scrollbar removed
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9 — Wrapped-row outside-range de-emphasis

- [x] 17. De-emphasise content outside the range on wrapped rows (DSH-Qwen; direct review)
  - [x] 17.1 Render outside-range dimming and disabled treatment on wrapped rows (DSH-Qwen)
    - Keep the existing inside-range `wrapped-row-loop-{index}` segment and render outside-range
      waveform/marker content at a lower opacity, including rows that do not intersect the range,
      with content inside the range at the no-loop opacity (R4.1, R4.3).
    - Apply a distinct disabled treatment when `isLoopRangeEnabled` is false while keeping the
      segments and de-emphasis (R4.7, R11.2); render nothing special when no Valid range exists
      (R4.6); keep marker x-positions, marker tap selection, and seek gestures unchanged (R4.5,
      INV-6); update all mounted rows by the next frame on any range change (R4.8).
    - Files: `src/components/ui/waveform/WrappedRow.tsx`,
      `src/components/ui/waveform/WrappedWaveform.tsx`,
      `src/styles/components/waveform/wrappedRow.ts`.
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 11.2_

- [x] 18. Checkpoint — wrapped-row de-emphasis
  - Run `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10 — Accessibility

- [x] 19. Add overview accessibility (direct)
  - [x] 19.1 Add handle slider/adjustable semantics, summary, actions, and focus flow (direct)
    - Handles: native `accessibilityRole="adjustable"` / web `role="slider"`, min 0, max
      `songDuration`, now = bound, value text `Loop start m:ss.s` / `Loop end m:ss.s`, mirrored to
      `aria-value*`; Start_Handle before End_Handle in tab order (R17.1, R17.6).
    - Summary label `Loop m:ss.s to m:ss.s, N seconds` or `No loop selected` (R17.2); accessibility
      actions "Set loop start at playhead", "Set loop end at playhead", and "Clear loop" gated per
      R17.3; announce updated/clamped value text once per change (R17.4).
    - Keyboard stepping via `nudgeLoopBound` (Arrow one Beat_Step, Page/Shift+Arrow 10× Beat_Step,
      Home/End to clamp limits) (R7.9, R17.6); move focus to the Clear_Control on clear and to the
      summary when the Restore_Window closes without restore (R17.7); web `ew-resize`/`grab`/
      `grabbing` cursors and a visible focus indicator (R16.4, R16.7).
    - Files: `src/components/ui/controls/LoopRangeOverview.tsx`,
      `src/components/ui/controls/LoopRangeLayer.tsx`,
      `src/components/ui/controls/LoopClearControl.tsx`.
    - _Requirements: 7.9, 16.4, 16.7, 17.1, 17.2, 17.3, 17.4, 17.6, 17.7_

  - [x]* 19.2 Add Playwright accessibility assertions (direct)
    - Assert handle roles/value text/tab order, summary label, the three accessibility actions,
      cursors, and the focus-on-clear flow.
    - Place in `tests/waveform-features.spec.ts`.
    - _Requirements: 17.1, 17.2, 17.3, 17.7_

- [x] 20. Checkpoint — accessibility
  - Run `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 11 — Detail-view loop highlight

- [x] 21. Highlight the loop in the detail view (DSH-Qwen; direct review)
  - [x] 21.1 Render the detail-view loop highlight (DSH-Qwen)
    - When the detail view is active and a Valid range exists, highlight the intersection of
      `[loopStartMs, loopEndMs]` with `[viewportStartTime, viewportStartTime + viewportDuration]`;
      show no highlight on an empty intersection or no Valid range (R4.4, R4.6).
    - Files: `src/components/ui/waveform/WaveformDetailPanel.tsx`,
      `src/components/ui/waveform/WaveformCanvas.tsx`.
    - _Requirements: 4.4, 4.6_

- [x] 22. Checkpoint — detail-view highlight
  - Run `npx tsc --noEmit` and `PLAYWRIGHT_PORT=8082 npm test`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 12 — iOS XCTest acceptance

- [x] 23. Add iOS acceptance coverage (direct)
  - [x] 23.1 Extend `BeatNoteUITests.swift` with loop-overview cases (direct)
    - Cover overview drag create/move/resize with the 44×44 extended hit area and no seek or
      marker-count change; a vertical drag on the overview preserving no page scroll; the
      Transport_Row five-button fit and the marker row after loop-button removal; the Loop_Toggle;
      loop playback wrap using the 150s `long-test-track.m4a` fixture; save/relaunch/restore of a
      saved loop; and the handle's adjustable label/value semantics. XCTest cannot invoke React
      Native custom accessibility actions reliably, so the actual VoiceOver increment remains in
      the physical-device gate at task 25.2.
    - Files: `tests/ios/BeatNoteUITests.swift`.
    - _Requirements: 1.4, 5.5, 6.1, 7.2, 9.6, 10.1, 12.1, 14.4, 15.8, 17.1_

- [x] 24. Checkpoint — iOS acceptance
  - Run focused cases with `IOS_TEST_ONLY=<test-name> npm run test:ios:ui`, then the aggregate
    `npm run test:ios:ui`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 13 — Full regression and physical-device acceptance

- [ ] 25. Final regression and manual acceptance (direct)
  - [x] 25.1 Run the full automated gate (direct)
    - Run `npx tsc --noEmit`, `npx jest --testPathPatterns=unit`, `PLAYWRIGHT_PORT=8082 npm test`,
      and the `npm run test:ios:ui` aggregate; fix any regression before proceeding.
    - _Requirements: 15.1, 19.1, 19.2_

  - [ ] 25.2 Run physical-device acceptance (direct)
    - On a physical iPhone, verify ~60fps range drag and playback, VoiceOver handle adjustment with
      value announcements, contrast of the rendered token pairs in every state, and audibility of
      the loop boundary during rehearsal. This gate is required before the feature is called done.
    - _Requirements: 17.4, 17.5_

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core
  implementation tasks are never optional.
- Delegation tags: **(DSH-Qwen)** = safe to delegate (pure utils, store actions,
  persistence/migration, unit/property tests, isolated non-gesture rendering); **(direct)** =
  gesture integration, audio boundary behaviour, and final UI/accessibility review.
- Each task references specific acceptance criteria from `requirements.md` for traceability.
- Property tests validate the Correctness Properties 1–10 from the design; unit tests validate
  specific examples and edge cases.
- Phases 1–7 deliver the MVP; Phases 8–13 are refinements and acceptance.
- Several task shapes follow the defaults of unresolved decisions D-1, D-2, D-5, D-7, and D-8 and
  must be revisited if a default changes (see "Dependence on unresolved product decisions").
- No stem-separation or monetisation tasks are included, per the spec Non-Goals.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "3.1", "3.2"] },
    { "id": 2, "tasks": ["3.3", "3.4", "5.1"] },
    { "id": 3, "tasks": ["5.2"] },
    { "id": 4, "tasks": ["5.3", "7.1"] },
    { "id": 5, "tasks": ["7.2", "9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 7, "tasks": ["11.1"] },
    { "id": 8, "tasks": ["13.1", "13.2"] },
    { "id": 9, "tasks": ["13.3", "13.5"] },
    { "id": 10, "tasks": ["13.4", "13.6"] },
    { "id": 11, "tasks": ["13.7", "15.1"] },
    { "id": 12, "tasks": ["15.2", "17.1"] },
    { "id": 13, "tasks": ["19.1"] },
    { "id": 14, "tasks": ["19.2", "21.1"] },
    { "id": 15, "tasks": ["23.1"] },
    { "id": 16, "tasks": ["25.1"] },
    { "id": 17, "tasks": ["25.2"] }
  ]
}
```
