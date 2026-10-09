# BeatNote Project History

This archive preserves completed work and older handover entries moved out of the live board to
keep `AGENTS.md` concise. Archived checklist items and handover entries are copied verbatim.

## Archived Completed Work

#### Product planning

- [x] Re-sequence releases around the core annotation/rehearsal workflow; define V1 monetisation groundwork, V2 Pro launch, V2.x cloud stem beta, and V3 on-device/hybrid stems
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `.kiro/steering/stem-separation.md`, `.kiro/steering/architecture-decisions.md`, `.kiro/specs/demucs-stem-separation/`, `README.md`, `AGENTS.md`</sub>

#### Core annotation MVP (web)

- [x] Global Zustand store — playback, viewport/zoom with centralized clamping, layers, markers, annotations, toggles
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`</sub>
- [x] Markers and annotations — add/remove/undo/redo, marker navigation, per-layer text annotations
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`, `src/components/ui/controls/AnnotationField.tsx`</sub>
- [x] Six-layer stem model with 2 / 4 / 6 visible-stem modes
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/StemSelector.tsx`</sub>
- [x] Waveform rendering, rhythmic grid, magnetic snapping, ghost playhead, BPM control
      <sub>**Key Artifacts:** `src/components/ui/waveform/`, `src/utils/magneticSnapping.ts`, `src/components/ui/controls/BpmControl.tsx`</sub>
- [x] Full single-screen UI — layout, controls, modals, HelpScreen, error boundary
      <sub>**Key Artifacts:** `src/features/studio/StudioScreen.tsx`, `src/components/layout/`, `src/components/ui/`</sub>

#### Data in / out

- [x] Platform-split export engine — CSV + MIDI, web/iOS implementations over a shared core
      <sub>**Key Artifacts:** `src/utils/exportEngine.ts`, `src/utils/exportEngine.web.ts`, `src/utils/exportEngine.ios.ts`, `src/utils/exportEngineCore.ts`, `src/utils/exportTypes.ts`</sub>
- [x] CSV import with layer mapping and row validation
      <sub>**Key Artifacts:** `src/utils/importEngine.ts`, `src/utils/importTypes.ts`, `src/components/ui/modals/ImportModal.tsx`</sub>
- [x] Project save/load round-trip via AsyncStorage
      <sub>**Key Artifacts:** `src/utils/projectManager.ts`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectModal.tsx`</sub>

#### Stem separation foundation

- [x] Shared types and store fields for stem separation (status / progress / URIs) — spec task 1
      <sub>**Key Artifacts:** `src/features/stemSeparation/types.ts`, `src/hooks/useStudioStore.ts`</sub>
- [x] `stemCache.ts` — AsyncStorage-backed cache metadata + Documents-directory stem files (FNV-1a hash)
      <sub>**Key Artifacts:** `src/features/stemSeparation/stemCache.ts`, `tests/unit/stemCache.test.ts`</sub>

#### Test & build harness

- [x] Implement wrapped-canvas Phase 8 multi-row A/B loop highlighting
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 7 responsive precision detail mode and wrapped-row restoration
      <sub>**Key Artifacts:** `src/components/ui/waveform/WaveformDetailPanel.tsx`, `src/components/ui/waveform/WaveformWorkspace.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/components/layout/MainContent.tsx`, `src/hooks/useStudioStore.ts`, `src/styles/components/waveform/`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 6 follow-playhead auto-scroll, suspension, re-arm, and toggle
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/wrappedWaveform.ts`, `tests/setup.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 5 seeking, marker placement/selection, and shared annotation selection
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/hooks/useStudioStore.ts`, `tests/unit/studioStore.wrapped.test.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/design.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 4 bounded row rendering and unified-slot integration
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/wrappedRow.ts`, `src/styles/components/waveform/wrappedWaveform.ts`, `src/components/layout/MainContent.tsx`, `src/hooks/useWaveformData.ts`, `tests/waveform-features.spec.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phases 1-2: deterministic row geometry, timeline mapping, and single-store state with unit/property coverage
      <sub>**Key Artifacts:** `src/utils/rowLayout.ts`, `src/utils/timelineMapping.ts`, `src/hooks/useStudioStore.ts`, `tests/unit/rowLayout.test.ts`, `tests/unit/timelineMapping.test.ts`, `tests/unit/studioStore.wrapped.test.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Add standalone wrapped-row gutter scaffolding and backwards-compatible wrapped preference persistence
      <sub>**Key Artifacts:** `src/components/ui/waveform/RowGutter.tsx`, `src/styles/components/waveform/rowGutter.ts`, `src/types/project.ts`, `src/utils/projectManager.ts`, `src/hooks/useStudioStore.ts`, `tests/unit/projectManager.wrapped.test.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 3 hook with orientation defaults and bounded visible-window geometry
      <sub>**Key Artifacts:** `src/hooks/useWrappedRows.ts`, `src/utils/rowLayout.ts`, `tests/unit/rowLayout.test.ts`, `.kiro/specs/wrapped-waveform-canvas/design.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Refine iOS mobile studio layout, expose toolbar scrolling, and hide deferred stem UI for V3
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/layout/mainContent.ts`, `src/features/stemSeparation/featureFlags.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Close iOS mobile acceptance defects — overview tap/drag seeks, live marker annotations, compact fixed controls, full-width waveform, landscape CSV actions, and long-track simulator coverage
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/long-test-track.m4a`</sub>
- [x] Enable iOS background audio playback and verify time continuity through background/foreground in XCTest
      <sub>**Key Artifacts:** `app.json`, `src/hooks/useAudioPlayer.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/background-audio.m4a`</sub>
- [x] Repair Playwright marker, layer-selector, audio-loading, and responsive assertions; full suite is green
      <sub>**Key Artifacts:** `tests/setup.ts`, `tests/core-functionality.spec.ts`, `tests/quality-assurance.spec.ts`, `tests/test-discovery.spec.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/HorizontalLayerSelector.tsx`</sub>
- [x] Route native timeline gestures to JS state safely, preserve vertical scrolling, and compact phone controls; cover landscape tap/drag in XCTest
      <sub>**Key Artifacts:** `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/SimpleWaveform.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/markerButton.ts`, `src/styles/components/controls/projectControls.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Mobile workspace scroll/toolbar layout and an always-reachable settings drawer toggle
      <sub>**Key Artifacts:** `src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Jest unit test setup + Playwright E2E harness (5 spec files)
      <sub>**Key Artifacts:** `jest.config.js`, `tests/unit/`, `tests/*.spec.ts`, `playwright.config.ts`</sub>
