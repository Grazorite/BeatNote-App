# Implementation Plan: Demucs Stem Separation

## Overview

Implement hybrid stem separation in BeatNote using a layered approach: shared types and store additions first, then the cache layer, then the two separator modules (on-device and cloud), then the orchestration hook, then UI components, and finally wiring everything together. Each step is independently testable before the next builds on it.

## Tasks

- [x] 1. Add shared types and store state for stem separation
  - Create `src/features/stemSeparation/types.ts` with `StemSeparationStatus`, `StemSeparationMode`, `StemSeparationResult`, `StemCacheEntry`, `StemCacheMetadata`, `StemProgressEvent`, and `StemSeparationError` types
  - Add `stemSeparationStatus`, `stemSeparationProgress`, and `separatedStemUris` state fields to `useStudioStore.ts` with defaults `'idle'`, `0`, and `{}`
  - Add `setStemSeparationStatus`, `setStemSeparationProgress`, and `setSeparatedStemUris` actions using the simple `set({})` form
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 1.1 Write unit tests for store stem separation actions
    - Test `setStemSeparationStatus`, `setStemSeparationProgress`, `setSeparatedStemUris` update state correctly
    - Create a fresh store instance per test (not the singleton)
    - Property 9: after any sequence of store actions, `stemSeparationStatus` is always one of `{idle, processing, complete, error}`, `stemSeparationProgress` is always in [0, 100], and all keys in `separatedStemUris` are valid `LayerId` values — use `fast-check` for 100+ iterations
    - Property 8: status is `"processing"` and progress is `0` immediately after initiation; `"complete"` and `100` after success
    - _Requirements: 6.1, 6.2, 6.3, 4.5, 4.6_

