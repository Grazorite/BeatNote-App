# Implementation Plan: Local Music Library and Playback Queue

## Overview

This plan derives a phased, dependency-ordered implementation from [`design.md`](./design.md) and
[`requirements.md`](./requirements.md). It starts with the OQ-4 Open_In spike, because its outcome
decides how the document-type config plugin sets `LSSupportsOpeningDocumentsInPlace`. It then
builds the schema and pure decision logic, the Persistence_Pipeline, repositories, and the journaled
migration, all before any UI. Native storage (`modules/library-storage`), the audio-store adapters,
and the Import_Pipeline follow as non-UI services. The store slices move the playing audio URI into
`useStudioStore`, and draft autosave lands before any queue navigation can switch songs. Save
semantics are made safe before the Track_Switch_Transaction, and the transaction lands before the
queue controls. The UI surfaces, the Open_In config plugin, and focused failure-path verification
come last.

All code is TypeScript / React Native, matching the existing codebase and
[`coding-standards.md`](../../steering/coding-standards.md), plus one Swift/Kotlin Expo Module
(ADR-003). All global state stays in `useStudioStore` (ADR-001); timestamps stay integer
milliseconds (ADR-009); colours come from `src/styles/common.ts`; icons come from `BeatNoteIcon`.
Side-effecting services live in `src/features/library/`; every branching decision is a pure
function in `src/utils/`.

### Scope boundary

In scope: everything in the design's scope boundary. Out of scope: streaming providers, a
Share_Extension, user-created Collections, auto-advance, Recently Deleted, stem separation, and
edits to the generated `ios/` directory. Loop-wrap and end-of-track logic in `useAudioPlayer.ts`
does not change beyond reading the audio source from the store.

### Working-tree precondition

Uncommitted playback-speed work currently touches `AGENTS.md`, steering files,
`src/hooks/useStudioStore.ts`, `src/hooks/useAudioPlayer.ts`, `src/utils/projectManager.ts`,
`src/types/project.ts`, `src/utils/playbackSpeed.ts`, and tests. Tasks that edit those files must
not start until that work is committed by its owner. Rebase onto it and treat `playbackSpeed` as
Persisted_Content (design "Current-state analysis"). Task 1 and the pure tasks for new files may
proceed earlier.

### Verification checkpoints

Each phase ends with a checkpoint using the project build gate:

- TypeScript: `npx tsc --noEmit`
- Temporary unit/property tests: `npm run test:unit` (Jest + `fast-check`, at least 100 iterations
  per property)
- Playwright E2E: `npm test` (use `PLAYWRIGHT_PORT=8082 npm test` when a simulator Metro server is
  already serving on port 8081)
- iOS XCTest: `IOS_TEST_ONLY=<case> npm run test:ios:ui` for each native case touched
- Whitespace: `git diff --check`

### Testing strategy alignment

The repository policy in [`testing-strategy.md`](../../steering/testing-strategy.md) is
critical-test-only. Property and unit tests are temporary. They are written test-first where useful,
marked optional with `*`, and tagged
`Feature: local-music-library-queue, Property {number}: {property_text}`. Task 43.8 removes all of
them once the retained journeys prove the behaviour. Permanent coverage comes only from extending
the retained Playwright journeys and native XCTest cases named in the design, plus the one justified
new native case `testOpenInAudioImportsIntoLibrary`. No new Playwright spec file is added. No
`test.only` or `test.skip` is committed.

## Tasks

### Phase 0 — OQ-4 Open_In delivery spike

- [ ] 1. Decide `LSSupportsOpeningDocumentsInPlace` before writing the document-type plugin
  - [x] 1.1 Run the simulator spike with a throwaway audio document-type declaration
    - On a disposable branch, add a minimal audio `CFBundleDocumentTypes` entry (MP3 and M4A are
      enough) through a scratch config plugin. Run `npx expo prebuild -p ios` with
      `LSSupportsOpeningDocumentsInPlace` set to `true`, then to `false`.
    - For each value, open a `.mp3` and a `.beatnote` on the simulator from Files and through
      `xcrun simctl openurl`. Log the URL that React Native `Linking.getInitialURL()` and the
      `url` event deliver. Record whether it is a `Documents/Inbox/` copy or an in-place
      security-scoped URL.
    - Confirm that `super.application(app, open:…)` in the generated Expo `AppDelegate` returns
      `false` for file URLs, so the `||` reaches `RCTLinkingManager`. If an Expo subscriber
      consumes the URL, record that Task 39.4 is required.
    - Confirm whether `XCUIApplication.open(_:)` or `simctl openurl` delivers a document-type URL,
      which decides whether Task 39.5 adds `testOpenInAudioImportsIntoLibrary`.
    - Verification evidence: logged URL forms for each key value and entry point, plus the
      `Info.plist` diff from prebuild (`plutil -p ios/BeatNote/Info.plist`).
    - _Requirements: 7.3, 7.4, 7.9, 7.11, 30.7_

  - [ ] 1.2 Repeat the spike on one physical iPhone
    - Install a development build and repeat Task 1.1 from Files and from one third-party app (for
      example Mail or a cloud drive). Record the delivered URL forms and confirm the `.beatnote`
      declaration and its Files presentation are unchanged with the key `false`.
    - If no signed physical build can be installed before the Apple Developer account exists,
      record the block and adopt the simulator result, flagged as provisional for Task 44.4.
    - Verification evidence: a device-model/iOS-version note and the observed URL forms.
    - _Requirements: 7.4, 7.9, 7.11, 30.10_
    - Blocked on a signed physical-device build; the simulator decision is provisional until this
      check runs.

  - [x] 1.3 Record the OQ-4 decision and discard the spike code
    - Write the outcome into the design's config-plugin section (`.kiro/specs/local-music-library-queue/design.md`):
      the chosen key value, the Inbox versus in-place handling, whether the `AppDelegateSubscriber`
      fallback is needed, and whether the new native case is feasible.
    - Delete the disposable branch or scratch plugin so nothing from the spike is merged.
    - Verification evidence: `git status --porcelain` shows only the design edit, and
      `python3 ~/.kiro/skills/global-project-orchestrator/references/mdlint.py` passes on the design.
    - _Requirements: 7.3, 7.10, 7.11_

- [ ] 2. Checkpoint — OQ-4 decided
  - Ensure the decision is recorded, ask the user if questions arise.

### Phase 1 — Schema, domain types, and pure utilities

- [ ] 3. Define the typed domain model
  - [x] 3.1 Create the new type modules and constants
    - Create `src/types/library.ts` (`SourceProviderId`, `SourceIdentity`, `PlaybackCapabilities`,
      `Collection`, `IMPORTED_MUSIC_COLLECTION_ID`, `MusicItem` with `removed` and `legacy`,
      `LibrarySortKey`, `LibraryRecord`, `LibraryPrefs`, `ImportJobView`), `src/types/queue.ts`
      (`PlaybackQueue`), `src/types/migration.ts` (`MigrationEntry`, `MigrationJournal`), and
      `src/types/csvImport.ts` (`CsvImportPreview`, `CsvUndoSnapshot`, `DraftUiState`) exactly as
      in the design's Data Models section.
    - Add the requirements' constants block to a constants module
      (`src/utils/libraryConstants.ts`, pure, no imports beyond types), so services and UI share
      one definition of `DRAFT_AUTOSAVE_DEBOUNCE_MS`, `MAX_AUDIO_FILE_BYTES`, and the rest.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.10, 2.5, 25.1_

  - [x] 3.2 Extend `src/types/project.ts` with saved-project and draft types
    - After the playback-speed work is committed, add `SAVED_PROJECT_VERSION = '1.2.0'`,
      `PersistedLayer`, `PersistedContent` (with `extras`), `SavedProject` (with `projectId`,
      `musicItemId`, `revision`, and the informational `audio`), `SavedProjectSummary`,
      `ProjectIndexRecord`, `DraftBaseline`, and `SongDraft`. Keep `BeatNoteProject` unchanged for
      legacy reads, including both index signatures.
    - Verification evidence: `npx tsc --noEmit` clean; the existing project load path still
      compiles unchanged.
    - _Requirements: 1.3, 1.4, 1.7, 1.8, 11.7_

- [x] 4. Persisted_Content extraction and Content_Fingerprint
  - [x] 4.1 Implement `src/utils/persistedContent.ts`
    - `extractPersistedContent(state)` reads exactly the Persisted_Content fields (including
      `playbackSpeed`, loop range, and `isLoopRangeEnabled`) and excludes every Session_State
      field. `applyPersistedContent` returns the store patch. `splitProjectEnvelope` and
      `toProjectRecord` map between `SavedProject` and `PersistedContent`, spreading `extras`
      first so unknown top-level, `settings`, and layer fields survive.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.8, 11.1, 11.2, 16.15_

  - [x] 4.2 Implement `src/utils/contentFingerprint.ts`
    - `canonicalize` sorts layers by ID, markers numerically, and annotations by timestamp then
      code-unit text. It orders keys at every depth, omits `undefined`, and maps non-finite numbers
      to `null`. Envelope fields and `metadata.duration` are excluded.
      `computeContentFingerprint` returns `fp1:<length>:<h1><h2>` from two seeded `cyrb53`
      hashes; any other prefix compares unequal.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 11.4, 11.6_

  - [ ]* 4.3 Write property test for fingerprint canonicity
    - **Property 1: Fingerprint is canonical and ignores session state**
    - **Validates: Requirements 11.1, 11.2, 11.4, 11.6**
    - Temporary: `tests/unit/contentFingerprint.test.ts`.

  - [ ]* 4.4 Write property test for persisted-content round-trip
    - **Property 2: Persisted content round-trips with unknown fields**
    - **Validates: Requirements 1.8, 11.5, 16.15**
    - Temporary: `tests/unit/contentFingerprint.test.ts`.

- [x] 5. Stored-record shape validation
  - [x] 5.1 Implement `src/utils/recordValidation.ts`
    - Shape guards for `MusicItem`, `SavedProject`, `SongDraft`, `PlaybackQueue`, `LibraryRecord`,
      `ProjectIndexRecord`, and `MigrationJournal`. They return `{ valid, invalidIds }` without
      mutating input, so a family loads its valid subset and reports each invalid ID once.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.9_

  - [ ]* 5.2 Write property test for invalid-record isolation
    - **Property 3: Invalid records are isolated**
    - **Validates: Requirements 1.9**
    - Temporary: `tests/unit/recordValidation.test.ts`.