- [x] Regeneratable portrait-mode Xcode UI-test target and iOS simulator workflow for launch,
      audio/annotation, project save/relaunch/restore, CSV import validation, and share-sheet export
      <sub>**Key Artifacts:** `plugins/withIosUiTests.js`, `scripts/ios-ui-test.js`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/`</sub>
- [x] Clean strict TypeScript gate — replaced missing layer icon imports and corrected web cursor typing
      <sub>**Key Artifacts:** `src/components/ui/controls/LayerControls.tsx`, `src/styles/components/controls/timelineScrollbar.ts`</sub>
- [x] Local iOS simulator baseline — reproducible prebuild, Xcode 27 build, simulator launch,
      safe-area layout, and native-safe SVG rendering
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, `plugins/withIosPodDeploymentTarget.js`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`</sub>
- [x] Make iOS document-picker UI tests select fixtures when Files Recents is empty
      <sub>**Key Artifacts:** `tests/ios/BeatNoteUITests.swift`</sub>

#### Repo hygiene & tooling

- [x] Markdown lint clean across all 12 repo `.md` files (fixed 25 formatting issues in `design.md`)
      <sub>**Key Artifacts:** `.kiro/specs/demucs-stem-separation/design.md`</sub>
- [x] Migrated the 5 agent hooks from legacy `.kiro.hook` (v1) to v2 JSON; refined stale test command and scoped `update-live-docs` away from AGENTS.md
      <sub>**Key Artifacts:** `.kiro/hooks/coding-standards-check.json`, `.kiro/hooks/style-file-reminder.json`, `.kiro/hooks/ts-check-on-save.json`, `.kiro/hooks/test-file-check.json`, `.kiro/hooks/update-live-docs.json`</sub>

## Archived Handover Log

### 2026-10-05 — Add multi-row A/B loop highlighting

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `87f2f66`
**Kanban moved:** Wrapped-canvas Phase 8 A/B loop highlighting → Done; Phase 9 annotation display remains In Progress

**Changed:**

- Wired the existing session-only `loopStartMs`/`loopEndMs` bounds through the virtualized wrapped
  waveform and indexed the pure `loopSegmentsForRows` result by row.
- Added a defensive translucent SVG segment behind each affected row's waveform, markers, and
  playhead. Empty, non-finite, reversed, and out-of-row ranges render nothing; exact row boundaries
  retain the existing half-open ownership semantics.
- DSH-Qwen session `session-41471e66-4bb5-4f0a-a647-ef9a3dbf4dd3` implemented only the bounded
  `WrappedRow` overlay. Codex reviewed the geometry and directly implemented store/list integration.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 51 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 64 passed.
- Existing loop utility tests cover clipped multi-row segments, exact-boundary ownership, full
  coverage without overlap, equal endpoints, and reversed inactive ranges.

**Not verified / known gaps:**

- The production UI does not yet expose A/B loop-bound controls, so the new visual overlay was not
  activated through browser or simulator UI. The later section-looping feature will supply that path.
- No iOS suite was rerun because Phase 8 is passive rendering over existing state and its specified
  gate is unit plus web regression; the existing landscape-lock and physical-device gaps remain.

**Next agent should:**

- Implement Phase 9 compact annotation indicators and clustering under direct interaction review,
  reusing the shared selected-marker annotation flow without rendering text inline.

### 2026-10-05 — Complete responsive precision detail mode

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `eeda468`
**Kanban moved:** Wrapped-canvas Phase 7 precision detail mode → Done; Phase 8 A/B loop highlighting remains In Progress

**Changed:**

- Added `WaveformWorkspace` as the unified-path owner of wrapped/detail switching. Selecting a row
  sets the detail viewport to its exact half-open range; phone portrait replaces the wrapped list,
  while wide/landscape keeps wrapped context and docks the detail panel below it.
- Added an accessible gutter action per wrapped row and restored the selected row on return. Project
  loads now clear the session-only row selection so persisted detail preference opens deterministically
  on the active row rather than inheriting stale edit state.
- Added `WaveformDetailPanel` around the existing precision `WaveformCanvas`, retaining its scrub,
  snap, marker-adjustment, and zoom behavior with stable panel/close identifiers.
- DSH-Qwen session `session-d89e48a4-e4b4-4cb9-98bb-cd79f7877616` implemented only the bounded
  detail-panel wrapper and styles. Direct review removed an unused import and non-ASCII glyph; Codex
  owned and reviewed all responsive workspace, store, row, and `MainContent` integration.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `AGENTS.md`,
`docs/context/archive/beatnote-project-history.md`, `src/components/layout/MainContent.tsx`,
`src/components/ui/waveform/WaveformDetailPanel.tsx`,
`src/components/ui/waveform/WaveformWorkspace.tsx`,
`src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`src/components/ui/waveform/index.ts`, `src/hooks/useStudioStore.ts`,
`src/styles/components/waveform/waveformDetailPanel.ts`,
`src/styles/components/waveform/waveformWorkspace.ts`,
`src/styles/components/waveform/wrappedRow.ts`, `tests/ios/BeatNoteUITests.swift`,
`tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 51 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 64 passed,
  including portrait replacement, exact selected-row viewport seeking, close-state neutrality,
  selected-row restoration, and landscape docked presentation.
- Focused `IOS_TEST_ONLY=testPrecisionDetailModeOpensAndRestoresWrappedRow npm run test:ios:ui`
  → 1 passed on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791176105747.xcresult`.
- `git diff --check` → clean before documentation reconciliation.

**Not verified / known gaps:**

- Native landscape detail docking was not rerun because the existing simulator scene-rotation lock
  still blocks geometry-guarded landscape acceptance; the same presentation passed in browser E2E.
- The detail panel inherits marker adjustment, snapping, zoom, and scrubbing from the existing
  `WaveformCanvas`; midpoint scrubbing is covered, but no new dedicated marker-drag XCTest was added.
- Phase 8 A/B loop highlighting is not implemented.

**Next agent should:**

- Implement Phase 8 multi-row A/B loop highlighting using the existing pure
  `loopSegmentsForRows` helper, then verify boundary ownership and rendering without changing loop
  semantics in either waveform view.

### 2026-10-05 — Complete follow-playhead refinement

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `47f95a5`
**Kanban moved:** Wrapped-canvas Phase 6 follow-playhead → Done; Phase 7 precision detail mode remains In Progress

**Changed:**

- Added active-row auto-centering during playback, a persisted follow preference toggle, and a
  transient manual-scroll suspension state. Suspended follow re-arms only after the active row first
  leaves and then returns to the actual visible window; the toggle can also resume immediately.
- Added compact `Follow: On`, `Follow: Off`, and `Follow: Suspended` states plus native drag and
  web-wheel suspension handling without persisting transient scroll state.
- Extended the long-track web fixture helper and acceptance coverage for follow toggling,
  auto-scroll, suspension, explicit resume, and automatic re-arm. Added focused portrait XCTest
  coverage for a distant-row seek and follow toggle behavior.
- A bounded DSH-Qwen test delegation timed out without returning a task ID after writing only its
  assigned test files. Direct review corrected pointer positioning and assertion reliability before
  accepting the draft; UI integration remained under Codex ownership.

**Key Artifacts** (from `git diff --name-only`): `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `docs/context/archive/beatnote-project-history.md`,
`src/components/ui/waveform/WrappedWaveform.tsx`,
`src/styles/components/waveform/wrappedWaveform.ts`, `tests/setup.ts`,
`tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 51 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 63 passed.
- Focused `IOS_TEST_ONLY=testWrappedFollowPlayheadTracksDistantRow npm run test:ios:ui` → 1 passed
  on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791174843069.xcresult`.
