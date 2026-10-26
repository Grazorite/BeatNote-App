# BeatNote Project History

This archive preserves completed work and older handover entries moved out of the live board to
keep `AGENTS.md` concise. Archived checklist items and handover entries are copied verbatim.

## Archived Completed Work

- [x] Complete local implementation, retained automation, simulator accessibility review, and
      durable documentation for `local-music-library-queue`, including consistent Project Manager
      action alignment and deterministic per-case native fixture isolation
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/`, `.kiro/steering/architecture-decisions.md`, `.kiro/steering/ios-testflight.md`, `.kiro/steering/project-overview.md`, `.kiro/steering/testing-strategy.md`, `scripts/ios-ui-test.js`, `src/components/ui/`, `tests/`</sub>

- [x] Extend the retained browser journeys across project save/copy, newest-project restoration,
      draft-preserving switches, CSV replace/undo, legacy relink, queue transport, and toolbar order
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/features/library/draftAutosave.ts`, `tests/setup.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add reproducible iOS audio document declarations and an autolinked native Open_In bridge with
      retained cold-launch URLs, serialized import/switch handling, and focused simulator coverage
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/design.md`, `.kiro/specs/local-music-library-queue/tasks.md`, `app.json`, `plugins/withAudioDocumentTypes.js`, `modules/library-storage/expo-module.config.json`, `modules/library-storage/ios/LibraryStorageModule.swift`, `modules/library-storage/src/index.ts`, `modules/library-storage/src/index.web.ts`, `scripts/ios-ui-test.js`, `src/features/library/useLibraryLifecycle.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Restructure the Project Manager around the current song and move CSV import/export out of the
      toolbar into confirmed, reversible project actions
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/CsvReplaceConfirm.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectPrompt.tsx`, `src/components/ui/projects/ProjectRow.tsx`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/modals/csvReplaceConfirm.ts`, `src/styles/components/modals/projectManagerModal.ts`, `src/utils/projectNames.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Restore Music Library presentation in iPhone landscape and remove the playback-time render
      storm that delayed waveform and control interactions
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Add rename/delete/relink/Show Projects library actions and replace the legacy load-song path
      with the accessible Song Title control, filtered project routing, ordered queue announcements,
      and updated browser/native journeys
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/SongTitleControl.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/features/library/importPipeline.ts`, `src/features/library/libraryActions.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useAudioPlayer.ts`, `src/styles/components/controls/songTitleControl.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/setup.ts`, `tests/test-helpers.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Build the accessible Music Library sheet with reusable rows and overflow actions, scroll-safe
      loading/empty/error/search/sort states, persisted sorting, guarded track switching, import
      progress/cancellation/retry, and native/web audio-picker ingestion
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/OverflowMenu.tsx`, `src/components/ui/library/`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/features/library/importPipeline.ts`, `src/features/library/repositories.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/common/overflowMenu.ts`, `src/styles/components/library/`</sub>

- [x] Extend the shared icon family and add the accessible detented bottom-sheet primitive with
      Reduce Motion, safe-area/keyboard/rotation handling, focus restoration, and web focus trapping
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/index.ts`, `src/styles/components/common/bottomSheet.ts`, `src/utils/sheetDetent.ts`</sub>

- [x] Replace the reserved dock cells with queue navigation and Shuffle, then gate dependent
      playback surfaces against provider capabilities without regressing the direct-file transition
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/controls/RepeatControl.tsx`, `src/features/library/sourceResolver.ts`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/dockButton.ts`, `src/styles/layout/mainContent.ts`</sub>

- [x] Add all-or-nothing track switching, the dirty-project switch guard, rapid destination
      coalescing, directional failure skipping, launch restoration, and project/import routing
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/trackSwitch.ts`, `src/features/library/useLibraryLifecycle.ts`, `src/features/library/projectService.ts`, `src/features/library/importPipeline.ts`, `src/features/library/repositories.ts`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Add safe Save, Save as New, revision/name conflict handling, project rename/delete/open/revert,
      stored/current CSV export, accessible save prompts, and the V1.2 Project Manager cutover
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/ConfirmDialog.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectPrompt.tsx`, `src/utils/exportEngineCore.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add per-song draft autosave with bounded latency, background flushing, foreground retry,
      persistent read/write/storage failure recovery, and cross-service dock notices
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/draftAutosave.ts`, `src/features/library/repositories.ts`, `src/features/library/useLibraryLifecycle.ts`, `src/components/ui/common/PersistenceBanner.tsx`, `src/components/layout/MainContent.tsx`</sub>

- [x] Add the serialized local-library boot lifecycle, resumable migration hydration, missing-file
      reconciliation, queue restoration, Retry locking, and protected orphan sweep
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/useLibraryLifecycle.ts`, `src/features/library/repositories.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Add the local music library, draft/project, queue, and switch slices; atomically apply track
      state; and move the active audio URI and transitional filename into the store
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/repositories.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Standardise the loop overview with the wrapped timeline palette and distinguish overview and
      canvas playheads using a shared amber core, dark underlay, and triangular cap
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/requirements.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `tests/waveform-features.spec.ts`</sub>

- [x] Standardise real waveform extraction between the web build and native iOS, replacing native
      synthetic peaks with an AVAssetReader Expo module and keeping resolution behind a
      capability-ready provider boundary for a future Lite/Pro distinction
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/`, `.kiro/steering/architecture-decisions.md`, `.kiro/steering/release-roadmap.md`, `modules/beatnote-waveform/`, `package.json`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/hooks/useWaveformData.ts`, `src/services/waveformExtraction*`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Keep the playback-speed popup above the central Play control and make the first Speed press
      during or immediately after dismissal reopen it without a dead tap
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/controlDock.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Add reusable CSV preview/replace/undo and legacy migration planning transforms, and enforce
      version 1.0.0 parity across package metadata, Expo/Metro, and generated iOS development builds
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `.kiro/steering/ios-testflight.md`, `app.json`, `package.json`, `plugins/withVersionConsistency.js`, `scripts/check-version-consistency.js`, `src/utils/csvReplace.ts`, `src/utils/importEngine.ts`, `src/utils/migrationPlan.ts`</sub>

- [x] Stabilise direct playback-speed dragging, replace abrupt popup removal with an interruptible
      collapse/fade, remove redundant speed feedback, and keep loaded-song Annotation actionable
      with marker-prerequisite guidance
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Implement pitch-preserved playback speed from 0.5×–2× in 0.05× increments, with an adjustable
      popup slider, common presets, reset, project persistence, and responsive accessibility
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `.kiro/steering/architecture-decisions.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/ios-testflight.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/playbackSpeedControl.ts`, `src/types/project.ts`, `src/utils/playbackSpeed.ts`, `src/utils/projectManager.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Replace the Settings sliders glyph with a simple rounded gear in the shared icon family
      <sub>**Key Artifacts:** `src/components/icons/BeatNoteIcon.tsx`</sub>

- [x] Replace mobile Settings and Help with safe full-screen pages, make Help swap in immediately
      without stacking a modal, place Settings at the trailing toolbar edge, use iPhone-style
      right-edge push transitions over the live app without a white host flash, keep Settings Close
      free of back-navigation decoration, remove V1 BPM controls, make CSV action text readable on
      orange, and retain only critical tests
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/testing-strategy.md`, `package.json`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/styles/components/modals/exportModal.ts`, `src/styles/components/screens/helpScreen.ts`, `src/styles/layout/sidebar.ts`, `src/styles/theme.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, removed `tests/unit/`, `tests/core-functionality.spec.ts`, and `tests/quality-assurance.spec.ts`</sub>

- [x] Keep timed annotation callouts readable during playback with a 2-second dwell, 350-millisecond
      fade, successive-annotation replacement, and source-marker editing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/utils/markerSelection.ts`, `tests/unit/markerSelection.test.ts`</sub>

- [x] Establish a typed colour-theme foundation with a registered immutable dark palette, semantic
      contract, compatibility access, and explicit rules for adding palettes and runtime switching
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `src/styles/theme.ts`, `src/styles/common.ts`, `tests/unit/theme.test.ts`</sub>

- [x] Align startup settings, project/audio actions, and CSV import/export with the one-lane V1 UX:
      start with settings closed, distinguish raw audio from saved Projects, expose CSV-only I/O,
      report marker counts instead of hidden layers, and explain the remaining BPM behavior
      <sub>**Key Artifacts:** `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/hooks/useStudioStore.ts`, `src/types/project.ts`, `src/utils/projectManager.ts`, `tests/ui-components.spec.ts`, `tests/unit/projectManager.wrapped.test.ts`, `tests/unit/studioStore.wrapped.test.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Clean up the V1 settings drawer so it exposes only Help & Shortcuts and BPM while preserving
      hidden state and project-schema fields for compatibility
      <sub>**Key Artifacts:** `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/HelpButton.tsx`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Refine the playback/marker dock from simulator feedback: preserve playback across tap/drag
      seeking, add a dedicated landscape rail with a central 2×2 play control, distinguish playlist icons, place annotation below
      the overview in portrait and above the right rail in landscape, keep controls inside device
      safe areas, and unify all feedback above the overview
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/`, `src/components/ui/waveform/`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

### Test & build harness

- [x] Align the active loop-range colour across overview/detail/wrapped canvases and rationalise the
      automated suite around critical behavior coverage
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `.kiro/steering/testing-strategy.md`, `src/components/ui/waveform/WrappedRow.tsx`, `tests/core-functionality.spec.ts`, `tests/quality-assurance.spec.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`; removed `tests/test-discovery.spec.ts`, `tests/unit/rowDensityPresets.test.ts`, and `tests/unit/studioStore.test.ts`</sub>
- [x] Smooth loop-range dragging and separate the clear/restore action from full-song content
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/components/ui/controls/LoopClearControl.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/controls/LoopRangeLayer.tsx`, `src/components/ui/controls/LoopRangeOverview.tsx`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/`, `tests/ui-components.spec.ts`, `tests/unit/studioStore.loop.test.ts`, `tests/waveform-features.spec.ts`</sub>
- [x] Refine loop controls after simulator review — restore mutually exclusive marker/range loops,
      simplify status chrome, use icon-only clear/restore, and apply a complementary teal range palette
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/components/icons/LoopMarkerIcon.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useKeyboardShortcuts.ts`, `src/hooks/useStudioStore.ts`, `src/styles/`, `src/utils/loopRange.ts`, `tests/unit/`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Restrict marker creation to the bottom marker controls; gutter and waveform taps only seek or select
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/ios/BeatNoteUITests.swift`, `tests/waveform-features.spec.ts`</sub>
- [x] Fit the complete song into a fixed, non-scrolling phone waveform with timestamp-only gutters
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/hooks/useWrappedRows.ts`, `src/styles/components/waveform/`, `src/utils/rowLayout.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/unit/rowLayout.test.ts`, `tests/waveform-features.spec.ts`</sub>
- [x] Redesign the phone workspace as a fixed, single-layer canvas with no page/action-row scrolling
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformWorkspace.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/quality-assurance.spec.ts`, `tests/ui-components.spec.ts`</sub>
- [x] Complete wrapped-canvas Phases 14-15 native acceptance and renderer cleanup
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/index.ts`, `tests/ios/BeatNoteUITests.swift`; removed `src/components/ui/waveform/SimpleWaveform.tsx`</sub>
- [x] Implement wrapped-canvas Phase 12 accessibility metadata and stable test identifiers
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>

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

- [x] Implement wrapped-canvas Phase 11 responsive reflow and side-by-side wide detail layout
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/waveform/WaveformWorkspace.tsx`, `src/styles/components/waveform/waveformWorkspace.ts`, `tests/waveform-features.spec.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 10 explicit row-density presets and timestamp-safe reflow
      <sub>**Key Artifacts:** `src/components/ui/waveform/RowDensityControls.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/rowDensityControls.ts`, `src/styles/components/waveform/wrappedWaveform.ts`, `src/utils/rowDensityPresets.ts`, `tests/unit/rowDensityPresets.test.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 9 compact annotation indicators, clustering, and detail-on-tap
      <sub>**Key Artifacts:** `src/utils/annotationClusters.ts`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/unit/annotationClusters.test.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
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

### 2026-10-25 — Finish local music library validation

**Agent:** orchestrator (Codex) + DSH-Qwen durability checks · **Commit(s):** `2754c36`
**Kanban moved:** local-music-library-queue Tasks 42–43, 44.1–44.3, and 45 → Done; Task 44.4 → In Progress

**Changed:**

- Retained seven isolated iOS journeys for picker/import, restoration, loop transport, CSV/share,
  background playback, landscape interaction, and Open_In without relying on a transient toast.
- Exercised draft, switching, migration, quota, crash, and background invariants in 16 temporary
  checks, then removed them in accordance with the repository's temporary-unit-test policy.
- Fixed maximum-Dynamic-Type clipping and aligned Project Manager action icons consistently while
  keeping labels centred; documented ADR-012…ADR-016 and the finished library workflow.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, empty permanent unit gate, JavaScript syntax,
  disabled-test search, `git diff --check`, and Markdown lint → clean.
- Full retained Playwright gate → 6/6 journeys passed, including library persistence and sheet focus.
- Isolated iPhone 17 Pro / iOS 26.2 aggregate → all seven retained native cases passed; the final
  portrait picker/layout rerun also passed after the Dynamic Type and action-alignment fixes.
- Simulator review → portrait, landscape, Music Library, Project Manager, queue controls, and
  maximum accessibility text fit without horizontal overflow after the clipping fixes.

**Not verified / known gaps:**

- Task 44.4 remains: physical Files/third-party Open_In, files over 100 MB, backup/restore, low disk,
  interruptions/routes, force-quit durability, spoken VoiceOver, Reduce Motion touch comfort, and
  rapid queue navigation.