- [x] 6. Draft resolution, Switch_Guard decision, and save planning
  - [x] 6.1 Implement `src/utils/draftResolution.ts`
    - `resolveSongLoad(input)` applies the design's six ordered rules: explicit project, deleted
      baseline as unnamed, baseline advance on equal fingerprint, dirty or unsaved draft, newest
      project with `modifiedAt` then revision then Project_ID tie-break, and unnamed or empty draft.
    - `deriveDraftUiState` returns `emptyUnnamed`, `unsaved`, `saved`, or `dirty`, never `dirty`
      for an Unnamed_Draft. `decideSwitchGuard` returns `prompt` only for `dirty`.
    - `planSave(baseline, storedRevision | null)` returns `create`, `update` (revision + 1), or
      `conflict`. Add `changedMarkerCount` (per-layer symmetric difference) and
      `changedSettingNames` for the Discard and Revert confirmations.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.15, 13.1, 13.2, 13.3, 13.4, 13.7, 14.1, 14.2, 14.3, 16.1, 16.2, 16.8, 16.9, 16.12, 17.4, 17.5_

  - [ ]* 6.2 Write property test for song-load resolution precedence
    - **Property 14: Song-load resolution precedence**
    - **Validates: Requirements 12.15, 13.1, 13.2, 13.3, 13.4, 13.7**
    - Temporary: `tests/unit/draftResolution.test.ts`.

  - [ ]* 6.3 Write property test for the guard decision
    - **Property 15: Guard prompts only for dirty drafts**
    - **Validates: Requirements 14.1, 14.2, 14.3**
    - Temporary: `tests/unit/draftResolution.test.ts`.

  - [ ]* 6.4 Write property test for save routing and revisions
    - **Property 19: Save routing and revisions**
    - **Validates: Requirements 16.1, 16.2, 16.4, 16.8, 16.9, 16.12**
    - Temporary: `tests/unit/draftResolution.test.ts` (it targets `planSave`).

- [ ] 7. Queue order, shuffle, navigation, and library sort/search
  - [x] 7.1 Implement `src/utils/queueOrder.ts`
    - `compareLibraryItems` / `sortLibraryItems` cover Title (`Intl.Collator`, base sensitivity),
      Recently Added, Recently Played (nulls last), and Duration (unknown last), with a Music_Item_ID
      tie-break. `normalizeForSearch` and `filterLibraryItems` match Display_Title and
      Original_Filename ignoring case and diacritics.
    - `buildQueue` returns a snapshot of the Collection in sort order, ignoring search, with shuffle
      off. `shuffleOrder(snapshot, currentId, random)` is a Fisher–Yates over the remaining entries
      with the current item pinned at index 0, and `random` is injected. `setShuffle(queue, on,
      random)` handles single-entry and off cases.
    - `queueTarget(queue, action, currentTimeMs, hasSong)` implements the navigation table,
      including the 3000 ms Previous threshold and both disabled reasons with precedence.
      `removeFromQueue`, `restoreQueue(queue, existingIds)`, and
      `nextSkipCandidate(queue, fromIndex, direction, visited)` complete the module.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 10.7, 10.8, 15.5, 18.1, 18.2, 18.3, 18.7, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.12, 19.13, 19.14, 19.16, 20.1, 20.5, 20.6_

  - [ ]* 7.2 Write property test for sort and search determinism
    - **Property 11: Sort and search are deterministic**
    - **Validates: Requirements 10.7, 10.8**
    - Temporary: `tests/unit/librarySort.test.ts`.

  - [ ]* 7.3 Write property test for queue snapshot construction
    - **Property 21: Queue build captures a snapshot**
    - **Validates: Requirements 18.1, 18.2, 18.3**
    - Temporary: `tests/unit/queueOrder.test.ts`.

  - [ ]* 7.4 Write property test for queue maintenance
    - **Property 22: Queue maintenance preserves order and the current item**
    - **Validates: Requirements 18.7, 20.1, 20.5**
    - Temporary: `tests/unit/queueOrder.test.ts`.

  - [ ]* 7.5 Write property test for navigation targets
    - **Property 23: Navigation targets**
    - **Validates: Requirements 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.16**
    - Temporary: `tests/unit/queueOrder.test.ts`.

  - [ ]* 7.6 Write property test for pinned shuffle
    - **Property 24: Shuffle pins the current item and restores the snapshot**
    - **Validates: Requirements 19.12, 19.13, 19.14**
    - Temporary: `tests/unit/queueOrder.test.ts`, using a seeded `random`.

  - [ ]* 7.7 Write property test for Skip traversal
    - **Property 18: Skip visits each entry at most once**
    - **Validates: Requirements 15.5, 20.6**
    - Temporary: `tests/unit/queueOrder.test.ts` (it targets `nextSkipCandidate`; Task 28.3
      reuses it).

- [x] 8. Project names, export filenames, and Project_Manager grouping
  - [x] 8.1 Implement `src/utils/projectNames.ts`
    - `validateProjectName` trims and rejects names that are empty or longer than 100 characters.
      `findNameClash` matches same-Music_Item names case-insensitively, and `suggestUniqueName`
      returns the lowest `(n)` with n ≥ 2, truncating the base to fit.
      `normalizeDisplayTitle` trims and truncates to 200 characters and rejects empty values.
      `sanitizeExportFilename` replaces invalid characters with `_`, truncates the base to 100, and
      appends `.csv`.
    - Add `groupProjectSections(currentMusicItemId, currentProjectId, summaries, items)`, which
      returns Current, "Projects for <title>", "All Projects" grouped by Display_Title ascending,
      and "Audio removed", with rows sorted by `modifiedAt` descending. The design lists no
      separate file for this helper, so it lives here.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 10.13, 10.14, 16.5, 16.6, 16.7, 21.1, 21.2, 21.3, 23.3, 24.5_

  - [ ]* 8.2 Write property test for name validation and suggestions
    - **Property 20: Name validation and unique suggestions**
    - **Validates: Requirements 10.13, 10.14, 16.5, 16.6, 16.7**
    - Temporary: `tests/unit/projectNames.test.ts`.

  - [ ]* 8.3 Write property test for Project_Manager grouping
    - **Property 25: Project Manager grouping**
    - **Validates: Requirements 21.1, 21.2, 21.3**
    - Temporary: `tests/unit/projectSections.test.ts`.

  - [ ]* 8.4 Write property test for export filenames
    - **Property 27: Export filenames are safe**
    - **Validates: Requirements 23.3**
    - Temporary: `tests/unit/projectNames.test.ts`.

- [x] 9. CSV preview and replace transforms
  - [x] 9.1 Implement `src/utils/csvReplace.ts`
    - `parseCsvForPreview(text, layers, songDuration)` reuses the existing `ImportEngine` row
      parsing. It keeps the thrown empty and header-less errors but returns
      `importedMarkerCount: 0` instead of throwing when no rows are importable, and it reports
      `skippedRows` and `beyondDurationCount`.
    - `applyCsvReplace(layers, preview)` replaces markers and annotations on all six layers (absent
      layers become empty) and returns the `CsvUndoSnapshot`. `restoreCsvUndo(layers, snapshot)`
      restores them exactly.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 22.1, 22.3, 22.4, 22.5, 22.7, 22.9, 22.12_

  - [ ]* 9.2 Write property test for replace then undo
    - **Property 26: CSV replace then undo restores exactly**
    - **Validates: Requirements 22.7, 22.9, 22.12**
    - Temporary: `tests/unit/csvReplace.test.ts`.

- [ ] 10. Import and migration decisions
  - [x] 10.1 Implement `src/utils/importDecisions.ts`
    - `validateImportRequest(name, reportedBytes, availableBytes)` checks only the final extension
      (case-insensitive), the 0 < size ≤ 500 MB range, and the free-space margin. It skips the
      free-space check when `availableBytes` is `null` and returns the exact requirement messages.
    - `decideDuplicate(library, hash, size)` returns `duplicate`, `reattach`, or `create`.
      `decideRelink(stored, chosen, decodeOk)` returns `attach`, `looksOriginal`, `keepMissing`, or
      `confirmMismatch`. `selectOrphans(files, referenced, now, minAgeMs)` picks unreferenced files
      past the age limit.
    - This file applies the design rule that branching decisions are pure functions in `src/utils/`;
      the design does not name a file for it.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 4.1, 4.4, 4.5, 5.6, 5.7, 5.8, 6.3, 7.8, 28.6_

  - [x] 10.2 Implement `src/utils/migrationPlan.ts`
    - `classifyLegacyUri(uri, platform, fileInfo)` returns `durableFile`, `liveCache`, `purged`,
      `sessionObjectUrl`, `inlineData`, or `unknown`. `findMissingItemMatch` reuses an item only
      for an exact case-sensitive filename and both durations within 50 ms.
      `toSavedProject(legacy, projectId, musicItemId)` preserves unknown fields and legacy `audio`,
      sets version `1.2.0` and revision 1, and never touches `layers` or `settings`.
      `nextMigrationStep(journal, legacyKeys)` returns entries in sorted key order and skips
      completed ones.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 28.2, 28.3, 28.4, 28.5, 28.8, 28.9, 28.10, 28.11, 28.13, 27.6_

  - [ ]* 10.3 Write property test for pre-copy validation
    - **Property 5: Import validation rejects before copying**
    - **Validates: Requirements 3.2, 3.3, 3.5, 3.6, 7.8**
    - Temporary: `tests/unit/importPipeline.test.ts`.

  - [ ]* 10.4 Write property test for the duplicate decision
    - **Property 7: Duplicate decision**
    - **Validates: Requirements 4.1, 4.4, 4.5**
    - Temporary: `tests/unit/importPipeline.test.ts`.

  - [ ]* 10.5 Write property test for the relink decision table
    - **Property 8: Relink decision table**
    - **Validates: Requirements 5.6, 5.7, 5.8, 5.9, 28.6**
    - Temporary: `tests/unit/relinkDecision.test.ts`.

  - [ ]* 10.6 Write property test for orphan selection
    - **Property 9: Orphan sweep never deletes referenced files**
    - **Validates: Requirements 6.3**
    - Temporary: `tests/unit/orphanSweep.test.ts`.

  - [ ]* 10.7 Write property test for non-destructive migration planning
    - **Property 29: Migration is non-destructive and associates correctly**
    - **Validates: Requirements 28.2, 28.3, 28.4, 28.5, 28.9, 28.10, 28.11, 28.13**
    - Temporary: `tests/unit/migrationPlan.test.ts`.