- `git diff --check` → clean before documentation reconciliation.

**Not verified / known gaps:**

- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks the geometry-guarded landscape cases; Phase 6 portrait native behavior is verified.
- Native manual-scroll suspension and automatic re-arm are covered by the shared implementation and
  web acceptance, but the focused XCTest covers distant-row tracking and toggling only.
- Phase 7 precision detail mode is not implemented.

**Next agent should:**

- Implement Phase 7 `WaveformDetailPanel` and `WaveformWorkspace` under direct UI review, preserving
  wrapped scroll restoration and keeping playback/markers neutral during view switches.

### 2026-10-04 — Complete wrapped MVP gestures and marker selection

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `fc96587`
**Kanban moved:** Wrapped-canvas Phase 5 gestures → Done; Phase 6 follow-playhead remains In Progress

**Changed:**

- Added JS-thread row gestures using the proven horizontal-intent and vertical-yield thresholds:
  lower-row taps seek, horizontal drags scrub, and vertical intent remains available to the wrapped
  scroll view.
- Added a visible 44 px marker lane. Taps select the nearest marker within a 22 px radius or place a
  new marker on the active layer, then seek to that timestamp; other layers remain unchanged.
- Added transient single-store `selectedMarker` state and migrated `AnnotationField` from local
  selection so wrapped marker selection and annotation editing share one contract. Selection clears
  when its marker is removed, markers are cleared, a song is unloaded, or a project is loaded.
- DSH-Qwen session `session-0ba4df52-3819-4e5b-a278-cc11f63a79b1` completed a read-only gesture and
  test review. Codex retained direct ownership of all UI/store integration and adjusted the proposal
  so marker actions seek as well, preserving deterministic annotation synchronization.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/design.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `docs/context/archive/beatnote-project-history.md`,
`src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `src/hooks/useStudioStore.ts`,
`tests/ios/BeatNoteUITests.swift`, `tests/unit/studioStore.wrapped.test.ts`,
`tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 51 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 62 passed,
  including seek-only, marker placement/selection, annotation enablement, and drag stability.
- Focused `IOS_TEST_ONLY=testWrappedRowSeekMarkerAndDragGestures npm run test:ios:ui` → 1 passed on
  iPhone 17 Pro / iOS 26.2; result bundle `ios/build/BeatNoteUITests-1791128250826.xcresult`.

**Not verified / known gaps:**

- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks the geometry-guarded landscape cases; Phase 5 portrait native behavior is verified.
- Vertical-scroll yielding is configured with the proven thresholds and exercised indirectly, but a
  dedicated XCTest scroll-offset assertion is not yet present.
- Phase 4 and Phase 5 changes were committed together in `fc96587`.

**Next agent should:**

- Implement Phase 6 follow-playhead suspension/re-arm behavior, then add focused scroll acceptance
  before proceeding to the precision detail workspace.

### 2026-10-04 — Integrate bounded wrapped waveform rendering

**Agent:** orchestrator (Codex) · **Commit(s):** `fc96587`
**Kanban moved:** Wrapped-canvas Phase 4 rendering → Done; Phase 5 gestures remains In Progress

**Changed:**

- Added `WrappedRow` and `WrappedWaveform` with aligned gutters, decoded per-row waveform slices,
  native-safe flat timing bars when real peaks are unavailable, layer-coloured markers, clipped
  progress, and an active-row-only playhead.
- Mounted the wrapped view in the unified waveform slot while preserving stem feature gating and the
  overview scrollbar. Rendering uses the design-approved fixed-height spacer window with three-row
  overscan, so mounted row components remain bounded independently of song length.
- Added stable wrapped-rendering selectors and a loaded-audio Playwright acceptance check. Direct
  review also corrected the time-zero playhead so its stroke is inset within the SVG bounds.
- Delegation was skipped after the required preflight found no running Ollama server or DSH process;
  the local-agent fallback was used without starting host services automatically.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `AGENTS.md`,
`docs/context/archive/beatnote-project-history.md`, `src/components/layout/MainContent.tsx`,
`src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `src/hooks/useWaveformData.ts`,
`src/styles/components/waveform/wrappedRow.ts`, `src/styles/components/waveform/wrappedWaveform.ts`,
`src/utils/rowLayout.ts`, `tests/unit/rowLayout.test.ts`, `tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 50 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 61 passed,
  including the new loaded-song wrapped-row check.
- `git diff --check` → clean before documentation reconciliation.

**Not verified / known gaps:**

- Phase 5 seeking and marker gestures are intentionally absent; the overview scrollbar remains the
  available seek surface until that phase lands.
- Native wrapped rendering, vertical nested scrolling, and touch behavior were not rerun in the iOS
  simulator in this phase. Existing simulator landscape-rotation and physical-device gaps remain.
- Expo reported the existing package-version compatibility warnings during web startup; dependencies
  were not changed as part of this feature slice.

**Next agent should:**

- Implement Phase 5 row tap/drag seeking and marker placement under direct review, then run the web
  gate and a focused iOS simulator acceptance pass before proceeding to follow-playhead behavior.

### 2026-10-04 — Complete wrapped-row hook with Qwen draft review

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `b829525`, `7c3c0ef`
**Kanban moved:** Wrapped-canvas Phase 3 hook → Done; Phase 4 rendering remains In Progress

**Changed:**