- A final focused landscape rerun stalled in Apple's test runner after returning to the home screen;
  the identical retained landscape journey passed in the preceding isolated aggregate, before the
  subsequent Project-Manager-only alignment change.
- Concurrent wrapped-waveform/playhead edits remain uncommitted and outside `2754c36`.

**Next agent should:**

- Run Task 44.4 on a signed physical iPhone and record the device/iOS result for each acceptance item.

### 2026-10-24 — Complete retained library browser journeys

**Agent:** orchestrator (Codex) + context/DSH reviewers · **Commit(s):** `701f239`
**Kanban moved:** local-music-library-queue Task 41 → Done

**Changed:**

- Expanded the retained project journey through named Save, Save as New, newest-project restore,
  dirty-draft Keep & Switch, confirmed CSV replacement with toast Undo, and seeded legacy relink.
- Expanded the dock journey with three durable audio identities for restart/switch semantics,
  First/Previous/Next, Shuffle, end-of-queue accessibility, and rapid Next coalescing.
- Closed test-discovered product races: Project Manager now yields before showing a save prompt,
  and authored changes update dirty state immediately while durable autosave remains debounced.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, empty permanent unit gate, disabled-test
  search, and `git diff --check` → clean for the completed change.
- Full retained Playwright gate → 6/6 journeys passed, including the concurrent waveform journeys.
- Focused V1 toolbar, dock/queue, and project/CSV/legacy journeys each passed independently.

**Not verified / known gaps:**

- Task 42's expanded native XCTest journeys, physical-device queue/relink/VoiceOver behavior, and
  long-session durability remain unverified.
- Concurrent uncommitted wrapped-waveform/playhead edits remain outside `701f239`.

**Next agent should:**

- Implement Task 42.1 by updating the launch/picker XCTest, then extend the annotation/restore,
  queue transport, settings, and CSV/share native journeys in Tasks 42.2–42.5.

### 2026-10-24 — Complete native audio Open_In delivery

**Agent:** orchestrator (Codex) + DSH-Qwen/local review · **Commit(s):** `af6bfe0`, `79e477e`
**Kanban moved:** local-music-library-queue Phase 9 (Tasks 39–40) → Done

**Changed:**

- Added an idempotent Expo config plugin that preserves the BeatNote Project declaration, declares
  seven audio document types plus OGG/FLAC UTIs, and provisionally disables in-place opening.
- Added an autolinked LibraryStorage app-delegate subscriber with retained pre-observer URLs,
  owner-safe listener transitions, and a web-safe module contract; lifecycle handling now queues
  supported file URLs until library boot completes and routes them through the shared import path.
- Added deterministic `simctl openurl` delivery and focused XCTest assertions for title, toast, and
  retained library row; the unfiltered runner now schedules Open_In separately from ordinary cases.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty unit gate, JavaScript syntax, generated
  Info.plist inspection, and `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.
- Focused iPhone 17 Pro / iOS 26.2 Open_In journey → passed after final observer hardening; result
  bundle `ios/build/BeatNoteOpenInUITest-1792777502768.xcresult`.
- Retained launch/document-picker journey → passed; result bundle
  `ios/build/BeatNoteUITests-1792742530993.xcresult`.

**Not verified / known gaps:**

- Physical Files/third-party delivery, `.beatnote` presentation, security-scoped behavior, and the
  final `LSSupportsOpeningDocumentsInPlace = false` decision remain blocked on device/signing access.
- An unfiltered native-suite attempt reached the split runner but five older picker-driven cases
  failed to find staged Files fixtures in the accumulated simulator state; focused affected cases
  pass, and full-suite isolation/Files state remains a Phase 10 harness concern.
- Concurrent uncommitted wrapped-waveform/playhead edits remain outside both commits.

**Next agent should:**

- Implement Task 41.1 by extending the retained project/import/export Playwright journey, then
  Task 41.2's responsive queue/control coverage.

### 2026-10-23 — Complete Project Manager and CSV relocation

**Agent:** orchestrator (Codex) + implementation agents + DSH audit dispatched · **Commit(s):** `c30d294`
**Kanban moved:** local library Project Manager and CSV relocation → Done (Phase 8 complete)

**Changed:**

- Rebuilt Projects as one safe-area-aware sectioned surface with the current draft, current-song
  projects, all projects, audio-removed grouping, row overflow actions, relink, rename, and delete.
- Added same-song Save & Open and two-step destructive discard/revert guards, while preserving the
  existing cross-song switch guard as the sole owner of cross-song decisions.
- Replaced append-style CSV import with previewed replacement, explicit counts and confirmation,
  single-level Undo, current/stored project export, and removed the two toolbar CSV actions plus
  their dead legacy state and modal.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty retained unit gate, and
  `git diff --check` → clean for the completed change.
- Full retained Playwright gate → 6/6 critical journeys passed, including Project Manager CSV
  preview/cancel and current-project export.
- Focused iPhone 17 Pro / iOS 26.2 launch and document-picker journey → passed; result bundle
  `ios/build/BeatNoteUITests-1792741064585.xcresult`.

**Not verified / known gaps:**

- Physical-device CSV picker/share, VoiceOver traversal, destructive-guard wording, row overflow,
  and Project Manager rotation remain unverified.
- The DSH read-only audit was successfully dispatched but had not returned by this checkpoint.
- Concurrent uncommitted wrapped-waveform/playhead edits remain outside `c30d294`.

**Next agent should:**

- Implement Task 39.1's audio document-type config plugin and preserve `.beatnote` ownership while
  applying the provisional Open_In in-place decision.

### 2026-10-23 — Fix landscape library presentation and interaction latency

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `1c12777`
**Kanban moved:** reported landscape/interaction regressions → Done

**Changed:**

- Declared every supported iPhone orientation on the shared bottom-sheet modal so the Music Library
  can present after rotating to landscape, and extended the retained landscape journey to open it.
- Prevented the 50 ms playback clock from rebuilding the full studio tree by selecting stable marker
  keys, memoizing the main content, stabilizing audio/focus callbacks, and retaining one shared empty
  marker collection for inactive waveform rows.
- Replaced scrub play-state React state with a ref, eliminating an extra gesture-time render and a
  fast-gesture stale-closure race without reducing the 50 ms loop-boundary sampling cadence.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, contract
  validation, and `git diff --check` → clean for the completed change.
- Full retained Playwright gate → 6/6 critical journeys passed.
- Focused iPhone 17 Pro / iOS 26.2 landscape journey → passed, including Music Library presentation;
  result bundle `ios/build/BeatNoteUITests-1792722437057.xcresult`.
- Metro served the updated 1.0.0 bundle on localhost:8081 and the app launched in the booted
  iPhone 17 Pro simulator.

**Not verified / known gaps:**

- Physical-device responsiveness, memory profiling, and long-session soak behavior remain
  unverified; the diagnosed issue was excessive render churn, with no evidence of a memory leak.
- Toolbar CSV actions still await Task 37 relocation, so portrait title space remains constrained
  until the Project Manager replacement is complete.
- Concurrent uncommitted wrapped-waveform/playhead edits remain outside `1c12777`.

**Next agent should:**

- Implement Task 36.3's sectioned Project Manager, then Task 36.4 and Task 37 so CSV actions can be
  removed from the toolbar without stranding import/export.

### 2026-10-22 — Complete library actions and Song Title navigation

**Agent:** orchestrator (Codex) + local review agents · **Commit(s):** `1094996`, `eed382f`, `ad064e2`, `ca2e56c`, `7ef938d`
**Kanban moved:** Music Library row actions and Song Title toolbar → In Progress (Tasks 34–35 complete)

**Changed:**

- Added identity-preserving rename, file-first safe deletion, retained missing-audio drafts and
  projects, confirmed relink, and per-song Show Projects routing without changing queue position.
- Replaced the direct load-song shim with a one-line accessible Song Title control that hosts the
  mounted library sheet, shows missing state, and keeps Save available for editable missing-audio
  drafts.
- Centralized queue-origin title announcements at successful transaction commit so Skip and rapid
  coalescing announce in commit order; added routed modal focus handling and race-safe native waits.
- Began Task 36 with accessible, large-text-safe `CurrentProjectSection` and `ProjectRow` primitives,
  including exact action identifiers, disabled/read-only/missing states, overflow actions, and named
  destructive project deletion confirmation.
- Preserved the toolbar CSV buttons until Task 37.4. This resolves the sequencing conflict between
  `.kiro/specs/local-music-library-queue/requirements.md` Requirement 8.1/8.9 (final four actions)
  and `.kiro/specs/local-music-library-queue/tasks.md` Task 37.4 (explicit removal owner) while the
  retained CSV journeys still target those buttons.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, legacy-loader
  search, and `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed with durable WAV import.
