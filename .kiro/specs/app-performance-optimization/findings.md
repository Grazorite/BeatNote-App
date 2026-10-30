# Performance Findings

These are static code-review candidates, not confirmed bottlenecks. A candidate is promoted only by
physical Release-local evidence in `results.md`.

| Rank | Hypothesis / evidence | Physical-iPhone relevance | Decision before measurement | Required confirmation |
|---:|---|---|---|---|
| 1 | H-9: `src/hooks/useWaveformData.ts` keeps decoded peak arrays in module-level `waveformCache` with no bound or eviction. Each URI can retain both detailed and overview products after switches. | Ten-switch and long-session physical footprint can grow even after returning to the first song. | Measure first; do not add eviction until switch-back behavior and retained size are known. | Allocations generations plus 5/15/30-minute and ten-switch footprint rows (3.3/4.6). |
| 2 | H-3: `WaveformCanvas.tsx` subscribes to `currentTime` and calls `generateWaveformPath(...)` inline in render. In detail mode this can rebuild the SVG string on each sampled position update. Wrapped rows and overview already memoise their path inputs. | Large peak arrays can turn every playback tick into JS work and SVG reconciliation in detail mode. | Instrument path construction; avoid changing the already-memoised wrapped view without contrary evidence. | Path counter and React/JS profiles for detail and wrapped views (4.2/4.3). |
| 3 | H-6: `draftAutosave.ts` clones persisted content and computes its fingerprint synchronously while constructing a write snapshot. Cost scales with layer marker/annotation count before storage I/O begins. | A 500-marker edit may block the JS thread during interaction even if the eventual write is asynchronous. | Measure first; chunking changes persistence ordering and force-quit guarantees. | Signposted 500-marker autosave with JS long-task duration (3.4/4.6). |
| 4 | H-2/H-4: `useZoomGesture.ts`, `useScrollZoom.ts`, `StemsView.tsx`, and `StemWaveform.tsx` use whole-store subscriptions. Those surfaces can reconstruct component work on unrelated store updates; the wrapped V1 path is much more granular. | Detail/stem surfaces may amplify playback updates, but hidden/deferred V1 surfaces may contribute nothing to the reported phone delay. | Audit and profile mounted surfaces before splitting selectors. | Complete subscription table and profiler commit reasons per view (4.1/4.2). |
| 5 | H-7 is not yet supported by a code defect: native BPM windows already run in detached utility-priority tasks with explicit cancellation checks, while waveform extraction is asynchronous but unprofiled. | Changing QoS or adding yields prematurely could slow analysis without improving playback. | Keep current scheduling until a contention trace shows main/JS/audio interference. | Seek/control latency, hitches, audio dropout, and cancellation during decode/BPM/autosave (3.4). |

The completed DSH-Qwen audit (`session-b21ea04d-e305-4b1a-802f-d1b8934c426a`) additionally identified
the 10 Hz playback sampling loop in `useAudioPlayer.ts` as the likely boundary for playhead feedback,
and the object-returning capability selector in `MainContent.tsx` as a high-signal H-2 candidate.
Both now have temporary counters/marks; neither is approved for optimisation until device profiler
counts and IVL traces establish its contribution.

## First physical baseline evidence

On the iPhone 15 Pro Max Release-local build, the final 20 paced S-medium/50 wrapped-waveform taps
completed the instrumented seek path at p50 46.77 ms, p90 51.20 ms, and max 54.01 ms. The interval
starts at the JS seek handler and ends after the native player seek promise plus the following
animation frame, so it passes the 100 ms playhead target as an instrumented completion measure. It
does not replace external-video first-feedback, audible-position, or ±20 ms accuracy evidence.

The slow-then-rapid interaction trace told a different story: six Animation Hitches totalled
1,658.698 ms over 51.348242 seconds (32.30 ms/s), with a 550.12 ms longest hitch, and the user saw
lag while tapping rapidly. Instruments' modeled signpost table retained only two overlapping seek
intervals, while the gated post-end unified-log fallback retained all 25. This confirms a physical
smoothness problem under rapid input, but not H-5's cause; task 4.4 must split touch delivery, JS,
store, React/Fabric, and frame time before O-5 or O-6 is authorised.

## Current interpretation