- Pushed the previously verified wrapped core, iOS test hardening, gutter, and persistence work to
  `origin/master` as `b829525`.
- DSH-Qwen session `session-57f59a58-d7e6-4679-8d27-5e71ef7d3c44` drafted
  `useWrappedRows.ts` and pure row viewport helpers within its two-file assignment. The DSH host
  exited after writing, so no reliable final worker message was available.
- Direct review fixed the draft's visible-window divisor (it incorrectly used container height
  instead of fixed row height), added focused unit coverage, and clarified the optional viewport
  metrics contract in the wrapped-canvas design/tasks. No UI integration or gesture code changed.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/design.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `src/hooks/useWrappedRows.ts`,
`src/utils/rowLayout.ts`, `tests/unit/rowLayout.test.ts`.

**Verified:**

- `npx tsc --noEmit` → clean.
- `npm run test:unit -- --runInBand` → 50 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 60 passed.
- `git diff --check` → clean; contract checker with five-item Done/log limits → 0 errors.

**Not verified / known gaps:**

- The hook is not mounted yet. `WrappedRow`, `WrappedWaveform`, `MainContent` integration, seeking,
  marker gestures, and simulator acceptance remain open.
- The DSH web profile was no longer running after the draft; its process lifecycle needs checking
  before another delegated task. Phase 3 was committed in `7c3c0ef`.
- Existing simulator landscape-rotation and physical-device acceptance gaps remain unchanged.

**Next agent should:**

- Implement Phase 4 `WrappedRow` and `WrappedWaveform` without gestures, then directly review the
  `MainContent` integration before beginning Phase 5 gesture work.

### 2026-10-04 — Add wrapped gutter and preference persistence

**Agent:** orchestrator (Codex) · **Commit(s):** `b829525`
**Kanban moved:** Wrapped gutter scaffolding + preference persistence → Done; wrapped UI integration remains In Progress

**Changed:**

- Added the standalone `RowGutter` component and mirrored token-based styles without exporting,
  mounting, or adding gestures; UI integration remains under direct Codex review.
- Persisted only `primaryView`, `countSize`, `rowDensity`, and `followPlayhead`; legacy projects are
  normalized to wrapped/8/phrase/follow defaults. Added round-trip and exclusion tests for transient
  loop, selection, manual-scroll, and derived-row state.
- Fresh DSH sessions `session-8fccb6c4-90a1-4a23-9ee7-52746d510286` and
  `session-cee5ed24-b3fc-44e2-984e-a131ffc279cc` failed before editing because Ollama could not open
  the Qwen manifest on the external model volume (`operation not permitted`); Codex used the
  orchestrator fallback and implemented/reviewed both bounded tasks directly.

**Key Artifacts** (from `git diff --name-only` plus untracked source): `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `src/components/ui/waveform/RowGutter.tsx`,
`src/styles/components/waveform/rowGutter.ts`, `src/types/project.ts`,
`src/utils/projectManager.ts`, `src/hooks/useStudioStore.ts`,
`tests/unit/projectManager.wrapped.test.ts`, `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `npx tsc --noEmit` → clean; focused persistence suite → 2 passed.
- `npm run test:unit -- --runInBand` → 46 passed across 6 suites; elevated
  `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 60 passed.
- `git diff --check` → clean; contract checker with five-item Done/log limits → 0 errors.

**Not verified / known gaps:**

- `RowGutter` is intentionally not exported or rendered yet. Phase 3 hook, wrapped row/list
  rendering, UI integration, and all wrapped gestures remain open and were not modified.
- DSH-Qwen remains unavailable until host permissions allow Ollama to read
  `/Volumes/s_cx_g/Ollama/models/manifests/registry.ollama.ai/library/qwen3.8-sharp-uncensored-q4/latest`.
- Existing simulator landscape-rotation and physical-device acceptance gaps remain unchanged. This
  completed slice was committed and pushed in `b829525`.

**Next agent should:**

- Implement and directly review Phase 3 `useWrappedRows`, then build the non-gesture wrapped row/list
  rendering around the completed gutter; keep `MainContent` integration and gestures in Codex.

### 2026-10-03 — Build wrapped-canvas core and isolate simulator rotation

**Agent:** orchestrator (Codex) · **Commit(s):** `b829525`
**Kanban moved:** Wrapped-canvas Phases 1-2 → Done; remaining canvas implementation → In Progress

**Changed:**

- Added pure integer-ms row layout and timeline mapping with half-open boundary ownership, loop
  clipping, phrase labels, and fast-check properties. Added wrapped-view preferences/session fields
  and setters to the existing Zustand store; no wrapped UI is rendered yet.
- Switched `MainContent` to `useWindowDimensions` for orientation changes. Corrected the long-track
  drag XCTest to capture its pre-drag clock before interacting, and made landscape tests require an
  actual landscape app frame rather than accepting portrait execution.
- Two bounded DSH-Qwen attempts ended at `max-tokens` with no files; Codex implemented and reviewed
  the entire completed slice. The user was asked to check simulator Portrait Orientation Lock.

**Key Artifacts** (from `git diff --name-only` plus untracked source): `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `src/components/layout/MainContent.tsx`, `src/hooks/useStudioStore.ts`,
`src/utils/rowLayout.ts`, `src/utils/timelineMapping.ts`, `tests/ios/BeatNoteUITests.swift`,
`tests/unit/rowLayout.test.ts`, `tests/unit/timelineMapping.test.ts`,
`tests/unit/studioStore.wrapped.test.ts`, `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 44 passed; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 60 passed
  against the final `MainContent` orientation-hook change.
- Initial full `npm run test:ios:ui` on committed baseline → 9/9 passed. Post-change full rerun →
  8/9 passed (`ios/build/BeatNoteUITests-1790958927382.xcresult`); long-track drag passed after
  the assertion fix. Focused landscape rerun confirms the simulator did not rotate the app scene.

**Not verified / known gaps:**

- Latest iOS gate is not green. XCTest and Device Hub rotate the simulated hardware, but BeatNote
  remains in a portrait 402 x 874 scene; the in-test AX dump shows the portrait dock. The app's
  generated Info.plist supports landscape and source has no explicit orientation lock. The cause may
  be the simulator's Portrait Orientation Lock; do not call this an app layout defect until that is
  checked. The CSV landscape test now also asserts actual rotation and has not been rerun.
- Wrapped rendering, gestures, and physical-device acceptance are not implemented/verified. The
  core/persistence work listed above was committed and pushed in `b829525`.

**Next agent should:**

- Verify simulator orientation lock is off, rerun both focused landscape tests and the full suite,
  then implement Phase 3 `useWrappedRows` and Phase 4 virtualized rendering against the completed
  pure core. Keep integration/audio/gesture ownership in Codex; delegate only bounded, testable
  leaf files to DSH-Qwen using the 32K local-model context.

### 2026-10-03 — Verify committed mobile refinements

**Agent:** orchestrator (Codex) · **Commit(s):** `b3e516b` (created by Kiro)
**Kanban moved:** iOS mobile studio refinements → Done; wrapped waveform canvas → In Progress

**Changed:**

- No application files changed in this verification pass. The committed mobile layout, toolbar cue,
  deferred stem UI, and annotation typing fix were rechecked before beginning the wrapped-canvas spec.
- Resolved workflow selection conflict: the current user request controls the next task under
  `/Users/galen/.codex/skills/local-agent-orchestrator/references/lifecycle.md`, rather than the
  default top-card selection in `AGENTS.md`.

**Key Artifacts** (from `git diff b3e516b^ b3e516b --name-only`): `src/components/layout/MainContent.tsx`,
`src/components/layout/Sidebar.tsx`, `src/components/ui/controls/AnnotationField.tsx`,
`src/components/ui/controls/ProjectControls.tsx`, `src/styles/layout/mainContent.ts`,
`src/features/stemSeparation/featureFlags.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 9 passed, 0 failed on iPhone 17 Pro / iOS 26.2 simulator; result bundle
  `ios/build/BeatNoteUITests-1790957454247.xcresult`.