- Focused iPhone 17 Pro / iOS 26.2 simulator launch/picker journey → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792679367535.xcresult`.
- Local reviewer found announcement, focus, and native-wait races; all were corrected and the
  resulting TypeScript/diff checks passed. The requested DSH bridge remained unavailable.
- Task 36.1–36.2 component checkpoints → `npx tsc --noEmit`, version parity, and scoped diff checks
  clean; the components are not mounted until Task 36.3.

**Not verified / known gaps:**

- The focused XCTest passed before its final filename-specific wait was hardened; that test-only
  change was not rebuilt after review. Physical-device picker/import, VoiceOver, sheet gestures,
  keyboard/search, row-action failure paths, and relink remain unverified.
- Toolbar CSV actions intentionally remain until Task 37.4; therefore the final Requirement 8.1
  four-action layout is not yet complete.
- Concurrent uncommitted waveform/playhead edits remain outside all four commits.

**Next agent should:**

- Implement Task 36.3 by replacing the current Project Manager with the single sectioned surface,
  then add the same-song open/revert guard in Task 36.4.

### 2026-10-22 — Add icons and accessible bottom sheet

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `721e004`, `4bf2c9b`
**Kanban moved:** local library icons and bottom sheet → In Progress (Tasks 31–32 complete)

**Changed:**

- Added the seven missing shared glyphs and verified the complete nine-icon set remains distinct at
  18 px without colour; existing chevron-down and warning glyphs were retained.
- Added the pure sheet-detent resolver and a reusable liquid-glass BottomSheet with medium/large
  detents, header-only pan, animated dismissal, safe areas, keyboard expansion, and rotation refits.
- Added live Reduce Motion handling, accessible detent switching and Close, title/return focus,
  web Tab/Shift-Tab trapping, Escape dismissal, and cancelled-pan recovery.

**Verified:**

- Temporary detent property checks → 3/3 passed, then removed per policy.
- Chromium icon grid → all nine glyphs legible and distinguishable at exactly 18 px.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- The primitive is not mounted until the Music Library surface lands, so real sheet drag, keyboard,
  focus, VoiceOver, and rotation behavior still require integrated simulator and physical checks.
- The DSH bridge was unavailable in this Codex session; local Ollama and the configured Qwen model
  were available, so implementation continued in Codex after the required preflight report.
- Concurrent uncommitted waveform/playhead edits remain outside both commits.

**Next agent should:**

- Implement Task 33.1 OverflowMenu, then Task 33.2 MusicLibraryRow and ImportProgressRow.

### 2026-10-18 — Build project and draft persistence foundations

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `0c0e0f0`, `1e0fa29`
**Kanban moved:** local library project/draft foundations → In Progress

**Changed:**

- Added the V1.2 saved-project, persisted-content, and per-song draft contracts while keeping the
  legacy `BeatNoteProject` shape and load path intact; moved `LayerId` to the shared project domain
  and re-exported it from the store for compatibility.
- Added pure extraction/application and project-envelope mapping that preserve unknown top-level,
  settings, and layer fields, plus canonical serialisation and versioned 106-bit content fingerprints.
- Added invalid-record isolation for every library storage family, the six-rule song-load resolver,
  dirty/switch/save planning helpers, and project-name/export/grouping decisions.
- Preserved a concurrent installed `expo-dev-client` addition as the separate dependency commit
  `1e0fa29`; DSH-Qwen review and validator delegations were cancelled after they stalled without
  output or file changes.

**Verified:**

- Temporary focused unit checks → 17/17 passed across fingerprint, persisted-content round trip,
  draft resolution, validation isolation, and name/grouping behavior; files were then removed per
  the temporary-test policy.
- `npx tsc --noEmit`, `git diff --check`, Markdown lint for the updated task list, and the empty
  permanent unit command → clean.
- Elevated retained Playwright gate on port 8082 → 6/6 critical journeys passed.

**Not verified / known gaps:**

- The new pure utilities are not wired to repositories, autosave, track switching, or UI yet.
- Physical-device Open-in delivery and all existing hardware acceptance items remain pending.
- Native prebuild/autolinking was not rerun specifically for the concurrent `expo-dev-client` addition.

**Next agent should:**

- Implement Task 9.1 CSV preview/replace transforms, then continue into the persistence pipeline and
  repositories that consume these validated records.

### 2026-10-18 — Start local music library foundations

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `d7e9e2a`
**Kanban moved:** `local-music-library-queue` Phase 0 and non-overlapping Phase 1 work → In Progress

**Changed:**

- Reconciled the new spec with the shipped playback-speed ADR: provider/library decisions now use
  ADR-012 through ADR-016, local pitch-preserving speed remains supported, and `ImportJobView` is
  defined instead of referenced implicitly.
- Added the library, queue, migration, CSV-import, and shared-constant type foundations, plus pure
  queue/sort/search/shuffle/navigation and import/duplicate/relink/orphan decision utilities.
- Ran the OQ-4 spike in an isolated app ID and recorded a provisional
  `LSSupportsOpeningDocumentsInPlace = false` decision in the design. The disposable app and build
  directory were removed afterwards.
- DSH-Qwen audited the Open-in surface successfully. Its isolated queue implementation failed twice
  without producing a file; Codex cancelled it and implemented/reviewed the utility directly.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and Markdown lint for the changed spec files → clean.
- Elevated full retained Playwright gate on port 8082 → 6/6 critical journeys passed after the
  playback and library foundation commits were reconciled.
- Temporary queue and import-decision checks → 7/7 passed, then removed per project policy.
- Prebuild preserved the `.beatnote` declaration under both in-place settings and added the scratch
  MP3/M4A declaration without editing the repository's native project.
- On iPhone 17 Pro / iOS 26.2 Simulator, warm and cold M4A delivery reached React Native Linking
  under both settings as `Documents/Inbox` copies; MP3 also reached both paths with the key `true`.

**Not verified / known gaps:**

- Physical Files and third-party-app delivery remains blocked on a signed device build, so the key
  decision is provisional. Simulator `openurl` cannot prove security-scoped in-place behaviour.
- A `.beatnote` host URL opened Files UI instead of Linking; its declaration was preserved, but its
  delivery path still needs physical-device validation.
- The dependency alignment and playback-speed work were reconciled separately in `738c3ae`; the
  installed dependency tree now matches the committed manifests.
- Task 3.2 and the dependent project/draft utilities remain the next implementation slice.

**Next agent should:**

- Implement Task 3.2 and the dependent persisted-content/fingerprint utilities.

### 2026-10-18 — Refine speed-popup interaction and annotation guidance

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `738c3ae`
**Kanban moved:** Playback-speed direct-manipulation refinement → Done

**Changed:**

- Made slider coordinates stable across the full track so the thumb follows a drag without jumping
  when it passes over the fill or thumb, while retaining 0.05× normalization from 0.5× through 2×.
- Removed redundant speed toasts, increased the popup's glass opacity, and added a 700-millisecond
  dwell followed by a 420-millisecond collapse/fade toward the Speed control.
- Made that dismissal interruptible: touching the fading popup restores it immediately, and Speed,
  preset, and Reset presses all use the same transition instead of abruptly unmounting the panel.
- Kept Annotation enabled whenever audio is loaded; away from a marker it now leaves the editor
  closed and shows the actionable "Add a marker first" toast.
- DSH-Qwen task `session-2a700c81-465d-4e6d-90eb-32babefb66e9` supplied the bounded popup draft;
  Codex reviewed it and corrected web-coordinate stability and interrupted-animation completion.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean before lifecycle bookkeeping.
- Focused retained dock journey → 1/1 passed, including exact intermediate drag values, fade
  interruption, delayed auto-close, and animated button/preset/Reset dismissal.
- Full retained Playwright gate on port 8082 → 6/6 critical journeys passed, including loaded-song
  Annotation prerequisite feedback.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2,
  including 2× pitch-preserved rate/reset, loaded-song Annotation feedback, and loop transport;
  result bundle `ios/build/BeatNoteUITests-1792259719500.xcresult`.

**Not verified / known gaps:**

- Physical-device touch feel, VoiceOver, Bluetooth output, and audible pitch/artifact quality remain
  part of the active playback-speed acceptance checklist.
- Concurrent `local-music-library-queue` work and its untracked files remain outside this task.

**Next agent should:**

- Complete the on-device playback-speed checklist, paying particular attention to interrupting the
  fade with a second touch and dragging continuously at 0.5× and 2×.

### 2026-10-16 — Establish the colour-theme foundation

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Typed colour-theme foundation → Done

**Changed:**

- Added a typed, immutable `ThemeColors` contract, the registered `darkTheme`, a default-theme name,
  and a pure palette accessor so future palettes must provide every semantic role.
- Kept the existing `colors` export as a compatibility alias to the registered dark palette, avoiding
  visual or behavioural churn while current module-level `StyleSheet` definitions remain static.
- Documented palette registration, semantic-token use, contrast/state requirements, and the boundary
  between today’s static palette and future runtime switching.

**Verified:**

- `git diff --check` and `npx tsc --noEmit` → clean.
- Unit gate → 126/126 passed across 13 suites, including the new registry/immutability tests.
- Full Playwright gate on port 8082 → 17/17 passed with the refactor preserving current rendering.

**Not verified / known gaps:**

- Dark remains the only complete palette; no user-facing theme selector or runtime provider was added.
- Existing colour literals outside the central palette remain migration debt and should move to
  semantic tokens when those components are next changed.
- This work and the prior user-approved icon/glass changes are included in `d533a72`.

**Next agent should:**

- Continue physical-device acceptance; add a second complete palette before introducing runtime
  theme selection or theme-aware style factories.

### 2026-10-15 — Align V1 startup and project data actions

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `uncommitted`
**Kanban moved:** Align startup settings, project/audio actions, and CSV import/export → Done

**Changed:**

- Start phone sessions with the settings drawer closed and use a settings gear for reopening it.
- Replaced the ambiguous song/folder pairing with a music-file action for choosing raw audio and a
  library action labelled Projects for saved BeatNote projects; replacing audio now warns that
  existing markers and annotations retain their timestamps.
- Made V1 import/export explicitly CSV-only, removed the MIDI choice from the V1 export surface,
  report marker counts rather than hidden layer counts, and surface imported/skipped-row totals.
- Renamed BPM to Project BPM and documented its live uses in musical timing and beat-sized loop
  adjustments; the fixed phone waveform layout remains independent of BPM.
- Updated help copy, persistence summaries, web/unit coverage, and native workflows to match the
  single annotation-lane V1 product surface while preserving multi-layer and MIDI internals.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 118 passed across 11 suites.
- Focused Playwright V1 startup/settings toolbar workflow → 1/1 passed.
- Native CSV import/share and project save/restore workflows passed in the latest aggregate on
  iPhone 17 Pro / iOS 26.2.
- Focused native launch/settings/audio-picker workflow → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792044180964.xcresult`.

**Not verified / known gaps:**

- The full Playwright aggregate is 15/16 because the concurrent dock workflow cannot find its new
  `annotation-glass` assertion; the focused V1 workflow passes.
- The full native aggregate is 8/14: six tests, including the launch workflow, were killed by the
  simulator rather than reporting assertion failures; the focused V1 launch rerun passes.
- The repository remains uncommitted with the previously documented dock/loop work and this V1
  cleanup; no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun both full aggregates, then continue the
  physical-device acceptance checklist.

### 2026-10-15 — Complete landscape dock refinements

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Landscape dock refinement → Done; physical acceptance remains In Progress

**Changed:**

- Replaced the 264-point 4×4 landscape rail with an adaptive 104-point two-column rail: three paired
  rows above a full-width/two-row play control and three paired rows below it. The grid expands to
  use the available safe height and keeps ordinary controls near-square; portrait retains its 2×8 grid.
- Kept the compact annotation field below the overview on the expanded audio-canvas side and kept the
  rail within the existing left/right device safe-area padding.
- Removed the landscape-only bottom safe-area inset so the control grid uses the rail's full height;
  portrait retains its curved-corner bottom protection.
- Gated overview-strip outside-range dimming on the active range-loop mode, so an inactive edited
  selection leaves markers, waveform content, and the playhead at normal opacity.
- Kept the overview clear/restore slot visibly occupied after audio loads by rendering a disabled
  trash control until a valid range or restore snapshot makes it actionable.
- Closed the visual seam between the overview track and its action slot, inset the end-of-song
  overview playhead by two pixels to keep it visible, and added subtle shared glass gradients plus
  roomier annotation text padding to the mobile lower controls.
- Made remove-previous always pressable with explanatory no-target feedback; simplified repeat's
  active treatment; aligned the tri-state loop icon cycle; and corrected marker-arrow ordering.
- Added vivid-violet, heavier timeline marker strokes while retaining white marker-control glyphs,
  and replaced previous/next track chevrons with mirrored hollow double-triangle SVG icons.
- Updated the Kiro requirements, design, tasks, browser geometry assertions, and native geometry
  assertions to match the accepted orientation-specific layout.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 116 passed across 11 suites.
- Elevated full Playwright gate → 16/16 passed, including two-column geometry and the custom icon
  structure at 740×390.
- Focused iOS `testLandscapeGesturesAndCompactControls` → 1/1 passed, then the full aggregate passed
  14/14 on iPhone 17 Pro / iOS 26.2; result bundles
  `ios/build/BeatNoteUITests-1792014461042.xcresult` and
  `ios/build/BeatNoteUITests-1792014665195.xcresult`.
- The final adaptive rail passed the focused browser dock check and the native landscape check on
  iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1792016980605.xcresult`, including the zero-bottom-inset assertion.
- Inactive-versus-active overview dimming passed focused browser coverage and the native portrait
  loop-control check; result bundle `ios/build/BeatNoteUITests-1792017546382.xcresult`.

**Not verified / known gaps:**

- Physical-iPhone VoiceOver, touch comfort, software-keyboard behavior, and sustained playback/drag
  performance remain the final acceptance gate.

**Next agent should:**

- Have the user visually confirm the loaded and unloaded landscape rail in the simulator,
  then run the physical-device acceptance checklist.

### 2026-10-15 — Simplify V1 settings drawer

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `uncommitted`
**Kanban moved:** Clean up the settings drawer for V1 → Done

**Changed:**

- Reduced the rendered drawer to Help & Shortcuts and BPM. Canvas Options and Marker Options are
  hidden because their controls are no-ops on the wrapped V1 canvas, expose deferred multi-layer
  behavior, or let users hide core loop/annotation UI.
- Preserved the existing store actions and persisted project settings so older projects remain
  compatible and deferred detail/multi-layer work can reuse them.
- Added stable identifiers plus web/native coverage that asserts the two V1 controls are present and
  the eight advanced or inapplicable labels remain absent.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 116 passed across 11 suites.
- Playwright settings workflow passed; the final current-tree full run passes 16/16 after the
  concurrent landscape rail geometry was corrected.
- Focused iOS `testStudioLaunchesAndDocumentPickerOpens` passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1791996998465.xcresult`.

**Not verified / known gaps:**

- The repository remains uncommitted with the previously documented dock work and concurrent icon,
  annotation, layout, store, and test changes.

**Next agent should:**

- Continue physical-device acceptance after the user visually confirms the final landscape rail.

### 2026-10-13 — Refine loop controls after simulator review

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `7d51b3a`
**Kanban moved:** Loop-control simulator refinements → Done

**Changed:**

- Restored the marker-segment loop button, store state, keyboard shortcut, and playback behavior.
  Marker and custom-range loops are mutually exclusive; enabling either disables the other, while
  whole-song repeat remains independent.
- Removed the visible grand-total marker and current-time captions while retaining 1×1 non-layout
  automation probes, replaced clear/restore text with trash/undo icons, and changed the range palette
  from orange to complementary teal.
- Amended `.kiro/specs/loop-range-overview/requirements.md`, `design.md`, and `tasks.md` because the
  user's explicit request to preserve marker looping conflicted with Requirement 15's retirement
  rule. The explicit request won; the historical retirement phase is labelled superseded.
- DSH-Qwen session `session-1e89499a-afdd-4c1c-bd02-3fed3de1f3f9` reviewed coexistence and boundary
  risks. Its previous-sample boundary and regression-test advice informed the implementation; store
  mutual exclusion was retained as a stronger invariant than simultaneous flags with precedence.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 123 passed across
  11 suites; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed.
- Device Hub was restarted; Xcode built and launched BeatNote on iPhone 17 Pro / iOS 26.2. Visual
  inspection confirmed the fifth marker-loop control, hidden captions, and fixed-row fit. Teal token
  contrast measured 10.11:1 enabled and 3.88:1 disabled against `#111111`.

**Not verified / known gaps:**

- The native XCTest aggregate was not rerun after this refinement. The app was exercised directly in
  the simulator, but creating a range with computer-use drag did not reliably trigger the native pan
  gesture, so the rendered teal range and icon-only clear/restore should be checked manually next.
- Physical-device performance, VoiceOver, contrast, and audible-boundary acceptance remain open.

**Next agent should:**

- In the running simulator, drag a loop range and visually check teal selection plus trash/undo;
  then test mutual exclusion by alternating the marker-loop and range-loop buttons.

### 2026-10-12 — Complete loop-range overview automated implementation

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `251b60f`
**Kanban moved:** Loop-range overview → In Progress (automated implementation complete; physical-device gate remains)

**Changed:**

- Implemented the single loop-range model end to end: validated range math and store actions,
  project-schema 1.1.0 migration/persistence, armed playback wrapping, keyboard commands, and
  retirement of the marker-segment loop.
- Replaced `TimelineScrollbar` with the compact full-song range editor, including native/web
  create/move/resize gestures, clear/restore, transport enablement, wrapped-row/detail projection,
  viewport following, and accessible adjustable handle semantics.
- Added unit/property, Playwright, and XCTest coverage for range behavior, persistence, interaction
  isolation, layout, playback wrap, and native save/relaunch/restore. Fixed overlay pointer capture,
  native accessibility-tree visibility, aggregate state timing, and simulator orientation issues
  encountered during verification.
- DSH-Qwen session `session-5f492eba-8623-4c8f-a399-e8b8706bf74f` reviewed the Phase 12 XCTest
  changes. Accepted its transport-tolerance and async-test concerns where supported by the result
  bundles; retained direct ownership of gesture/audio assertions and the physical VoiceOver gate.