- [x] 11. Checkpoint — pure layer
  - Run `npx tsc --noEmit`, `npm run test:unit`, and `git diff --check`.
  - Confirm no new `src/utils/` file imports React, React Native, Expo, or AsyncStorage.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2 — Persistence_Pipeline, repositories, and migration

- [ ] 12. Build the serialised Persistence_Pipeline
  - [x] 12.1 Implement the FIFO worker and coalescing in `src/features/library/persistencePipeline.ts`
    - One queue and one worker: exactly one `WriteOp` runs at a time, in enqueue order. A
      `coalesceKey` replaces only a queued (never running) op in place. `enqueueWrite` resolves
      when its op, or the op that superseded it, settles. Provide `cancelQueued(coalesceKey)`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.8, 12.9_

  - [ ] 12.2 Add read-health write blocking and corrupt-value quarantine
    - `markReadFailed` / `markReadSucceeded` per key and per family. An op targeting a failed key
      rejects with `PersistenceBlockedError` without touching storage. Repositories copy an
      unparseable raw value to `<key>_corrupt_<timestamp>` before marking it, and raise a
      `PersistenceIssue` that names the data and offers Retry (re-read).
    - The project family stays blocked until `getAllKeys` and the index read both succeed.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 26.2, 26.3, 10.17_

  - [x] 12.3 Add failure classification and automatic retry
    - Storage-full errors (web `QuotaExceededError`, native space/full messages, or under 1 MB free
      after a failure) never retry and raise "BeatNote is out of storage space" naming the item.
      Other failures retry the same op at the head of the queue after 1 s, 2 s, and 4 s, then
      require a manual Retry. A write failure never rolls back in-memory state.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 26.5, 26.6_

  - [ ]* 12.4 Write property test for write serialisation
    - **Property 13: Persistence and import queues are serialised** (write-queue half)
    - **Validates: Requirements 12.8**
    - Temporary: `tests/unit/persistencePipeline.test.ts` with a fake AsyncStorage.

  - [ ]* 12.5 Write property test for read-failure write blocking
    - **Property 28: Read failures block writes**
    - **Validates: Requirements 26.2, 26.3, 26.5**
    - Temporary: `tests/unit/persistencePipeline.test.ts`.

- [ ] 13. Implement typed repositories in `src/features/library/repositories.ts`
  - [x] 13.1 Add the library, prefs, queue, and journal repositories
    - Read and write `beatnote.library.v1`, `beatnote.library.prefs.v1`, `beatnote.queue.v1`, and
      `beatnote.migration.v1`, each through `recordValidation` and the pipeline. Invalid records are
      excluded from memory, logged by ID, and never rewritten. No audio bytes go to AsyncStorage.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.9, 6.6, 18.5, 26.1_

  - [ ] 13.2 Add the per-Music_Item draft repository
    - `readDraft(id)` / `writeDraft(id, draft)` on `beatnote.draft.v1.<musicItemId>`, so a draft
      write rewrites no other draft and no project.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 11.3, 12.11, 26.1_

  - [ ] 13.3 Add the per-Project_ID project repository with index reconcile
    - Write `beatnote.project.v2.<projectId>` first, then `beatnote.projects.v2.index`. At boot,
      list `beatnote.project.v2.` keys, rebuild missing or stale index entries, and drop orphaned
      ones. Deletion removes the key first, then the index.
    - `readStoredRevision(projectId)` re-reads inside a pipeline op for the revision-conflict check,
      which also covers two web tabs.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 2.3, 26.1, 26.3, 26.4, 27.5_

  - [ ] 13.4 Freeze the legacy `beatnote_projects` value and retire its whole-value writers
    - Add a read-only legacy reader for migration. In `src/utils/projectManager.ts`, retire the
      `setStoredProjects`-based save, rename, and delete paths so V1.2 never writes
      `beatnote_projects`. Keep `withProjectDefaults`, `normalizePersistedLoop`, and
      `compareProjectVersion` for load-time normalisation. Make this edit only after the
      playback-speed work in that file is committed.
    - Verification evidence: `npx tsc --noEmit` clean; a project-wide search finds no remaining
      writer of `beatnote_projects`.
    - _Requirements: 26.3, 28.11_

  - [ ]* 13.5 Write unit tests for index reconcile and legacy freeze
    - A crash between project and index writes self-heals. The legacy key is byte-identical after
      every V1.2 operation. Temporary: `tests/unit/repositories.test.ts`.
    - _Requirements: 26.3, 26.4_

- [ ] 14. Implement the journaled migration runner
  - [ ] 14.1 Implement `src/features/library/migration.ts` with an injected importer
    - Follow the design's algorithm: read the legacy value (blocking on read failure), create or
      resume the journal, and assign and persist each entry's `projectId` before any dependent
      write. Skip newer versions as `skippedNewer`. Import resolvable URIs through an injected
      `importer` (wired to the Import_Pipeline in Task 19.4) or use `findOrCreateMissingItem`. Write
      `toSavedProject` through the repositories and mark the entry `migrated` or `missing`.
    - Failed imports become `failedRetrying` with an attempt count, and become `missing` after the
      third launch.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.9, 28.10, 28.11, 28.13, 28.15_

  - [ ] 14.2 Add interruption-safe resume
    - On resume, `importing` entries delete their `stagedRelativePath` when no Music_Item
      references it and re-run. Already-migrated entries are skipped, and journal-stored Project_IDs
      make re-runs write the same keys.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 28.7, 28.8_

  - [ ] 14.3 Expose migration status and the unresolved-audio notice data
    - Track `unresolvedCount` and gate the one-time notice on
      `LibraryPrefs.missingAudioNoticeShownForMigration`. Expose read-only (newer-version) summaries
      for the Project_Manager.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 28.10, 28.12_

  - [ ]* 14.4 Write property test for migration idempotence and resume
    - **Property 30: Migration is idempotent and resumable**
    - **Validates: Requirements 28.7, 28.8**
    - Temporary: `tests/unit/migrationPlan.test.ts`, with a fake importer and interruption injected
      at every step.