- Xcode emitted its existing post-test `simctl` diagnostics warning without failing XCTest.

**Not verified / known gaps:**

- Physical-device interruption/share acceptance and pixel-level review across iPhone sizes remain open.
- The earlier overview-drag timeout did not reproduce; no test or app change was made for it.

**Next agent should:**

- Implement and review Phase 1 pure wrapped-row utilities and tests before changing the store or UI.

### 2026-10-02 — Specify wrapped waveform canvas (planning only)

**Agent:** orchestrator (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** Wrapped waveform canvas → To Do (new planned feature; spec authored)

**Changed:**

- Authored a new Design-First feature spec under `.kiro/specs/wrapped-waveform-canvas/`
  (`design.md`, `requirements.md`, `tasks.md`) replacing the single long waveform with a wrapped,
  score-like timeline while retaining the continuous waveform as a precision detail mode.
- Design grounds all layout in pure utilities (`rowLayout.ts`, `timelineMapping.ts`) with a
  half-open `[startMs, endMs)` boundary-ownership invariant; adds only derived row geometry (never
  persisted) and a small set of new single-store fields (`primaryView`, `countSize`, `rowDensity`,
  `followPlayhead`, `loopStartMs/loopEndMs`, `selectedRowIndex`).
- Added the planned-feature card to the Kanban To Do column.
- No application code changed; this is a specification/planning artifact only.

**Key Artifacts** (new, from `git status`): `.kiro/specs/wrapped-waveform-canvas/design.md`,
`.kiro/specs/wrapped-waveform-canvas/requirements.md`,
`.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`.kiro/specs/wrapped-waveform-canvas/.config.kiro`, `AGENTS.md`.

**Verified:**

- `validate_spec_format` → 0 issues for `requirements.md`, `design.md`, and `tasks.md`.
- Spec grounded in the real code (store, `WaveformCanvas`, `TimelineScrollbar`, `useWaveformData`,
  gesture config, `STEM_SEPARATION_UI_ENABLED`), read before writing.
- Subsequent whole-tree pre-commit checks: `npx tsc --noEmit` → clean;
  `npm run test:unit -- --runInBand` → 26 passed; elevated
  `PLAYWRIGHT_PORT=8082 npm test -- --reporter=list` → 60 passed.
- `npm run test:ios:ui` → 8 passed and 1 failed on iPhone 17 Pro / iOS 26.2; focused rerun
  reproduced `testLongTrackOverviewTapAndDragSeek` timing out at `BeatNoteUITests.swift:147`.

**Not verified / known gaps:**

- The wrapped waveform feature is specified but not implemented.
- The committed pre-existing mobile-layout work does not have a fully green iOS UI gate: overview
  drag seeking failed to update the playback label within five seconds in both the full and focused
  simulator runs. The other eight iOS UI tests passed; Xcode also emitted its existing post-test
  `simctl` diagnostic warning.
- Unresolved product decisions: final density presets, exact detail-panel geometry on tablets,
  whether `countSize` ships with this feature or the separate 8-count task, and whether A/B loop
  state (`loopStartMs/loopEndMs`) is introduced here or by the section-looping task.
- Pre-existing uncommitted working-tree changes (unrelated prior work) were preserved untouched.

**Next agent should:**

- Begin Phase 1 of `.kiro/specs/wrapped-waveform-canvas/tasks.md` (pure `rowLayout.ts` +
  `timelineMapping.ts` with unit/property tests) behind the existing unified-waveform structure.

### 2026-10-02 — Re-sequence monetisation and stem separation

**Agent:** orchestrator (Codex GPT-6) · **Commit(s):** `uncommitted`
**Kanban moved:** Demucs stem separation → Deferred V2.x/V3; release and monetisation roadmap → Done

**Changed:**

- Added a durable release roadmap defining the complete Lite baseline, V1 entitlement groundwork,
  V2 Pro launch, V2.x cloud stem beta, and V3 on-device/hybrid stem path.
- Parked all unfinished Demucs work while preserving its completed types, store/cache foundation,
  tests, requirements, and design.
- Revised the future cloud architecture to keep service credentials behind a managed backend and
  treat compute credits separately from local Pro capabilities.
- Reordered the live board around physical-device acceptance, unit coverage, and the core
  choreography/rehearsal workflow.

**Key Artifacts** (from `git diff --name-only`): `.kiro/specs/demucs-stem-separation/design.md`,
`.kiro/specs/demucs-stem-separation/requirements.md`, `.kiro/specs/demucs-stem-separation/tasks.md`,
`.kiro/steering/architecture-decisions.md`, `.kiro/steering/project-overview.md`,
`.kiro/steering/release-roadmap.md`, `.kiro/steering/stem-separation.md`, `AGENTS.md`, `README.md`,
`docs/context/archive/beatnote-project-history.md`.

**Verified:**

- Documentation links and roadmap references reviewed; `git diff --check` and the project contract
  checker pass.
- No application code or entitlement behavior changed.

**Not verified / known gaps:**

- Lite/Pro limits, App Store products/prices, purchase provider, cloud provider economics, model
  licensing, stem quality, latency, and physical-device CoreML performance remain product or
  technical validation work.

**Next agent should:**

- Complete physical-device acceptance, then close the required unit-coverage gaps before starting
  V1 entitlement groundwork or additional core choreography features.

### 2026-10-01 — Close mobile iOS acceptance defects

**Agent:** orchestrator (Codex GPT-6) · **Commit(s):** `9fffab3`
**Kanban moved:** iOS mobile acceptance defects → Done; physical-device acceptance remains In Progress

**Changed:**

- Made the overview timeline seek on tap and drag, and resized it to its measured width.
- Kept a newly added marker selected for annotation while playback advances; made the project toolbar respond to taps while the annotation keyboard is open.
- Replaced the wrapping mobile toolbar with a fixed horizontal action row and bottom control dock; corrected waveform height/width and mobile safe-area padding.
- Added a 150-second audio fixture and iOS UI coverage for overview seeking, live annotation, and landscape CSV actions; documented the manual simulator path.

**Key Artifacts** (from `git diff --name-only`, plus the new fixture): `.gitignore`, `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `playwright.config.ts`, `scripts/ios-ui-test.js`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/components/controls/projectControls.ts`, `src/styles/layout/mainContent.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/long-test-track.m4a`.

**Verified:**

- `npm run test:ios:ui` → 9 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790818599021.xcresult`.
- Focused save/relaunch/restore XCTest passed with the annotation keyboard open.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `PLAYWRIGHT_PORT=8082 npm test -- --reporter=list` → 60 passed; `git diff --check` → clean.
- `git push origin master` → `origin/master` advanced to `9fffab3`; working tree clean after the implementation commit.

**Not verified / known gaps:**

- Physical iPhone audio interruptions, visual rotation/safe-area quality, and sharing to a real external destination remain manual acceptance checks. Simulator geometry assertions do not prove pixel-perfect layout on every device.
- Xcode emits existing dependency/module-cache and post-test `simctl` diagnostics despite all nine XCTest cases passing.
- The implementation commit and long-track fixture are pushed; physical-device acceptance is still pending.

**Next agent should:**

- Run physical-device acceptance, then close the unit-coverage gaps before advancing native stem separation.

### 2026-10-01 — Enable and verify iOS background playback

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Simulator background-playback acceptance → Done; physical-device acceptance remains In Progress

**Changed:**

- Enabled iOS background audio capability and configured Expo Audio to play in silent mode and continue while the app is backgrounded.
- Added a 30-second AAC fixture and an XCTest that confirms the playback clock advances across a background/foreground transition; made annotation-field UI testing wait for the rendered value before saving.
- Documented simulator coverage and real-device interruption gaps in `.kiro/steering/ios-testflight.md`.
- **Workflow conflict resolved:** `AGENTS.md` had 20 live completed cards, while `~/.codex/skills/local-agent-orchestrator/references/lifecycle.md` defaults to five; archived 16 older cards and the oldest handover in `docs/context/archive/beatnote-project-history.md`. Preserved the explicit 10-entry log cap from `AGENTS.md`.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `app.json`, `scripts/ios-ui-test.js`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/hooks/useAudioPlayer.ts`, `tests/ios/BeatNoteUITests.swift`, `docs/context/archive/beatnote-project-history.md`; `tests/fixtures/background-audio.m4a` is ignored by the repository's media pattern and must be force-added.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test -- --reporter=list` → 60 passed; initial sandbox run could not bind Expo's web server, elevated rerun passed.
- `npm run test:ios:ui` → 6 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790790644556.xcresult`.
- Focused background-playback XCTest → passed; `git diff --check` → clean.
- `python3 ~/.codex/skills/local-agent-orchestrator/scripts/validate_contract.py <project-root>` → 0 contract errors before board compaction.

**Not verified / known gaps:**

- Real-device call/audio-route interruptions and external-destination sharing remain manual acceptance checks.
- Xcode emits existing dependency/module-cache diagnostics and a post-test `simctl` lookup warning; XCTest reports all six cases Passed.

**Next agent should:**

- Run physical-device audio interruption and external-share acceptance, then return to the unit-coverage gap.

### 2026-09-30 — Fix iOS timeline gestures and compact phone controls

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Native timeline gesture errors + phone control sizing → Done; physical-device acceptance remains In Progress

**Changed:**

- Routed tap/pan callbacks that access Zustand or React state through the JS thread, and constrained pans to horizontal movement so vertical page scrolling can reach the overview timeline.
- Made phone detection orientation-aware on native platforms while preserving width-based web breakpoints; reduced mobile transport/marker controls to 52-point targets and tightened project actions.
- Added a landscape iOS UI test covering waveform and overview timeline tap/drag, absence of the runtime error screen, and compact control dimensions.

**Key Artifacts** (from `git diff --name-only`): `AGENTS.md`, `src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/SimpleWaveform.tsx`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/markerButton.ts`, `src/styles/components/controls/projectControls.ts`; `tests/ios/BeatNoteUITests.swift` is present as an untracked file in `git status`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test -- --reporter=list` → 60 passed across 5 Playwright specs.
- `npm run test:ios:ui` → 5 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790758734538.xcresult`.
- The landscape XCTest tapped and dragged both gesture surfaces and asserted the runtime error screen was absent; `git diff --check` → clean.

**Not verified / known gaps:**

- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- Xcode still prints module-cache/debugger diagnostics and a post-test `simctl` diagnostic warning; XCTest passes despite these host-tooling warnings.

**Next agent should:**

- Complete the physical-device acceptance checklist, then return to the remaining unit-coverage and Demucs work.

### 2026-09-30 — Rerun automated regression gates

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Automated regression gates → reverified; physical-device acceptance remains In Progress

**Changed:**

- Verification-only rerun; no implementation or test source files were changed. Updated this handover with current results and the native-runtime warning discovered after app relaunch.
- Relaunched BeatNote in the iPhone 17 Pro simulator and left Metro serving for manual acceptance.

**Key Artifacts** (from `git diff --name-only`): `AGENTS.md` (verification record; source changes remain from prior uncommitted work).

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test` → 60 passed across 5 Playwright spec files.
- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790748329968.xcresult`.
- Metro status endpoint → `packager-status:running`; simulator screenshot confirms BeatNote Studio renders after relaunch.

**Not verified / known gaps:**

- Metro logs Reanimated worklet errors for `setViewportLocked`, `setViewportStartTime`, and `dispatchSetState` on the UI thread. `TimelineScrollbar` pan callbacks call Zustand setters directly; waveform scrubbing needs investigation because XCTest does not cover this gesture path.
- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- Xcode emitted a post-test diagnostic that it could not find `simctl`; the XCTest result bundle reports all four cases Passed.

**Next agent should:**

- Investigate/fix the native TimelineScrollbar worklet callback errors, verify waveform scrubbing, then continue physical-device acceptance.

### 2026-09-29 — Repair web regressions and verify the clean iOS picker path

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Playwright regression failures → Done; clean-simulator Files picker → Done; physical-device acceptance remains In Progress

**Changed:**

- Replaced ambiguous marker/layer text queries with stable test IDs, loaded the audio fixture through the real picker flow, and aligned responsive/accessibility checks with actual touch behavior.
- Exposed the marker button's native/web accessibility role, label, and disabled state.
- Updated XCTest Files navigation to browse `On My iPhone > BeatNote` when the simulator's Recents list is empty.
- Documented the Xcode 27 Device Hub workflow and Expo CLI Simulator-app limitation.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `src/components/ui/controls/HorizontalLayerSelector.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `tests/setup.ts`, `tests/core-functionality.spec.ts`, `tests/quality-assurance.spec.ts`, `tests/test-discovery.spec.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test` → 60 passed across 5 Playwright spec files.
- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790673519618.xcresult`.
- `git diff --check` → clean.
- Xcode 27 Cmd+R built and launched BeatNote on iPhone 17 Pro; Metro bundled 2,957 modules and a simulator screenshot confirmed the Studio screen rendered.

**Not verified / known gaps:**

- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- `npm run ios -- --device 'iPhone 17 Pro'` stops with `Can't determine id of Simulator app`; use the Xcode 27 workspace Run action and Device Hub on this host.
- Native dependency deprecation/nullability warnings remain; they did not fail the iOS UI suite.

**Next agent should:**

- Complete the physical-device acceptance checklist, then address the missing utility/store unit-test coverage before advancing native stem separation.

### 2026-09-24 — Make iOS project workflow reachable and automate restore

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Mobile layout blocker → Done; save/relaunch/restore acceptance → Done

**Changed:**

- `StudioScreen.tsx`, `MainContent.tsx`, and layout styles: removed the nested outer scroll view,
  use the full phone viewport when the overlay sidebar is closed, pin project controls while scrolling,
  stack transport/marker controls on narrow screens, and prevent the annotation field from flexing
  beyond the visible mobile content.
- `SidebarToggle.tsx`, `ProjectControls.tsx`, and `AnnotationField.tsx`: expose stable sidebar test IDs,
  provide a drawer-reopen control, use compact wrapping project controls, and size annotations for mobile.
- `BeatNoteUITests.swift`: run acceptance in portrait, close the overlay sidebar, enter an annotation,
  save a project, terminate/relaunch, load the project, verify its marker/annotation/audio state, and
  delete the temporary project.
- `.kiro/steering/ios-testflight.md`: document current automated coverage and remaining physical
  device checks.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`,
`src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`,
`src/components/ui/controls/SidebarToggle.tsx`, `src/components/ui/controls/ProjectControls.tsx`,
`src/components/ui/controls/AnnotationField.tsx`, `src/styles/features/studioScreen.ts`,
`src/styles/layout/mainContent.ts`, `src/styles/components/controls/projectControls.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro, iOS 26.1 simulator; includes drawer open/close,
  project round-trip, valid/invalid import, and share-sheet export.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `git diff --check` → clean.
- `EXPO_NO_TELEMETRY=1 npm test` → 52 passed, 8 failed; older checks have stale marker, responsive,
  and sidebar expectations. These web failures were not repaired as part of iOS hardening.
- Result bundle: `ios/build/BeatNoteUITests-1790233343129.xcresult`.

**Not verified / known gaps:**

- Physical-device audio behavior, waveform scrubbing, background interruptions, and sharing to an
  external app remain manual acceptance checks.
- The Playwright suite is not a clean regression gate yet; its 8 failing checks need separate review.
- Xcode reports a post-test simulator diagnostics `simctl` lookup warning and UIKit UIScene lifecycle
  deprecation warnings; the XCTest run itself passes.

**Next agent should:**

- Complete physical-device audio/scrub/background/share acceptance. Separately update stale Playwright
  assumptions and expand unit coverage before advancing the Demucs native interface.

### 2026-09-24 — Add repeatable iOS XCTest acceptance workflow

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Automated iOS acceptance tests → Done; core iOS acceptance → In Progress

**Changed:**

- `plugins/withIosUiTests.js`, `app.json`, `package.json`, `package-lock.json`: generate a
  `BeatNoteUITests` Xcode target and shared scheme on Expo prebuild; add `npm run test:ios:ui`.
- `scripts/ios-ui-test.js`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/`: automate simulator
  build, Metro startup, fixture staging, launch, audio playback, annotation, CSV import validation,
  and share-sheet export. Results are saved as ignored `.xcresult` bundles.
- `src/hooks/useScrollZoom.ts`: guard the web-only DOM event hookup from native views. XCTest found
  the `element.addEventListener is not a function` startup crash previously seen in the simulator.
- Added test IDs to interactive controls and enabled loading saved projects when no audio is loaded.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`,
`App.tsx`, `app.json`, `package-lock.json`, `package.json`, `src/components/layout/MainContent.tsx`,
`src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`,
`src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/AudioControls.tsx`,
`src/components/ui/controls/LayerControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`,
`src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`,
`src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`,
`src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectModal.tsx`,
`src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`,
`src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`,
`src/hooks/useAudioPlayer.ts`, `src/hooks/useScrollZoom.ts`, `src/hooks/useStudioStore.ts`,
`src/styles/components/controls/timelineScrollbar.ts`, `tests/fixtures/test-audio.wav`,
`plugins/withIosUiTests.js`, `scripts/ios-ui-test.js`, `tests/fixtures/invalid-import.csv`,
`tests/fixtures/valid-import.csv`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro, iOS 26.1 simulator.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `git diff --check` → clean.
- Xcode 27 rebuild and XCTest result bundle at `ios/build/BeatNoteUITests-1790230527899.xcresult`.

**Not verified / known gaps:**

- Save/relaunch/restore remains manual: focusing the annotation field scrolls project controls out of
  view, and the project controls are clipped in portrait. UI layout needs keyboard/scroll hardening.
- Physical-device audio, scrubbing, background interruptions, and sharing to an external destination
  are not covered by simulator automation. Xcode logs a simulator diagnostics warning after tests,
  but the XCTest result itself passes.

**Next agent should:**

- Fix the mobile nested-scroll/keyboard layout so project controls remain reachable, then add project
  save/relaunch/restore back to the UI suite and complete a physical-device acceptance pass.

### 2026-09-24 — Partial iOS workflow acceptance; restore project audio

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** iOS core workflow acceptance → In Progress (simulator UI interaction unavailable)

**Changed:**

- `src/components/ui/controls/TimelineScrollbar.tsx`: removed an unused lowercase web-SVG `<defs><clipPath><rect>` block that crashed React Native SVG when rendering the iOS studio; screenshots and Metro logs identified this as the load-screen error.
- `src/hooks/useStudioStore.ts`, `src/hooks/useAudioPlayer.ts`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/layout/MainContent.tsx`, `src/features/studio/StudioScreen.tsx`: loading a saved project now routes its saved audio URI and original filename into the audio player. Previously project data restored but the player remained unset.
- `AGENTS.md`, `.kiro/steering/ios-testflight.md`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, `plugins/withIosPodDeploymentTarget.js`, and the iOS-safe layout/SVG files under `src/`: local simulator baseline, earlier TypeScript fixes, and this acceptance pass remain uncommitted in the shared worktree.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `App.tsx`, `app.json`, `package-lock.json`, `package.json`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/LayerControls.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/timelineScrollbar.ts`; `plugins/withIosPodDeploymentTarget.js` is new and untracked.

**Verified:**

- Xcode 27 built and launched the app in the iPhone 17 Pro simulator; Metro bundled the app and the studio screen rendered.
- The supplied simulator screenshot and Metro stack trace pinpointed the lowercase SVG tags in `TimelineScrollbar`; removed them. Metro is running in normal development mode at port 8081 for simulator reload.
- `npx tsc --noEmit` → clean.
- `npm run test:unit -- --runInBand` → 26 passed, 2 suites.
- `git diff --check` → clean.

**Not verified / known gaps:**

- Simulator UI taps are unavailable through the exposed computer-control surface, so document-picker audio load, playback/scrub, markers, save/relaunch, import, and share-sheet export were not interactively exercised.
- Physical-device behavior and `npm test` Playwright E2E were not run. Cached audio URI availability after OS cache eviction remains a risk for saved projects.

**Next agent should:**

- Complete the iOS core workflow acceptance checklist interactively in Simulator or on an iPhone, especially project reload and Files/share interoperability; fix any defects before starting native stem-separation work.

### 2026-09-23 — Restore clean TypeScript gate

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Fix pre-existing `tsc` errors → Done

**Changed:**

- `LayerControls.tsx`: replaced imports for nonexistent custom layer icons with the established
  `lucide-react-native` icon set already used by `StemsView`.
- `timelineScrollbar.ts`: replaced the unsupported `ew-resize` React Native cursor value with the
  typed `pointer` cursor for interactive resize handles.
- `AGENTS.md`: promoted TypeScript checking into the standard build gate and reconciled the live
  stem-separation status.

**Verified:**

- `npx tsc --noEmit` → clean, no TypeScript errors.
- `npm run test:unit` → 26 passed, 2 suites.

**Not verified / known gaps:**

- Playwright E2E and visual cursor behavior were not run this session.

**Next agent should:**

- Continue the In Progress stem separation work with the native module TypeScript interface.

### 2026-08-28 — Markdown lint clean-up and hook migration to v2

**Agent:** orchestrator (Claude Opus 4.8) · **Commit(s):** `9dde5f2`
**Kanban moved:** Repo hygiene & tooling items → Done

**Changed:**

- `design.md`: fixed all 25 markdown lint findings (emphasis-as-heading `**Validates:**` labels,
  blank lines around lists/headings, fenced-block languages). Formatting only — no content change.
- Migrated all 5 agent hooks from legacy `.kiro/hooks/*.kiro.hook` (v1 `when`/`then`) to v2
  `.kiro/hooks/*.json` (`trigger`/`action`). Deleted the 5 legacy files.
- Corrected the stale Jest flag in the test hook (`--testPathPatterns`) and scoped `update-live-docs`
  to durable steering/README only, leaving AGENTS.md to the orchestrator.

**Verified:**

- `mdlint.py` across all 12 repo `.md` files → 0 findings.
- All 5 v2 hook JSON files parse as valid JSON; `.kiro/hooks/` now contains only the v2 files.
- `git diff design.md` reviewed → purely whitespace/formatting.

**Not verified / known gaps:**

- Hooks are declared but not fired this session — v2 hooks activate on next session start.
- `ts-check-on-save` will report the known pre-existing `tsc` errors on every save until the
  "Fix pre-existing tsc errors" To Do item is done.

**Next agent should:**

- Continue the In Progress stem separation work (native module TS interface, spec task 3).

### 2026-08-28 — Board initialised; pending work committed

**Agent:** orchestrator (Claude Opus 4.8) · **Commit(s):** `570078c` (pending work), `797f20b` (board + docs)
**Kanban moved:** n/a — board initialised

**Changed:**

- Committed all pending working-tree changes as `570078c` (platform-split export engine, stem
  separation types + cache, demucs spec, Jest unit setup, app.json/eas.json) for a clean baseline.
- Created `AGENTS.md` as the dynamic handover orchestrator with a Context Map pointing to
  `.kiro/steering/` and the active spec (committed in `797f20b`).
- Reconciled documentation in `797f20b`: split README Features into "Available now" vs "Planned"
  so unbuilt features are no longer implied shipped; fixed stale demucs spec checkboxes (tasks 1.1,
  2, 2.1 done). Noted the `stemCache` hash deviates from the spec (FNV-1a, not SHA-256/js-sha256).

**Verified:**

- `npx jest --testPathPatterns=unit` → 26 passed, 2 suites.
- `git status` → working tree clean after commit `570078c`.
- Done column seeded from `src/` reads and git history; To Do seeded from the demucs spec tasks,
  `.kiro/steering/` planned features, and the testing-strategy coverage requirements.

**Not verified / known gaps:**

- `npx tsc --noEmit` fails on two pre-existing errors (LayerControls icon exports, timelineScrollbar
  cursor) that predate this session — typecheck is not yet a clean gate.
- Playwright E2E (`npm test`) was not run this session.
- Choreography features and stem separators are confirmed absent by grep, not by exhaustive read.

**Next agent should:**

- Pick up the In Progress item: write `stemCache` property tests (spec task 2.1), then implement the
  native module TS interface (spec task 3).