**Key Artifacts** (from `git status` / `git diff --name-only`):
`.kiro/specs/loop-range-overview/`, `src/utils/loopRange.ts`, `src/hooks/useStudioStore.ts`,
`src/hooks/useAudioPlayer.ts`, `src/hooks/useLoopRangeGesture.ts`, `src/hooks/useViewportFollow.ts`,
`src/components/ui/controls/`, `src/components/ui/waveform/`, `src/types/project.ts`,
`src/utils/projectManager.ts`, `tests/unit/`, `tests/ui-components.spec.ts`,
`tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 120 passed across 11 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed.
- Focused native overview, loop-wrap/transport, and save/relaunch/restore cases passed; elevated full
  aggregate → 15/15 passed on iPhone 17 Pro Max / iOS 26.2. Inspected result bundle
  `ios/build/BeatNoteUITests-1791739669368.xcresult`.

**Not verified / known gaps:**

- Physical-iPhone acceptance remains required before the feature is Done: sustained drag/playback
  performance, actual VoiceOver increment/decrement announcements, rendered contrast, and audible
  loop-boundary quality. XCTest verifies the adjustable semantics but cannot reliably invoke React
  Native custom accessibility actions.
- Implementation, specification, and tests are committed in `251b60f`; this handover/archive update
  is recorded separately.

**Next agent should:**

- Run simulator-first exploratory acceptance, then task 25.2 from
  `.kiro/specs/loop-range-overview/tasks.md` on a physical iPhone; if it passes, mark the feature Done.

### 2026-10-09 — Complete wrapped waveform acceptance

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `4f54e80`
**Kanban moved:** Wrapped-canvas Phases 14-15 → Done

**Changed:**

- Extended native acceptance to verify horizontal row seeking without vertical page movement,
  follow-playhead continuity through background and foreground, portrait detail replacement,
  landscape row reflow, marker preservation, and non-overlapping docked detail geometry.
- Corrected follow-toggle XCTest assertions to use the native switch value introduced by Phase 12
  accessibility semantics, then isolated each case with app termination and a controlled Files-picker
  retry to remove order-dependent system-modal leakage.
- Verified the prior iPhone 17 Pro failure was device-specific orientation-lock state. A fresh iPhone
  17 Pro Max simulator rotated correctly and passed the full portrait and landscape suite.
- Removed the unused `SimpleWaveform` renderer and its barrel export after repository search and
  DSH-Qwen session `session-12ef6a00-97a4-4668-961f-17ef01f37dc0` independently confirmed zero live
  consumers. Phase 12 review session `session-6616ede1-4a1d-46cc-b8db-6b3989db4b33` also completed
  with a pass and only non-blocking polish observations.

**Key Artifacts** (from implementation commit `4f54e80`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/index.ts`,
`src/components/ui/waveform/SimpleWaveform.tsx` (removed), `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 67 passed.
- Focused wrapped-row seek, follow/background, and landscape reflow/detail XTests each passed.
- Elevated full `IOS_SIMULATOR_ID=8716E9DD-B2FC-4614-8691-DC517F86B82E npm run test:ios:ui`
  → 14/14 passed on iPhone 17 Pro Max / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791516777967.xcresult` was inspected for the aggregate result.

**Not verified / known gaps:**

- Physical-device audio interruption, VoiceOver, safe-area/orientation, and external share-destination
  acceptance remain outstanding. The original iPhone 17 Pro simulator may still retain its local
  orientation-lock state; the app configuration itself supports all orientations.

**Next agent should:**

- Run the physical-device acceptance checklist, then address the top unit-test coverage backlog item.

### 2026-10-09 — Complete wrapped accessibility semantics

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `659617d`
**Kanban moved:** Wrapped-canvas Phase 12 accessibility → Done; Phase 14 iOS acceptance remains In Progress

**Changed:**

- Added adjustable row semantics with index, time range, phrase, and active playback value. Native
  values use `accessibilityValue`; explicit ARIA aliases cover the current React Native Web mapping.
- Added layer-aware marker labels with timestamp and annotated state, plus a descriptive follow
  toggle label. Existing gutter, density, detail, and stable identifier contracts remain intact.
- Separated the row accessibility surface from visual descendants so iOS VoiceOver can navigate the
  row and each accessible SVG marker independently instead of grouping markers beneath the row.
- Added focused web and iOS assertions for roles, labels, values, stable IDs, keyboard activation,
  marker visibility, and the unannotated-to-annotated label transition.
- DSH-Qwen session `session-6616ede1-4a1d-46cc-b8db-6b3989db4b33` received a bounded read-only
  review. It remained running without final findings at handover; Codex retained implementation and
  verification ownership.