- [ ] 15. Checkpoint — persistence and migration
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`, and
    `git diff --check`. The existing journeys must still pass, because no UI has changed yet.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3 — Native storage module, audio-store adapters, and Import_Pipeline

- [ ] 16. Create the `modules/library-storage` Expo Module
  - [ ] 16.1 Add the TypeScript interface and module configuration
    - Create `modules/library-storage/expo-module.config.json` and `src/index.ts` exposing
      `getMusicDirectoryUri`, `setExcludedFromBackup`, `isExcludedFromBackup`, `md5File`, and
      `randomUUID`. Add a web implementation (`src/index.web.ts`) whose `randomUUID` uses
      `crypto.randomUUID`, with the other members unused on web.
    - Verification evidence: `npx tsc --noEmit` clean; Expo autolinking lists the module.
    - _Requirements: 2.1, 6.1, 6.2_

  - [ ] 16.2 Implement the iOS module in Swift
    - `ios/LibraryStorageModule.swift` resolves and creates `Library/Application Support/BeatNote/Music/`.
      It sets and reads `NSURLIsExcludedFromBackupKey`, computes a streaming MD5 in 1 MiB chunks
      with CryptoKit `Insecure.MD5` (lowercase hex), and returns a lowercased `NSUUID`. No edits
      under the generated `ios/` directory.
    - Verification evidence: `npx expo prebuild -p ios` then the focused build of
      `IOS_TEST_ONLY=testStudioLaunchesAndDocumentPickerOpens npm run test:ios:ui` succeeds.
    - _Requirements: 2.1, 6.1, 6.2, 4.6_

  - [ ] 16.3 Implement the Android module in Kotlin
    - `android/…/LibraryStorageModule.kt` uses `noBackupFilesDir/BeatNote/Music`, a no-op
      `setExcludedFromBackup`, a streaming MD5, and `UUID.randomUUID()`.
    - Verification evidence: `npx tsc --noEmit` clean; the Android Gradle compile succeeds if an
      Android toolchain is available. Otherwise record it as not verified.
    - _Requirements: 6.1, 6.2_

- [ ] 17. Implement the audio-store adapters
  - [ ] 17.1 Implement `src/features/library/audioStore.ts` (native)
    - Follow the `AudioStoreAdapter` contract. `ensureDirectories` creates the Music and staging
      directories and re-applies backup exclusion at every launch. `availableBytes` uses
      `Paths.availableDiskSpace`. `stage` uses legacy `copyAsync` with a size check, `hash` calls
      `md5File`, `probeDuration` uses a transient `createAudioPlayer` with a 10 s timeout and always
      calls `release()`, and `commit` uses `File.move`.
    - `checkAvailable` reports a file as missing when it is absent, 0 bytes, or unreadable.
      `deleteSourceCopy` deletes only cache and `Documents/Inbox/` copies. `sweepOrphans` delegates
      the choice to `selectOrphans`, logs each failure, and continues.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 2.5, 3.1, 3.4, 3.7, 3.10, 3.11, 3.12, 3.14, 5.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.9_

  - [ ] 17.2 Implement `src/features/library/audioStore.web.ts` (IndexedDB)
    - Database `beatnote-audio` v1, store `audio`. `availableBytes` uses
      `navigator.storage.estimate()` or `null`. Staging is an in-memory `Blob`, the hash is
      `sha256:` from Web Crypto, and the duration probe uses `HTMLAudioElement`. `commit` is one
      atomic `readwrite` put that leaves no partial bytes on quota abort.
      `resolvePlayableUri` creates an object URL and revokes the previous one on switch.
      Request `navigator.storage.persist()` once after the first import.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.18, 6.6, 27.2, 27.3, 27.4, 27.6_

- [ ] 18. Implement the provider-neutral source boundary
  - [ ] 18.1 Implement `src/features/library/sourceResolver.ts`
    - Provider registry with the `local` provider and `LOCAL_CAPABILITIES`. Pitch-preserving speed
      is supported, per design resolution 2 (ADR-011). `resolve` runs `checkAvailable` before
      `resolvePlayableUri` and throws `SourceUnavailableError` on failure. `capabilitiesFor(item)`
      is available for capability gates. No credentials or account fields exist anywhere.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 25.1, 25.2, 25.5, 25.6_

- [ ] 19. Implement the shared Import_Pipeline
  - [ ] 19.1 Implement the stages, FIFO job queue, and cancellation in `src/features/library/importPipeline.ts`
    - Run stages 1–11 in the design's order. Jobs run one at a time in arrival order. Cancellation
      is a flag checked between stages and after the copy resolves, and it is ignored once
      Import_Commit starts. A library-write failure at commit deletes the committed file. Any
      directory failure aborts with the copy message. Messages use the exact design strings.
    - Expose a job observer so Task 21.1 can mirror `importJobs` into the store without the
      pipeline holding global state.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.17, 4.6, 6.5_

  - [ ] 19.2 Add duplicate and reattach handling
    - An available match discards the staged file and returns `duplicate` (the track switch is
      wired in Task 28.6). A missing or removed match commits under a new physical UUID, clears
      `removed`, restores Imported_Music, and keeps the Music_Item_ID. A matching filename with a
      different hash creates a new item.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 24.4_

  - [ ] 19.3 Add the Relink flow
    - With `relinkTargetId`, run stages 1–8 and branch through `decideRelink`. Return
      `relinkNeedsConfirm` for `looksOriginal` and `confirmMismatch`. A confirmed relink updates the
      reference, size, hash, duration, and availability and deletes the old physical file. Cancel or
      a dismissed picker discards the staged copy and changes nothing.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 28.6_

  - [ ] 19.4 Connect migration to the Import_Pipeline
    - Pass `enqueueImport({ origin: 'migration' })` as the migration runner's importer, including
      `inlineData` decoding to a Blob on web and duplicate detection by hash.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 28.2, 28.4, 28.15_

  - [ ]* 19.5 Write property test for pre-commit failure cleanup
    - **Property 6: Pre-commit failure or cancellation leaves no trace**
    - **Validates: Requirements 3.4, 3.7, 3.8, 3.10, 4.6, 6.5**
    - Temporary: `tests/unit/importPipeline.test.ts` with a fake `AudioStoreAdapter`.

  - [ ]* 19.6 Write property test for import serialisation
    - **Property 13: Persistence and import queues are serialised** (import-queue half)
    - **Validates: Requirements 3.17**
    - Temporary: `tests/unit/importPipeline.test.ts`.

- [ ] 20. Checkpoint — native and import services
  - Run `npx tsc --noEmit`, `npm run test:unit`, `git diff --check`, and the focused
    `IOS_TEST_ONLY=testStudioLaunchesAndDocumentPickerOpens npm run test:ios:ui` to prove the
    module builds and the app still launches.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4 — Store slices and audio URI ownership

- [ ] 21. Add the library, draft/project, queue, and switch slices to `useStudioStore`
  - [ ] 21.1 Add the library slice
    - `libraryItems`, `librarySort`, `projectSummaries`, `importJobs`, `libraryStatus`,
      `persistenceIssues`, `libraryNotice`, and `isLibrarySheetOpen`, with thin actions
      (`setLibraryItems`, `setLibrarySort`, `notify`, `openLibrarySheet`, `closeLibrarySheet`).
      Mirror Import_Pipeline jobs through the Task 19.1 observer. Use `set((state) => …)` for
      derived updates and keep selectors granular.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.10, 3.15, 10.7, 10.16, 10.17_

  - [ ] 21.2 Add the draft and project slice
    - `currentMusicItemId`, `draftBaseline`, `draftBaselineFingerprint`, `draftBaselineName`,
      `lastWrittenFingerprint`, `draftUiState`, `saveInProgress`, `csvPreview`, and `csvUndo`, with
      `setDraftBaseline` and `setLastWrittenFingerprint`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 11.7, 16.4, 16.17_

  - [ ] 21.3 Add the queue slice
    - `queue` and `setQueue`, persisting through the queue repository on every change, with no
      Project_ID or draft reference.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 1.5, 1.6, 18.5_

  - [ ] 21.4 Add the switch slice and the atomic `applyTrackState`
    - `switchPhase`, `switchGuard`, `pendingSwitchTargetId`, and `loadingMusicItemId`.
      `applyTrackState(payload)` is one `set()` that writes the current item, the audio URI, every
      Persisted_Content field (with the existing `loadProject` normalisation), `songDuration`,
      baseline fields, and the queue index. It resets Session_State and `currentTime` to 0, sets
      `isLoopMarkerActive: false`, and leaves `isRepeatActive` untouched.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 13.8, 15.2, 15.13_

  - [ ] 21.5 Move the playing audio URI into the store
    - Add `currentAudioUri`. Change `useCustomAudioPlayer` (`src/hooks/useAudioPlayer.ts`) to derive
      its `AudioSource` from a narrow `currentAudioUri` selector instead of local `useState`. Leave
      loop-wrap and end-of-track logic unchanged.
    - Keep `load-song` working through a temporary store-backed shim (picker result →
      `currentAudioUri`) until Task 35.2 removes `loadSong` and `loadProjectAudio`. Make this edit
      only after the playback-speed changes to both files are committed.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes
      unchanged.
    - _Requirements: 1.7, 15.2_

  - [ ]* 21.6 Write property test for the library identity and retention invariant
    - **Property 4: Library identity and retention invariant**
    - **Validates: Requirements 1.10, 2.1, 2.2, 2.3, 2.4, 2.5, 5.11, 24.1, 24.7**
    - Temporary: `tests/unit/libraryReducer.test.ts` against a fresh `create()` store.

- [ ] 22. Add the boot sequence in `src/features/library/useLibraryLifecycle.ts`
  - [ ] 22.1 Implement boot steps 1–4 and mount the hook once in `StudioScreen`
    - Read the library, prefs, project index (with reconcile), queue, and journal. On read failure,
      set `libraryStatus = 'readError'`, raise the error with Retry, and block writes. Run migration
      when needed, showing "Updating your library…" with Save, imports, and switching disabled.
      Run `ensureDirectories`, mark missing files, and restore the queue with `restoreQueue`.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 5.2, 10.17, 18.6, 18.7, 18.9, 26.2, 28.1, 28.14, 27.6_

  - [ ] 22.2 Run the orphan sweep after boot when no import is running
    - Log the removed count. Failures are logged without user-facing errors.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 6.3, 6.4_

- [ ] 23. Checkpoint — store slices
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5 — Draft autosave (before any queue navigation)

- [ ] 24. Implement draft autosave and its failure surfaces
  - [ ] 24.1 Implement `src/features/library/draftAutosave.ts`
    - `startDraftAutosave()` subscribes to the Persisted_Content tuple, compared shallowly, while a
      song is loaded and `libraryStatus === 'ready'`. The delay is
      `min(500, firstUnwrittenAt + 2000 − now)`. Writes use coalesce key `draft:<id>`, snapshot the
      content at execution time, and skip when the fingerprint equals the last written one. A change
      during a write re-arms the timer.
    - `flushDraft(timeoutMs)` clears the timer, enqueues immediately, and races the timeout. After
      each write, recompute `draftUiState`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 11.1, 11.2, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.11_

  - [ ] 24.2 Wire `AppState` flushing and foreground retry in `useLibraryLifecycle`
    - Flush immediately on `background` and `inactive`. Retry failed draft writes on `active` and
      at the next change. Start autosave only after boot completes. The subscription cleans up on
      unmount.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.7, 12.12_

  - [ ] 24.3 Create `PersistenceBanner` and mount it in `StudioScreen`
    - `src/components/ui/common/PersistenceBanner.tsx` with
      `src/styles/components/common/persistenceBanner.ts` renders a persistent "Draft not saved.
      Your latest changes are only on screen." banner, plus storage-full and read-error issues,
      each with a 44×44 Retry. Use the liquid-glass surface, semantic tokens, and text plus icon
      (not colour alone). Remove the banner on a successful write.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.12, 12.13, 26.2, 26.5, 26.6, 29.1, 29.3_

  - [ ] 24.4 Forward `libraryNotice` into the dock toast
    - In `src/components/layout/MainContent.tsx`, forward each new `libraryNotice` (by `id`) to the
      existing `useDockToast.show(message, action)`, so import, Open_In, and save confirmations
      reach the Dock_Toast from outside `MainContent`.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` dock journey
      still passes.
    - _Requirements: 3.13, 16.14_

  - [ ]* 24.5 Write property test for autosave latency and snapshots
    - **Property 12: Autosave bounds latency and writes the latest snapshot**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**
    - Temporary: `tests/unit/draftAutosave.test.ts` with Jest fake timers.

- [ ] 25. Checkpoint — autosave
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6 — Safe Save, Save as New, revisions, and names (before track controls)

- [ ] 26. Implement `src/features/library/projectService.ts` and the save prompts
  - [ ] 26.1 Implement `saveCurrent` and `saveAsNew` as single pipeline steps
    - Route through `planSave`. An Unnamed_Draft or deleted baseline returns `needsName`. Update in
      place keeps the Project_ID, name, and `createdAt` and sets revision + 1 and `modifiedAt` now.
      Save as New creates a new Project_ID for the same Music_Item.
    - Each save cancels the pending draft write and writes the project and then the draft with the
      new baseline in one op. On failure, keep the old baseline, keep the draft dirty, re-enqueue
      the draft write, and return `failed` with the reason. Write `version` `1.2.0` unless a loaded
      newer version and its unknown fields are preserved.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.9, 12.10, 16.1, 16.2, 16.3, 16.4, 16.12, 16.13, 16.15_

  - [ ] 26.2 Add the revision conflict, name clashes, read-only projects, and `saveInProgress`
    - Re-read the stored revision inside the op. A greater revision returns `revisionConflict`, and
      Overwrite writes stored + 1. A clash returns `nameConflict` with `suggestUniqueName`.
      Newer-version projects block Save over themselves but allow Save as New.
      `saveInProgress` disables Save, Save as New, and switching.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 16.7, 16.8, 16.9, 16.10, 16.11, 16.17, 27.5, 28.10_

  - [ ] 26.3 Implement `renameProject` and `deleteProject`
    - Rename keeps the Project_ID and storage key and enforces per-song uniqueness. Delete removes
      only that project. Deleting the current baseline converts the draft to an Unnamed_Draft with
      its content. When a removed Music_Item has lost its last project and its draft, delete its
      record. The queue is never touched.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 2.3, 20.7, 24.1, 24.2, 24.6, 24.7, 24.9_

  - [ ] 26.4 Implement same-song `openProject` and `revertToSaved`
    - For the current Music_Item, return `needsGuard` when the draft is dirty. Otherwise load the
      project as the baseline through `applyTrackState` without changing audio or queue. Revert
      restores the baseline content and is enabled only when the draft is `dirty`. Cross-song
      opening returns `needsSwitch` (handled by Task 28.6).
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6, 17.8, 17.9, 20.7_

  - [ ] 26.5 Implement `exportProjectCsv`
    - `'current'` exports the in-memory working state. A Project_ID exports the stored content
      (including "Audio missing" projects) without loading it. Use `sanitizeExportFilename` and the
      existing `ExportEngine` platform files. A write failure reports "Export failed"; a dismissed
      share sheet changes nothing.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 25.6_

  - [ ] 26.6 Create `SaveProjectPrompt` and `ConfirmDialog`, and wire `save-project`
    - `src/components/ui/modals/SaveProjectPrompt.tsx` replaces `SaveProjectModal.tsx`. It is
      prefilled with the Display_Title, shows the inline limit error with Confirm disabled, keeps
      the text, and shows the duplicate message with the suggestion. Cancel writes nothing.
    - `src/components/ui/modals/ConfirmDialog.tsx` is a shared glass confirmation. Both components
      move focus to the title and return it on close, with styles under `src/styles/components/modals/`.
    - In `ProjectControls.tsx`, `save-project` (testID unchanged) calls `saveCurrent` and shows the
      toast "Saved “<project>”" instead of an `Alert`.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes after
      updating the existing save assertions to the prompt.
    - _Requirements: 16.5, 16.6, 16.7, 16.8, 16.14, 16.16, 29.1, 29.2, 29.8_

  - [ ] 26.7 Retire the store's `saveProject` and `loadProject`
    - Remove both store actions. Route the existing `ProjectManagerModal` Open through
      `projectService.openProject`. Until Task 28.6, a cross-song open uses the temporary audio shim
      from Task 21.5. Task 36 restructures the modal.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 16.2, 1.7_

  - [ ]* 26.8 Write unit tests for the save and autosave race
    - A Save enqueued while a debounced draft write is pending cancels it and writes the project
      and draft in one step. A failed project write re-enqueues the draft and keeps the old baseline.
      Temporary: `tests/unit/projectService.test.ts`.
    - _Requirements: 12.9, 12.10, 16.13_