The most actionable physical-iPhone sequence is now: capture task 4.4's rapid-seek IVL breakdown,
then complete the scripted playback/scrub/sheet/keyboard hitch baselines and memory/path-generation
traces. The paced completion distribution alone does not authorise optimistic seeking (O-6), and
the rapid-input hitches do not yet distinguish JS/store work from Fabric or render-server stalls.

## Zustand subscription audit (task 4.1)

Generated from the TypeScript AST with `scripts/audit-zustand-subscriptions.js`. The static frequency
column describes when a selected value can change; device profiler counts are still required by
task 4.2 before changing selectors. Summary: 201 subscriptions — 158 granular, 18 derived selectors,
14 whole-store/broad, and 11 shallow-object selectors.

| Location | Classification | Playback frequency | Selector |
|---|---|---|---|
| `src/components/layout/MainContent.tsx:117` | granular | when field changes | `state => state.libraryNotice` |
| `src/components/layout/MainContent.tsx:118` | granular | when field changes | `state => state.songLoaded` |
| `src/components/layout/MainContent.tsx:119` | derived selector | evaluated on every update | `state => capabilitiesForLoadedItem( state.currentMusicItemId === null ? null : state.libraryItems[state.curren` |
| `src/components/layout/MainContent.tsx:124` | granular | when field changes | `state => state.playbackSpeed` |
| `src/components/layout/MainContent.tsx:125` | granular | stable action reference | `state => state.setPlaybackSpeed` |
| `src/components/layout/MainContent.tsx:126` | granular | when field changes | `state => state.switchPhase` |
| `src/components/layout/MainContent.tsx:127` | derived selector | evaluated on every update | `state => { const targetId = state.pendingSwitchTargetId ?? state.loadingMusicItemId; return targetId === null ` |
| `src/components/layout/MainContent.tsx:132` | granular | when field changes | `state => state.activeLayerId` |
| `src/components/layout/MainContent.tsx:133` | granular | when field changes | `state => state.allLayersData` |
| `src/components/layout/MainContent.tsx:134` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => markerKey( findMarkerNearTime(state.allLayersData, state.currentTime, state.activeLayerId), )` |
| `src/components/layout/MainContent.tsx:137` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => markerKey( findTimedAnnotationMarker(state.allLayersData, state.currentTime, state.activeLayerId), )` |
| `src/components/layout/MainContent.tsx:140` | granular | stable action reference | `state => state.setSelectedMarker` |
| `src/components/layout/MainContent.tsx:141` | granular | stable action reference | `state => state.updateMarkerAnnotation` |
| `src/components/layout/Sidebar.tsx:31` | granular | when field changes | `state => state.isSidebarCollapsed` |
| `src/components/layout/Sidebar.tsx:32` | granular | stable action reference | `state => state.toggleSidebar` |
| `src/components/layout/Sidebar.tsx:33` | granular | when field changes | `state => state.showHelpScreen` |
| `src/components/layout/Sidebar.tsx:34` | granular | stable action reference | `state => state.setShowHelpScreen` |
| `src/components/layout/StemsView.tsx:66` | broad | every store update | `(whole store)` |
| `src/components/layout/ViewModeToggle.tsx:7` | broad | every store update | `(whole store)` |
| `src/components/ui/common/PersistenceBanner.tsx:14` | granular | when field changes | `state => state.persistenceIssues` |
| `src/components/ui/controls/AnnotationField.tsx:30` | shallow object | when selected fields change | `useShallow(state => ({ currentTime: state.currentTime, allLayersData: state.allLayersData, showAnnotations: st` |
| `src/components/ui/controls/AudioControls.tsx:36` | shallow object | when selected fields change | `useShallow(state => ({ isPlaying: state.isPlaying, songLoaded: state.songLoaded, currentTime: state.currentTim` |
| `src/components/ui/controls/AudioControls.tsx:51` | derived selector | evaluated on every update | `state => state.songLoaded && isValidLoopRange(state, state.songDuration)` |
| `src/components/ui/controls/BeatAnchorControl.tsx:13` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/BeatAnchorControl.tsx:14` | granular | playback sample (~10 Hz) | `state => state.currentTime` |
| `src/components/ui/controls/BeatAnchorControl.tsx:15` | granular | when field changes | `state => state.bpm` |
| `src/components/ui/controls/BeatAnchorControl.tsx:16` | granular | when field changes | `state => state.beatAnchorMs` |
| `src/components/ui/controls/BeatAnchorControl.tsx:17` | granular | when field changes | `state => state.phraseStartMs` |
| `src/components/ui/controls/BeatAnchorControl.tsx:18` | granular | stable action reference | `state => state.setPhraseStartAtPlayhead` |
| `src/components/ui/controls/BeatAnchorControl.tsx:19` | granular | when field changes | `state => state.nudgeBeatAnchor` |
| `src/components/ui/controls/BpmControl.tsx:7` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:10` | granular | when field changes | `state => state.currentMusicItemId` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:11` | derived selector | evaluated on every update | `state => musicItemId ? state.analysisByItem[musicItemId] : undefined` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:12` | granular | when field changes | `state => state.manuallyOverriddenBpm` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:13` | granular | when field changes | `state => state.gridRestoreSnapshot` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:14` | granular | when field changes | `state => state.gridPreview` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:15` | granular | when field changes | `state => state.previewAnalysisSuggestion` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:16` | granular | when field changes | `state => state.applyGridPreview` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:17` | granular | when field changes | `state => state.cancelGridPreview` |
| `src/components/ui/controls/BpmSuggestionCard.tsx:18` | granular | stable action reference | `state => state.restoreGridSnapshot` |
| `src/components/ui/controls/CanvasOptionsToggle.tsx:11` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/ControlDock.tsx:48` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/CountSizeControl.tsx:11` | granular | when field changes | `state => state.countSize` |
| `src/components/ui/controls/CountSizeControl.tsx:12` | granular | stable action reference | `state => state.setCountSize` |
| `src/components/ui/controls/DanceCountDisplay.tsx:9` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => state.showDanceCounts ? state.currentTime : 0` |
| `src/components/ui/controls/DanceCountDisplay.tsx:10` | granular | when field changes | `state => state.bpm` |
| `src/components/ui/controls/DanceCountDisplay.tsx:11` | granular | when field changes | `state => state.countSize` |
| `src/components/ui/controls/DanceCountDisplay.tsx:12` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/DanceCountDisplay.tsx:13` | granular | when field changes | `state => state.showDanceCounts` |
| `src/components/ui/controls/DanceCountDisplay.tsx:14` | granular | when field changes | `state => state.beatAnchorMs` |
| `src/components/ui/controls/DanceCountDisplay.tsx:15` | granular | when field changes | `state => state.phraseStartMs` |
| `src/components/ui/controls/DanceCountVisibilityControl.tsx:9` | granular | when field changes | `state => state.showDanceCounts` |
| `src/components/ui/controls/DanceCountVisibilityControl.tsx:10` | granular | stable action reference | `state => state.setShowDanceCounts` |
| `src/components/ui/controls/GridLinesToggle.tsx:8` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/HelpButton.tsx:8` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/HorizontalLayerSelector.tsx:18` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/InnerLoopControl.tsx:16` | shallow object | when selected fields change | `useShallow(store => ({ marker: store.isLoopMarkerActive, range: store.isLoopRangeEnabled, loaded: store.songLo` |
| `src/components/ui/controls/LayerControls.tsx:9` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/LayerNameSettings.tsx:20` | granular | stable action reference | `state => state.setLayerCustomName` |
| `src/components/ui/controls/LayerNameSettings.tsx:21` | granular | stable action reference | `state => state.setTextInputFocused` |
| `src/components/ui/controls/LayerNameSettings.tsx:82` | granular | when field changes | `state => state.layers` |
| `src/components/ui/controls/LayerNameSettings.tsx:83` | granular | when field changes | `state => state.allLayersData` |
| `src/components/ui/controls/LayerNameSettings.tsx:84` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/LoopClearControl.tsx:22` | granular | when field changes | `state => state.loopStartMs` |
| `src/components/ui/controls/LoopClearControl.tsx:23` | granular | when field changes | `state => state.loopEndMs` |
| `src/components/ui/controls/LoopClearControl.tsx:24` | granular | when field changes | `state => state.songDuration` |
| `src/components/ui/controls/LoopClearControl.tsx:25` | granular | when field changes | `state => state.loopRestoreSnapshot` |
| `src/components/ui/controls/LoopClearControl.tsx:26` | granular | stable action reference | `state => state.clearLoopRange` |
| `src/components/ui/controls/LoopClearControl.tsx:27` | granular | stable action reference | `state => state.restoreLoopRange` |
| `src/components/ui/controls/LoopClearControl.tsx:28` | granular | when field changes | `state => state.discardLoopRestore` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:50` | granular | playback sample (~10 Hz) | `state => state.currentTime` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:124` | granular | playback sample (~10 Hz) | `state => state.currentTime` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:175` | granular | when field changes | `state => state.songDuration` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:176` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:177` | granular | when field changes | `state => state.allLayersData` |
| `src/components/ui/controls/LoopOverviewTrack.tsx:178` | granular | when field changes | `state => state.activeLayerId` |
| `src/components/ui/controls/LoopRangeLayer.tsx:57` | granular | when field changes | `state => state.nudgeLoopBound` |
| `src/components/ui/controls/LoopRangeLayer.tsx:58` | granular | stable action reference | `state => state.setLoopRange` |
| `src/components/ui/controls/LoopRangeOverview.tsx:25` | granular | when field changes | `state => state.showTimeline` |
| `src/components/ui/controls/LoopRangeOverview.tsx:26` | granular | when field changes | `state => state.loopStartMs` |
| `src/components/ui/controls/LoopRangeOverview.tsx:27` | granular | when field changes | `state => state.loopEndMs` |
| `src/components/ui/controls/LoopRangeOverview.tsx:28` | granular | when field changes | `state => state.songDuration` |
| `src/components/ui/controls/LoopRangeOverview.tsx:29` | granular | when field changes | `state => state.isLoopRangeEnabled` |
| `src/components/ui/controls/LoopRangeOverview.tsx:30` | granular | stable action reference | `state => state.setLoopStartAtPlayhead` |
| `src/components/ui/controls/LoopRangeOverview.tsx:31` | granular | stable action reference | `state => state.setLoopEndAtPlayhead` |
| `src/components/ui/controls/LoopRangeOverview.tsx:32` | granular | stable action reference | `state => state.clearLoopRange` |
| `src/components/ui/controls/MarkerButton.tsx:30` | shallow object | when selected fields change | `useShallow(state => ({ songLoaded: state.songLoaded, currentTime: state.currentTime, layers: state.layers, act` |
| `src/components/ui/controls/MarkerDockButton.tsx:22` | shallow object | when selected fields change | `useShallow(store => ({ loaded: store.songLoaded, current: store.currentTime, duration: store.songDuration, act` |
| `src/components/ui/controls/MarkerOptionsToggle.tsx:11` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/PlayPauseControl.tsx:14` | granular | when field changes | `state => state.isPlaying` |
| `src/components/ui/controls/PlayPauseControl.tsx:15` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/PlayPauseControl.tsx:16` | derived selector | evaluated on every update | `state => ( state.songLoaded && state.currentAudioUri !== null )` |
| `src/components/ui/controls/PlaybackSpeedControl.tsx:43` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/PlaybackSpeedControl.tsx:44` | derived selector | evaluated on every update | `state => capabilitiesForLoadedItem( state.currentMusicItemId === null ? null : state.libraryItems[state.curren` |
| `src/components/ui/controls/PlaybackTimeProbe.tsx:7` | granular | playback sample (~10 Hz) | `state => state.currentTime` |
| `src/components/ui/controls/PlaybackTimeProbe.tsx:8` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/ProjectControls.tsx:40` | shallow object | when selected fields change | `useShallow(state => ({ toggleSidebar: state.toggleSidebar, libraryStatus: state.libraryStatus, currentMusicIte` |
| `src/components/ui/controls/QueueTrackButton.tsx:54` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => state.currentTime > 3_000` |
| `src/components/ui/controls/QueueTrackButton.tsx:69` | shallow object | when selected fields change | `useShallow(state => ({ queue: state.queue, currentMusicItemId: state.currentMusicItemId, songLoaded: state.son` |
| `src/components/ui/controls/RepeatControl.tsx:14` | granular | when field changes | `state => state.isRepeatActive` |
| `src/components/ui/controls/RepeatControl.tsx:15` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/controls/RepeatControl.tsx:16` | granular | stable action reference | `state => state.toggleRepeat` |
| `src/components/ui/controls/RepeatControl.tsx:17` | derived selector | evaluated on every update | `state => capabilitiesForLoadedItem( state.currentMusicItemId === null ? null : state.libraryItems[state.curren` |
| `src/components/ui/controls/SidebarToggle.tsx:8` | broad | every store update | `(whole store)` |
| `src/components/ui/controls/SongTitleControl.tsx:19` | granular | when field changes | `state => state.currentMusicItemId` |
| `src/components/ui/controls/SongTitleControl.tsx:20` | derived selector | evaluated on every update | `state => ( state.currentMusicItemId === null ? null : state.libraryItems[state.currentMusicItemId] ?? null )` |
| `src/components/ui/controls/StemSelector.tsx:7` | broad | every store update | `(whole store)` |
| `src/components/ui/library/MusicLibrarySheet.tsx:91` | granular | when field changes | `state => state.isLibrarySheetOpen` |
| `src/components/ui/library/MusicLibrarySheet.tsx:92` | granular | when field changes | `state => state.libraryItems` |
| `src/components/ui/library/MusicLibrarySheet.tsx:93` | granular | when field changes | `state => state.librarySort` |
| `src/components/ui/library/MusicLibrarySheet.tsx:94` | granular | when field changes | `state => state.projectSummaries` |
| `src/components/ui/library/MusicLibrarySheet.tsx:95` | granular | when field changes | `state => state.importJobs` |
| `src/components/ui/library/MusicLibrarySheet.tsx:96` | granular | when field changes | `state => state.libraryStatus` |
| `src/components/ui/library/MusicLibrarySheet.tsx:97` | granular | when field changes | `state => state.currentMusicItemId` |
| `src/components/ui/library/MusicLibrarySheet.tsx:98` | granular | when field changes | `state => state.loadingMusicItemId` |
| `src/components/ui/library/MusicLibrarySheet.tsx:99` | granular | when field changes | `state => state.switchPhase` |
| `src/components/ui/library/MusicLibrarySheet.tsx:100` | granular | when field changes | `state => state.switchGuard` |
| `src/components/ui/library/MusicLibrarySheet.tsx:101` | granular | when field changes | `state => state.librarySwitchFailure` |
| `src/components/ui/library/MusicLibrarySheet.tsx:102` | granular | when field changes | `state => state.saveInProgress` |
| `src/components/ui/library/MusicLibrarySheet.tsx:103` | granular | stable action reference | `state => state.closeLibrarySheet` |
| `src/components/ui/library/MusicLibrarySheet.tsx:104` | granular | stable action reference | `state => state.setLibrarySort` |
| `src/components/ui/library/MusicLibrarySheet.tsx:105` | granular | stable action reference | `state => state.notify` |
| `src/components/ui/modals/ProjectManagerModal.tsx:143` | shallow object | when selected fields change | `useShallow(state => ({ projectSummaries: state.projectSummaries, libraryItems: state.libraryItems, currentMusi` |
| `src/components/ui/modals/SwitchGuardDialog.tsx:23` | granular | when field changes | `state => state.switchGuard` |
| `src/components/ui/modals/SwitchGuardDialog.tsx:24` | granular | when field changes | `state => state.currentMusicItemId` |
| `src/components/ui/modals/SwitchGuardDialog.tsx:25` | derived selector | evaluated on every update | `state => ( state.currentMusicItemId === null ? 'this song' : state.libraryItems[state.currentMusicItemId]?.dis` |
| `src/components/ui/modals/SwitchGuardDialog.tsx:30` | derived selector | evaluated on every update | `state => state.draftBaselineName ?? 'saved project'` |
| `src/components/ui/waveform/RhythmicGrid.tsx:18` | granular | when field changes | `state => state.bpm` |
| `src/components/ui/waveform/RhythmicGrid.tsx:19` | granular | when field changes | `state => state.viewportStartTime` |
| `src/components/ui/waveform/RhythmicGrid.tsx:20` | granular | when field changes | `state => state.viewportDuration` |
| `src/components/ui/waveform/RhythmicGrid.tsx:21` | granular | when field changes | `state => state.showGridLines` |
| `src/components/ui/waveform/RhythmicGrid.tsx:22` | granular | when field changes | `state => state.countSize` |
| `src/components/ui/waveform/RhythmicGrid.tsx:23` | granular | when field changes | `state => state.showDanceCounts` |
| `src/components/ui/waveform/RhythmicGrid.tsx:24` | granular | when field changes | `state => state.beatAnchorMs` |
| `src/components/ui/waveform/RhythmicGrid.tsx:25` | granular | when field changes | `state => state.phraseStartMs` |
| `src/components/ui/waveform/RhythmicGrid.tsx:26` | granular | when field changes | `state => state.gridPreview` |
| `src/components/ui/waveform/RowGutter.tsx:26` | granular | when field changes | `state => state.bpm` |
| `src/components/ui/waveform/RowGutter.tsx:27` | granular | when field changes | `state => state.countSize` |
| `src/components/ui/waveform/RowGutter.tsx:28` | granular | when field changes | `state => state.showDanceCounts` |
| `src/components/ui/waveform/RowGutter.tsx:29` | granular | when field changes | `state => state.beatAnchorMs` |
| `src/components/ui/waveform/RowGutter.tsx:30` | granular | when field changes | `state => state.phraseStartMs` |
| `src/components/ui/waveform/StemWaveform.tsx:47` | broad | every store update | `(whole store)` |
| `src/components/ui/waveform/WaveformCanvas.tsx:58` | granular | when field changes | `state => state.viewportStartTime` |
| `src/components/ui/waveform/WaveformCanvas.tsx:59` | granular | when field changes | `state => state.viewportDuration` |
| `src/components/ui/waveform/WaveformCanvas.tsx:60` | granular | when field changes | `state => state.pixelsPerSecond` |
| `src/components/ui/waveform/WaveformCanvas.tsx:61` | granular | playback sample (~10 Hz) | `state => state.currentTime` |
| `src/components/ui/waveform/WaveformCanvas.tsx:62` | granular | when field changes | `state => state.ghostPlayheadTime` |
| `src/components/ui/waveform/WaveformCanvas.tsx:63` | granular | when field changes | `state => state.songDuration` |
| `src/components/ui/waveform/WaveformCanvas.tsx:64` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/waveform/WaveformCanvas.tsx:65` | granular | when field changes | `state => state.loopStartMs` |
| `src/components/ui/waveform/WaveformCanvas.tsx:66` | granular | when field changes | `state => state.loopEndMs` |
| `src/components/ui/waveform/WaveformCanvas.tsx:67` | granular | when field changes | `state => state.isPlaying` |
| `src/components/ui/waveform/WaveformCanvas.tsx:68` | granular | when field changes | `state => state.showGridLines` |
| `src/components/ui/waveform/WaveformCanvas.tsx:69` | granular | when field changes | `state => state.bpm` |
| `src/components/ui/waveform/WaveformCanvas.tsx:70` | granular | when field changes | `state => state.countSize` |
| `src/components/ui/waveform/WaveformCanvas.tsx:71` | granular | when field changes | `state => state.beatAnchorMs` |
| `src/components/ui/waveform/WaveformCanvas.tsx:72` | granular | when field changes | `state => state.phraseStartMs` |
| `src/components/ui/waveform/WaveformCanvas.tsx:73` | granular | when field changes | `state => state.gridPreview` |
| `src/components/ui/waveform/WaveformCanvas.tsx:74` | granular | when field changes | `state => state.magneticSnapping` |
| `src/components/ui/waveform/WaveformCanvas.tsx:75` | granular | when field changes | `state => state.allLayersData` |
| `src/components/ui/waveform/WaveformCanvas.tsx:76` | granular | stable action reference | `state => state.setViewportStartTime` |
| `src/components/ui/waveform/WaveformCanvas.tsx:77` | granular | stable action reference | `state => state.setCurrentTime` |
| `src/components/ui/waveform/WaveformCanvas.tsx:78` | granular | stable action reference | `state => state.setGhostPlayheadTime` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:31` | granular | when field changes | `state => state.primaryView` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:32` | granular | when field changes | `state => state.selectedRowIndex` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:33` | granular | stable action reference | `state => state.setPrimaryView` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:34` | granular | stable action reference | `state => state.setSelectedRowIndex` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:35` | granular | stable action reference | `state => state.setViewportDuration` |
| `src/components/ui/waveform/WaveformWorkspace.tsx:36` | granular | stable action reference | `state => state.setViewportStartTime` |
| `src/components/ui/waveform/WrappedRow.tsx:143` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => clipRowProgress(row, state.currentTime)` |
| `src/components/ui/waveform/WrappedRow.tsx:145` | derived selector | evaluated on every update | `state => { const selected = state.selectedMarker; return selected && selected.timestamp >= row.startMs && sele` |
| `src/components/ui/waveform/WrappedRow.tsx:151` | granular | stable action reference | `state => state.setCurrentTime` |
| `src/components/ui/waveform/WrappedRow.tsx:152` | granular | stable action reference | `state => state.setGhostPlayheadTime` |
| `src/components/ui/waveform/WrappedWaveform.tsx:60` | granular | when field changes | `state => state.songDuration` |
| `src/components/ui/waveform/WrappedWaveform.tsx:61` | granular | when field changes | `state => state.songLoaded` |
| `src/components/ui/waveform/WrappedWaveform.tsx:62` | granular | when field changes | `state => state.activeLayerId` |
| `src/components/ui/waveform/WrappedWaveform.tsx:63` | granular | when field changes | `state => state.isPlaying` |
| `src/components/ui/waveform/WrappedWaveform.tsx:64` | granular | when field changes | `state => state.followPlayhead` |
| `src/components/ui/waveform/WrappedWaveform.tsx:65` | granular | when field changes | `state => state.loopStartMs` |
| `src/components/ui/waveform/WrappedWaveform.tsx:66` | granular | when field changes | `state => state.loopEndMs` |
| `src/components/ui/waveform/WrappedWaveform.tsx:67` | granular | when field changes | `state => state.isLoopRangeEnabled` |
| `src/components/ui/waveform/WrappedWaveform.tsx:68` | granular | when field changes | `state => state.rowDensity` |
| `src/components/ui/waveform/WrappedWaveform.tsx:69` | granular | stable action reference | `state => state.setFollowPlayhead` |
| `src/components/ui/waveform/WrappedWaveform.tsx:70` | granular | stable action reference | `state => state.setRowDensity` |
| `src/components/ui/waveform/WrappedWaveform.tsx:71` | granular | stable action reference | `state => state.setSelectedMarker` |
| `src/components/ui/waveform/WrappedWaveform.tsx:72` | granular | when field changes | `state => state.selectedRowIndex` |
| `src/features/library/useLibraryLifecycle.ts:411` | granular | when field changes | `state => state.libraryStatus` |
| `src/features/library/useLibraryLifecycle.ts:412` | granular | when field changes | `state => state.importJobs` |
| `src/features/studio/StudioScreen.tsx:34` | shallow object | when selected fields change | `useShallow(state => ({ layers: state.layers, activeLayerId: state.activeLayerId, setActiveLayer: state.setActi` |
| `src/hooks/useAudioPlayer.ts:43` | granular | when field changes | `state => state.currentAudioUri` |
| `src/hooks/useAudioPlayer.ts:44` | granular | when field changes | `state => state.currentAudioFilename` |
| `src/hooks/useAudioPlayer.ts:45` | derived selector | evaluated on every update | `state => ( state.currentMusicItemId === null ? state.currentAudioFilename ?? 'BeatNote' : state.libraryItems[s` |
| `src/hooks/useAudioPlayer.ts:69` | shallow object | when selected fields change | `useShallow(state => ({ isPlaying: state.isPlaying, layers: state.layers, activeLayerId: state.activeLayerId, s` |
| `src/hooks/useKeyboardShortcuts.ts:34` | shallow object | when selected fields change | `useShallow(state => ({ removeLastMarker: state.removeLastMarker, redoLastMarker: state.redoLastMarker, navigat` |
| `src/hooks/useScrollZoom.ts:10` | broad | every store update | `(whole store)` |
| `src/hooks/useWrappedRows.ts:43` | granular | when field changes | `(s) => s.songDuration` |
| `src/hooks/useWrappedRows.ts:44` | granular | when field changes | `(s) => s.bpm` |
| `src/hooks/useWrappedRows.ts:45` | granular | when field changes | `(s) => s.countSize` |
| `src/hooks/useWrappedRows.ts:46` | granular | when field changes | `(s) => s.rowDensity` |
| `src/hooks/useWrappedRows.ts:96` | derived selector | evaluated on every update; output may change at ~10 Hz | `state => ( timestampToRow(rows, toFiniteNumber(state.currentTime)) )` |
| `src/hooks/useZoomGesture.ts:12` | broad | every store update | `(whole store)` |