**Key Artifacts** (from implementation commit `659617d`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 67 passed,
  including the new focused assistive-technology flow.
- Focused `IOS_TEST_ONLY='testWrappedRowSeekMarkerAndDragGestures()' npm run test:ios:ui` → 1 passed
  on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791507156618.xcresult` reports one executed, passing test.

**Not verified / known gaps:**

- The complete iOS suite and native landscape cases were not rerun because the existing simulator
  scene-rotation lock remains unresolved; physical-device VoiceOver acceptance is also outstanding.
- DSH-Qwen's read-only review had not completed at handover and supplied no accepted code changes.

**Next agent should:**

- Implement Phase 14 iOS acceptance coverage and resolve the simulator scene-rotation lock before
  the full suite, then finish Phase 15 cleanup and final regression.

### 2026-10-06 — Complete responsive waveform reflow

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `c05b9ff`
**Kanban moved:** Wrapped-canvas Phase 11 responsive styling → Done; Phase 12 accessibility remains In Progress

**Changed:**

- Added a true side-by-side wrapped/detail workspace for wide and landscape layouts while retaining
  phone portrait's full detail-mode replacement. Docked panes share available width and may shrink
  without overlap.
- Removed the desktop/tablet 900 px minimum-content-width floor that caused clipping and horizontal
  page overflow on 844 px landscape and intermediate tablet widths.
- Strengthened responsive acceptance to cover portrait-to-landscape orientation-default row reflow,
  non-overlapping pane geometry, zero page overflow, and marker/annotation preservation and
  re-selection after resize.
- DSH-Qwen session `session-e4dac34e-c7cc-4084-8e01-1358eecff5a0` drafted only the docked style.
  Direct review fixed its portrait-pane `flex: 1` regression and owned the component integration,
  overflow repair, and tests. Existing safe-area and `keyboardShouldPersistTaps="handled"` paths were
  preserved.

**Key Artifacts** (from implementation commit `c05b9ff`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/layout/MainContent.tsx`,
`src/components/ui/waveform/WaveformWorkspace.tsx`,
`src/styles/components/waveform/waveformWorkspace.ts`, `tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 66 passed,
  including wide side-by-side geometry, no horizontal overflow, reflow, and data preservation.
- Focused `IOS_TEST_ONLY='testPrecisionDetailModeOpensAndRestoresWrappedRow()' npm run test:ios:ui`
  → 1 passed on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791251332686.xcresult` was inspected and reports one executed test.

**Not verified / known gaps:**

- Native landscape side-by-side geometry and orientation reflow remain unverified because the
  simulator scene-rotation lock persists; equivalent browser geometry/reflow acceptance is green.
- Physical-device safe-area, keyboard, and orientation acceptance remains outstanding.

**Next agent should:**

- Implement Phase 12 accessibility roles, labels, values, and stable identifiers across wrapped
  rows, markers, annotation indicators, density controls, and detail actions.

### 2026-10-06 — Add wrapped row-density presets

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `cd410fb`
**Kanban moved:** Wrapped-canvas Phase 10 density presets → Done; Phase 11 responsive reflow remains In Progress

**Changed:**

- Added explicit Spacious, Default, and Compact controls with stable identifiers. Presets map to
  1/2/3 phrases per row or 5/10/15-second duration rows and reuse the persisted single-store
  `rowDensity` contract.
- Kept density mapping pure and independently tested. Reflow changes only row projection geometry;
  marker timestamps and annotations remain unchanged across preset switches.
- Added semantic native gutter labels and portrait XCTest coverage for all three preset boundaries
  plus marker preservation. Optional landscape pinch remains intentionally omitted.
- DSH-Qwen session `session-fd5e84f5-c9e8-4ee7-ab0b-121d2eeb3625` drafted only the bounded control
  component and styles. Codex reviewed and refined that draft and directly owned mapping, store
  integration, accessibility, and browser/native acceptance.

**Key Artifacts** (from implementation commit `cd410fb`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/RowDensityControls.tsx`,
`src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`src/styles/components/waveform/rowDensityControls.ts`,
`src/styles/components/waveform/wrappedWaveform.ts`, `src/utils/rowDensityPresets.ts`,
`tests/unit/rowDensityPresets.test.ts`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 66 passed,
  including marker and annotation preservation while row boundaries reflow.
- Focused `IOS_TEST_ONLY='testWrappedRowDensityPresetsReflowWithoutChangingMarkers()' npm run test:ios:ui`
  → 1 passed on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791225205452.xcresult` was inspected and reports one executed test.

**Not verified / known gaps:**

- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks its geometry-guarded landscape cases; physical-device acceptance remains outstanding.
- Optional preset-snapping landscape pinch was deliberately omitted until explicit controls and
  responsive Phase 11 styling are stable.

**Next agent should:**

- Implement Phase 11 responsive styling and automatic reflow across narrow portrait, wide
  landscape, and resizing while preserving current presets, gestures, and playback state.

### 2026-10-06 — Add compact wrapped annotation display

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `1ef5c47`
**Kanban moved:** Wrapped-canvas Phase 9 annotation display → Done; Phase 10 density presets remains In Progress

**Changed:**

- Projected non-empty layer annotations onto their owning wrapped rows and rendered bounded colored
  dots instead of inline text. Nearby cross-layer indicators collapse into an `xN` SVG badge.
- Added deterministic first-member-anchored pixel clustering that filters invalid coordinates,
  avoids transitive overgrowth, preserves input order, and averages each cluster's display position.
- Reused the existing marker-lane nearest-marker gesture so tapping either a dot or badge selects and
  seeks to that marker, reopening it in the shared `AnnotationField` without a competing recognizer.
- DSH-Qwen session `session-2896f3f5-a762-4579-9ab0-84de7632928a` implemented only the pure helper
  and focused unit tests. Codex reviewed it and directly owned projection, SVG, and interaction work.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/utils/annotationClusters.ts`,
`src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`tests/unit/annotationClusters.test.ts`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 62 passed across 7 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 65 passed,
  including real marker annotation, compact rendering, no inline text, and detail-on-tap restoration.
- Focused `IOS_TEST_ONLY=testWrappedRowSeekMarkerAndDragGestures npm run test:ios:ui` → 1 passed on
  iPhone 17 Pro / iOS 26.2; native SVG indicator and existing row tap/drag behavior both passed.

**Not verified / known gaps:**

- The count badge is covered by pure cluster tests and direct SVG review, but browser/native
  acceptance creates a single annotation because the web import shim cannot inject deterministic
  cross-layer annotations through Expo DocumentPicker.
- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks its geometry-guarded landscape case; physical-device acceptance remains outstanding.

**Next agent should:**

- Implement Phase 10 explicit row-density presets, preserving marker/annotation timestamps while
  row geometry reflows; keep any optional pinch gesture out unless preset controls are stable first.

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

### 2026-10-09 — Fix the phone workspace to one screen

**Agent:** orchestrator (Codex) · **Commit(s):** `8b51e7d`
**Kanban moved:** Fixed single-layer phone workspace → Done

**Changed:**

- Replaced portrait's page and action-row scrollers with a fixed safe-area workspace. The wrapped
  waveform is now the only vertically scrollable surface, while the overview, transport, marker
  controls, and annotation field remain simultaneously reachable.
- Converted phone project actions to a compact fixed icon row, reduced waveform rows and controls,
  and hid phone-only layer, density, and follow chrome without removing desktop controls.
- Pinned phone editing to the canonical `vocals` lane while retaining all six stable layer IDs in
  persisted projects for compatibility, desktop use, and future V2 expansion.
- Updated the durable V1 product scope and replaced superseded native scroll/density assertions with
  fixed-layout, single-layer, gesture, follow-playhead, and reachability acceptance.

**Key Artifacts** (from implementation commit `8b51e7d`):
`.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`,
`src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`,
`src/styles/layout/mainContent.ts`, `tests/ios/BeatNoteUITests.swift`,
`tests/quality-assurance.spec.ts`, `tests/ui-components.spec.ts`.

**Verified:**

- Device Hub visual inspection on iPhone 17 Pro Max / iOS 26.2 → six waveform rows, overview, both
  control rows, annotation field, and all project actions fit in portrait without page scrolling.
- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed,
  including a loaded-track 375×667 viewport geometry check with no page/action-row overflow.
- Elevated full `IOS_SIMULATOR_ID=8716E9DD-B2FC-4614-8691-DC517F86B82E npm run test:ios:ui`
  → 14/14 passed; result bundle `ios/build/BeatNoteUITests-1791532193804.xcresult` was inspected.
  The final focused single-layer case also passed in `BeatNoteUITests-1791532576347.xcresult`.

**Not verified / known gaps:**

- Physical-device audio interruptions, VoiceOver, safe-area/orientation behavior, and completion of
  an external share remain outstanding. Additional stored lanes are preserved but intentionally not
  selectable in the V1 phone editor.

**Next agent should:**

- Run the physical-device acceptance checklist, then address the utility/store unit-test backlog.

### 2026-10-09 — Fit full songs into the fixed phone canvas

**Agent:** orchestrator (Codex) · **Commit(s):** `1c252e5`
**Kanban moved:** Timestamp-only compact phone gutters → Done

**Changed:**

- Replaced the mobile wrapped-waveform `ScrollView` with a fixed canvas that renders every row at
  once. Row count follows available screen height, while timestamps partition the complete song.
- Reduced gutters to timestamp-only, vertically centered labels and made the compact marker lane
  proportional to row height so lower-row taps seek instead of accidentally adding markers.
- Kept desktop virtualization, density presets, and follow-playhead scrolling unchanged; documented
  the fixed full-song phone canvas as a durable product rule.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/steering/project-overview.md`, `src/components/ui/waveform/RowGutter.tsx`,
`src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`src/hooks/useWrappedRows.ts`, `src/styles/components/waveform/rowGutter.ts`,
`src/styles/components/waveform/wrappedRow.ts`, `src/styles/components/waveform/wrappedWaveform.ts`,
`src/utils/rowLayout.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`,
`tests/unit/rowLayout.test.ts`, `tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 70 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed,
  including fixed-canvas overflow, full-duration coverage, and compact gesture behavior.
- Native portrait fixed-canvas, compact row seek/marker gestures, landscape reflow/detail docking,
  and background playback continuity each passed focused on iPhone 17 Pro / iOS 26.2.
- Latest full native aggregate ran 14 cases: 12 passed; its two duration-expectation failures were
  corrected and both then passed focused (`BeatNoteUITests-1791535636043.xcresult` and
  `BeatNoteUITests-1791535683002.xcresult`).

**Not verified / known gaps:**

- A final all-14 aggregate was not rerun after the assertion-only fixture-duration correction.
- Physical-device safe-area, VoiceOver, interruption, and external share-destination checks remain.

**Next agent should:**

- Run physical-device acceptance, then address the top utility/store unit-test coverage item.

### 2026-10-10 — Specify loop-range overview (planning only)

**Agent:** orchestrator (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** Loop-range overview → To Do (new planned feature; spec authored)

**Changed:**

- Authored a Requirements-First feature spec under `.kiro/specs/loop-range-overview/`
  (`requirements.md`, `design.md`, `tasks.md`) to repurpose `TimelineScrollbar` into a compact
  full-song loop-range editor: draggable start/end handles, range move, clear/restore, a transport
  loop toggle, range projection onto wrapped rows, and range-aware playback with an armed-wrap rule.
- Documented a one-loop-model consolidation: reuse the existing session-only `loopStartMs`/
  `loopEndMs` with validating setters plus a new `isLoopRangeEnabled`, retire the marker-segment
  loop (`isLoopMarkerActive`/`toggleLoopMarker`, its `MarkerButton` button, rebind `L`), and keep
  whole-song repeat with defined precedence. Persistence bumps the project schema to 1.1.0.
- Added the planned-feature card to the Kanban To Do column and rotated the oldest handover entry
  (2026-10-09 wrapped accessibility semantics) verbatim into the archive to keep five live entries.
- No application code changed; this is a specification/planning artifact only.

**Key Artifacts** (from `git status`): `.kiro/specs/loop-range-overview/requirements.md`,
`.kiro/specs/loop-range-overview/design.md`, `.kiro/specs/loop-range-overview/tasks.md`,
`.kiro/specs/loop-range-overview/.config.kiro`, `AGENTS.md`,
`docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `validate_spec_format` → 0 issues for `requirements.md` and `tasks.md`.
- `design.md` is markdown-lint clean (`mdlint.py` → 0 findings). `validate_spec_format` reports 4
  residual `design/missing-property-validates` warnings on 4 of 10 correctness properties; every
  property has an accurate `**Validates: Requirements ...**` line in the project's canonical form,
  and the warnings persisted across six formatting variants (same form the shipped
  wrapped-waveform-canvas spec uses), so they are treated as a validator-detection quirk, not a
  content gap.
- Spec grounded in the real code (store loop fields, `TimelineScrollbar`, `useAudioPlayer` poll,
  `loopSegmentsForRows`, `projectManager`, gesture config), read before writing.

**Not verified / known gaps:**

- No build/test/lint of application code was run — nothing was implemented. tsc/Jest/Playwright/
  XCTest are task checkpoints, not yet executed.
- Unresolved product decisions D-1..D-9 remain (min loop length, whether `loopEnabled` persists,
  replacing the retired marker loop, tap-to-seek, clear/restore affordance, desktop viewport strip,
  jump-when-started-after-end, restore-window length/focus, newer-version writability).
- The 4 design-validator warnings above were not cleared.

**Next agent should:**

- Begin Phase 1 of `.kiro/specs/loop-range-overview/tasks.md` (pure `src/utils/loopRange.ts` +
  `compareProjectVersion` with unit/property tests), keeping gesture and audio-boundary work direct.

### 2026-10-10 — Restrict marker creation to controls

**Agent:** orchestrator (Codex) · **Commit(s):** `1c252e5`
**Kanban moved:** Button-only marker creation → Done

**Changed:**

- Removed marker creation from wrapped-row taps. Blank waveform taps now seek, gutter taps open
  precision detail, and existing marker taps continue to select and seek.
- Kept marker creation exclusively on the bottom add-marker control and documented that interaction
  as a durable V1 product rule.
- Updated browser and native acceptance to assert that gutter, waveform, marker, and drag gestures
  never increase the marker count while the add-marker button does.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `tests/ios/BeatNoteUITests.swift`,
`tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 70 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed.
- Focused portrait fixed-workspace, wrapped-row gesture, and landscape reflow XTests each passed on
  iPhone 17 Pro / iOS 26.2; all three result bundles were inspected.

**Not verified / known gaps:**

- The full 14-case iOS aggregate was not rerun; focused native coverage exercises every changed
  marker-creation path. Physical-device acceptance remains outstanding.

**Next agent should:**

- Run physical-device acceptance, then address the top utility/store unit-test coverage item.

### 2026-10-13 — Smooth and separate the loop overview controls

**Agent:** orchestrator (Codex) · **Commit(s):** `9ff4bab`
**Kanban moved:** Loop-range drag jank and overview overlap → Done

**Changed:**

- Removed per-frame native accessibility announcements from pointer drags and retained targeted,
  once-per-action handle announcements for keyboard and adjustable accessibility changes. Memoized
  the static overview track and made the store skip identical settled range writes.
- Measured gesture/full-song geometry from a dedicated track region and placed the icon-only
  clear/restore control in a fixed sibling slot. Its 44-point effective target no longer covers the
  playhead, marker indicators, range body, or handles.
- Updated the requirements, design, task checklist, unit test, and browser acceptance coverage for
  the action-slot geometry and gesture hot-path behavior.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 124 passed across
  11 suites; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed,
  including a non-overlap assertion between the track and clear/restore control.
- Focused native loop-drag XCTest passed, then the full aggregate passed 15/15 on iPhone 17 Pro /
  iOS 26.2; result bundles `BeatNoteUITests-1791886084082.xcresult` and
  `BeatNoteUITests-1791886222558.xcresult` were inspected.

**Not verified / known gaps:**

- Subjective drag smoothness still needs the user's simulator retest and the required physical-
  iPhone ~60fps gate. Physical VoiceOver announcements, rendered contrast, and audible loop-boundary
  quality also remain outside simulator automation.

**Next agent should:**

- Have the user retest range creation/move/resize in Device Hub, then complete task 25.2 on a
  physical iPhone before marking the loop-range feature fully Done.

### 2026-10-14 — Remove remaining loop-range drag jank and edge clipping

**Agent:** orchestrator (Codex) · **Commit(s):** `260585e`
**Kanban moved:** Loop-range overview refinement → Done; physical-device acceptance remains In Progress

**Changed:**

- Kept the visible overview grips centred on their exact bounds while preserving 44pt native touch
  targets, and inset the 2px overview playhead so it remains visible at both song edges.
- Changed disabled saved ranges to muted dashed outlines without broad wrapped-canvas fill or
  outside-range dimming, while retaining the stronger teal treatment when range looping is active.
- Stabilised per-row marker/loop props, memoised rows by rendered geometry, and narrowed mounted
  store subscriptions so handle motion no longer repaints unrelated waveform rows, the studio root,
  audio hook, shortcut hook, transport, marker controls, annotation field, or project controls.
- Extended browser coverage for inactive projection, exact end-grip placement, and end-of-song
  playhead visibility; updated the requirements and Phase 16 checklist to match the refined UX.

**Key Artifacts** (from `git diff-tree --name-only -r 260585e`):
`.kiro/specs/loop-range-overview/`, `src/components/ui/controls/LoopOverviewTrack.tsx`,
`src/components/ui/controls/LoopRangeLayer.tsx`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`,
`src/hooks/useAudioPlayer.ts`, `src/hooks/useKeyboardShortcuts.ts`, `tests/ui-components.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 124 passed across 11 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed.
- Focused native loop-overview test passed on iPhone 17 Pro / iOS 26.2; inspected result bundle
  `ios/build/BeatNoteUITests-1791934841660.xcresult` (1 passed, 0 failed).
- Device Hub was running and BeatNote launched directly after the simulator test.

**Not verified / known gaps:**

- The full 15-case native aggregate was not rerun; the changed gesture/render path passed focused.
- Physical-iPhone drag performance, VoiceOver actions/announcements, rendered contrast, and audible
  loop-boundary quality remain the final loop-range acceptance gate.

**Next agent should:**

- Have the user recheck disabled/enabled dragging and both song edges in the simulator, then run the
  physical-device checklist in task 25.2 if the simulator refinement is accepted.

### 2026-10-14 — Align loop visuals and consolidate critical tests

**Agent:** orchestrator (Codex) + test-auditor + DSH-Qwen attempt · **Commit(s):** `96b6649`
**Kanban moved:** Loop visual consistency and automated-suite rationalisation → Done

**Changed:**

- Changed active wrapped-row range projection from the orange accent to the shared teal
  `colors.loopEnabled` hue used by the overview and detail view; documented the cross-surface
  colour contract and completed Phase 17 of the loop-range spec.
- Reduced the automated suite from 208 to 130 focused cases: Playwright 69→14, Jest 124→102, and
  XCTest 15→14. Removed runner/smoke assertions, a fake reimplementation of the store, trivial
  density mappings, and duplicated flows while retaining loop, annotation, responsive-layout,
  persistence, import/export, background-audio, orientation, and gesture coverage.
- Fixed two native timing defects exposed by the full aggregate: controlled React Native text entry
  now uses paced XCTest input, and the save/restore scenario initializes the fixture's real audio
  duration before creating a persisted range.
- Updated the durable test strategy to prioritise behavior-rich workflows and production-facing
  unit tests. A scoped DSH-Qwen audit was attempted but exhausted its response budget without a
  recommendation; the direct and sub-agent audits supplied the retained coverage map.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 102 passed across 9 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 14 passed.
- Elevated full `npm run test:ios:ui` → 14/14 passed on iPhone 17 Pro / iOS 26.2; inspected result
  bundle `ios/build/BeatNoteUITests-1791938471156.xcresult`.

**Not verified / known gaps:**

- Physical-iPhone sustained drag/playback performance, VoiceOver adjustment announcements,
  rendered contrast, and audible loop-boundary quality remain the final loop-range acceptance gate.
- Global web keyboard shortcuts remain a desirable single-workflow addition, and the production
  utility/store unit-test backlog remains open; neither blocks the loop-range spec.

**Next agent should:**

- Run task 25.2 from `.kiro/specs/loop-range-overview/tasks.md` on a physical iPhone; if it passes,
  move loop-range overview from In Progress to Done.

### 2026-10-14 — Author playback-marker-control-dock spec

**Agent:** orchestrator (spec workflow) · **Commit(s):** `uncommitted`
**Kanban moved:** Author the `playback-marker-control-dock` spec → Done

**Changed:**

- Created a requirements-first feature spec under `.kiro/specs/playback-marker-control-dock/` with
  18 EARS requirements, an implementation-grounded design, and a phased task plan.
- Read the existing transport, marker, loop, audio, store, persistence, and mobile-layout paths to
  ground the spec in real fields and test identifiers. No production code or tests changed.

**Verified:**

- Spec-format and markdown checks passed on all three documents.
- `git status --porcelain` showed only `AGENTS.md` plus the new untracked spec directory.

**Not verified / known gaps:**

- The work was spec-only at that point; implementation and test gates remained open.
- Five product decisions and the nearby-marker boundary were explicitly deferred to implementation.

**Next agent should:**

- Resolve the listed product decisions, then begin implementation from the pure inner-loop state
  transitions and store action.

### 2026-10-14 — Resolve playback-marker-control-dock product decisions

**Agent:** orchestrator (spec workflow) · **Commit(s):** `uncommitted`
**Kanban moved:** none (spec already in Done; follow-up refinement)

**Changed:**

- Resolved all five open product decisions with the user and folded them into `requirements.md` and `design.md`: (1) playback-speed set `0.75×, 0.8×, 1×, 1.25×, 2×` default `1×`, data-driven/extensible; (2) pre-engine speed button follows an explicit “coming soon” path — updates label + toast, no real rate change yet; (3) landscape toast anchors to the rail’s waveform-facing inner edge (portrait stays above the dock); (4) reserved controls are pressable buttons announcing “coming soon” (distinct from disabled “temporarily unavailable”); (5) marker-navigation stays silent at the first/last target.
- Renamed the specs’ “Open product decisions” / “Residual design decisions” sections to “Resolved…” with each choice recorded. No production code or tests changed.

**Verified:**

- `validate_spec_format` on `requirements.md` and `design.md` → no format issues.
- global-rules markdownlint helper (via the spec subagents) → 0 new findings.

**Not verified / known gaps:**

- Still spec-only; nothing implemented or committed, so no build/test gate was run.
- The `<100` vs `<=100` ms nearby-marker boundary is still deferred to implementation (tasks Phase 4).

**Next agent should:**

- Begin implementation at tasks.md Phase 1 (pure `src/utils/innerLoop.ts` derivations and the net-new `cycleInnerLoop` store action), running the build gate at each phase checkpoint.

### 2026-10-14 — Implement portrait playback and marker control dock

**Agent:** orchestrator (Codex) + DSH-Qwen attempt · **Commit(s):** `uncommitted`
**Kanban moved:** Playback/marker control dock → In Progress (automated implementation complete)

**Changed:**

- Replaced the two phone control rows with a fixed 2×8 portrait dock, dominant play/pause block,
  explicit marker navigation/removal, independent repeat, tri-state inner loop, reserved playlist
  and shuffle affordances, local toast feedback, and the non-engine playback-speed chooser contract.
- Added pure/store inner-loop transitions with guarded whole-song range initialization and corrected
  marker removal so toggle/remove-previous actions remove exactly one intended marker.
- Kept desktop controls and playback precedence unchanged; added keyboard avoidance so the phone
  annotation field remains above the iOS software keyboard.
- Preserved the compact landscape rail after simulator evidence showed that widening it for the
  portrait grid made the waveform too narrow. A landscape-specific redesign is now explicit backlog;
  the 320-point/eight-44-point-column contradiction remains documented in the spec task list.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 116 passed across 11 suites.
- Elevated Playwright gate → 15 passed, including the consolidated phone dock workflow.
- Elevated full native aggregate → 14/14 passed on iPhone 17 Pro / iOS 26.2; focused dock/loop and
  landscape tests also passed. Focused annotation/project test passed with the new keyboard-visible
  assertion; result bundle `ios/build/BeatNoteUITests-1791964462449.xcresult`.
- Started Metro on port 8081, set the simulator app's `RCT_jsLocation` to `127.0.0.1:8081`, and
  relaunched `com.beatnote.app`; Device Hub visual inspection confirmed the dock rendered without the
  null script-URL fatal screen.

**Not verified / known gaps:**

- Portrait visual feel still needs the user's simulator review; physical-device VoiceOver, target
  comfort, and performance remain open.
- Eight non-overlapping 44-point columns cannot fit the stated 320-point width or the compact
  landscape rail. Portrait is automated at 393 points; landscape requires the requested new design.
- DSH-Qwen read-only review session `session-3ce3a63c-fb34-44dd-ac67-43c49d931fe0` did not return
  findings within the implementation window and was cancelled; direct, browser, and native review
  supplied the verified coverage above.

**Next agent should:**

- Launch the current build in Device Hub for the user's portrait visual pass, then resolve any dock
  polish before physical-device acceptance; do not treat the mirrored landscape fallback as final.

### 2026-10-15 — Complete simulator dock refinements

**Agent:** orchestrator (Codex) + test-auditor · **Commit(s):** `uncommitted`
**Kanban moved:** Landscape dock and simulator polish → Done; physical acceptance remains In Progress

**Changed:**

- Reflowed landscape controls into a 4×4 rail with a central 2×2 play button; retained the portrait
  2×8 contract and orientation state.
- Moved annotation below the overview and above the bottom dock, added minimum safe-area spacing,
  and lifted the shared toast above the overview so dock and clear/restore actions use one location.
- Preserved active playback across tap/drag seeking by starting scrub pause/resume only after the pan
  gesture activates; added distinct double-chevron previous/next-track placeholders, smaller speed
  text, and the requested marker/loop toast messages.
- Reconciled the Kiro requirements/design/tasks with the accepted simulator behavior and expanded
  existing high-value web/native workflows rather than adding redundant cases.
- Hid the loop overview and clear/restore action until audio is loaded, and applied the 34-point iOS
  safe-area floor inside the dock so its lowest interactive row clears curved phone corners.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 116 passed across 11 suites; full Playwright gate → 15 passed.
- Full iOS aggregate → 14/14 passed; result bundle `BeatNoteUITests-1791996061873.xcresult`.
- Focused iOS landscape and active-playback seek tests also passed 1/1 each.
- Focused unloaded-overview/bottom-button safe-area test passed after the final layout refinement;
  Device Hub visual inspection confirmed both corrections.
- Device Hub visual inspection confirmed the portrait bottom-safe layout and the landscape 4×4 rail;
  Metro is running on port 8081 in session `64007` for continued simulator testing.

**Not verified / known gaps:**

- Physical-iPhone VoiceOver, touch comfort, software-keyboard behavior, and sustained playback/drag
  performance remain the final acceptance gate.
- The full aggregate predates only the final unloaded-overview/safe-area refinement; that path passed
  its focused native test and focused browser workflow.

**Next agent should:**

- Have the user run the final simulator checklist with a loaded song, then run physical-device
  acceptance; keep Metro alive while the user tests.

#### Archived Done item — playback-marker-control-dock specification

- [x] Author the `playback-marker-control-dock` feature spec — requirements, design, and task plan for consolidating the two phone control rows into one two-row eight-column dock (dominant 2×2 play/pause, tri-state inner-loop control, independent repeat, whole-song range auto-init, reserved playlist/shuffle placeholders, playback-speed button contract, shared transient toast). Specification only; no production code or tests changed.
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/requirements.md`, `.kiro/specs/playback-marker-control-dock/design.md`, `.kiro/specs/playback-marker-control-dock/tasks.md`, `.kiro/specs/playback-marker-control-dock/.config.kiro`</sub>

#### Archived Done item — unloaded waveform prompt

- [x] Simplify the unloaded phone waveform prompt to “Load a song” and center it within the full
      available timeline workspace
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/wrappedWaveform.ts`, `tests/ui-components.spec.ts`</sub>

### 2026-10-15 — Center the unloaded waveform prompt

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Center and simplify the unloaded wrapped-waveform empty state → Done

**Changed:**

- Shortened the empty-state message from “Load a song to view the wrapped timeline” to “Load a song”.
- Made the phone placeholder flex into the available waveform workspace, removing the fixed-height
  appearance and centering the message horizontally and vertically.
- Added browser geometry coverage for exact centering within the unloaded waveform container.

**Verified:**

- `npx tsc --noEmit` → clean.
- Focused Playwright V1 startup/settings workflow → 1/1 passed, including center-point geometry at
  393×852.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun for this small flexbox/copy-only refinement.
- The repository remains uncommitted with the previously documented dock/loop and V1 cleanup work;
  no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun the full automated aggregates, then
  continue the physical-device acceptance checklist.

### 2026-10-16 — Refine glass popups, gutters, and CSV wording

#### Archived Done item — glass popups, gutters, and CSV wording

- [x] Bring transient dock popups into the liquid-glass family, center wrapped-row gutter timestamps,
      and describe the V1 CSV's BPM-derived timing precisely
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/specs/playback-marker-control-dock/design.md`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/styles/components/controls/controlDock.ts`, `src/styles/components/controls/playbackSpeedControl.ts`, `src/styles/components/waveform/rowGutter.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `d533a72`
**Kanban moved:** Liquid-glass popups, centered gutters, and precise V1 CSV contents → Done

**Changed:**

- Reused `GlassBackdrop` for the dock toast and playback-speed chooser, adding a lighter translucent
  toast variant with 12-point corners and a subtle 10%-white highlight instead of the saturated teal
  toast outline.
- Centered every wrapped-row timestamp horizontally and vertically within its full-height gutter box.
- Replaced the vague CSV claim with the exact current behavior: timestamps, BPM-derived 4-beat
  `bar:beat` timing, and annotations; Help and Export now use matching wording.
- Documented the liquid-glass popup rule in durable styling guidance and the dock design.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites.
- Focused phone dock/workspace Playwright workflows → 2/2 passed; full Playwright gate → 17/17 passed.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun; native CSV copy coverage was updated for the next
  aggregate.
- Routine native success alerts and system pickers/share sheets retain platform styling; this change
  targets the custom transient dock popup family.
- The user's concurrent icon-proportion work and this polish are included in `d533a72`; no unrelated
  dirty changes were reverted.

**Next agent should:**

- Run the native visual/VoiceOver acceptance pass, then continue the active full-surface glass work.

#### Archived Done item — terminal loop-range playback and endpoint geometry

- [x] Fix terminal loop-range playback and endpoint geometry: song-end ranges wrap after native
      completion, endpoint grips remain fully visible, and the track retains exact full-song mapping
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/hooks/useAudioPlayer.ts`, `src/components/ui/controls/LoopRangeLayer.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/utils/loopRange.ts`, `tests/ui-components.spec.ts`, `tests/unit/loopRange.test.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

### 2026-10-15 — Fix terminal loop and endpoint grip

**Agent:** orchestrator (Codex) · **Commit(s):** `cf652dc`
**Kanban moved:** Terminal range loop and endpoint handle correction → Done

**Changed:**

- Kept the range body mapped to the exact 0%/100% track endpoints while insetting only the
  eight-pixel endpoint grips, preventing the end grip from being covered by the adjacent action.
- Added Expo Audio completion-state handling and deferred the broader end-of-track pause path for an
  armed terminal range, so a range ending at songDuration wraps instead of stopping at 2:29.
- Centralised endpoint-visible playhead projection in a tested utility and removed a timing-sensitive
  browser gesture assertion while retaining direct geometry coverage.
- Updated the loop-range requirements, design, and completed task record for the corrected contract.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites; full Playwright gate → 16/16 passed.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792045957150.xcresult`.

**Not verified / known gaps:**

- Physical-device audible boundary quality and VoiceOver remain pending.
- The correction is committed in `cf652dc`; it and earlier commits `ba06384` / `adb2f54` remain
  local because the remote destination still requires explicit ownership approval.

**Next agent should:**

- Push the three local commits after the user explicitly confirms the `Grazorite/BeatNote-App`
  GitHub destination, preserving the unrelated concurrent icon/control worktree edits.

#### Archived Done item — overview and glass control polish

- [x] Polish the loaded overview and mobile lower controls: remove the action-slot gap, retain the
      end-of-song playhead, and add restrained glass gradients plus roomier annotation padding
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/styles/components/controls/loopRangeOverview.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

### 2026-10-15 — Polish overview and glass controls

**Agent:** orchestrator (Codex) · **Commit(s):** `ba06384`
**Kanban moved:** Overview/action alignment and lower-control polish → Done

**Changed:**

- Removed spacing between the overview track and its fixed action slot while keeping the disabled
  trash control visible before a range exists.
- Inset the overview playhead by two pixels at both endpoints so it remains visible at song end.
- Added restrained diagonal glass gradients behind the annotation and dock surfaces, increased
  annotation horizontal padding, and preserved popup overflow above the dock.
- Narrowed the native dock/range check to deterministic geometry and state assertions; loop-boundary
  calculations remain covered by the dedicated unit/property suite.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Full Playwright gate → 16/16 passed.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792045036902.xcresult`.

**Not verified / known gaps:**

- The final glass intensity and spacing still need the user's simulator visual review.
- Physical-device VoiceOver, touch comfort, software-keyboard behavior, and sustained drag/playback
  performance remain open.
- The implementation, specs, tests, and accumulated V1 cleanup are committed in `ba06384`.

**Next agent should:**

- Relaunch the app for the user's simulator visual pass, then continue physical-device acceptance.

#### Archived Done item — custom BeatNote icon family

- [x] Modernise and refine every button icon with a shared custom BeatNote family, including the
      single-note audio glyph, thin open repeat grammar, bounded-range cue, invariant marker sizing,
      solid rounded transport, and subdued active/operation fills
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/specs/playback-marker-control-dock/`, `src/components/icons/`, `src/components/layout/StemsView.tsx`, `src/components/ui/common/VerticalSegmentedControl.tsx`, `src/components/ui/controls/`, `src/components/ui/screens/HelpScreen.tsx`</sub>

### 2026-10-15 — Create and refine the BeatNote icon family

**Agent:** orchestrator (Codex) + context-gatherer + DSH-Qwen Leonardo concept pass · **Commit(s):** `d533a72`
**Kanban moved:** Modernise and simplify every button icon; define custom-icon principles → Done

**Changed:**

- Added a central 24×24 `BeatNoteIcon` SVG family spanning project/data actions, transport,
  choreography markers, loop utilities, disclosure/view controls, and annotation-layer instruments,
  then simplified the first concept pass to iOS-inspired monoline geometry and stronger negative space.
- Refined the set from the user's visual references: reduced audio loading to one music note, restored
  a familiar save-file silhouette, enlarged CSV direction arrows, rounded and filled transport
  geometry, and unified every marker action around one single-border shield silhouette.
- Made add/remove marker operations subdued green/red without cramped `+`/`−` cues, made
  remove-previous a red shield with its left arrow on the right, preserved one full-size shield in
  every navigation composite, and placed marker or `•—•` bounded-range cues inside the thin open
  repeat chassis.
- Added a muted control-state orange distinct from the brighter timeline/brand accent and applied it
  consistently to filled active buttons and selected segmented controls.
- Replaced every current button's direct Lucide use while retaining numeric BPM/speed controls as
  text, existing button chrome, test IDs, accessible names/states, and control behavior.
- Codified the rounded 1.75-point outline, one-silhouette/one-modifier limit, optical balance,
  small-size legibility, and accessibility requirements in durable steering; primary transport
  glyphs use simple solid geometry while detailed decorative motifs are explicitly avoided.
- Updated the playback-dock design/task record to make the shared custom family the ongoing source
  for dock glyphs. DSH task `session-cb84715b-2187-4e71-9b6b-83ec0b16139b` supplied the bounded
  first-pass concepts; Codex retained the clearer bookmark language for marker navigation.

**Verified:**

- `git diff --check`, `npx tsc --noEmit`, and the unit gate → clean; 119/119 tests passed across 11 suites.
- Elevated full Playwright gate on port 8082 → 17/17 passed.
- Desktop browser visual inspection of unloaded and fixture-loaded states → the toolbar and dock
  render the single note, open repeat chassis, solid rounded transport, invariant marker shields,
  subdued state colours, and the compact bounded-range cue at actual control size.
- Browser assertions confirm add-marker transitions green add → red remove → green add while the
  existing repeat/inner-loop behavior and accessible state checks remain intact.

**Not verified / known gaps:**

- Native simulator and physical-iPhone visual/VoiceOver review were not rerun for the icon-only change.
- The icon work and the three earlier local commits are included in the push containing `d533a72`.

**Next agent should:**

- Continue physical-device visual/VoiceOver acceptance for the completed icon family.

#### Archived Done item — unloaded annotation spacing

- [x] Add an 8-point gap above the phone dock and keep the annotation field blank and non-interactive
      until audio is loaded
      <sub>**Key Artifacts:** `src/components/ui/controls/AnnotationField.tsx`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`</sub>

### 2026-10-15 — Refine the unloaded annotation field

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Add breathing room and silence the unloaded annotation field → Done

**Changed:**

- Added an 8-point portrait gap between the annotation field and the control dock; landscape retains
  its compact zero-bottom-margin rail layout.
- Removed the redundant unloaded annotation placeholder and blocked pointer interaction until a song
  is loaded, while retaining the existing disabled input semantics.
- Added browser coverage for the blank placeholder, non-editable state, and minimum dock spacing.

**Verified:**

- `npx tsc --noEmit` → clean.
- Focused Playwright V1 startup/settings workflow → 1/1 passed at 393×852.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun for this small spacing and disabled-state change.
- The repository remains uncommitted with the previously documented dock/loop and V1 cleanup work;
  no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun the full automated aggregates, then
  continue the physical-device acceptance checklist.

#### Archived Done item — full-surface liquid glass and annotation states

- [x] Unify portrait/landscape media glass and every custom menu, then correct annotation dots,
      full-field glass, long-text overflow, and unloaded media-control states
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/ErrorModal.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/styles/common.ts`, `src/styles/components/`, `src/styles/layout/sidebar.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

### 2026-10-16 — Unify glass surfaces and annotation states

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Full-surface liquid-glass and annotation/unloaded-state cleanup → Done

**Changed:**

- Confirmed portrait and landscape media controls share `GlassBackdrop`, then extended the same
  restrained material to Settings, Help, Projects, Save, Import, Export, and app error panels.
- Replaced unrelated blue/green modal fills and harsh borders with shared glass, subtle highlights,
  BeatNote orange primary actions, neutral glass actions, and semantic destructive actions.
- Made annotated-marker indicators violet and borderless, moved annotation glass into the field's
  exact bounds, and added tail truncation while idle with normal horizontal scrolling while editing.
- Disabled every media/dock action until audio is loaded, including reserved track, shuffle, speed,
  and previous-marker removal controls; essential Load Audio, Projects, and Settings remain usable.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites; full Playwright gate → 17/17 passed.
- Device Hub loaded the refreshed 1,325-module native bundle; portrait Settings and Projects glass
  panels were visually inspected. Landscape dock use of the shared backdrop is code- and browser-verified.

**Not verified / known gaps:**

- The new native iOS assertions were not run through Xcode; physical-device VoiceOver, keyboard,
  and touch-comfort acceptance remain pending.
- The user's concurrent icon work and prior polish changes are included in `d533a72`.

**Next agent should:**

- Run focused native launch/annotation/orientation tests, then continue physical-device acceptance.

#### Archived Done item — marker-gated annotation workflow

- [x] Replace the compact mobile annotation field with marker-gated modal editing, a bounded
      selected-marker callout, reversible marker deletion, the agreed portrait/landscape dock order,
      safe-area project padding, and orientation-stable glass sizing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `.kiro/steering/coding-standards.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/modals/AnnotationEditorModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/hooks/useDockToast.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/annotationCallout.ts`, `src/styles/components/modals/annotationEditorModal.ts`, `src/utils/markerSelection.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/unit/markerSelection.test.ts`, `tests/unit/studioStore.innerLoop.test.ts`, `tests/waveform-features.spec.ts`</sub>

### 2026-10-16 — Replace compact annotations and harden marker deletion

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Marker-gated annotations, reversible deletion, and responsive dock refinement → Done

**Changed:**

- Replaced the compact phone annotation field with a dock action enabled only at a nearby marker,
  a native-stable modal draft editor with explicit Save/Cancel, and a bounded two-line callout above
  the overview. The callout uses a darker but still translucent liquid-glass surface.
- Added bounded marker-deletion history that preserves annotations, an actionable Undo toast, and a
  long-press menu for restoring the latest deletion or deleting all earlier markers with confirmation.
- Applied the exact portrait/landscape button order, standardised marker glyph size, reclaimed the
  removed landscape annotation-row height, added safe-area-aware Projects/Close padding, and made
  glass backdrops remeasure after rotation.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and unit gate → clean; 123/123 tests passed across 12 suites.
- Full Playwright gate → 17/17 passed, including annotation modal/callout, Undo, Projects padding,
  exact dock order, and portrait-landscape-portrait glass geometry.
- Focused native annotation test typed `Live marker note` character by character and passed; focused
  native landscape/orientation workflow passed on iPhone 17 Pro / iOS 26.2.
- Device Hub visual review confirmed the expanded unloaded landscape canvas, safe Projects/Close
  insets, and a full-width portrait dock after returning from landscape.

**Not verified / known gaps:**

- Physical-device VoiceOver, touch comfort, and keyboard acceptance remain pending.
- This work and the prior user-approved icon/glass changes are included in `d533a72`.

**Next agent should:**

- Continue the active physical-device acceptance checklist, especially VoiceOver actions and
  long-press deletion comfort on hardware.

### 2026-10-16 — Extend timed annotation readability

**Agent:** orchestrator (Codex) · **Commit(s):** `e6bd48f`
**Kanban moved:** Timed annotation dwell and successive replacement → Done

**Changed:**

- Extended the mobile annotation callout from a 100-millisecond playhead match to a 2-second
  media-time reading window followed by a 350-millisecond exit fade.
- Shortened the original 3-second proposal to 2 seconds after the user's on-device timing feedback.
- Made the newest reached annotated marker replace the prior callout immediately, while unannotated
  markers leave the current note visible and same-time ties prefer the active layer.
- Kept the lingering callout bound to its source marker for editing while preserving the dock
  Annotation button's strict near-marker gate.
- Recorded the timed-comment chronology decision in the playback-dock requirements, design, and
  completed task list.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 129/129 passed across 13 suites, including dwell, replacement, tie, and blank-marker cases.
- Focused timing suite after the 2-second adjustment → 5/5 passed; TypeScript remained clean.
- Full Playwright gate → 17/17 passed.

**Not verified / known gaps:**

- The fade and live music timing have not yet been visually assessed on a physical iPhone.
- The implementation, tests, specs, and archived handover rotation are included in `e6bd48f`.

**Next agent should:**

- Check the 2-second dwell and 350-millisecond fade on-device during the existing physical acceptance pass.

### 2026-10-16 — Finish V1 settings and critical-test cleanup

**Agent:** orchestrator (Codex) · **Commit(s):** `fd99b7c`
**Kanban moved:** V1 full-screen settings/help, CSV contrast, and critical-only tests → Done

**Changed:**

- Replaced the phone's width-animated settings drawer with a safe-area-aware full-screen page in
  portrait and landscape, removing the bottom color gap and expansion-time text bunching.
- Removed visible BPM settings from V1 and rebuilt Help as a full-screen, mobile-first guide with
  touch controls before secondary web keyboard shortcuts.
- Added the semantic `onAccent` theme color and applied solid black, semibold text to both lines of
  the orange Import CSV and Export CSV actions.
- Made mobile Help swap into the existing Settings modal immediately instead of presenting a second
  full-screen native modal; its Back action returns to Settings, while Settings Close has no arrow.
- Moved Settings to the rightmost end of the mobile toolbar and replaced bottom-up modal motion with
  a 280-millisecond trailing-edge push: Settings enters from the right, Help pushes over it, and Back
  reverses that navigation while retaining the underlying page.
- Changed the mobile modal host to transparent `overFullScreen` presentation so the live BeatNote
  workspace remains behind the moving Settings page instead of exposing the native white host.
- Replaced 129 permanent unit tests, 11 redundant browser journeys, and 8 overlapping native cases
  with 6 critical Playwright journeys and 6 native integration cases. Jest remains available only
  for temporary test-first checks that must be removed after verification.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and `npm run test:unit` → clean; the temporary unit suite
  correctly reports no tests and exits successfully.
- Elevated Playwright gate on port 8082 → 6/6 critical journeys passed, including computed black
  text for both labels on both CSV actions.
- Focused iOS `testStudioLaunchesAndDocumentPickerOpens` → passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792161700307.xcresult`.
- Device Hub loaded the fresh 1,175-module bundle; the portrait Settings page visibly fills the
  device, respects the safe area, has no BPM control or bottom strip, and no longer width-expands.
- Device Hub visual review confirmed the arrowless Settings Close and immediate in-surface Help
  navigation; the focused Settings/Help Playwright workflows pass 2/2.
- Device Hub confirmed the rightmost Settings placement and final native page geometry. Focused iOS
  launch/settings passed with the trailing-position assertion; result bundle
  `ios/build/BeatNoteUITests-1792162543533.xcresult`.
- Device Hub reloaded the transparent host and confirmed Settings covers the live app cleanly; the
  focused Settings transition browser workflow passes 1/1 after the host change.

**Not verified / known gaps:**

- Physical-device VoiceOver, touch comfort, and external CSV sharing remain pending.
- Native landscape Settings is covered by the responsive implementation and browser geometry check;
  Device Hub's manual rotate view rendered the simulator surface sideways during this pass.
- Metro is running on port 8081 so the mounted Debug app remains usable in Device Hub.

**Next agent should:**

- Continue physical-device acceptance, beginning with Settings/Help rotation and CSV share-sheet
  readability on real hardware.

### 2026-10-17 — Ship pitch-preserved playback speed

**Agent:** orchestrator (Codex) · **Commit(s):** `738c3ae`
**Kanban moved:** Slow-down / pitch-preserve playback → Done

**Changed:**

- Added normalized global and project-persisted playback speed from 0.5× through 2× in 0.05×
  increments, defaulting safely to 1× for missing or invalid project values.
- Replaced the placeholder speed chooser with a responsive glass popup containing a live slider,
  current value, endpoints, eight common presets, Reset to 1×, and adjustable accessibility actions.
- Connected the store to `expo-audio`, forcing pitch correction on and requesting its high-quality
  algorithm whenever the speed or underlying player changes; no custom native module is needed for
  the supported range.
- Updated the playback-dock spec and durable architecture/iOS guidance to replace the superseded
  custom-module and web pitch-shift assumptions.
- DSH-Qwen delegation session `session-a4538ec3-46a5-4e53-8fe0-d7b431adb5b2` failed before producing
  output or edits; Codex implemented and verified the feature directly.

**Verified:**

- Temporary normalization checks → 2/2 passed for invalid input, clamping, and 0.05× quantization;
  the temporary test was removed per the project testing policy.
- `npx tsc --noEmit` and `git diff --check` → clean.
- Full retained Playwright gate on port 8082 → 6/6 passed; the dock journey verifies the 0.75×
  preset, slider-only 0.85× value, browser engine rate and pitch flag, popup bounds in both
  orientations, rotation persistence, and reset.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2; 2×
  advanced the media clock faster than wall time, reset returned to 1×, and loop transport remained
  intact. Result bundle: `ios/build/BeatNoteUITests-1792196091966.xcresult`.

**Not verified / known gaps:**

- Physical-device listening is still required for pitch fidelity and artifacts across the range,
  plus VoiceOver, live adjustment comfort, Bluetooth, interruptions, and background/loop behavior.
- Expo/Jest dependencies were aligned with the Expo SDK 54 recommendations in the same commit.
- The local-music library foundations were committed separately in `d7e9e2a`.

**Next agent should:**

- Run the playback-speed physical-device checklist with music containing exposed vocals and sustained
  notes, checking 0.5×, 0.75×, 1.25×, 1.5×, and 2× through speakers and Bluetooth.

### 2026-10-17 — Replace Settings sliders with a gear

**Agent:** orchestrator (Codex) · **Commit(s):** `48b312b`
**Kanban moved:** Settings gear icon → Done

**Changed:**

- Replaced the shared Settings sliders glyph with a conventional eight-tooth gear and centre hub,
  retaining BeatNote's 24×24 geometry, 1.75-point rounded stroke, button sizing, and accessibility.

**Verified:**

- `git diff --check` and `npx tsc --noEmit` → clean.
- Full retained Playwright gate on port 8082 → 6/6 critical journeys passed.
- Browser visual review at 393×852 → the gear is clear and balanced in the trailing phone toolbar slot.

**Not verified / known gaps:**

- Native simulator and physical-iPhone visual review were not rerun for this one-glyph change.
- The icon, archived handover rotation, and lifecycle state are included in `48b312b`.

**Next agent should:**

- Continue the physical-device acceptance checklist, beginning with Settings/Help rotation and CSV
  share-sheet readability on real hardware.

### 2026-10-18 — Add CSV migration transforms and version parity

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `1149eb5`
**Kanban moved:** local library CSV/migration decisions → In Progress

**Changed:**

- Added a shared CSV parser path that keeps legacy import errors while allowing a zero-row preview,
  reports existing/imported/skipped/beyond-duration counts, replaces all layer marker data, and
  captures/restores the actual prior draft state.
- Added deterministic legacy URI classification, missing-item matching, non-destructive V1.2
  project conversion, and resumable journal-step selection.
- Made `1.0.0` consistent across package and Expo configuration, generated iOS marketing/bundle
  metadata, the installed simulator app, and the running localhost Expo manifest. Added preflight
  checks before Metro and native run commands plus a prebuild plugin to prevent drift.
- DSH-Qwen produced the initial CSV transform, then stalled on the corrective follow-up. Codex
  removed its duplicated parser and guessed draft state before verification.

**Verified:**

- Temporary focused CSV and migration checks → 10/10 passed, including parser compatibility,
  zero-row preview, counts, replace/undo, URI classes, matching, preservation, and journal order;
  the temporary tests were then removed per policy.
- `npm run check:version`, `npx tsc --noEmit`, `git diff --check`, and the empty permanent unit gate
  → clean; `npx expo prebuild --platform ios --no-install` reapplied native configuration.
- Elevated retained Playwright gate on port 8082 → 6/6 critical journeys passed.
- The running Expo localhost manifest reports version `1.0.0` and iOS build `1`; the installed
  iPhone 17 Pro simulator app reports `CFBundleShortVersionString` `1.0.0` and build `1`.

**Not verified / known gaps:**

- CSV transforms and migration decisions are not wired to repositories, store actions, or UI yet.
- The physical iPhone development client was not inspected directly; its localhost manifest is
  aligned, but a native binary version change would still require rebuilding that client.
- Concurrent playback-dock edits remain uncommitted and outside `1149eb5`.

**Next agent should:**

- Implement Task 11's serialised persistence pipeline, then the typed repositories that consume it.

### 2026-10-18 — Fix speed-popup reopening and transport stacking

**Agent:** orchestrator (Codex) · **Commit(s):** `02aef09`
**Kanban moved:** Playback-speed post-dismissal and stacking regression → Done

**Changed:**

- Added an explicit closing-state ref so a Speed press during the final dismissal frame reverses the
  close and restores the chooser instead of restarting an invisible close animation.
- Raised both the speed cell and its containing dock row above the central Play control; empty centre
  cells remain touch-through, so Play stays operable whenever the chooser is absent.
- Extended the retained browser journey to reopen during the near-transparent close interval, prove
  the chooser remains open, and hit-test the chooser above Play at their overlap point.
- Updated the speed contract and design to require first-press reopening and topmost dock stacking.

**Verified:**

- Focused retained dock journey → 1/1 passed, including close reversal and popup-over-Play hit testing.
- `npx tsc --noEmit`, `git diff --check`, and the full retained Playwright gate on port 8082 → clean;
  6/6 critical journeys passed.

**Not verified / known gaps:**

- Two focused iOS attempts built successfully but stopped in shared test setup before reaching the
  popup assertions because the newly added Expo development client did not expose BeatNote's toolbar
  within the existing 10-second launch wait. Result bundles:
  `ios/build/BeatNoteUITests-1792281624743.xcresult` and
  `ios/build/BeatNoteUITests-1792281686987.xcresult`.
- The user's physical-phone screenshot was the Expo web build in Safari; the refreshed phone surface
  and native development client still need direct visual confirmation of the corrected stacking.

**Next agent should:**

- Align the iOS UI harness with the Expo development-client launch path, then rerun the focused speed
  case; continue the physical-device pitch and interaction checklist afterward.

### 2026-10-18 — Standardise native waveform extraction

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `02aef09`
**Kanban moved:** Web/native waveform parity → Done

**Changed:**

- Replaced the native random waveform fallback with a local Expo module that streams decoded PCM
  through AVAssetReader, reduces it to normalized peak/RMS buckets, and supplies both the wrapped
  gutter rows and loop overview strip with real audio-derived peaks.
- Introduced platform extraction providers, explicit `basic`/`detailed` resolution, shared in-memory
  and in-flight caches, and an honest timing-bar fallback on unsupported platforms.
- Kept entitlement logic out of extraction and documented a future V2 split: Lite can retain a
  basic real waveform while Pro can add detailed, persistent, zoomable waveform capability.
- Added retained iOS identifiers for decoded row and overview peaks and updated the waveform spec,
  architecture decision, roadmap, module count, and active simulator coverage.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, Expo autolinking resolution, CocoaPods installation, and a
  full unsigned iOS simulator build → passed; `BeatNoteWaveformModule` was discovered and compiled.
- Device Hub on iPhone 17 Pro / iOS 26.2 loaded `Dionela_Marilag.mp3` and visibly rendered matching
  real waveform structure in all wrapped rows and the green overview strip.
- Full retained Playwright gate → 6/6 critical journeys passed.
- Focused native journey found both new waveform identifiers after loading audio; the journey later
  failed after annotation save because the app hit a React Native Yoga assertion, outside extraction.
  Result bundle: `ios/build/BeatNoteUITests-1792328753084.xcresult`.

**Not verified / known gaps:**

- Physical-device extraction performance, thermal/memory behavior, VoiceOver, and very long or
  unusual audio formats still require acceptance.
- Android intentionally retains the timing-bar fallback until a native decoder provider is added.
- The downstream Yoga crash in the broader annotation journey needs separate diagnosis; waveform
  assertions completed successfully before it occurred.

**Next agent should:**

- Run real-device waveform acceptance with short and long MP3/M4A files, then continue the physical
  playback-speed and control-dock checks.

### 2026-10-19 — Harmonise waveform and playheads

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Overview waveform colour standardisation → Done

**Changed:**

- Replaced the overview's bright success-green waveform with the wrapped timeline's muted grey base
  and an active-layer-colour overlay clipped to elapsed playback.
- Kept semantic purple markers and teal loop state, then standardised both overview and active-row
  playheads on an amber core with a dark underlay and triangular top cap so they remain visible
  across every layer colour and cannot be mistaken for plain marker lines.
- Updated the waveform requirements and implementation plan, plus retained browser assertions for
  the muted waveform, elapsed colour, and both playheads' halo/core/cap treatment.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean for the scoped change.
- Focused retained waveform and dock journeys → 2/2 passed.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Physical-device contrast and visibility under different display brightness and accessibility
  settings remain part of loop-overview acceptance.
- Concurrent local-library repository/spec edits remain present and outside this task.

**Next agent should:**

- Check the overview palette and capped playhead on a physical iPhone, then continue loop-range
  VoiceOver, drag-performance, and audible-boundary acceptance.

### 2026-10-19 — Complete library store checkpoint

**Agent:** orchestrator (Codex) + reviewers · **Commit(s):** `03bbe4a`
**Kanban moved:** local library store/audio ownership → In Progress (Phase 4 complete)

**Changed:**

- Added the library, draft/project, queue, and switch slices, plus Import_Pipeline job mirroring and
  serialized queue persistence including queue removal.
- Added atomic track-state application for audio identity, normalized authored content, draft
  baseline, queue index, and session reset while preserving Repeat.
- Moved the playing URI and transitional filename into the store so queue switches cannot pair a
  new track with the prior song's save/export filename; notice IDs now remain monotonic across
  track commits.

**Verified:**

- Temporary focused store checks → 4/4 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Task 22 boot hydration, migration, missing-file reconciliation, and orphan sweeping are not wired.
- A DSH-Qwen read-only review task remained running without a completed report; independent focused
  review found and resolved the notice-ID and transitional-filename hazards.
- Physical-device Open-in delivery and existing hardware acceptance items remain pending.

**Next agent should:**

- Implement Task 22, beginning with strict singleton reads and the project-index I/O-failure guard,
  then add and mount the injectable boot lifecycle.

### 2026-10-20 — Complete boot and draft autosave checkpoints

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `c6f8c7a`, `009fa5c`
**Kanban moved:** local library boot + autosave → In Progress (Phase 5 complete)

**Changed:**

- Added strict, retryable launch hydration with migration locking, repaired derived project indexes,
  missing-file reconciliation, queue restoration, and a protected post-boot orphan sweep.
- Added per-song draft autosave with a 500 ms debounce, 2 s maximum latency, execution-time content
  snapshots, fingerprint skips, coalesced serialized writes, background flush, and foreground retry.
- Centralized persistence failures in an accessible glass banner and forwarded monotonic library
  notices into mobile and desktop dock toasts.

**Verified:**

- Boot temporary checks → 7/7 passed; autosave temporary checks → 6/6 passed; both suites were
  removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Background/force-quit draft restoration still requires the retained native journey after track
  switching and launch restoration are wired in Phase 7, plus physical-device acceptance.
- DSH-Qwen's Task 24 audit failed without output; an independent reviewer found four edge cases,
  all corrected before the final gates.
- Concurrent uncommitted waveform/playhead work remains present and outside the autosave commit.

**Next agent should:**

- Implement Task 26 safe Save/Save as New semantics, beginning with the single pipeline operation
  and revision/name conflict results before replacing the legacy Save prompt.

### 2026-10-21 — Complete safe project semantics

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `b5a4883`, `1a567bf`, `0cc511b`
**Kanban moved:** local library safe Save/project semantics → In Progress (Phase 6 complete)

**Changed:**

- Added serialized Save/Save as New with revision, name, read-only, partial-write, collision, and
  in-flight edit/switch handling, plus project rename, deletion, same-song open/revert, and CSV
  export for live or stored content.
- Replaced the legacy Save modal with an accessible validated prompt and shared confirmation dialog;
  successful saves now use the dock toast and revision conflicts offer Overwrite or Save as New.
- Removed the store's legacy project save/load actions. The existing manager now uses V1.2 project
  summaries and services, with an isolated cross-song audio bridge until Task 28.6.

**Verified:**

- Temporary focused save/project checks → 28/28 passed across save, autosave races, rename/delete,
  open/revert, CSV export, recovery, and unknown-field preservation; suites removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Focused save-prompt journey → 1/1 passed; full retained Playwright gate → 6/6 passed.

**Not verified / known gaps:**

- The retained browser fixture still uses the Task 21.5 direct-audio shim, so it validates the
  prompt but cannot complete a library-backed save until the Phase 9 import surface replaces it.
- Same-song destructive open/revert confirmations remain Task 36.4; physical-device focus,
  VoiceOver, and save/open persistence acceptance remain outstanding.
- DSH-Qwen's Task 26.4 review identified ignored draft-write failures, which were surfaced before
  commit; its discarded-edit and stale-state concerns did not apply to the specified synchronous
  replacement path.

**Next agent should:**

- Implement Task 28.1's track-switch transaction core, then the pending-destination and rollback
  semantics before wiring queue controls.

### 2026-10-21 — Complete track-switch transactions

**Agent:** orchestrator (Codex) + DSH-Qwen attempted audit · **Commit(s):** `ed00dac`
**Kanban moved:** local library track switching → In Progress (Phase 7 complete)

**Changed:**

- Added the single track-switch coordinator with preflight draft flushing, source resolution,
  duration probing, one-state audio/content/queue commit, player readiness, post-load persistence,
  rollback, directional Skip, and last-request coalescing.
- Added the exact dirty-project guard with Save & Switch, Keep Draft & Switch, Cancel, nested
  naming/revision handling, and accessibility title focus.
- Restored the persisted launch item through the transaction and routed explicit project opens and
  user-facing duplicate imports through the same guarded path; removed the cross-song audio shim.

**Verified:**

- Temporary transaction/launch checks → 20/20 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Native/physical-device switching, VoiceOver dialog traversal, interruption handling, and
  Open-in delivery remain unverified.
- DSH-Qwen exhausted its token window without returning an audit; the additional internal reviewer
  also hit its usage limit without findings.
- Concurrent uncommitted waveform/playhead and lifecycle-log edits remain outside `ed00dac`.

**Next agent should:**

- Implement Task 29.1 queue actions using `navigationBaseIndex`, then replace the reserved dock
  controls in Task 29.2.

### 2026-10-21 — Complete queue controls and capability gates

**Agent:** orchestrator (Codex) + DSH-Qwen partial audit · **Commit(s):** `83c1660`, `0dab428`
**Kanban moved:** local library queue controls → In Progress (Phase 8 checkpoint complete)

**Changed:**

- Replaced all four reserved dock cells with First, Previous, Next, and Shuffle controls backed by
  serialized queue actions, pending-switch-aware navigation, accessible states, and failure recovery.
- Applied provider capability gates to exact-seek navigation, waveform/overview interaction,
  playback speed, queue controls, Repeat, and Shuffle, with visible and accessibility explanations.
- Preserved local capabilities for the transitional direct-file loader, basic Play for sources
  without exact seeking, and the normal choose-music explanations when no source is loaded.

**Verified:**

- Temporary queue-action checks → 5/5 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.
- Focused iPhone 17 Pro / iOS 26.2 simulator transport journey → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792554646546.xcresult`.

**Not verified / known gaps:**

- Physical-device queue switching, provider-gated presentation, and VoiceOver remain unverified.
- DSH-Qwen later returned a partial low-severity audit before exhausting its token window; the
  actionable exact-seek and empty-state concerns had already been resolved before commit.
- Concurrent uncommitted waveform/playhead edits remain outside both queue commits.

**Next agent should:**

- Implement Task 31.1's shared icon glyphs, then Task 32's bottom-sheet primitive.

### 2026-10-22 — Complete the Music Library sheet

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `af1ef7a`, `654f8ab`, `bef8830`
**Kanban moved:** Music Library sheet and picker import → In Progress (Task 33 complete)

**Changed:**

- Added the accessible glass overflow menu, current/missing library rows, and cancellable or
  retryable import-progress rows with stable identifiers and large-text-safe controls.
- Added the scroll-safe Music Library sheet with exact loading, migration, empty, no-match, and
  read-error states; Imported Music filtering; persisted sort; diacritic-insensitive search; project
  counts; and guarded row switching with inline failure recovery.
- Moved sheet dismissal to the fully committed library-switch path, including guarded continuation,
  and added a session-only failure channel so provisional commits and rollbacks never dismiss the
  sheet or lose the row-level Retry action.
- Wired the native/web document picker to the shared durable Import Pipeline, including MIME and
  web extension filters, no-base64 web ingestion, cancellation semantics, queue rebuild/open, and
  dock confirmations.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean after each checkpoint.
- Full retained Playwright gate → 6/6 critical journeys passed after Tasks 33.1–33.2, 33.3, and 33.4.
- Installed Expo DocumentPicker source confirms the web `accept` attribute joins the supplied MIME
  and extension filters; a read-only second review found no remaining P1/P2 issues in Task 33.3.

**Not verified / known gaps:**

- The sheet is not mounted until Task 35.2, so integrated native/web visual checks, VoiceOver,
  keyboard/search, detent gestures, and real picker/import interaction remain pending.
- The requested DSH bridge discovery was retried, but no `dsh_collab` or `dsh_task_*` tool was
  exposed; a local Codex reviewer completed Task 33.3 review, while its later Task 33.4 pass hit an
  account usage limit before reporting.
- Concurrent uncommitted waveform/playhead edits remain outside all three commits.

**Next agent should:**

- Implement Task 34.1 music-item rename, then Task 34.2 deletion semantics.