- [ ] 27. Checkpoint — save semantics
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7 — Track_Switch_Transaction, guard, and queue controls

- [ ] 28. Implement `src/features/library/trackSwitch.ts`
  - [ ] 28.1 Implement the transaction core
    - Run `decideSwitchGuard`, sample `wasPlaying` and pause, then `flushDraft(2000)`. Resolve the
      destination (`checkAvailable`, `sourceResolver.resolve`, draft and summaries,
      `resolveSongLoad`, `probeDuration`). Commit with one `applyTrackState`, then await the player
      loading (10 s).
    - Only after the player loads, persist the queue index and `lastPlayedAt`, then start playback
      when `wasPlaying` was true and no guard was shown. Repeat is unchanged, marker loop is off,
      and the loop range comes from the destination.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 12.6, 13.8, 15.1, 15.2, 15.10, 15.11, 15.12, 15.13, 15.14_

  - [ ] 28.2 Add the single pending-destination slot and the navigation base index
    - Ignore requests while `switchPhase === 'guard'`. During the Load_Phase, replace
      `pendingSwitchTargetId` so replaced destinations never load or get `lastPlayedAt`. Compute
      Next and Previous from the pending index, else the in-flight index. Start the pending
      destination with a full transaction, including its guard.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 14.10, 15.6, 15.7, 15.8, 15.9_

  - [ ] 28.3 Add failure handling, rollback, and Skip
    - A pre-commit failure marks the item missing when the file check failed, keeps the source
      untouched, and shows an error naming the destination with Relink, Skip (queue only), and
      Close. A player failure after commit rolls back to the source snapshot and reloads it paused
      at the previous time.
    - Skip uses `nextSkipCandidate` and stops with "No playable songs in this direction". A flush
      failure or timeout cancels the switch with "BeatNote couldn't save your draft, so the song
      wasn't changed." and Retry and Stay.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 5.3, 5.4, 12.14, 15.3, 15.4, 15.5, 20.6, 25.5_

  - [ ] 28.4 Create `SwitchGuardDialog` and `resolveSwitchGuard`
    - `src/components/ui/modals/SwitchGuardDialog.tsx` with
      `src/styles/components/modals/switchGuardDialog.ts`, driven only by `switchGuard`, using the
      exact title and message. It offers Save & Switch (accent), Keep Draft & Switch (quiet glass),
      and Cancel, with no Discard.
    - Save & Switch retains the destination through a naming or conflict prompt and drops it on
      cancel or failure. Keep Draft flushes unchanged. Cancel leaves the song, queue index, and
      playback state unchanged. Backgrounding while the dialog is open flushes the draft and keeps
      the dialog and destination. Focus moves to the title. Mount the dialog in the studio layout.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.11, 16.11, 29.1, 29.8_

  - [ ] 28.5 Complete launch restoration (boot step 5)
    - In `useLibraryLifecycle`, load the restored current item with
      `requestTrackSwitch({ origin: 'launch' })`, paused at 0 ms. A missing or deleted item starts
      with no song and keeps the queue. Rebuild the queue when the launch item is not in the
      snapshot.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 15.14, 18.4, 18.8, 18.9_

  - [ ] 28.6 Route cross-song opens and duplicate imports through the transaction
    - `projectService.openProject` `needsSwitch` calls `requestTrackSwitch({ explicitProjectId })`.
      A duplicate import shows "“<title>” is already in your library" and switches, and a cancelled
      guard still shows the toast. Remove the shim's project path from Task 26.7.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 4.1, 4.2, 4.3, 17.7, 21.7, 21.8_

  - [ ]* 28.7 Write property test for all-or-nothing switching
    - **Property 16: Track switch is all-or-nothing**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.10, 15.11, 15.12, 15.13**
    - Temporary: `tests/unit/trackSwitch.test.ts` with a fake resolver, player, and failure
      injection at every step.

  - [ ]* 28.8 Write property test for rapid-request coalescing
    - **Property 17: Rapid requests coalesce to the last destination**
    - **Validates: Requirements 15.6, 15.7, 15.8, 15.9**
    - Temporary: `tests/unit/trackSwitch.test.ts`.

- [ ] 29. Replace the reserved dock controls with queue controls
  - [ ] 29.1 Add the queue store actions
    - `firstTrack`, `previousTrack`, `nextTrack`, and `toggleShuffle` call `queueTarget` and
      `setShuffle`, then `requestTrackSwitch`, or seek to 0 keeping play state. Toggling shuffle
      persists the queue and raises "Shuffle on" or "Shuffle off". Successful navigation raises no
      toast. End of track keeps the existing behaviour (no auto-advance).
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.10, 19.11, 19.12, 19.13, 19.14, 19.15, 19.17_

  - [ ] 29.2 Create `QueueTrackButton` and replace `reserved()` in `ControlDock`
    - `src/components/ui/controls/QueueTrackButton.tsx` with
      `src/styles/components/controls/queueTrackButton.ts` keeps the testIDs
      `first-track-control`, `previous-track-control`, `next-track-control`, and `shuffle-control`
      and their grid cells. It maps to `DockButton` states, using a boolean
      `currentTime > 3000` selector for Previous so it does not re-render at 50 ms.
    - Disabled descriptions are "Choose music to start a queue" (which takes precedence) and "End
      of queue". All four are disabled while the guard is open or a save is in progress. Shuffle
      exposes `checked` and `aria-pressed`. Remove the "… is in development" toasts.
    - Verification evidence: `npx tsc --noEmit` clean; the existing dock journey passes after
      replacing its reserved-toast assertions.
    - _Requirements: 14.10, 16.17, 19.1, 19.9, 19.15, 19.16, 29.1, 29.2, 29.3_

  - [ ] 29.3 Apply capability gates to dependent controls
    - Gate exact-seek navigation, waveform and overview, `PlaybackSpeedControl`, the queue
      controls, Repeat, and Shuffle with `capabilitiesFor(currentItem)`. A gated control is
      disabled, shows a hint and a visible description naming the capability, and changes nothing
      when pressed. With `local`, nothing is gated in practice.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 25.3, 25.4_

