# Requirements Document

> **Release status:** deferred. These requirements describe the eventual V3 hybrid feature. A V3
> cloud-first beta may implement only the cloud, progress/cancellation, cache, store, error-handling,
> and limited waveform requirements after the gates in
> [`.kiro/steering/release-roadmap.md`](../../steering/release-roadmap.md) are satisfied.
> Requirements that expose a user-provided Replicate key are superseded by ADR-010 and must be
> rewritten around managed backend authorization before implementation resumes.

## Introduction

Hybrid stem separation for BeatNote using Demucs. The feature provides a single "Split Stems" action that separates a loaded audio file into individual instrument stems (vocals, drums, bass, piano, guitar, other) using either on-device CoreML inference or the Replicate cloud API. The system automatically selects the processing tier based on device capability and user preference, caches results for instant reload, and integrates separated stems into the existing layer-based waveform display.

## Glossary

- **Stem_Separator**: The orchestration module (`useStemSeparation` hook) that coordinates on-device and cloud separation, caching, progress reporting, and store updates.
- **On_Device_Separator**: The native iOS module (`StemSeparationModule.swift` via Expo Modules API) that runs Demucs htdemucs CoreML inference on the device Neural Engine.
- **Cloud_Separator**: The TypeScript module (`cloudSeparator.ts`) that submits audio to the Replicate API, polls for completion, and downloads separated stem files.
- **Stem_Cache**: The persistence module (`stemCache.ts`) that stores and retrieves separated stem audio files using `expo-file-system` and tracks metadata in AsyncStorage.
- **Progress_Overlay**: The modal UI component that displays separation progress, estimated time remaining, and a cancel button during processing.
- **Settings_Panel**: The existing sidebar settings area extended with stem separation mode, API key input, and cache management controls.
- **Store**: The Zustand store (`useStudioStore.ts`) that holds all global application state including stem separation status, progress, and stem URIs.
- **LayerId**: One of six fixed internal identifiers: `vocals`, `drums`, `bass`, `piano`, `guitar`, `other`.
- **Stem_Count**: The number of stems to separate into — 4 (vocals, drums, bass, other) or 6 (adds piano, guitar).
- **Source_Hash**: A hash derived from the source audio URI combined with the requested stem count, used as the cache key.
- **StemsView**: The multitrack waveform display component that renders individual layer waveforms.
- **WaveformCanvas**: The unified waveform display component that renders the full-mix audio.

## Requirements

### Requirement 1: Initiate Stem Separation

**User Story:** As a choreographer, I want to tap a single "Split Stems" button to separate my loaded song into individual instrument stems, so that I can annotate each instrument layer independently.

#### Acceptance Criteria

1. WHEN the user taps the "Split Stems" action and a song is loaded, THE Stem_Separator SHALL check the Stem_Cache for an existing result matching the Source_Hash of the current audio URI and Stem_Count.
2. WHEN a cached result exists for the Source_Hash, THE Stem_Separator SHALL load the cached stem URIs into the Store without re-processing.
3. WHEN no cached result exists and the separation mode is "Auto", THE Stem_Separator SHALL attempt On_Device_Separator first.
4. WHEN no cached result exists and the separation mode is "On-device only", THE Stem_Separator SHALL use On_Device_Separator exclusively.
5. WHEN no cached result exists and the separation mode is "Cloud only", THE Stem_Separator SHALL use Cloud_Separator exclusively.
6. IF the user taps "Split Stems" and no song is loaded, THEN THE Stem_Separator SHALL display an error message indicating that a song must be loaded first.
7. WHILE stem separation is in progress, THE Stem_Separator SHALL prevent the user from initiating another separation request.

### Requirement 2: On-Device CoreML Separation

**User Story:** As a choreographer, I want stem separation to work offline on my iOS device, so that I can prepare my music without needing an internet connection.

#### Acceptance Criteria

1. WHEN on-device separation is initiated, THE On_Device_Separator SHALL invoke the bundled htdemucs CoreML model via the Expo Modules API native Swift module.
2. WHEN the Stem_Count is 4, THE On_Device_Separator SHALL produce stems for vocals, drums, bass, and other.
3. WHEN the Stem_Count is 6, THE On_Device_Separator SHALL produce stems for vocals, drums, bass, piano, guitar, and other using the htdemucs_6s model variant.
4. WHILE on-device inference is running, THE On_Device_Separator SHALL report progress updates from 0 to 100 via native module callbacks.
5. THE On_Device_Separator SHALL execute inference on the Neural Engine via CoreML, not on the CPU.
6. WHEN on-device separation completes successfully, THE On_Device_Separator SHALL write each stem as a separate audio file to the `expo-file-system` Documents directory.
7. IF on-device separation fails or times out in "Auto" mode, THEN THE Stem_Separator SHALL present the user with an option to retry using Cloud_Separator.