- [ ] 2. Implement `stemCache.ts`
  - Install `js-sha256` (`npm install js-sha256`) for pure-JS hashing
  - Implement `computeHash(audioUri, stemCount)` using SHA-256 truncated to 16 hex chars
  - Implement `lookupCache(sourceHash)` reading from AsyncStorage key `beatnote_stem_cache`
  - Implement `storeCache(entry)` writing metadata to AsyncStorage and creating the stem directory under `<DocumentsDir>/beatnote_stems/<sourceHash>/`
  - Implement `deleteCache(sourceHash)` removing files from `expo-file-system` and the metadata entry from AsyncStorage
  - Implement `getAllCacheEntries()` and `getCacheSize()` for the storage management screen
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [-] 2.1 Write property tests for `stemCache.ts`
    - Property 1: cache round-trip — store then lookup returns identical `sourceHash`, `stemCount`, `stems`, and `createdAt`
    - Property 2: hash determinism — same `(audioUri, stemCount)` always returns the same hash across 100+ random pairs
    - Property 3: metadata completeness — stored entry always has all four required fields
    - Property 4: deletion inverse — store → delete → lookup returns `null`
    - Edge case: lookup on empty cache returns `null`
    - Edge case: two entries with different hashes do not overwrite each other
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [ ] 3. Implement the native Expo Module TypeScript interface
  - Create `modules/stem-separation/src/index.ts` with `StemSeparationNativeModule` interface and `requireNativeModule('StemSeparation')` export
  - Expose `separateStems(audioUri: string, stemCount: number): Promise<Record<string, string>>` and `cancelSeparation(): void`
  - Declare `onProgress` event type in `StemSeparationModuleEvents`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 4. Implement `onDeviceSeparator.ts`
  - Create `src/features/stemSeparation/onDeviceSeparator.ts`
  - Implement `separateOnDevice(options)` calling the native module `separateStems`, subscribing to `onProgress` events, and mapping output file names to `LayerId` keys
  - Implement `cancelOnDevice()` calling the native module `cancelSeparation()`
  - Map native module errors to typed `StemSeparationError` codes (`DEVICE_ERROR`, `MODEL_MISSING`, `INSUFFICIENT_MEMORY`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.2, 8.3, 8.4, 8.6_

  - [ ] 4.1 Write unit tests for `onDeviceSeparator.ts`
    - Mock the native module with `jest.fn()`
    - Property 5: stemCount=4 result has exactly `{vocals, drums, bass, other}` keys; stemCount=6 has exactly `{vocals, drums, bass, piano, guitar, other}` keys
    - Property 7: progress events emitted by the mock are non-decreasing and bounded in [0, 100]
    - Example: native module `separateStems` is called with the correct `audioUri` and `stemCount` arguments
    - Edge case: native module rejection maps to `DEVICE_ERROR`
    - Edge case: `MODEL_MISSING` error code from native module maps to `MODEL_MISSING` typed error
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.6_

- [ ] 5. Implement `cloudSeparator.ts`
  - Create `src/features/stemSeparation/cloudSeparator.ts`
  - Implement `separateCloud(options)`: POST to Replicate `/v1/predictions` with `facebook/demucs` model, poll every 2 seconds, map status to progress (`starting→5`, `processing→5–95` linear, `succeeded→100`)
  - Download each output URL to `<DocumentsDir>/beatnote_stems/<sourceHash>/` via `expo-file-system`
  - Map output filenames to `LayerId` keys and return the record
  - Handle `AbortSignal` for cancellation (delete the Replicate prediction on abort)
  - Map errors to typed `StemSeparationError` codes (`NO_API_KEY`, `NETWORK_ERROR`, `API_ERROR`)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.2, 10.3_

  - [ ] 5.1 Write unit tests for `cloudSeparator.ts`
    - Mock `fetch` with `jest.fn()` for Replicate API calls
    - Property 7: progress sequence from polled mock responses is non-decreasing and bounded in [0, 100]
    - Property 13: estimated time remaining is non-negative for any `(songDuration, currentProgress, elapsedMs)` triple where progress > 0
    - Example: correct Replicate endpoint and model are called; `Authorization` header contains the API key
    - Edge case: no API key → throws `StemSeparationError` with code `NO_API_KEY`
    - Edge case: API error response → throws `StemSeparationError` with code `API_ERROR` and the response message
    - Edge case: network failure → throws `StemSeparationError` with code `NETWORK_ERROR`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

- [ ] 6. Checkpoint — Ensure all unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement `useStemSeparation` hook and public API
  - Create `src/features/stemSeparation/useStemSeparation.ts`
  - Read `stemCount` and current audio URI from the store; compute `sourceHash` via `stemCache.computeHash`
  - Implement `initiateSeparation()`: check in-progress guard, set status to `"processing"` and progress to `0`, check cache, dispatch to on-device or cloud based on mode from AsyncStorage
  - In Auto mode: on `DEVICE_ERROR`, `MODEL_MISSING`, or `INSUFFICIENT_MEMORY`, present a confirmation dialog offering cloud fallback instead of immediately showing an error
  - Implement `cancelSeparation()` delegating to `cancelOnDevice()` or aborting the cloud `AbortController`
  - On success: call `storeCache`, then `setSeparatedStemUris` and `setStemSeparationStatus('complete')`
  - On error: call `setStemSeparationStatus('error')` and surface via `ErrorModal` pattern; log via `console.error` with context
  - Create `src/features/stemSeparation/index.ts` re-exporting the hook and public types
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.7, 4.3, 4.4, 4.5, 4.6, 4.7, 10.1, 10.4, 10.6_

  - [ ] 7.1 Write unit tests for `useStemSeparation` orchestration logic
    - Mock `stemCache`, `onDeviceSeparator`, `cloudSeparator`, and the store
    - Property 10: in-progress guard — calling `initiateSeparation` when status is `"processing"` leaves status unchanged and does not invoke any separator
    - Example: cache hit path sets `separatedStemUris` and status `"complete"` without calling any separator
    - Example: Auto mode on-device failure triggers cloud fallback offer
    - Example: `NO_SONG` error is surfaced when no audio URI is in the store
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 2.7_

- [ ] 8. Implement `StemProgressOverlay.tsx`
  - Create `src/components/ui/overlay/StemProgressOverlay.tsx` and its style file at `src/styles/components/overlay/stemProgressOverlay.ts`
  - Read `stemSeparationStatus` and `stemSeparationProgress` from the store; render only when status is `"processing"`
  - Display a progress bar bound to `stemSeparationProgress`
  - Compute and display estimated time remaining from progress rate and song duration (non-negative, per Property 13)
  - Render a cancel button that calls `cancelSeparation()` from `useStemSeparation`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Implement `StemSeparationSettings.tsx`
  - Create `src/components/ui/settings/StemSeparationSettings.tsx` and its style file
  - Render a mode selector (Auto / On-device only / Cloud only) persisted to AsyncStorage key `beatnote_stem_mode`
  - Render a Replicate API key text input that reads/writes via `expo-secure-store` key `beatnote_replicate_key`; never log or store the key in AsyncStorage
  - Show a warning when mode is `"cloud"` and no key is stored in SecureStore
  - Render a link/button to the Storage management screen
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 10. Implement the Storage management screen additions
  - Add a storage section (or screen) that calls `getAllCacheEntries()` and `getCacheSize()` to display total cache size and per-song cache size
  - Render a delete button per entry that calls `deleteCache(sourceHash)` and refreshes the list
  - _Requirements: 5.5, 5.6_

- [ ] 11. Wire `StemProgressOverlay` and `StemSeparationSettings` into the app shell
  - Mount `<StemProgressOverlay />` in `StudioScreen.tsx` (or the root layout) so it renders over all content during processing
  - Add `<StemSeparationSettings />` as a new section in `Sidebar.tsx`
  - Add the "Split Stems" button to the sidebar or toolbar, calling `initiateSeparation()` from `useStemSeparation`; disable the button when `stemSeparationStatus === 'processing'` or no song is loaded
  - _Requirements: 1.6, 1.7, 7.1, 7.4_

- [ ] 12. Update `StemsView` to use per-stem waveform URIs
  - Read `separatedStemUris` from the store inside `StemsView.tsx`
  - For each stem layer, pass `separatedStemUris[stem.id as LayerId] ?? audioUri` as the `audioUri` prop to `StemWaveform`
  - Verify `WaveformCanvas` (unified view) continues to receive the original full-mix `audioUri` prop unchanged from `StudioScreen`
  - _Requirements: 6.5, 6.6, 9.1, 9.2, 9.3, 9.4_

  - [ ] 12.1 Write unit tests for waveform URI selection logic
    - Property 11: toggling `viewMode` between `"unified"` and `"multitrack"` does not change `separatedStemUris` or `stemSeparationStatus`
    - Property 12: the URI passed to `WaveformCanvas` always equals the original full-mix audio URI, never a stem URI
    - Example: when `separatedStemUris` has a URI for `"drums"`, `StemsView` passes that URI to the drums `StemWaveform`
    - Example: when `separatedStemUris` is empty, `StemsView` falls back to the full-mix URI for all layers
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 6.5, 6.6_

- [ ] 13. Implement the Swift native module (`StemSeparationModule.swift`)
  - Create `modules/stem-separation/ios/StemSeparationModule.swift` using `ExpoModulesCore`
  - Declare `Name("StemSeparation")`, `Events("onProgress")`, `AsyncFunction("separateStems")`, and `Function("cancelSeparation")`
  - In `separateStems`: load the bundled `.mlmodelc` model file from `Bundle.main`, decode the audio at `audioUri`, run inference on the Neural Engine via CoreML on a background queue, emit `onProgress` events, write output stems to `<DocumentsDir>/beatnote_stems/<hash>/`, and resolve the promise with a `[stemName: fileUri]` dictionary
  - In `cancelSeparation`: cancel in-progress inference
  - Reject with `"MODEL_MISSING"` if the model file is absent or corrupted; reject with `"INSUFFICIENT_MEMORY"` on memory pressure
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 2.5_

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Add E2E tests for stem separation flows
  - Create `tests/stem-separation.spec.ts`
  - Test: "Split Stems" button is visible when a song is loaded
  - Test: tapping "Split Stems" shows the progress overlay with a progress bar and cancel button
  - Test: cancelling separation dismisses the overlay and resets status to idle
  - Test: after successful separation (mocked via service worker or fixture), per-layer waveforms appear in `StemsView`
  - Test: switching to unified view after separation shows the full-mix waveform, not a stem waveform
  - Test: Settings sidebar shows the stem separation mode selector and API key input
  - Test: entering an API key in settings persists it (verified by re-opening settings)
  - _Requirements: 1.1, 1.7, 4.1, 4.3, 6.5, 6.6, 7.1, 7.2, 7.3, 9.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The Swift native module (task 13) requires an EAS build — it cannot be tested in Expo Go
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Each property test comment should include the tag: `// Feature: demucs-stem-separation, Property N: <title>`
- The Replicate API key must never appear in logs, AsyncStorage, or project files — only in `expo-secure-store`