- [ ] 30. Checkpoint — switching and queue controls
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`,
    `IOS_TEST_ONLY=testLoopRangeToggleAndTransportFits npm run test:ios:ui`, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8 — Library, toolbar, Project_Manager, and CSV UI

- [ ] 31. Extend the shared icon family
  - [ ] 31.1 Add the new `BeatNoteIcon` glyphs
    - Add `chevron-down`, `music-library`, `warning`, `more`, `current`, `missing-audio`, `close`,
      `search`, and `sort` in `src/components/icons/BeatNoteIcon.tsx`. Use the 24×24 view box, the
      1.75-point rounded stroke, and the ~4…20 live area; each must stay distinguishable at 18 px
      without colour.
    - Verification evidence: `npx tsc --noEmit` clean; a simulator or browser visual check at
      18 px.
    - _Requirements: 29.3, 29.7_

- [ ] 32. Build the `BottomSheet` primitive
  - [ ] 32.1 Implement the pure detent resolver
    - `src/utils/sheetDetent.ts`: `resolveSheetRelease(sheetHeight, releaseOffset)` returns
      `close` when the release is more than 0.25 × the medium height below the medium detent, else
      the nearest of medium (0.50 × height) and large.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ] 32.2 Implement `src/components/ui/common/BottomSheet.tsx`
    - Use a transparent `overFullScreen` `Modal` host, a visible grabber, and a pan gesture on the
      grabber and header only (gesture-handler `Gesture.Pan`, Reanimated `withTiming` 300 ms).
      Reduce Motion makes changes immediate. Landscape opens at large with leading, trailing, and
      bottom insets. On keyboard show, expand to large and pad the list.
    - Provide a 44×44 Close and a "Switch sheet size" accessibility action. Focus moves to the
      title on open and returns to `returnFocusRef` on close. On web, trap Tab and Shift-Tab and
      close on Escape. Rotation keeps the sheet mounted. Styles go in
      `src/styles/components/common/bottomSheet.ts` with the liquid-glass surface.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8, 9.10, 9.11, 9.12, 29.6, 29.8_

  - [ ]* 32.3 Write property test for detent resolution
    - **Property 10: Sheet release resolves to a valid detent**
    - **Validates: Requirements 9.3, 9.4**
    - Temporary: `tests/unit/sheetDetent.test.ts`.

- [ ] 33. Build the Music_Library_Sheet
  - [ ] 33.1 Create `OverflowMenu`
    - `src/components/ui/common/OverflowMenu.tsx` with `src/styles/components/common/overflowMenu.ts`
      is a glass action menu. Its actions are also exposed as VoiceOver custom actions on the owning
      row, and the trigger is 44×44.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 10.11, 10.12, 29.1, 29.2_

  - [ ] 33.2 Create `MusicLibraryRow` and `ImportProgressRow`
    - The row shows the title (one line, or two at accessibility sizes), `m:ss` or `--:--`, and
      `<n> projects`. The current row shows the `current` glyph and `selected` state. A missing row
      shows the glyph and "Audio missing" text and includes it in the label. The overflow offers
      Rename, Show Projects, Delete from BeatNote, and Relink when missing.
    - The progress row shows the file name and an indicator labelled with the file name. Before
      commit it offers a 44×44 "Cancel import". A failed row shows the message with Retry (reopens
      the picker) and Dismiss. Styles go under `src/styles/components/library/`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.15, 3.16, 5.5, 9.9, 10.1, 10.2, 10.11, 10.18, 29.1, 29.3_

  - [ ] 33.3 Create `MusicLibrarySheet` with states, sort, and search
    - From top to bottom: the title "Music" and Close, an Import Audio row that is always first,
      import rows, a search field (only for more than 8 items), the sort selector (persisted
      through prefs), and a `FlatList`. Empty, loading, no-match, and read-error states use the
      exact strings and Retry. Row actions are disabled while loading. Only Imported_Music is
      exposed.
    - A row tap calls `requestTrackSwitch({ origin: 'library', rebuildQueue: true })` with a row
      spinner and the other rows disabled. `committed` closes the sheet, `failed` shows an inline
      Retry, `cancelled` stays open, and tapping the current row closes without reloading.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.15, 10.16, 10.17, 10.19, 18.1, 18.2_

  - [ ] 33.4 Wire Import Audio to the picker and Import_Pipeline
    - Use `DocumentPicker.getDocumentAsync` restricted to the supported types (the web chooser
      filtered by MIME type and extension). Cancelling changes nothing and shows no error.
      Success shows a Dock_Toast and opens the item with a queue rebuild.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.13, 7.1, 7.2, 7.12, 18.3, 27.1_

- [ ] 34. Implement library row actions
  - [ ] 34.1 Implement rename
    - Use `normalizeDisplayTitle`, show an inline error with Save disabled on an empty title, and
      update `SongTitleControl` immediately. Identity, path, and references are unchanged; the queue
      order is unchanged.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 2.2, 10.13, 10.14, 18.2_

  - [ ] 34.2 Implement Delete from BeatNote
    - Show a destructive `ConfirmDialog` stating the project count, whether a draft exists, and
      that the original in Files is unaffected. For the current song, first switch to the next
      entry, else the previous, and delete nothing if that switch is cancelled or fails.
    - On confirm, delete only the managed file, remove the item from collections and the queue, and
      keep it as `removed` with its projects and draft. With no other entry, stop playback and show
      the editor in Missing_Audio_State with an editable draft. Deleting the last item clears the
      queue and shuffle. A file-delete failure keeps the item available and shows the
      couldn't-remove error.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 3.14, 10.20, 20.1, 20.2, 20.3, 20.4, 20.5, 24.3, 24.4, 24.7, 24.10, 24.11, 24.12_

  - [ ] 34.3 Implement Relink and Show Projects
    - Relink opens the picker with `relinkTargetId` and shows `ConfirmDialog` for "This looks like
      the original file" or the stored/chosen title-and-duration mismatch, with Use This File and
      Cancel. Show Projects opens the Project_Manager on that song's rows. The queue position is
      kept.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 5.5, 5.6, 5.8, 5.9, 20.6, 28.6_

- [ ] 35. Replace the toolbar's load-song action with `SongTitleControl`
  - [ ] 35.1 Create `SongTitleControl`
    - `src/components/ui/controls/SongTitleControl.tsx` with
      `src/styles/components/controls/songTitleControl.ts` (`testID="song-title-control"`). It shows
      `Choose Music` or the Display_Title on one tail-truncated line, then `chevron-down`. A missing
      song adds the `warning` glyph and "Missing". It uses `flex: 1`, `minWidth: 0`, and
      `minHeight: 44`, with the exact label and hint.
    - After a committed queue switch, announce the new title once through
      `AccessibilityInfo.announceForAccessibility`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 19.17, 29.1_

  - [ ] 35.2 Restructure `ProjectControls` and remove the load-song path
    - On phone, the order is `song-title-control`, `save-project`, `load-project`, and
      `sidebar-open-toggle` within the safe-area insets. Tablet and desktop show the same four with
      text labels. Remove `load-song`, its "Replace Audio?" alert, the Task 21.5 shim, and
      `loadSong` / `loadProjectAudio` in `useAudioPlayer.ts`. Host `MusicLibrarySheet` with return
      focus to the title control.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 8.1, 8.2, 8.10, 8.11, 9.10_

  - [ ] 35.3 Update existing tests that referenced `load-song`
    - Route `tests/test-helpers.ts` `clickLoadSongAndWait` and its peers through
      `song-title-control` → Import Audio, and update the `load-song` references in
      `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, and
      `tests/ios/BeatNoteUITests.swift` helpers. Remove superseded assertions rather than skipping
      them.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes; a project-wide search finds no
      remaining `load-song` reference.
    - _Requirements: 8.2, 30.6, 30.8_