### Requirement 3: Cloud API Separation (Replicate)

**User Story:** As a choreographer, I want a cloud-based separation option for higher quality results, so that I get the cleanest possible stems for detailed annotation work.

#### Acceptance Criteria

1. WHEN cloud separation is initiated, THE Cloud_Separator SHALL submit the audio file to the Replicate API using the `facebook/demucs` model.
2. THE Cloud_Separator SHALL authenticate with the Replicate API using the user-provided API key stored in `expo-secure-store`.
3. WHILE a Replicate prediction is in progress, THE Cloud_Separator SHALL poll the prediction status every 2 seconds and map the status to a progress value from 0 to 100.
4. WHEN the Replicate prediction completes, THE Cloud_Separator SHALL download each separated stem file and write the files to the `expo-file-system` Documents directory.
5. IF cloud separation is requested and no Replicate API key is stored, THEN THE Cloud_Separator SHALL display a prompt instructing the user to enter an API key in Settings.
6. IF the Replicate API returns an error, THEN THE Cloud_Separator SHALL display the error message to the user and set the Store separation status to "error".
7. IF the device has no internet connection when cloud separation is requested, THEN THE Cloud_Separator SHALL display an error message indicating that internet access is required.

### Requirement 4: Separation Progress and Cancellation

**User Story:** As a choreographer, I want to see how long stem separation will take and be able to cancel it, so that I am not stuck waiting with no feedback.

#### Acceptance Criteria

1. WHILE stem separation is in progress, THE Progress_Overlay SHALL display a progress bar reflecting the current progress percentage (0–100).
2. WHILE stem separation is in progress, THE Progress_Overlay SHALL display an estimated time remaining based on the song duration and current progress rate.
3. WHEN the user taps the cancel button on the Progress_Overlay during on-device separation, THE Stem_Separator SHALL cancel the native CoreML inference and set the Store separation status to "idle".
4. WHEN the user taps the cancel button on the Progress_Overlay during cloud separation, THE Stem_Separator SHALL delete the Replicate prediction and set the Store separation status to "idle".
5. WHEN separation begins, THE Store SHALL set `stemSeparationStatus` to "processing" and `stemSeparationProgress` to 0.
6. WHEN separation completes successfully, THE Store SHALL set `stemSeparationStatus` to "complete" and `stemSeparationProgress` to 100.
7. IF separation fails, THEN THE Store SHALL set `stemSeparationStatus` to "error".

### Requirement 5: Stem Caching and Storage Management

**User Story:** As a choreographer, I want previously separated stems to load instantly and I want to manage how much storage they use, so that I do not waste time re-processing or run out of device storage.

#### Acceptance Criteria

1. WHEN stem separation completes successfully, THE Stem_Cache SHALL store the stem audio files in the `expo-file-system` Documents directory and persist cache metadata in AsyncStorage under the key `beatnote_stem_cache`.
2. THE Stem_Cache SHALL use a Source_Hash derived from the source audio URI and the Stem_Count as the cache key for each entry.
3. WHEN a cached entry is loaded, THE Stem_Cache SHALL return the stored stem file URIs mapped to their corresponding LayerId values.
4. THE Stem_Cache SHALL store the following metadata per entry: Source_Hash, Stem_Count, a mapping of LayerId to file URI, and a creation timestamp.
5. WHEN the user navigates to Settings and selects Storage, THE Settings_Panel SHALL display the total cache size and the cache size per song.
6. WHEN the user deletes a cached entry from the Storage screen, THE Stem_Cache SHALL remove the corresponding stem audio files from the Documents directory and remove the metadata entry from AsyncStorage.

### Requirement 6: Store Integration

**User Story:** As a developer, I want stem separation state managed in the Zustand store, so that all UI components can reactively display separation status and stem data.

#### Acceptance Criteria

1. THE Store SHALL maintain a `stemSeparationStatus` field with values "idle", "processing", "complete", or "error".
2. THE Store SHALL maintain a `stemSeparationProgress` field as a number from 0 to 100.
3. THE Store SHALL maintain a `separatedStemUris` field as a partial record mapping LayerId to file URI strings.
4. THE Store SHALL provide `setStemSeparationStatus`, `setStemSeparationProgress`, and `setSeparatedStemUris` actions to update stem separation state.
5. WHEN `separatedStemUris` is populated and the view mode is "multitrack", THE StemsView SHALL render each layer waveform using the corresponding stem file URI from `separatedStemUris`.
6. WHEN `separatedStemUris` is populated and the view mode is "unified", THE WaveformCanvas SHALL continue to render the original full-mix audio URI.

### Requirement 7: Settings for Stem Separation

**User Story:** As a choreographer, I want to choose between on-device and cloud separation and manage my API key, so that I can control quality, speed, and cost.

#### Acceptance Criteria

1. THE Settings_Panel SHALL provide a stem separation mode selector with options: "Auto", "On-device only", and "Cloud only".
2. THE Settings_Panel SHALL provide a text input for the Replicate API key.
3. WHEN the user enters a Replicate API key, THE Settings_Panel SHALL store the key in `expo-secure-store` and never in AsyncStorage.
4. THE Settings_Panel SHALL provide a link to the Storage management screen for cache management.
5. IF the user selects "Cloud only" mode and no API key is stored, THEN THE Settings_Panel SHALL display a warning indicating that an API key is required.
6. THE application binary SHALL NOT bundle a default Replicate API key.

### Requirement 8: Native iOS Module (Expo Modules API)

**User Story:** As a developer, I want the CoreML inference exposed as an Expo Module with a TypeScript interface, so that the React Native layer can invoke on-device separation without ejecting from the Expo managed workflow.

#### Acceptance Criteria

1. THE On_Device_Separator SHALL be implemented as an Expo Module under `modules/stem-separation/` with a Swift implementation (`StemSeparationModule.swift`) and a TypeScript interface (`src/index.ts`).
2. THE native module SHALL expose a `separateStems(audioUri: string, stemCount: number)` function that returns a promise resolving to a record mapping stem names to output file URIs.
3. THE native module SHALL expose a `cancelSeparation()` function that cancels any in-progress inference.
4. THE native module SHALL emit progress events with a numeric value from 0 to 100 during inference.
5. THE native module SHALL bundle the htdemucs CoreML model file within the application binary.
6. IF the CoreML model file is missing or corrupted, THEN THE native module SHALL reject the promise with a descriptive error message.

### Requirement 9: Waveform Display After Separation

**User Story:** As a choreographer, I want to see individual waveforms for each separated stem, so that I can visually identify instrument patterns when placing beat markers.

#### Acceptance Criteria

1. WHEN `separatedStemUris` contains a URI for a given LayerId and the view mode is "multitrack", THE StemsView SHALL use that stem URI for waveform rendering of the corresponding layer.
2. WHEN `separatedStemUris` does not contain a URI for a given LayerId, THE StemsView SHALL fall back to rendering a placeholder or the full-mix waveform for that layer.
3. WHEN the user toggles between "unified" and "multitrack" view modes, THE application SHALL switch between the full-mix waveform and per-stem waveforms without re-processing.
4. THE WaveformCanvas SHALL continue to use the original full-mix audio URI regardless of whether stems have been separated.

### Requirement 10: Error Handling and Edge Cases

**User Story:** As a choreographer, I want clear error messages when stem separation fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. IF on-device separation fails due to insufficient device memory, THEN THE Stem_Separator SHALL display an error message suggesting the user close other applications or use cloud separation.
2. IF cloud separation fails due to an invalid or expired API key, THEN THE Cloud_Separator SHALL display an error message instructing the user to check the API key in Settings.
3. IF cloud separation fails due to a network timeout, THEN THE Cloud_Separator SHALL display an error message and offer a retry option.
4. IF the source audio file is in an unsupported format for Demucs processing, THEN THE Stem_Separator SHALL display an error message listing the supported audio formats.
5. IF the `expo-file-system` Documents directory has insufficient storage space to write stem files, THEN THE Stem_Cache SHALL display an error message suggesting the user free up storage via the Storage management screen.
6. WHEN any separation error occurs, THE Store SHALL set `stemSeparationStatus` to "error" and THE Stem_Separator SHALL log the error details via `console.error` with context.