- [ ] 36. Restructure the Project_Manager around the current project
  - [ ] 36.1 Create `CurrentProjectSection`
    - `src/components/ui/projects/CurrentProjectSection.tsx` with styles shows the name or
      "Unsaved draft", the Display_Title, and the state text and icon ("Saved", "Edited — not
      saved", "Draft based on “<name>”"). It shows the newer-project note with Open, and 44×44
      Save, Save as New Project, Import CSV, and Export CSV, plus Revert to Saved and Undo CSV
      Import.
    - With no song, it shows "No song chosen" with Choose Music and the four actions disabled.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 13.5, 13.6, 17.8, 17.9, 21.4, 21.5, 21.9, 22.10, 29.3_

  - [ ] 36.2 Create `ProjectRow`
    - `src/components/ui/projects/ProjectRow.tsx` with styles shows the name, marker count, modified
      time, the Display_Title in All Projects, "Audio missing", and "Read-only (newer version)". A
      44×44 overflow offers Open, Rename, Export CSV, and Delete. The testIDs are
      `project-row-<projectId>`, `project-open-…`, `project-rename-…`, `project-export-…`, and
      `project-delete-…`. Delete uses a destructive `ConfirmDialog` that names the project.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 21.6, 21.10, 24.8, 24.9, 24.10, 28.10, 29.1, 29.2_

  - [ ] 36.3 Rebuild `ProjectManagerModal` as a sectioned list
    - Use one `SectionList` from `groupProjectSections`, including the "Audio removed" group with
      Relink and Delete, and an empty-state line per section. Keep the full-screen phone
      presentation, safe areas, and orientations. The migration notice "<n> projects need their
      audio reconnected" opens the modal scrolled to the first affected row.
    - Update existing tests that used `load-saved-project-<name>` or `delete-saved-project-<name>`.
    - Verification evidence: `npx tsc --noEmit` clean; `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 21.1, 21.2, 21.3, 21.7, 21.8, 21.11, 24.5, 28.12_

  - [ ] 36.4 Add the same-song open guard and the Revert confirmations
    - "Save changes before opening?" offers Save & Open (opens only if the save succeeds), Discard
      Changes & Open (a second destructive confirmation naming `changedMarkerCount`, or the changed
      settings when it is 0), and Cancel. Revert to Saved uses the same second confirmation.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.8_

- [ ] 37. Relocate CSV into the Project_Manager as a confirmed, reversible replace
  - [ ] 37.1 Add the CSV store actions
    - `previewCsvImport` picks and parses into `csvPreview` without changing editor state. A
      dismissed picker does nothing, and a parse error shows the parser message.
      `applyCsvReplace` replaces all layers, stores `csvUndo` with the prior draft UI state, and
      updates only the draft. `undoCsvReplace` restores the layers exactly. Clear `csvUndo` on the
      next import, song switch, or save. Remove the store's `importFromCSV` append path.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 22.1, 22.2, 22.3, 22.6, 22.7, 22.9, 22.10, 22.11_

  - [ ] 37.2 Create `CsvReplaceConfirm`
    - `src/components/ui/modals/CsvReplaceConfirm.tsx` with styles uses the title "Replace markers
      in “<project or Unsaved draft>”?". It shows existing and imported marker and annotation
      counts, skipped rows, and "<n> markers are past the end of this song". Replace is disabled
      with "No markers were found" when nothing is importable. Focus moves to the title.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 22.4, 22.5, 22.12, 29.1, 29.8_

  - [ ] 37.3 Wire Import CSV, Export CSV, and Undo into the Project_Manager
    - Import CSV in `CurrentProjectSection` opens preview, confirm, and replace, then shows a
      Dock_Toast with Undo for 5000 ms. Undo CSV Import in the section uses the retained snapshot.
      Export CSV (current) and row Export CSV call `exportProjectCsv` through the existing
      `ExportModal` format chooser. Delete `ImportModal.tsx`.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 8.9, 21.5, 22.8, 22.10, 23.1, 23.2_

  - [ ] 37.4 Remove `import-data` and `export-data` from the toolbar and update their tests
    - Delete the toolbar CSV buttons from `ProjectControls.tsx`. Move the existing Playwright and
      XCTest references to `import-data` and `export-data` onto the Project_Manager's Current
      Project actions.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes; a project-wide search finds no
      remaining toolbar `import-data` or `export-data` reference.
    - _Requirements: 8.1, 8.9, 30.6_

- [ ] 38. Checkpoint — UI surfaces
  - Run `npx tsc --noEmit`, `npm run test:unit`, `PLAYWRIGHT_PORT=8082 npm test`, focused
    `IOS_TEST_ONLY=testStudioLaunchesAndDocumentPickerOpens npm run test:ios:ui`, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 9 — Native Open_In configuration and delivery

- [ ] 39. Declare audio document types and handle incoming URLs
  - [ ] 39.1 Create `plugins/withAudioDocumentTypes.js`
    - Using `withInfoPlist`, append one `Audio` `CFBundleDocumentTypes` entry (`Viewer`,
      `LSHandlerRank = Alternate`, the seven `LSItemContentTypes`). Add
      `UTImportedTypeDeclarations` for `org.xiph.ogg-audio` and `org.xiph.flac` conforming to
      `public.audio`. Leave the `BeatNote Project` entry untouched, and set
      `LSSupportsOpeningDocumentsInPlace` per the Task 1.3 decision.
    - Verification evidence: `npx expo prebuild -p ios` followed by `plutil -p ios/BeatNote/Info.plist`
      shows both document types and the chosen key value.
    - _Requirements: 7.3, 7.10, 7.11_

  - [ ] 39.2 Register the plugin in `app.json`
    - Add the plugin and remove the direct `LSSupportsOpeningDocumentsInPlace` key so the plugin
      owns it. Keep `UIFileSharingEnabled` for exports.
    - Verification evidence: a clean `npx expo prebuild -p ios --clean` reproduces the Task 39.1
      `Info.plist`.
    - _Requirements: 7.3, 7.11_

  - [ ] 39.3 Wire `Linking` in `useLibraryLifecycle`
    - Call `Linking.getInitialURL()` once and subscribe to `url` (cleaned up on unmount). Queue
      cold-launch URLs until boot completes. Supported audio `file://` URLs become `openIn` jobs,
      other extensions are rejected with the unsupported-file message, and `.beatnote` is ignored.
      After the import, run the transaction with its guard. A cancelled guard keeps the item in the
      library. Inbox copies are deleted; in-place originals never are. Open_In is hidden on web.
    - Verification evidence: `npx tsc --noEmit` clean.
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 18.4, 27.3_

  - [ ] 39.4 Add the `AppDelegateSubscriber` fallback only if Task 1.1 required it
    - Add a minimal subscriber to `modules/library-storage` that emits `onOpenURL`, and have
      `useLibraryLifecycle` listen to it instead of `Linking`. Skip this sub-task when the spike
      confirmed `RCTLinkingManager` receives file URLs, and record the skip.
    - Verification evidence: a focused native build passes, or the skip is recorded.
    - _Requirements: 7.4_

  - [ ] 39.5 Add `testOpenInAudioImportsIntoLibrary` if the spike showed it is feasible
    - In `scripts/ios-ui-test.js`, stage an audio fixture and deliver it with `simctl openurl` or
      `XCUIApplication.open(_:)`. In `tests/ios/BeatNoteUITests.swift`, assert the Dock_Toast, the
      library row, and the loaded title. If the spike showed neither mechanism delivers a
      document-type URL, add no case and keep Open_In on the physical-device list.
    - Verification evidence: `IOS_TEST_ONLY=testOpenInAudioImportsIntoLibrary npm run test:ios:ui`
      passes, or the omission is recorded.
    - _Requirements: 30.7, 7.4_

- [ ] 40. Checkpoint — Open_In
  - Run `npx tsc --noEmit`, `npx expo prebuild -p ios`, the focused native cases touched, and
    `git diff --check`.
  - Ensure all tests pass, ask the user if questions arise.

### Phase 10 — Retained journeys and focused failure-path verification

- [ ] 41. Extend the retained Playwright journeys (no new spec file)
  - [ ] 41.1 Extend the project/import/export surfaces journey
    - In `tests/ui-components.spec.ts` ("custom menus and submenus share the liquid-glass
      surface"), cover the following. Open the sheet from `song-title-control`; import audio with
      `page.setInputFiles`; Save with the name prompt; Save as New Project. Switch to a second song
      and back, asserting the newest project resolves. Edit, switch, and choose Keep Draft & Switch.
      Run the CSV replace confirmation with counts, Replace, and toast Undo.
    - Finally, reload with an `addInitScript`-seeded legacy `beatnote_projects` entry whose
      `audio.uri` is a `blob:` URL. Assert "Audio missing", Relink, and available.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 30.2, 4.3, 5.6, 13.2, 14.7, 16.1, 16.3, 22.4, 22.9, 27.6, 28.3_

  - [ ] 41.2 Extend the responsive control-dock journey
    - With two imported items in portrait and landscape: Next, Previous (restart above 3 s and
      switch below), First, Shuffle on and off with `aria-pressed`, and the disabled "End of queue"
      state. Add a rapid-Next burst that asserts only the final title is loaded.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 30.3, 15.6, 19.2, 19.5, 19.6, 19.8, 19.9, 19.15, 29.6_

  - [ ] 41.3 Update the V1 Settings journey toolbar order
    - Assert `song-title-control`, `save-project`, `load-project`, and `sidebar-open-toggle` in
      portrait and landscape.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes.
    - _Requirements: 8.1, 8.11_

  - [ ] 41.4 Confirm the `waveform-features.spec.ts` journeys pass through the new helpers
    - Assertions are otherwise unchanged. Remove any superseded step rather than skipping it.
    - Verification evidence: `PLAYWRIGHT_PORT=8082 npm test` passes; a project-wide search finds no
      `test.only` or `test.skip`.
    - _Requirements: 30.6, 30.8_

- [ ] 42. Extend the retained native XCTest cases
  - [ ] 42.1 Update `testStudioLaunchesAndDocumentPickerOpens`
    - Tap `song-title-control`, assert the sheet title "Music", tap Import Audio, and assert the
      Files picker. Remove the `load-song` and toolbar-CSV assertions.
    - Verification evidence: `IOS_TEST_ONLY=testStudioLaunchesAndDocumentPickerOpens npm run test:ios:ui`
      passes.
    - _Requirements: 8.2, 9.10, 30.6_

  - [ ] 42.2 Extend `testAudioAnnotationAndProjectRestore` for the durable copy and draft restore
    - Add a `__DEV__`-only boot hook in `useLibraryLifecycle` that empties `Paths.cache` when the
      launch environment sets `BEATNOTE_TEST_PURGE_CACHES=1`. The case imports a song, adds a
      marker without saving, terminates the app, and relaunches with the flag. It asserts that the
      song loads from the durable copy, paused at 0 ms, and that the marker is restored from the
      draft.
    - Verification evidence: `IOS_TEST_ONLY=testAudioAnnotationAndProjectRestore npm run test:ios:ui`
      passes.
    - _Requirements: 30.4, 12.11, 18.8, 2.5_

  - [ ] 42.3 Update `testCsvImportAndShareSheetExport` to confirmed replace
    - Import from the Project_Manager's Current Project section, assert the confirmation counts,
      choose Replace, and assert the marker count equals the CSV, not the sum. Export from the same
      section to the share sheet.
    - Verification evidence: `IOS_TEST_ONLY=testCsvImportAndShareSheetExport npm run test:ios:ui`
      passes.
    - _Requirements: 30.5, 22.7, 23.1_

- [ ] 43. Verify the failure paths, then remove every temporary test
  - [ ] 43.1 Purged cache
    - Covered by Task 42.2. Also confirm on web that a reload after import keeps the item
      available from IndexedDB.
    - Verification evidence: the Task 42.2 result bundle; a Playwright reload step in Task 41.1.
    - _Requirements: 2.5, 3.1, 27.2_

  - [ ] 43.2 Missing files
    - Delete a managed file between launches with a temporary fake adapter. Assert the launch marks
      it missing, the switch fails with Relink/Skip/Close and an untouched source, and Skip stops
      with "No playable songs in this direction". The legacy relink step in Task 41.1 proves the
      user-visible path.
    - Verification evidence: temporary `tests/unit/trackSwitch.test.ts` cases pass; Task 41.1 passes.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 15.3, 15.5_

  - [ ] 43.3 Disk full and storage quota
    - With fake adapters, inject a native copy `ENOSPC`, a web IndexedDB `QuotaExceededError`, and
      an AsyncStorage quota error. Assert that partial files are deleted, no record is created, the
      prior stored value is byte-identical, in-memory state is kept, and the exact messages appear.
    - Verification evidence: temporary `tests/unit/importPipeline.test.ts` and
      `persistencePipeline.test.ts` cases pass.
    - _Requirements: 3.7, 26.5, 27.4, 28.15_

  - [ ] 43.4 Rapid switching
    - Ten Next requests during a Load_Phase load only the in-flight item and the final one, and
      replaced items never get `lastPlayedAt`.
    - Verification evidence: the Task 28.8 property passes; the Task 41.2 rapid-Next assertion
      passes.
    - _Requirements: 15.6, 15.7, 15.8_

  - [ ] 43.5 Save and autosave race
    - A Save during a pending debounce, a Save that fails mid-step, and a crash simulated between
      the project and draft writes. Assert that the next load advances the baseline on equal
      fingerprints.
    - Verification evidence: temporary `tests/unit/projectService.test.ts` cases pass.
    - _Requirements: 12.9, 12.10, 12.15_

  - [ ] 43.6 Background and termination
    - `AppState` `background` and `inactive` flush within the budget. Backgrounding with the guard
      open keeps the dialog and destination. Termination mid-transaction relaunches to the last
      committed song.
    - Verification evidence: temporary `tests/unit/draftAutosave.test.ts` and `trackSwitch.test.ts`
      cases pass; Task 42.2 passes.
    - _Requirements: 12.7, 12.11, 14.11, 15.14_

  - [ ] 43.7 Migration interruption and idempotence
    - Interrupt after each journal step, relaunch, and assert identical Music_Items and
      Project_IDs, no duplicate or unreferenced managed files, and an untouched legacy key.
    - Verification evidence: the Task 14.4 property passes; the Task 41.1 legacy step passes.
    - _Requirements: 28.7, 28.8, 28.13_

  - [ ] 43.8 Remove every temporary unit and property test
    - Delete all `tests/unit/*.test.ts` files created by this plan. The design records no
      testing-strategy exception, so none are retained. If a fingerprint or migration regression
      appeared during implementation, keep only the smallest test and record the exception in
      Task 45.4.
    - Verification evidence: `npm run test:unit` succeeds with no tests found; `git status`
      shows no remaining files from this plan under `tests/unit/`.
    - _Requirements: 30.8, 30.9_

- [ ] 44. Final gates and acceptance
  - [ ] 44.1 Run the full automated gate
    - Run `npx tsc --noEmit`, `npm test` (or `PLAYWRIGHT_PORT=8082 npm test` when Metro holds
      8081), and focused `IOS_TEST_ONLY=<case> npm run test:ios:ui` for every native case touched:
      `testStudioLaunchesAndDocumentPickerOpens`, `testAudioAnnotationAndProjectRestore`,
      `testCsvImportAndShareSheetExport`, `testLoopRangeToggleAndTransportFits`, and
      `testOpenInAudioImportsIntoLibrary` if added. Then run the aggregate native suite for
      release acceptance.
    - Also run `npm run test:unit` (it must pass with no temporary tests), `git diff --check`, and
      `python3 ~/.kiro/skills/global-project-orchestrator/references/mdlint.py` on every changed
      Markdown file.
    - Verification evidence: each command's result recorded in the handover log.
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.8_

  - [ ] 44.2 Simulator visual review
    - Check portrait (320–480 points), landscape (480–932 points), and the largest accessibility
      text size: toolbar title truncation, sheet detents, sheet rotation with preserved scroll and
      search, the keyboard, the guard and confirmation dialogs, the Project_Manager sections, the
      queue controls, and the persistence banner. Confirm there is no horizontal scrolling, no
      clipping, and no content under the safe areas.
    - Verification evidence: screenshots or notes per surface.
    - _Requirements: 8.4, 8.11, 9.6, 9.7, 9.8, 9.9, 29.5, 29.6_

  - [ ] 44.3 VoiceOver accessibility review
    - Check focus on "Music" at open and its return to `song-title-control` at close, the detent
      action, row custom actions, current/missing/dirty/removed/shuffle announcements, the guard
      dialog, save prompts, CSV confirmation, the one-time title announcement after queue
      navigation, and web keyboard focus with a visible focus indicator.
    - Verification evidence: a per-surface pass/fail list.
    - _Requirements: 9.5, 9.10, 9.12, 19.17, 29.1, 29.3, 29.4, 29.8_

  - [ ] 44.4 Physical-device acceptance
    - On a physical iPhone, check:
      - Open_In from Files and from a third-party app, including a file over 100 MB, confirming any
        provisional Task 1.2 result.
      - Backup exclusion: the Music_Directory flag, and that after a restore items show "Audio
        missing" and relink by hash.
      - A near-full disk import.
      - Audio interruptions, route changes, and the background flush across a force-quit.
      - Touch comfort for the sheet drag, detents, rows, and queue controls, with Reduce Motion.
      - Large text at 200% in both orientations.
      - Rapid Next/Previous during playback.
    - This gate is required before the feature is called done.
    - Verification evidence: a device/iOS-version note and a per-item result.
    - _Requirements: 6.2, 7.4, 7.9, 12.7, 12.11, 29.2, 29.5, 30.10_

### Phase 11 — Documentation and handover

- [ ] 45. Record the decisions and update the board
  - [ ] 45.1 Add ADR-012…ADR-016 to `.kiro/steering/architecture-decisions.md`
    - ADR-012 Music_Item identity and app-owned audio storage; ADR-013 Draft and baseline
      persistence; ADR-014 Web audio storage; ADR-015 Provider-neutral playback source; ADR-016
      Bottom sheet without a navigation library. Number them after the existing ADR-011, and update
      the `AGENTS.md` Context Map's ADR range.
    - Verification evidence: `mdlint.py` passes on the file.
    - _Requirements: 6.2_

  - [ ] 45.2 Update `.kiro/steering/project-overview.md`
    - Cover Music_Items, drafts, Saved_Projects, the queue, and the Song_Title_Control workflow
      in the domain concepts and core workflow. Remove the transient-audio limitation and add
      Open_In.
    - Verification evidence: `mdlint.py` passes on the file.
    - _Requirements: 7.4, 8.2_

  - [ ] 45.3 Update `.kiro/steering/ios-testflight.md`
    - Cover the audio document types and the plugin, the OQ-4 decision, the Music_Directory
      location and backup exclusion, the `library-storage` module in the native-modules table, the
      new or omitted Open_In XCTest case, and `BEATNOTE_TEST_PURGE_CACHES`.
    - Verification evidence: `mdlint.py` passes on the file.
    - _Requirements: 6.2, 7.3, 30.7_

  - [ ] 45.4 Update `.kiro/steering/testing-strategy.md` where rules changed
    - Update the retained journey and native case lists (the queue/library coverage and the Open_In
      case, if added). Record a testing-strategy exception only if Task 43.8 kept a test. Make no
      edit if no rule changed.
    - Verification evidence: `mdlint.py` passes on the file.
    - _Requirements: 30.7, 30.9_

  - [ ] 45.5 Update `AGENTS.md` and run the orchestrator contract checker
    - Move the item to `✅ Done` only after Tasks 44.1–44.3 pass. If Task 44.4 is still pending,
      keep a physical-acceptance item in `🚧 In Progress`. Add Key Artifacts from
      `git diff --name-only`, update the Active Project Status metrics, and prepend a handover-log
      entry with **Changed:**, **Verified:**, **Not verified / known gaps:**, and **Next agent
      should:**. Rotate to the latest 5 entries.
    - Run `mdlint.py AGENTS.md` and the orchestrator Kanban invariant self-check from the
      `global-project-orchestrator` skill.
    - Verification evidence: both checks report clean.
    - _Requirements: 30.1_

## Notes

- Tasks marked with `*` are temporary test sub-tasks. They can be skipped for a faster path; when
  written, they are removed in Task 43.8 per the repository testing policy. Core implementation and
  retained-journey tasks are never optional.
- Each task references specific acceptance criteria in `requirements.md`. The design's ADR
  renumbering (012–016) supersedes the requirements' proposed 011–015.
- `src/utils/libraryConstants.ts`, `src/utils/importDecisions.ts`, and `src/utils/sheetDetent.ts`
  are small pure additions that the design implies but does not name. They follow its rule that
  branching decisions are pure functions in `src/utils/`.
- Tasks 3.2, 13.4, Task 21's sub-tasks, and any other edit to `useStudioStore.ts`, `useAudioPlayer.ts`,
  `projectManager.ts`, or `types/project.ts` wait for the in-flight playback-speed work to be
  committed.
- `load-song` stays functional through a temporary shim (Task 21.5) until `SongTitleControl` replaces
  it (Task 35.2), so every checkpoint runs green.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["4.1", "5.1", "6.1", "7.1", "8.1", "9.1", "10.1"] },
    { "id": 5, "tasks": ["4.2", "10.2"] },
    { "id": 6, "tasks": ["4.3", "5.2", "6.2", "7.2", "8.2", "9.2", "10.3"] },
    { "id": 7, "tasks": ["4.4", "6.3", "7.3", "8.3", "10.4"] },
    { "id": 8, "tasks": ["6.4", "7.4", "8.4", "10.5"] },
    { "id": 9, "tasks": ["7.5", "10.6"] },
    { "id": 10, "tasks": ["7.6", "10.7"] },
    { "id": 11, "tasks": ["7.7", "12.1"] },
    { "id": 12, "tasks": ["12.2"] },
    { "id": 13, "tasks": ["12.3"] },
    { "id": 14, "tasks": ["12.4", "13.1"] },
    { "id": 15, "tasks": ["12.5", "13.2"] },
    { "id": 16, "tasks": ["13.3"] },
    { "id": 17, "tasks": ["13.4"] },
    { "id": 18, "tasks": ["13.5", "14.1"] },
    { "id": 19, "tasks": ["14.2"] },
    { "id": 20, "tasks": ["14.3"] },
    { "id": 21, "tasks": ["14.4", "16.1"] },
    { "id": 22, "tasks": ["16.2", "16.3"] },
    { "id": 23, "tasks": ["17.1", "17.2"] },
    { "id": 24, "tasks": ["18.1", "19.1"] },
    { "id": 25, "tasks": ["19.2"] },
    { "id": 26, "tasks": ["19.3"] },
    { "id": 27, "tasks": ["19.4", "19.5"] },
    { "id": 28, "tasks": ["19.6", "21.1"] },
    { "id": 29, "tasks": ["21.2"] },
    { "id": 30, "tasks": ["21.3"] },
    { "id": 31, "tasks": ["21.4"] },
    { "id": 32, "tasks": ["21.5"] },
    { "id": 33, "tasks": ["21.6", "22.1"] },
    { "id": 34, "tasks": ["22.2"] },
    { "id": 35, "tasks": ["24.1", "24.3", "24.4"] },
    { "id": 36, "tasks": ["24.2", "24.5"] },
    { "id": 37, "tasks": ["26.1"] },
    { "id": 38, "tasks": ["26.2"] },
    { "id": 39, "tasks": ["26.3"] },
    { "id": 40, "tasks": ["26.4"] },
    { "id": 41, "tasks": ["26.5", "26.6"] },
    { "id": 42, "tasks": ["26.7", "26.8"] },
    { "id": 43, "tasks": ["28.1"] },
    { "id": 44, "tasks": ["28.2"] },
    { "id": 45, "tasks": ["28.3"] },
    { "id": 46, "tasks": ["28.4"] },
    { "id": 47, "tasks": ["28.5", "28.6"] },
    { "id": 48, "tasks": ["28.7", "29.1"] },
    { "id": 49, "tasks": ["28.8", "29.2"] },
    { "id": 50, "tasks": ["29.3"] },
    { "id": 51, "tasks": ["31.1", "32.1"] },
    { "id": 52, "tasks": ["32.2", "32.3"] },
    { "id": 53, "tasks": ["33.1"] },
    { "id": 54, "tasks": ["33.2"] },
    { "id": 55, "tasks": ["33.3"] },
    { "id": 56, "tasks": ["33.4"] },
    { "id": 57, "tasks": ["34.1"] },
    { "id": 58, "tasks": ["34.2"] },
    { "id": 59, "tasks": ["34.3"] },
    { "id": 60, "tasks": ["35.1"] },
    { "id": 61, "tasks": ["35.2"] },
    { "id": 62, "tasks": ["35.3"] },
    { "id": 63, "tasks": ["36.1", "36.2"] },
    { "id": 64, "tasks": ["36.3"] },
    { "id": 65, "tasks": ["36.4"] },
    { "id": 66, "tasks": ["37.1", "37.2"] },
    { "id": 67, "tasks": ["37.3"] },
    { "id": 68, "tasks": ["37.4"] },
    { "id": 69, "tasks": ["39.1", "39.3"] },
    { "id": 70, "tasks": ["39.2", "39.4"] },
    { "id": 71, "tasks": ["39.5"] },
    { "id": 72, "tasks": ["41.1", "42.1"] },
    { "id": 73, "tasks": ["41.2", "42.2"] },
    { "id": 74, "tasks": ["41.3", "42.3"] },
    { "id": 75, "tasks": ["41.4", "43.1", "43.2", "43.3", "43.4", "43.5", "43.7"] },
    { "id": 76, "tasks": ["43.6"] },
    { "id": 77, "tasks": ["43.8"] },
    { "id": 78, "tasks": ["44.1"] },
    { "id": 79, "tasks": ["44.2", "44.3"] },
    { "id": 80, "tasks": ["44.4"] },
    { "id": 81, "tasks": ["45.1", "45.2", "45.3", "45.4"] },
    { "id": 82, "tasks": ["45.5"] }
  ]
}
```
