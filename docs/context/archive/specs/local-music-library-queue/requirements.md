# Requirements Document

## Introduction

BeatNote currently treats audio as a transient attachment of the working session. The user picks a
file, the app plays a cache copy, and a saved project remembers that cache URI. This feature turns
audio into a durable, app-owned **Music Library** with a **Playback Queue**, and separates three
kinds of annotation state that today are conflated:

- **Music items** — reusable audio sources that BeatNote owns (a durable copy) or references.
- **Song drafts** — one automatically persisted working state per music item.
- **Saved projects** — explicitly named snapshots, each associated with exactly one music item. A
  music item may have many saved projects.

The **Playback Queue** orders music item IDs only; it never contains projects. Every song change,
whether from the queue or from the Music Library, runs through one guarded **Track Switch
Transaction** that flushes the outgoing draft, resolves the destination's draft or project, and
loads audio and annotation state as one coherent step. The four reserved dock controls (First,
Previous, Next, Shuffle) become functional queue controls.

The feature also replaces the toolbar's load/replace-audio action with a song-title control,
restructures the Project Manager around the current project, changes CSV import from append to a
confirmed, reversible replace, and migrates existing projects that reference `audio.uri` /
`audio.filename`. Streaming providers (Apple Music, Spotify) are not implemented; V1 defines only a
provider-neutral source and capability boundary so they can be added later.

### Verified current state

The following facts were verified from the code at commit `0f588bb` and constrain the requirements:

- **Audio picking.** `useCustomAudioPlayer.loadSong` (`src/hooks/useAudioPlayer.ts`) calls
  `DocumentPicker.getDocumentAsync` with eight audio MIME types, `copyToCacheDirectory: true`, and
  `multiple: false`, then validates only the filename extension (`.mp3`, `.wav`, `.m4a`, `.aac`,
  `.ogg`, `.flac`). It plays the picker's cache URI directly via `setAudioSource({ uri })`, keeps
  the original name in local `audioFilename` state, and shows a blocking `Alert` on success. No
  size, decodability, or free-space check exists, and no durable copy is made. On web the picker
  returns a session-scoped object URL.
- **Audio state location.** The playing URI and filename live in `useState` inside
  `useCustomAudioPlayer`, not in `useStudioStore`. `loadProjectAudio(uri, filename)` loads a
  project's stored URI without checking that the file exists.
- **Project model.** `BeatNoteProject` (`src/types/project.ts`) has an index signature
  (`[key: string]: unknown`) at the top level and in `settings`, `version`, `metadata` (name, bpm,
  duration, stemCount, createdAt, modifiedAt), `audio: { uri; filename }`, six `layers` with
  `markers: number[]` and `annotations: { timestamp; text }[]`, and `settings` (viewMode,
  showGridLines, layerSpecificNavigation, primaryView, countSize, rowDensity, followPlayhead,
  loopRange, loopEnabled). There is no project ID field.
- **Project storage.** `ProjectManager` (`src/utils/projectManager.ts`) stores every project in one
  AsyncStorage JSON value under `beatnote_projects`, keyed by a generated "filename"
  (`<sanitised name>_<Date.now()>.beatnote`). Every save, rename, and delete rewrites the whole
  value. `PROJECT_VERSION` is `'1.1.0'`; `compareProjectVersion` compares numeric components.
- **Storage read failure.** `getStoredProjects` returns `{}` when reading or parsing fails. A
  subsequent save then writes a value containing only the new project, which would overwrite all
  existing projects.
- **Rename changes identity.** `renameProject` writes the project under a new filename key and
  deletes the old key, so the storage key is not a stable identity.
- **Save always creates.** `useStudioStore.saveProject(name, audioUri, audioFilename)` never passes
  a filename to `ProjectManager.saveProject`, so every Save creates a new project record and resets
  `createdAt`. There is no "update the open project" path and no dirty tracking.
- **Forward compatibility.** When `loadedProjectSource.version` is newer than `PROJECT_VERSION`,
  `saveProject` spreads the loaded source's unknown top-level and `settings` fields into the new
  record and keeps the newer version string. Projects at or below `1.1.0` are re-stamped `1.1.0`.
  `withProjectDefaults` fills absent settings, and `normalizePersistedLoop` clears loop ranges for
  projects older than `1.1.0` and re-clamps or rejects persisted bounds.
- **Load.** `loadProject` replaces `allLayersData`, bpm, `songDuration`, view settings, and loop
  state, resets `currentTime` to 0, clears selections and the loop restore snapshot, and returns
  the stored `audio.uri` / `audio.filename`.
- **CSV import appends.** `ImportModal` picks a `text/csv` file, reads it with
  `expo-file-system/legacy`, and calls `useStudioStore.importFromCSV`, which parses with
  `ImportEngine.importFromCSV` and **appends** imported markers and annotations to each matching
  layer immediately, with no confirmation, preview, or undo. The modal text warns that re-importing
  may create duplicates. The parser requires `Layer` and `Marker Time (ms)` columns and reports
  `importedMarkers` and `skippedRows`.
- **CSV export.** `ExportModal` exports the current in-memory store state through
  `ExportEngine.exportToCSV` (platform files `exportEngine.ts` / `.ios.ts` / `.web.ts`). The iOS
  variant writes under a `beatnote_exports` directory and opens the share sheet.
- **Toolbar.** `ProjectControls` renders, in order, `load-song` (Choose/Replace Audio, which shows a
  "Replace Audio?" alert when annotations exist and keeps existing markers at their timestamps),
  `save-project`, `load-project` (Projects), `import-data` (Import CSV), `export-data` (Export CSV),
  and on mobile `sidebar-open-toggle` (Settings) at the trailing end.
- **Responsive layout rule.** `StudioScreen`, `MainContent`, `Sidebar`, `HelpScreen`, and
  `WaveformCanvas` treat the layout as phone when, on web, the window width is less than 768 points,
  and, on native, the smaller of window width and height is less than 768 points
  (`breakpoints.mobile` in `src/styles/common.ts`). Otherwise the tablet/desktop layout applies.
- **Project Manager.** `ProjectManagerModal` lists every saved project, newest first, with Open,
  Rename, and Delete actions (`load-saved-project-<name>`, `delete-saved-project-<name>`). It has no
  notion of the current song or current project.
- **Reserved dock controls.** `ControlDock` renders `first-track-control`,
  `previous-track-control`, `next-track-control`, and `shuffle-control` as reserved buttons that
  only raise "… is in development" dock toasts.
- **Lifecycle.** No module in `src/` or `App.tsx` subscribes to React Native `AppState`. Nothing is
  persisted automatically; unsaved work is lost on termination. Launch starts with no song loaded.
- **Undo.** The store keeps only a bounded marker-deletion history (`markerDeletionHistory`,
  `restoreLastMarkerDeletion`, `redoLastMarker`). There is no general undo.
- **Native configuration.** `app.json` sets `UIFileSharingEnabled: true` (the Documents directory is
  visible in the Files app), `LSSupportsOpeningDocumentsInPlace: true`, `UIBackgroundModes:
  ["audio"]`, and declares only the `.beatnote` project document type; no audio document types are
  declared. `plugins/` contains `withIosPodDeploymentTarget.js` and `withIosUiTests.js`. The
  generated `ios/` directory is noncanonical.
- **Dependencies.** `expo-file-system` (legacy API in use), `expo-document-picker`,
  `@react-native-async-storage/async-storage`, `react-native-gesture-handler`,
  `react-native-reanimated`, and `react-native-safe-area-context` are installed. No crypto, linking,
  or bottom-sheet library is installed.
- **Existing stores of files.** `src/features/stemSeparation/stemCache.ts` already stores files
  under an app directory with AsyncStorage metadata (`beatnote_stem_cache`); it is deferred V3 code
  and is not reused by this feature.

## Glossary

- **Studio_Store**: The single Zustand store `useStudioStore` (ADR-001). All new global state lives
  here.
- **Music_Item**: A persisted record describing one reusable audio source, identified by a
  Music_Item_ID. For local audio it points to one Managed_Audio_File.
- **Music_Item_ID**: A stable, randomly generated UUID assigned when a Music_Item is created. It
  never derives from a URI, path, filename, or display title, and never changes.
- **Managed_Audio_File**: BeatNote's own durable copy of imported audio, stored in the
  Music_Directory under a UUID physical filename with the original extension.
- **Music_Directory**: The app-owned directory that holds Managed_Audio_Files. It is not inside the
  Files-visible Documents directory.
- **Staging_Area**: The `.staging/` subdirectory of the Music_Directory that holds in-progress
  import copies before they are renamed into place.
- **Import_Commit**: The Import_Pipeline stage that writes the new or updated Music_Item metadata.
  An import is cancellable only before this stage.
- **Original_Filename**: The filename reported by the import source, kept as metadata only.
- **Display_Title**: The user-editable title BeatNote shows for a Music_Item. It defaults to the
  Original_Filename without its extension.
- **Content_Hash**: A digest of the complete audio file bytes, used to detect duplicate imports.
- **Source_Identity**: The provider-neutral description of where a Music_Item's audio comes from:
  a provider identifier (V1: `local`) plus a provider-specific reference (V1: the Managed_Audio_File
  relative path).
- **Playback_Capabilities**: The typed declaration of what a source provider supports: exact
  seeking, waveform/sample access, pitch-preserving speed, offline playback, queue control,
  background playback, repeat, and shuffle.
- **Collection**: A logical BeatNote grouping of Music_Items. It is not a Files folder. V1 has one
  built-in Collection, **Imported_Music**, that contains every Music_Item.
- **Saved_Project**: A persisted, explicitly named annotation snapshot that references exactly one
  Music_Item_ID. It is the compatible evolution of `BeatNoteProject`.
- **Project_ID**: A stable UUID identifying a Saved_Project, independent of its name and storage
  key.
- **Song_Draft**: The single automatically persisted working annotation state for one Music_Item.
- **Draft_Baseline**: The Saved_Project (by Project_ID and revision) that a Song_Draft was last
  opened from or saved to, or none for an unnamed draft.
- **Unnamed_Draft**: A Song_Draft whose Draft_Baseline is none.
- **Persisted_Content**: The fields that a Saved_Project persists today (layers' markers,
  annotations, visibility, and layer-persistent data; bpm; stemCount; countSize; rowDensity;
  primaryView; viewMode; showGridLines; layerSpecificNavigation; followPlayhead; loopRange;
  loopEnabled), plus any field added to Saved_Project by this or later features, plus preserved
  unknown fields.
- **Session_State**: State excluded from drafts: playback position, play/pause state, selected
  marker, selected row, ghost playhead, open modals or sheets, toasts, marker-deletion history,
  loop restore snapshot, marker-loop mode, and queue position.
- **Content_Fingerprint**: A deterministic digest of the canonical serialisation of
  Persisted_Content, excluding project name, timestamps, Project_ID, and revision.
- **Dirty**: The Song_Draft state in which its Content_Fingerprint differs from the
  Draft_Baseline's Content_Fingerprint. An Unnamed_Draft is never reported as Dirty relative to a
  project; it is reported as "Unsaved draft" when it holds any marker or annotation.
- **Persistence_Pipeline**: The single serialised queue through which every metadata write (music
  library, drafts, projects, queue, migration journal) is performed.
- **Import_Pipeline**: The single ingestion pipeline shared by every audio import entry point.
- **Open_In**: Receiving an audio file URL from another app through iOS document-type handling
  ("Open in BeatNote" / share-sheet app row), without a Share Extension.
- **Share_Extension**: A separate iOS app-extension target. Not part of V1.
- **Phone_Layout**: The layout active when, on web, the window width is less than 768 points, or,
  on native, the smaller of window width and height is less than 768 points. Any other window uses
  the **Tablet_Desktop_Layout**.
- **Song_Title_Control**: The toolbar control `song-title-control` that shows the current
  Display_Title or `Choose Music` and opens the Music_Library_Sheet.
- **Music_Library_Sheet**: The slide-up, resizable sheet that lists Music_Items.
- **Sheet_Height**: The height between the top and bottom safe-area insets available to the
  Music_Library_Sheet.
- **Playback_Queue**: The persisted, ordered list of Music_Item_IDs used by queue navigation, plus a
  current index, shuffle state, and the Collection and sort it was built from.
- **Queue_Snapshot**: The order of Music_Item_IDs captured when the Playback_Queue is built. Later
  library sort changes do not reorder it.
- **Track_Switch_Transaction**: The single guarded operation that changes the loaded Music_Item.
- **Switch_Guard**: The step of a Track_Switch_Transaction that decides whether to prompt the user
  before leaving the current Music_Item.
- **Load_Phase**: The part of a Track_Switch_Transaction after the Switch_Guard has resolved,
  through applying the destination state.
- **Missing_Audio_State**: The state of a Music_Item whose metadata exists but whose
  Managed_Audio_File is absent, 0 bytes, or unreadable.
- **Relink**: Choosing a replacement audio file for a Music_Item or legacy project in
  Missing_Audio_State.
- **Migration_Journal**: A persisted record of per-project migration status that makes migration
  resumable and idempotent.
- **Project_Manager**: The Projects surface (`ProjectManagerModal` or its successor).
- **CSV_Import_Preview**: The parsed, not-yet-applied CSV import result with its counts.
- **Dock_Toast**: The shared transient feedback element defined by the
  `playback-marker-control-dock` spec (`testID="dock-toast"`).

## Constants

```text
DRAFT_AUTOSAVE_DEBOUNCE_MS      = 500
DRAFT_FLUSH_TIMEOUT_MS          = 2000   (budget for a flush before a switch or background, and the
                                          maximum autosave latency under continuous change)
PREVIOUS_RESTART_THRESHOLD_MS   = 3000
PROJECT_NAME_MAX_LENGTH         = 100
DISPLAY_TITLE_MAX_LENGTH        = 200
MAX_AUDIO_FILE_BYTES            = 500 MB (recommended default; see Open Questions)
FREE_SPACE_MARGIN_BYTES         = 50 MB
SUPPORTED_AUDIO_EXTENSIONS      = .mp3 .wav .m4a .aac .ogg .flac
MIN_TOUCH_TARGET_PT             = 44
IMPORT_DECODE_TIMEOUT_MS        = 10000
ORPHAN_FILE_MIN_AGE_MS          = 86400000 (24 hours, by file modification time)
SHEET_MEDIUM_DETENT_RATIO       = 0.50 (±0.02 of Sheet_Height)
SHEET_SETTLE_MS                 = 350
SHEET_CLOSE_DRAG_RATIO          = 0.25 (of the medium detent height)
CSV_UNDO_TOAST_MS               = 5000
PERSISTENCE_AUTO_RETRY_LIMIT    = 3
MIGRATION_IMPORT_ATTEMPT_LIMIT  = 3
LEGACY_DURATION_TOLERANCE_MS    = 50
MAX_TEXT_SCALE                  = 200%
```

## Requirements

All requirements in this section are V1 scope. Future extensions and non-goals follow separately.

### Requirement 1: Typed domain model

**User Story:** As a developer, I want explicit types for music, drafts, projects, and the queue, so
that identity and ownership are unambiguous across the codebase.

#### Acceptance Criteria

1. THE application SHALL define typed models `MusicItem`, `SourceIdentity`, `PlaybackCapabilities`,
   `Collection`, `SongDraft`, `SavedProject`, and `PlaybackQueue` in `src/types/`.
2. THE `MusicItem` model SHALL contain at least: Music_Item_ID, Source_Identity, Display_Title,
   Original_Filename, file extension, byte size, Content_Hash, duration in integer milliseconds
   (or null until measured), `addedAt`, `lastPlayedAt` (or null), availability state (`available`
   or `missing`), and Collection memberships.
3. THE `SavedProject` model SHALL extend the existing `BeatNoteProject` shape with a Project_ID, a
   `musicItemId`, and a monotonically increasing integer `revision`, and SHALL keep the existing
   top-level and `settings` index signatures.
4. THE `SongDraft` model SHALL contain the Music_Item_ID, the Draft_Baseline (Project_ID and
   revision, or null), the Persisted_Content, the baseline Content_Fingerprint (or null), and
   `updatedAt`.
5. THE `PlaybackQueue` model SHALL contain only Music_Item_IDs as entries, plus the current index
   (or null), the shuffle flag, the unshuffled Queue_Snapshot order, and the source Collection ID
   and sort key it was built from.
6. THE `PlaybackQueue` model SHALL contain no Project_ID, project name, or Song_Draft reference.
7. THE Saved_Project and Song_Draft models SHALL reference audio only through `musicItemId`, and
   THE application SHALL resolve playable audio from the Music_Item at load time rather than from
   any URI stored in a project or draft.
8. WHEN a Saved_Project or Song_Draft containing fields unknown to the running version is read and
   written back, THE application SHALL preserve every unknown top-level and `settings` field
   unchanged, extending the existing forward-compatibility convention to drafts and to
   projects at every version.
9. IF a stored `MusicItem`, `SavedProject`, `SongDraft`, or `PlaybackQueue` record is missing a
   required field or has a field of the wrong type, THEN THE application SHALL leave that record
   unchanged in storage, exclude it from loaded state, log an error naming the record ID, and load
   every other valid record.
10. THE `MusicItem` Collection memberships SHALL always include Imported_Music.

### Requirement 2: Stable identity independent of mutable values

**User Story:** As a choreographer, I want my projects to keep pointing at the right song after I
rename things, so that nothing breaks when I reorganise.

#### Acceptance Criteria

1. THE application SHALL generate each Music_Item_ID and Project_ID once, at creation, as a random
   UUID, and SHALL keep that ID unchanged across rename, relaunch, Relink, migration, duplicate
   re-import, and CSV export followed by CSV import.
2. WHEN a Music_Item's Display_Title is renamed, THE application SHALL leave its Music_Item_ID,
   Managed_Audio_File path, and every Saved_Project's and Song_Draft's `musicItemId` unchanged.
3. WHEN a Saved_Project is renamed, THE application SHALL leave its Project_ID, revision baseline
   references, and storage key unchanged.
4. WHEN a Music_Item's Collection memberships change, THE application SHALL leave its
   Music_Item_ID and all referencing Saved_Projects and Song_Drafts unchanged.
5. THE application SHALL store Managed_Audio_File locations as paths relative to the
   Music_Directory and SHALL resolve them to absolute URIs at runtime, so that an app-container
   path change after an iOS update or restore does not invalidate any Music_Item.

### Requirement 3: Shared audio Import_Pipeline

**User Story:** As a dancer, I want every song I import to be kept safely by BeatNote, so that it
still plays next week even if the system clears caches.

#### Acceptance Criteria

1. THE application SHALL route every audio import entry point (Files picker, Open_In, and Relink)
   through one Import_Pipeline that executes these stages in this order: receive; validate
   extension and size; check free space; copy to a staging file in the Staging_Area; verify the
   staged byte size; compute the Content_Hash of the staged copy; detect duplicates (discarding the
   staged copy on a duplicate); check decodability; atomically rename the staged copy to
   `<uuid>.<ext>` in the Music_Directory; Import_Commit; and delete the consumed source temporary
   copy.
2. WHEN a file's extension is not in SUPPORTED_AUDIO_EXTENSIONS, THE Import_Pipeline SHALL reject
   the file before copying and SHALL show "“<Original_Filename>” isn't a supported audio file.
   Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC."
3. WHEN a file's size is 0 bytes or exceeds MAX_AUDIO_FILE_BYTES, THE Import_Pipeline SHALL reject
   the file before copying and SHALL show a message naming the Original_Filename and stating either
   that the file is empty or the MAX_AUDIO_FILE_BYTES limit in megabytes.
4. IF the audio player cannot load the staged copy to a positive finite duration, or does not finish
   loading within IMPORT_DECODE_TIMEOUT_MS, THEN THE Import_Pipeline SHALL delete the staged copy,
   create no Music_Item, and show "BeatNote couldn't read “<Original_Filename>”. The file may be
   damaged or use an unsupported encoding."
5. WHEN free space reported by the platform is less than the file size plus
   FREE_SPACE_MARGIN_BYTES, THE Import_Pipeline SHALL reject the import before copying and SHALL
   show the required and available space in megabytes.
6. IF the platform cannot report free space, THEN THE Import_Pipeline SHALL skip the free-space
   check and rely on criterion 7 for copy failures.
7. IF a copy fails partway, including from a disk-full or storage-quota error, THEN THE
   Import_Pipeline SHALL delete the partial file, create no Music_Item, and show a message naming
   the file and the reason.
8. WHEN the user cancels the picker or an in-progress import before Import_Commit, THE
   Import_Pipeline SHALL delete any staged or partial copy, create no Music_Item, change no loaded
   song, and show no error.
9. WHEN the user requests cancellation after Import_Commit has begun, THE Import_Pipeline SHALL
   complete the import normally.
10. WHEN a staged copy completes, THE Import_Pipeline SHALL verify that its byte size equals the
    source size before hashing, SHALL name the final Managed_Audio_File `<uuid>.<ext>`, and SHALL
    store the Original_Filename as metadata.
11. WHEN an import succeeds, THE Import_Pipeline SHALL delete the picker cache copy or Open_In inbox
    copy that it consumed.
12. IF deleting the consumed picker cache copy or Open_In inbox copy fails, THEN THE Import_Pipeline
    SHALL still report the import as successful and SHALL log the cleanup error.
13. WHEN an import succeeds, THE Import_Pipeline SHALL add the Music_Item to Imported_Music and SHALL
    show a confirmation in the Dock_Toast instead of the current blocking success `Alert`.
14. WHEN a Managed_Audio_File is removed by BeatNote, THE application SHALL delete only the copy in
    the Music_Directory and SHALL leave the original file in Files or the source app untouched.
15. WHILE an import is in progress, THE Music_Library_Sheet SHALL show the file name and an
    indeterminate or percentage progress indicator whose accessible label includes the file name.
16. WHILE an import is in progress before Import_Commit, THE Music_Library_Sheet SHALL show a Cancel
    action with a touch target of at least MIN_TOUCH_TARGET_PT × MIN_TOUCH_TARGET_PT points and the
    accessible name "Cancel import".
17. WHEN an import is requested while another import is running, THE Import_Pipeline SHALL queue the
    request and process imports one at a time in arrival order.
18. WHERE the platform is web, THE Import_Pipeline SHALL store audio bytes through the web audio
    store defined in Requirement 27.

### Requirement 4: Duplicate detection and re-import

**User Story:** As a user, I want re-importing the same song to reuse what BeatNote already has, so
that my library has no duplicates and my projects stay attached.

#### Acceptance Criteria

1. WHEN an imported file's Content_Hash and byte size equal those of an existing available
   Music_Item, THE Import_Pipeline SHALL discard the staged copy, create no new Music_Item, and open
   the existing Music_Item through a Track_Switch_Transaction.
2. IF the Switch_Guard for a duplicate re-import is cancelled, THEN THE application SHALL keep the
   current Music_Item loaded and SHALL still show the message in criterion 3.
3. WHEN a duplicate is detected, THE application SHALL show "“<Display_Title>” is already in your
   library" in the Dock_Toast and SHALL keep the existing Display_Title, projects, and draft.
4. WHEN an imported file's Content_Hash and byte size equal those of an existing Music_Item in
   Missing_Audio_State, THE Import_Pipeline SHALL attach the new copy to that Music_Item, set its
   availability to `available`, and keep its Music_Item_ID.
5. WHEN two files share an Original_Filename but differ in Content_Hash, THE Import_Pipeline SHALL
   create a separate Music_Item for each.
6. IF computing the Content_Hash fails, THEN THE Import_Pipeline SHALL delete the staged or partial
   copy, create no Music_Item, and show an error naming the file.

### Requirement 5: Missing audio recovery

**User Story:** As a user, I want BeatNote to tell me clearly when a song's audio is gone and help
me reattach it, so that my annotations are never lost.

#### Acceptance Criteria

1. THE application SHALL treat a Managed_Audio_File as missing when the file is absent, is 0 bytes,
   or cannot be read.
2. WHEN the application launches, THE application SHALL check the Managed_Audio_File of every
   Music_Item and SHALL set each Music_Item whose file is missing to Missing_Audio_State.
3. WHEN a Music_Item is about to be loaded, THE application SHALL check its Managed_Audio_File and
   SHALL set the Music_Item to Missing_Audio_State if the file is missing.
4. WHEN the load-time check in criterion 3 finds the file missing, THE application SHALL keep the
   current Music_Item loaded and SHALL show an error naming the destination with a Relink action.
5. WHILE a Music_Item is in Missing_Audio_State, THE Music_Library_Sheet SHALL show it with a
   visible "Audio missing" label and icon (not colour alone) that is also part of the row's
   accessible label, SHALL offer a Relink action, and SHALL keep its Display_Title, Song_Draft, and
   Saved_Projects.
6. WHEN the user Relinks a Music_Item and the chosen file's Content_Hash matches the stored
   Content_Hash, THE application SHALL restore the Music_Item to `available` without a prompt.
7. IF a Relink file with a matching Content_Hash fails the decode check of Requirement 3
   criterion 4, THEN THE application SHALL keep the Music_Item in Missing_Audio_State.
8. WHEN the user Relinks a Music_Item and the chosen file's Content_Hash does not match, THE
   application SHALL show the stored and chosen titles and durations with the actions "Use This
   File" and "Cancel", and SHALL attach the file only after "Use This File" is chosen.
9. IF the user chooses Cancel in the Relink confirmation or dismisses the Relink picker, THEN THE
   application SHALL delete any chosen copy and leave the Music_Item, its Song_Draft, and its
   Saved_Projects unchanged.
10. IF Relink is confirmed with a file whose duration is shorter than the stored duration, THEN THE
    application SHALL keep all markers and annotations, and THE existing duration re-clamp rules of
    the `loop-range-overview` spec SHALL apply to the loop range.
11. THE application SHALL never delete a Music_Item record, Song_Draft, or Saved_Project as a
    consequence of detecting Missing_Audio_State.

### Requirement 6: Music storage location and backup

**User Story:** As a user, I want imported audio stored where I won't accidentally break it, so that
the Files app never shows BeatNote's internal copies.

#### Acceptance Criteria

1. THE application SHALL place the Music_Directory in an app-private location that is not the
   Files-visible Documents directory exposed by `UIFileSharingEnabled`.
2. THE application SHALL apply the backup policy chosen in Open Question OQ-2 to the
   Music_Directory and SHALL record that policy in a new ADR.
3. WHEN the application starts and no import is running, THE application SHALL delete files in the
   Music_Directory and the Staging_Area that no Music_Item references and whose modification time
   is older than ORPHAN_FILE_MIN_AGE_MS, SHALL never delete a file that a Music_Item references,
   and SHALL log the number of files removed.
4. IF deleting an orphaned file fails, THEN THE application SHALL log the failure, continue with the
   remaining files, and show no user-facing error.
5. IF the Music_Directory or Staging_Area cannot be created or written, THEN THE Import_Pipeline
   SHALL abort the import, create no Music_Item, and show the failure message of Requirement 3
   criterion 7.
6. THE application SHALL store audio bytes only in the filesystem (native) or the web audio store
   (Requirement 27) and SHALL store no audio bytes in AsyncStorage.

### Requirement 7: Import entry points

**User Story:** As a dancer, I want to bring music in from Files or from another app, so that I can
start annotating wherever the song lives.

#### Acceptance Criteria

1. WHEN the user chooses Import Audio in the Music_Library_Sheet, THE application SHALL present the
   native document picker restricted to the supported audio types and SHALL pass the result to the
   Import_Pipeline.
2. WHEN the user cancels the document picker, THE application SHALL return to the
   Music_Library_Sheet unchanged and show no error.
3. THE application SHALL declare the supported audio document types (MP3, WAV, M4A/MPEG-4 audio,
   AAC, OGG, FLAC) with a viewer/alternate handler rank through `app.json` or an Expo config plugin,
   so that `expo prebuild` reproduces the declaration without editing `ios/`.
4. WHEN iOS delivers an incoming audio file URL through Open_In, whether the app is cold-launched or
   already running, THE application SHALL pass that URL to the Import_Pipeline.
5. WHEN an Open_In file arrives while the Switch_Guard would prompt, THE application SHALL complete
   the import first and then run the Track_Switch_Transaction to the new Music_Item, including its
   prompt.
6. IF the user cancels the Switch_Guard prompt that follows an Open_In import, THEN THE application
   SHALL keep the imported Music_Item in the library and keep the current Music_Item loaded.
7. WHEN an Open_In file arrives while another import is running, THE Import_Pipeline SHALL queue it
   per Requirement 3 criterion 17.
8. WHEN an Open_In file's extension is not in SUPPORTED_AUDIO_EXTENSIONS, THE Import_Pipeline SHALL
   reject it with the message of Requirement 3 criterion 2 and create no file or record.
9. IF an incoming URL requires security-scoped access, THEN THE application SHALL acquire access for
   the duration of the copy and release it afterwards, whether the copy succeeds or fails.
10. THE application SHALL implement Open_In without a Share_Extension.
11. THE existing `.beatnote` project document type declaration SHALL remain unchanged.
12. WHERE the platform is web, THE Import Audio action SHALL open the browser file chooser filtered
    to SUPPORTED_AUDIO_EXTENSIONS, and Open_In SHALL not apply.

### Requirement 8: Song_Title_Control in the toolbar

**User Story:** As a user, I want the toolbar to show which song I'm working on, so that I always
know the context and can change it in one tap.

#### Acceptance Criteria

1. WHILE the Phone_Layout is active, THE toolbar SHALL render, in leading-to-trailing order,
   Song_Title_Control, Save (`save-project`), Projects (`load-project`), and Settings
   (`sidebar-open-toggle`) at the trailing end.
2. THE toolbar SHALL replace the `load-song` Choose/Replace Audio action and its "Replace Audio?"
   alert with Song_Title_Control (`testID="song-title-control"`).
3. WHILE no Music_Item is loaded, THE Song_Title_Control SHALL read `Choose Music` followed by a
   disclosure chevron.
4. WHILE a Music_Item is loaded, THE Song_Title_Control SHALL show its Display_Title on exactly one
   line with tail truncation at every text size, followed by a disclosure chevron, and SHALL include
   the full Display_Title in its accessibility label.
5. WHILE the loaded Music_Item is in Missing_Audio_State, THE Song_Title_Control SHALL show a warning
   icon and the text "Missing", and SHALL append ", audio missing" to its accessibility label.
6. THE Song_Title_Control SHALL take all horizontal space not used by the fixed-width Save, Projects,
   and Settings buttons, with a touch target of at least 44 × 44 points.
7. THE Song_Title_Control SHALL expose accessibility role button, the label "Music library, current
   song <Display_Title>" (or "Music library, no song chosen"), and the hint "Opens your music
   library".
8. WHEN the user activates Song_Title_Control, THE application SHALL open the Music_Library_Sheet.
9. THE Import CSV and Export CSV actions SHALL move from the toolbar into the Project_Manager's
   Current Project section (Requirement 21).
10. WHERE the Tablet_Desktop_Layout is active, THE toolbar SHALL show the same four actions with
    visible text labels.
11. WHILE the Phone_Layout is active in landscape, THE toolbar SHALL keep the order of criterion 1
    within the leading and trailing safe-area insets.

### Requirement 9: Music_Library_Sheet presentation

**User Story:** As a phone user, I want the library to slide up like an iOS sheet that I can resize,
so that I can glance at it or browse fully without losing my place.

#### Acceptance Criteria

1. WHEN opened, THE Music_Library_Sheet SHALL slide up from the bottom edge over the live workspace
   and SHALL show a visible grabber.
2. THE Music_Library_Sheet SHALL support a medium detent of SHEET_MEDIUM_DETENT_RATIO of the
   Sheet_Height and a large detent that fills the Sheet_Height, opening at the medium detent.
3. WHEN the user ends a drag of the grabber or sheet header, THE Music_Library_Sheet SHALL settle at
   the nearest detent within SHEET_SETTLE_MS.
4. WHEN a drag ends more than SHEET_CLOSE_DRAG_RATIO of the medium detent height below the medium
   detent, THE Music_Library_Sheet SHALL close.
5. THE Music_Library_Sheet SHALL provide a visible Close button with a 44 × 44 point target and an
   accessibility action to switch detents, so that resizing and dismissal never require a drag.
6. WHILE the device is in landscape, THE Music_Library_Sheet SHALL open at the large detent and
   SHALL respect the leading, trailing, and bottom safe-area insets.
7. WHEN the device rotates while the sheet is open, THE Music_Library_Sheet SHALL remain open, keep
   its scroll position and search text, and re-fit to the new safe area.
8. WHILE the software keyboard is visible, THE Music_Library_Sheet SHALL expand to the large detent
   and keep the focused field fully visible above the keyboard's top edge.
9. WHILE the system text size is at an accessibility size, THE Music_Library_Sheet SHALL wrap titles
   to at most two lines with tail truncation and SHALL keep every row action and the Close button
   reachable by scrolling without overlap or clipping.
10. WHEN the sheet opens, THE Music_Library_Sheet SHALL move VoiceOver focus to its title "Music",
    and WHEN it closes, THE application SHALL return focus to Song_Title_Control.
11. THE Music_Library_Sheet SHALL use the shared liquid-glass surface language defined in the coding
    standards.
12. WHERE the platform is web, THE Music_Library_Sheet SHALL cycle Tab and Shift-Tab focus within
    the sheet while open, SHALL close on Escape, and SHALL return focus to Song_Title_Control on
    close.

### Requirement 10: Music_Library_Sheet content and actions

**User Story:** As a choreographer with many songs, I want to find, open, rename, and remove songs
easily, so that my library stays manageable.

#### Acceptance Criteria

1. THE Music_Library_Sheet SHALL list the Music_Items of the selected Collection (V1:
   Imported_Music), each row showing Display_Title, duration (or "--:--" while the duration is
   unknown), and the number of Saved_Projects.
2. WHILE a Music_Item is loaded, THE Music_Library_Sheet SHALL mark its row as current with an icon
   and the accessibility state selected, not by colour alone.
3. WHEN the user taps a row other than the current one, THE application SHALL run a
   Track_Switch_Transaction to that Music_Item and close the sheet after a successful load.
4. WHILE a Track_Switch_Transaction started from the sheet is loading, THE Music_Library_Sheet SHALL
   show a progress indicator on the tapped row and disable the other rows.
5. IF a Track_Switch_Transaction started from the sheet fails or its Switch_Guard is cancelled, THEN
   THE Music_Library_Sheet SHALL stay open with the previous Music_Item loaded, and SHALL show an
   inline failure message with a Retry action when the load failed.
6. WHEN the user taps the current row, THE application SHALL close the sheet without reloading.
7. THE Music_Library_Sheet SHALL offer sort options Title (A–Z, locale-aware, case-insensitive),
   Recently Added, Recently Played, and Duration, and SHALL persist the chosen sort across
   relaunch.
8. WHERE the selected Collection contains more than 8 Music_Items, THE Music_Library_Sheet SHALL
   show a search field that filters by Display_Title and Original_Filename, case- and
   diacritic-insensitively.
9. WHEN a search matches no Music_Item, THE Music_Library_Sheet SHALL show "No matching music" and
   SHALL keep the Import Audio action visible.
10. THE Music_Library_Sheet SHALL show an Import Audio action at the top of the list in every state.
11. EACH row SHALL provide a visible overflow (“…”) button with the actions Rename, Show Projects, and
    Delete from BeatNote, and, while in Missing_Audio_State, Relink.
12. WHERE a row also supports long-press or swipe actions, THE same actions SHALL be available from
    the row's overflow button and as VoiceOver custom actions.
13. WHEN the user confirms a Music_Item rename, THE application SHALL trim the title, truncate it to
    DISPLAY_TITLE_MAX_LENGTH characters, store it, and update the Song_Title_Control immediately.
14. IF the trimmed rename title is empty, THEN THE application SHALL show an inline error, disable
    the rename Save action, and keep the previous Display_Title.
15. WHILE the library is empty, THE Music_Library_Sheet SHALL show "No music yet" with an Import
    Audio button.
16. WHILE the library metadata is loading, THE Music_Library_Sheet SHALL show a loading indicator
    and SHALL disable row actions.
17. IF the library metadata cannot be read, THEN THE Music_Library_Sheet SHALL show "BeatNote
    couldn't load your music library" with a Retry action and SHALL make no write to the library
    record (Requirement 26).
18. IF an import fails, THEN THE Music_Library_Sheet SHALL show the failure message from
    Requirement 3 inline with Retry (re-opens the picker) and Dismiss actions.
19. THE data model SHALL allow a Music_Item to belong to multiple Collections, and THE V1 user
    interface SHALL expose only Imported_Music.
20. WHEN the user chooses Delete from BeatNote for a row, THE application SHALL apply the
    confirmation and loaded-item effects defined in Requirement 24.

### Requirement 11: Song_Draft contents

**User Story:** As a dancer, I want my markers and settings for each song kept automatically, so
that I never lose work just because I didn't press Save.

#### Acceptance Criteria

1. THE Song_Draft SHALL contain every Persisted_Content field for its Music_Item.
2. THE Song_Draft SHALL exclude every Session_State field.
3. THE application SHALL keep exactly one Song_Draft per Music_Item.
4. WHEN the Content_Fingerprint of the in-memory state is computed, THE application SHALL sort
   markers ascending, sort annotations by timestamp then text, order object keys canonically, and
   exclude project name, Project_ID, revision, `createdAt`, and `modifiedAt`.
5. FOR ALL Persisted_Content values, writing a Song_Draft and reading it back SHALL produce an equal
   Content_Fingerprint and SHALL preserve every unknown field (round-trip property).
6. FOR ALL Persisted_Content values, computing the Content_Fingerprint twice SHALL return the same
   value, and two values differing only in marker or annotation array order SHALL return the same
   value.
7. THE Song_Draft SHALL record the baseline Project_ID, the baseline revision, and the baseline
   Content_Fingerprint, each null for an Unnamed_Draft.

### Requirement 12: Draft autosave pipeline

**User Story:** As a user, I want autosave to be reliable even when I switch songs fast or close the
app, so that the last thing I did is always kept.

#### Acceptance Criteria

1. WHEN a Persisted_Content field changes, THE application SHALL restart the draft debounce and
   schedule a Song_Draft write DRAFT_AUTOSAVE_DEBOUNCE_MS after the last change.
2. WHILE Persisted_Content changes continuously, THE application SHALL write the Song_Draft no later
   than DRAFT_FLUSH_TIMEOUT_MS after the first unwritten change.
3. WHEN a Song_Draft write is scheduled but the Content_Fingerprint equals the last written
   fingerprint, THE application SHALL skip the write.
4. WHEN a Song_Draft write executes, THE application SHALL write the snapshot of Persisted_Content
   taken at execution time.
5. WHEN Persisted_Content changes while a Song_Draft write is executing, THE application SHALL
   schedule another Song_Draft write.
6. WHEN a Track_Switch_Transaction begins, THE application SHALL flush any pending Song_Draft write
   for the outgoing Music_Item before changing the loaded song.
7. WHEN `AppState` changes to `background` or `inactive`, THE application SHALL flush any pending
   Song_Draft write immediately.
8. THE application SHALL perform every Song_Draft, Saved_Project, Music_Item, Playback_Queue, and
   Migration_Journal write through the Persistence_Pipeline, which executes writes one at a time in
   enqueue order.
9. WHEN an explicit Save is enqueued while a debounced draft write is pending, THE
   Persistence_Pipeline SHALL cancel the pending draft write and SHALL write the Saved_Project and
   the updated Song_Draft (new Draft_Baseline and baseline fingerprint) in the same pipeline step.
10. IF the Saved_Project write in criterion 9 fails, THEN THE application SHALL keep the previous
    Draft_Baseline, keep the Song_Draft Dirty, and immediately enqueue the cancelled draft write.
11. WHEN the application relaunches after termination or a crash, THE application SHALL restore the
    last completed Song_Draft write for any Music_Item when it is next loaded, SHALL never restore a
    partially written draft, and SHALL lose at most the changes made within
    DRAFT_AUTOSAVE_DEBOUNCE_MS before termination.
12. IF a Song_Draft write fails, THEN THE application SHALL keep the in-memory state, show a
    persistent banner "Draft not saved. Your latest changes are only on screen." with a Retry action,
    and retry automatically at the next change or app foreground.
13. WHEN a Song_Draft write succeeds after a failure, THE application SHALL remove the banner of
    criterion 12.
14. IF the flush required by criterion 6 fails or exceeds DRAFT_FLUSH_TIMEOUT_MS, THEN THE
    application SHALL cancel the switch, keep the current song loaded, and show "BeatNote couldn't
    save your draft, so the song wasn't changed." with Retry and Stay actions.
15. IF a Saved_Project revision is newer than the Song_Draft's baseline revision but has a
    Content_Fingerprint equal to the draft's, THEN THE application SHALL advance the Draft_Baseline
    to that revision and treat the draft as not Dirty.

### Requirement 13: Song-load resolution

**User Story:** As a choreographer, I want opening a song to bring back exactly what I was last
working on, so that I can continue immediately.

#### Acceptance Criteria

1. WHEN a Music_Item is loaded without an explicit project choice and its Song_Draft is Dirty or is
   an Unnamed_Draft holding any marker or annotation, THE application SHALL restore the Song_Draft.
2. WHEN a Music_Item is loaded without an explicit project choice, criterion 1 does not apply, and
   one or more Saved_Projects reference it, THE application SHALL open the Saved_Project with the
   greatest `modifiedAt` (ties broken by greater revision, then by Project_ID ascending) and make it
   the Draft_Baseline.
3. WHEN a Music_Item is loaded without an explicit project choice and no Saved_Project references
   it, THE application SHALL restore its Unnamed_Draft, or create an empty Unnamed_Draft if none
   exists.
4. WHEN the user explicitly opens a Saved_Project, THE application SHALL load that Saved_Project
   and make it the Draft_Baseline, overriding criteria 1–3.
5. WHILE a restored Dirty Song_Draft's Draft_Baseline is not the most recently modified
   Saved_Project for that Music_Item, THE Project_Manager Current Project section SHALL show "Draft
   based on “<baseline name>”" and the note "A newer project “<name>” exists" with an Open action.
6. WHEN the user chooses Open on the note of criterion 5, THE application SHALL run the
   Switch_Guard decision of Requirement 14 criterion 4 before loading the newer Saved_Project.
7. IF a Song_Draft's Draft_Baseline references a Saved_Project that no longer exists, THEN THE
   application SHALL restore the draft as an Unnamed_Draft and keep all of its content.
8. WHEN any resolution completes, THE application SHALL set `currentTime` to 0, set playback paused
   unless Requirement 15 criterion 11 applies, and reset Session_State.

### Requirement 14: Switch_Guard decisions

**User Story:** As a user switching songs, I want BeatNote to ask only when I'd otherwise be unclear
about my changes, so that switching is fast but safe.

#### Acceptance Criteria

1. THE application SHALL run the same Switch_Guard for queue navigation, Music_Library_Sheet
   selection, Open_In, duplicate re-import, and launch restoration.
2. WHEN the outgoing Song_Draft is an Unnamed_Draft, THE Switch_Guard SHALL flush the draft and
   continue without a prompt.
3. WHEN the outgoing Song_Draft is not Dirty, THE Switch_Guard SHALL continue without a prompt.
4. WHEN the outgoing Song_Draft is Dirty, THE Switch_Guard SHALL show a dialog titled "Save changes
   before switching?" with the message "Your changes to “<song>” differ from the saved project
   “<project>”. BeatNote can keep them as a draft." and the actions Save & Switch, Keep Draft &
   Switch, and Cancel.
5. THE Switch_Guard dialog SHALL offer no Discard action.
6. WHEN the user chooses Save & Switch, THE application SHALL save to the Draft_Baseline per
   Requirement 16 and then continue to the retained destination.
7. WHEN the user chooses Keep Draft & Switch, THE application SHALL flush the Song_Draft unchanged
   (still Dirty) and continue to the retained destination.
8. WHEN the user chooses Cancel, THE application SHALL keep the current song, queue index, and
   playback state unchanged.
9. WHILE a Save started from the Switch_Guard requires naming or a conflict decision, THE
   application SHALL retain the pending destination, continue to it after the save succeeds, and
   discard it and stay on the current song if the save is cancelled or fails.
10. WHILE the Switch_Guard dialog is open, THE application SHALL ignore further track-switch
    requests, and THE queue controls SHALL expose a disabled state; pending-destination replacement
    applies only during the Load_Phase (Requirement 15 criterion 6).
11. WHEN `AppState` changes to `background` while the Switch_Guard dialog is open, THE application
    SHALL flush the Song_Draft and keep the dialog and the retained destination.

### Requirement 15: Track_Switch_Transaction

**User Story:** As a dancer moving through a set, I want every song change to either fully succeed
or leave me where I was, so that I never end up with one song's markers on another song's audio.

#### Acceptance Criteria

1. THE Track_Switch_Transaction SHALL perform, in order: Switch_Guard, flush outgoing draft, record
   the destination, resolve the destination's Music_Item and audio file, resolve its draft or
   project per Requirement 13, load audio, apply annotation state, update the Playback_Queue index,
   and update the Music_Item's `lastPlayedAt`.
2. THE application SHALL apply the destination's annotation state and audio together, so that no
   rendered frame shows the destination's markers with the source's audio or the reverse.
3. IF resolving or loading the destination fails, including Missing_Audio_State, THEN THE
   application SHALL keep the source song, its annotation state, the queue index, and every
   `lastPlayedAt` unchanged, and SHALL show an error naming the destination with the actions
   Relink, Skip (queue navigation only), and Close.
4. IF the source audio was already unloaded when the failure of criterion 3 occurs, THEN THE
   application SHALL reload the source audio at its previous `currentTime`, paused.
5. WHEN the user chooses Skip after a queue-navigation failure, THE application SHALL attempt the
   next Music_Item in the same direction, skipping at most every queue entry once before stopping
   with "No playable songs in this direction".
6. WHILE a Track_Switch_Transaction is in its Load_Phase, THE application SHALL hold at most one
   pending destination, replacing it with each newer request, and SHALL start the pending
   destination after the in-progress transaction completes.
7. WHEN a pending destination is replaced, THE application SHALL neither load the replaced
   destination nor update its `lastPlayedAt`.
8. WHEN Next Track or Previous Track is requested during a Track_Switch_Transaction, THE application
   SHALL compute the target from the index of the pending destination, or of the in-progress
   destination when none is pending.
9. WHEN a pending destination starts, THE application SHALL run the full Track_Switch_Transaction
   for it, including the Switch_Guard.
10. WHEN playback is active as a transaction begins, THE application SHALL pause the source before
    loading the destination.
11. WHERE playback was active when the transaction began and no Switch_Guard dialog was shown, THE
    application SHALL start playback of the destination at 0 ms after it loads.
12. WHERE playback was paused when the transaction began or a Switch_Guard dialog was shown, THE
    application SHALL leave the destination paused at 0 ms.
13. THE Track_Switch_Transaction SHALL leave `isRepeatActive` unchanged, SHALL set marker looping
    off, and SHALL take the loop range and its enabled state from the destination's resolved draft
    or project.
14. IF the application is backgrounded or terminated during a Track_Switch_Transaction, THEN the
    next launch SHALL load the last Music_Item that completed a Track_Switch_Transaction, with its
    draft or project resolved per Requirement 13.

### Requirement 16: Save semantics

**User Story:** As a choreographer, I want Save to update the project I'm in and Save as New to
branch, so that I can keep several versions of a routine for one song.

#### Acceptance Criteria

1. WHEN the user activates Save while the Song_Draft is an Unnamed_Draft, THE application SHALL
   prompt for a project name prefilled with the Display_Title and SHALL create a new Saved_Project
   on confirmation.
2. WHEN the user activates Save while the Song_Draft has a Draft_Baseline, THE application SHALL
   update that Saved_Project in place, increment its revision, and keep its Project_ID, name, and
   `createdAt`.
3. WHEN the user activates Save as New Project, THE application SHALL prompt for a name and SHALL
   create a new Saved_Project for the same Music_Item, leaving the previous Saved_Project
   unchanged.
4. WHEN any save succeeds, THE application SHALL set the Saved_Project's `modifiedAt` to the save
   time, set it as the Draft_Baseline, store its Content_Fingerprint as the baseline fingerprint,
   and report the draft as not Dirty.
5. IF a trimmed project name is empty or longer than PROJECT_NAME_MAX_LENGTH characters, THEN THE
   application SHALL disable the prompt's Confirm action, show an inline error naming the limit, and
   keep the entered text.
6. THE application SHALL accept a project name that differs from the Display_Title.
7. IF a new or renamed trimmed project name equals, case-insensitively, the trimmed name of another
   Saved_Project for the same Music_Item, THEN THE application SHALL show "A project with this name
   already exists for this song", SHALL suggest "<name> (n)" with the lowest n ≥ 2 that is unique for
   that Music_Item, and SHALL save only after a unique name is confirmed; names may repeat across
   different Music_Items.
8. IF the stored Saved_Project revision is greater than the Draft_Baseline revision at Save time,
   THEN THE application SHALL ask "This project changed since you opened it" with Overwrite, Save as
   New Project, and Cancel actions.
9. WHEN the user chooses Overwrite in the conflict prompt, THE application SHALL write the
   Saved_Project with revision equal to the stored revision plus 1.
10. WHEN the user chooses Save as New Project in the conflict prompt, THE application SHALL follow
    criterion 3.
11. WHEN the user chooses Cancel in the conflict prompt, THE application SHALL change no stored
    data, keep the Song_Draft Dirty, and drop any pending destination per Requirement 14
    criterion 9.
12. IF the Draft_Baseline Saved_Project no longer exists at Save time, THEN THE application SHALL
    treat the save as criterion 1.
13. IF a save fails, THEN THE application SHALL keep the Song_Draft Dirty, keep the in-memory state,
    and show "Project not saved" with the failure reason and a Retry action.
14. WHEN a save succeeds, THE application SHALL confirm with a non-blocking toast "Saved
    “<project>”" instead of a blocking alert.
15. WHEN a Saved_Project is written, THE application SHALL write `version` as the new project
    version, or keep the loaded newer version string and unknown fields per Requirement 1
    criterion 8.
16. WHEN the user cancels a project name prompt, THE application SHALL write nothing and keep the
    Song_Draft content and its Dirty or Unsaved state.
17. WHILE a save is in progress, THE application SHALL disable Save, Save as New Project, and track
    switching.

### Requirement 17: Explicit project switching for the current song

**User Story:** As a user, I want to open a different saved project for the same song without losing
my unsaved edits by surprise, so that comparing versions is safe.

#### Acceptance Criteria

1. WHEN the user opens a Saved_Project for the current Music_Item while the Song_Draft is Dirty, THE
   application SHALL show "Save changes before opening?" with the actions Save & Open, Discard
   Changes & Open, and Cancel.
2. WHEN the user chooses Save & Open, THE application SHALL save per Requirement 16 and SHALL open
   the chosen Saved_Project only if the save succeeds.
3. WHEN the user chooses Cancel, THE application SHALL leave the Song_Draft, loaded project, audio,
   and queue unchanged.
4. WHEN the user chooses Discard Changes & Open, THE application SHALL replace the Song_Draft with
   the chosen Saved_Project's content after a second destructive confirmation naming the number of
   changed markers.
5. IF the number of changed markers is 0, THEN THE second destructive confirmation SHALL name the
   changed settings instead.
6. WHEN the user opens a Saved_Project for the current Music_Item, THE application SHALL leave the
   Playback_Queue, its index, and the loaded audio unchanged.
7. WHEN the user opens a Saved_Project that references a different Music_Item, THE application SHALL
   run a Track_Switch_Transaction to that Music_Item with the chosen project as the explicit
   selection.
8. WHILE the Song_Draft is Dirty and has a Draft_Baseline, THE Project_Manager SHALL enable a Revert
   to Saved action that, after a destructive confirmation, restores the Draft_Baseline content.
9. WHILE the Song_Draft is not Dirty or is an Unnamed_Draft, THE Project_Manager SHALL disable the
   Revert to Saved action.

### Requirement 18: Playback_Queue construction and persistence

**User Story:** As a dancer rehearsing a set, I want the queue to follow my library order at the
moment I start, so that the sequence doesn't jump around later.

#### Acceptance Criteria

1. WHEN the user opens a Music_Item from the Music_Library_Sheet, THE application SHALL rebuild the
   Playback_Queue as a Queue_Snapshot of the selected Collection in the current sort order (ignoring
   any search filter), set the current index to the opened item, and turn shuffle off.
2. WHEN the library sort, a Display_Title, or a search filter changes, THE application SHALL leave
   the existing Queue_Snapshot order unchanged.
3. WHEN a Music_Item is imported, THE application SHALL leave the existing Queue_Snapshot unchanged
   unless the import opens the item through the Music_Library_Sheet, which rebuilds it per
   criterion 1.
4. WHEN a Music_Item is opened through Open_In or launch restoration and is not in the
   Queue_Snapshot, THE application SHALL rebuild the queue per criterion 1.
5. WHEN the Playback_Queue changes, THE application SHALL persist it through the
   Persistence_Pipeline.
6. WHEN the application launches, THE application SHALL restore the persisted Playback_Queue.
7. WHEN the application restores the Playback_Queue at launch, THE application SHALL drop entries
   whose Music_Item_IDs no longer exist, keep the relative order of the remaining entries, and
   re-point the current index to the same Music_Item.
8. WHEN the application launches with a persisted current Music_Item that is available, THE
   application SHALL load it through a Track_Switch_Transaction, paused at 0 ms.
9. IF the persisted current Music_Item is missing or deleted at launch, THEN THE application SHALL
   start with no song loaded and keep the remaining queue.

### Requirement 19: Queue transport controls

**User Story:** As a user, I want First, Previous, Next, and Shuffle to work in the dock, so that I
can move through my songs without opening the library.

#### Acceptance Criteria

1. THE Control_Dock controls `first-track-control`, `previous-track-control`, `next-track-control`,
   and `shuffle-control` SHALL replace their reserved in-development behaviour with the queue
   behaviour in this requirement and SHALL keep their testIDs and grid positions.
2. WHEN the user activates First Track while the current index is greater than 0, THE application
   SHALL switch to index 0.
3. WHEN the user activates First Track while the current index is 0, THE application SHALL seek to
   0 ms and keep the play/pause state.
4. WHILE Shuffle is on, THE First Track control SHALL target index 0 of the shuffled order.
5. WHEN the user activates Previous Track while `currentTime` is greater than
   PREVIOUS_RESTART_THRESHOLD_MS, THE application SHALL seek to 0 ms without a
   Track_Switch_Transaction and keep the play/pause state.
6. WHEN the user activates Previous Track while `currentTime` is at most
   PREVIOUS_RESTART_THRESHOLD_MS and the current index is greater than 0, THE application SHALL
   switch to the previous index.
7. WHEN the user activates Previous Track while `currentTime` is at most
   PREVIOUS_RESTART_THRESHOLD_MS and the current index is 0, THE application SHALL seek to 0 ms and
   keep the play/pause state.
8. WHEN the user activates Next Track while a later entry exists, THE application SHALL switch to
   the next index.
9. WHILE the current index is the last entry, the queue has one entry, or the queue is empty, THE
   Next Track control SHALL be disabled with the description "End of queue", except that the
   description of criterion 16 takes precedence when both apply.
10. WHEN playback reaches the end of the track, THE application SHALL repeat the whole track if
    whole-track repeat is on. Otherwise, if Shuffle is on and a later shuffled entry exists, THE
    application SHALL switch to that entry and continue playback; if not, it SHALL pause at the
    end. Whole-track repeat SHALL take precedence over shuffled advancement.
11. WHILE an inner loop (markers or range) is active, THE queue controls SHALL remain operable, and
    switching SHALL apply Requirement 15 criterion 13.
12. WHEN the user turns Shuffle on with more than one queue entry, THE application SHALL persist a
    shuffled order that is a permutation of the Queue_Snapshot with the current Music_Item at
    index 0 and the remaining entries in random order.
13. WHEN the user turns Shuffle on with one queue entry, THE application SHALL change only the
    shuffle state.
14. WHEN the user turns Shuffle off, THE application SHALL restore the unshuffled Queue_Snapshot
    order and set the current index to the current Music_Item's position in it.
15. THE Shuffle control SHALL expose its on/off state as checked (`aria-pressed` on web) and SHALL
    raise the Dock_Toast "Shuffle on" or "Shuffle off".
16. WHILE no Music_Item is loaded or the queue is empty, THE four queue controls SHALL be disabled
    with the description "Choose music to start a queue".
17. THE queue controls SHALL raise no Dock_Toast on successful navigation, and the new
    Display_Title in Song_Title_Control SHALL be announced to VoiceOver once.

### Requirement 20: Queue maintenance on deletion and unavailability

**User Story:** As a user, I want the queue to stay sensible after I delete or lose songs, so that
navigation never lands on nothing.

#### Acceptance Criteria

1. WHEN a Music_Item that is not current is deleted, THE application SHALL remove it from the
   Queue_Snapshot and shuffled order and adjust the current index so the same Music_Item remains
   current.
2. WHEN the current Music_Item is deleted and another queue entry exists, THE application SHALL
   first run a Track_Switch_Transaction to the next entry, else the previous entry, and then delete
   the Music_Item.
3. IF the Track_Switch_Transaction of criterion 2 is cancelled or fails, THEN THE application SHALL
   delete nothing and leave the Playback_Queue unchanged.
4. WHEN the current Music_Item is deleted and no other queue entry exists, THE application SHALL
   end with an empty Playback_Queue and apply Requirement 24 criterion 11.
5. WHEN the last Music_Item in the library is deleted, THE application SHALL clear the
   Playback_Queue and turn shuffle off.
6. WHILE a queued Music_Item is in Missing_Audio_State, THE application SHALL keep it in the queue
   at its position, including after it is skipped or Relinked, and navigation to it SHALL follow
   Requirement 15 criteria 3 and 5.
7. WHEN a Saved_Project is opened, created, renamed, or deleted, THE application SHALL leave the
   Playback_Queue unchanged.

### Requirement 21: Project_Manager structure

**User Story:** As a choreographer, I want the Projects screen to start with what I'm working on
now, so that saving, importing, and exporting are obviously about the current project.

#### Acceptance Criteria

1. THE Project_Manager SHALL show, in order, a Current Project section, a "Projects for
   <Display_Title>" section listing other Saved_Projects for the current Music_Item, and an "All
   Projects" section listing remaining Saved_Projects grouped by Display_Title in ascending order.
2. THE Project_Manager SHALL order Saved_Project rows within each section or group by `modifiedAt`,
   newest first.
3. WHILE a Project_Manager section has no rows, THE Project_Manager SHALL show an empty-state line
   for that section instead of hiding it.
4. THE Current Project section SHALL show the project name (or "Unsaved draft"), the associated
   Display_Title, and a draft state of "Saved", "Edited — not saved", or "Draft based on “<name>”",
   using text and an icon rather than colour alone.
5. THE Current Project section SHALL provide Save, Save as New Project, Import CSV, and Export CSV
   actions, each with a 44 × 44 point target.
6. THE Project_Manager SHALL show on every Saved_Project row the name, marker count, and modified
   time (plus the Display_Title in All Projects) and a visible 44 × 44 point overflow button with
   Open, Rename, Export CSV, and Delete.
7. WHEN the user chooses Open on a row whose Saved_Project references a different Music_Item, THE
   application SHALL run a Track_Switch_Transaction including the Switch_Guard.
8. IF the Switch_Guard of criterion 7 is cancelled, THEN THE application SHALL leave the song,
   Song_Draft, and Playback_Queue unchanged.
9. WHILE no Music_Item is loaded, THE Current Project section SHALL show "No song chosen" with a
   Choose Music action and disable Save, Save as New Project, Import CSV, and Export CSV.
10. WHILE a Saved_Project's Music_Item is in Missing_Audio_State, THE Project_Manager SHALL label
    the row "Audio missing" and SHALL keep Rename, Export CSV, and Delete available.
11. THE Project_Manager SHALL keep its existing full-screen phone presentation, safe-area handling,
    and portrait and landscape layouts.

### Requirement 22: Confirmed, reversible CSV replace-import

**User Story:** As a user importing a CSV, I want to see what will change and be able to undo it, so
that an import never silently wipes or duplicates my markers.

#### Acceptance Criteria

1. WHEN the user chooses Import CSV, THE application SHALL pick and parse the file into a
   CSV_Import_Preview without modifying Studio_Store state.
2. WHEN the user dismisses the CSV picker, THE application SHALL leave all state unchanged and show
   no message.
3. IF parsing fails, THEN THE application SHALL show the parser's error message and leave all state
   unchanged.
4. WHEN parsing succeeds, THE application SHALL show a confirmation titled "Replace markers in
   “<current project or Unsaved draft>”?" stating the existing marker and annotation counts, the
   imported marker and annotation counts, and the skipped row count, with Replace and Cancel
   actions.
5. IF the CSV_Import_Preview contains 0 importable markers, THEN THE confirmation SHALL disable
   Replace and state that no markers were found.
6. WHEN the user chooses Cancel in the confirmation, THE application SHALL discard the
   CSV_Import_Preview and change no Studio_Store, Song_Draft, or Saved_Project state.
7. WHEN the user chooses Replace, THE application SHALL replace markers and annotations on every
   layer with the imported data (layers absent from the CSV become empty), leave all other
   Persisted_Content unchanged, and mark the Song_Draft Dirty or Unsaved.
8. WHEN a replace-import is applied, THE application SHALL keep a pre-import snapshot of all layers'
   markers and annotations and SHALL show a Dock_Toast with an Undo action for CSV_UNDO_TOAST_MS,
   after which the snapshot remains available per criterion 10.
9. WHEN the user activates Undo for a replace-import, THE application SHALL restore the pre-import
   markers and annotations on all six layers exactly and restore the prior Dirty, Saved, or Unsaved
   state.
10. THE application SHALL keep the pre-import snapshot available from the Project_Manager as "Undo
    CSV Import" until the next CSV import, song switch, or save.
11. WHEN a replace-import is applied, THE application SHALL update only the Song_Draft and SHALL not
    write to any Saved_Project until the user saves.
12. WHEN imported markers lie beyond `songDuration`, THE application SHALL include their count in the
    confirmation as "<n> markers are past the end of this song" and SHALL import them unchanged.

### Requirement 23: CSV export scope

**User Story:** As a choreographer, I want to export the routine I'm looking at or any saved
version, so that I can share the right one.

#### Acceptance Criteria

1. WHEN the user exports CSV from the Current Project section, THE application SHALL export the
   in-memory working state, including unsaved changes.
2. WHEN the user exports CSV from a Saved_Project row's overflow menu, including a row labelled
   "Audio missing", THE application SHALL export that Saved_Project's stored content without loading
   it or changing the current song, draft, or queue.
3. THE application SHALL name the export file "<project name, or Display_Title for an
   Unnamed_Draft>.csv", replacing characters invalid in file names with underscores and truncating
   the base name to PROJECT_NAME_MAX_LENGTH characters before the extension.
4. IF the export write fails or the share sheet is dismissed, THEN THE application SHALL change no
   state, and SHALL show an export-failed error when the write failed.

### Requirement 24: Deletion and dependencies

**User Story:** As a user, I want deleting things to be explicit about what else is affected, so
that I never lose projects by deleting a song.

#### Acceptance Criteria

1. WHEN a Saved_Project is deleted, THE application SHALL delete only that Saved_Project and SHALL
   leave its Music_Item, Managed_Audio_File, and Song_Draft unchanged.
2. WHEN a Saved_Project that is the current Draft_Baseline is deleted, THE application SHALL convert
   the Song_Draft to an Unnamed_Draft with its current content.
3. WHEN the user chooses Delete from BeatNote for a Music_Item, THE application SHALL show a
   destructive confirmation stating the number of Saved_Projects and whether a Song_Draft
   references it, and that the original file in Files is not affected.
4. WHEN the user confirms Delete from BeatNote, THE application SHALL delete the Managed_Audio_File,
   remove the Music_Item from every Collection and the Playback_Queue, and keep its Saved_Projects
   and Song_Draft with the Music_Item record retained in Missing_Audio_State as a hidden
   "removed" entry that Relink or a matching re-import restores.
5. WHILE a removed Music_Item retains Saved_Projects or a Song_Draft, THE Project_Manager SHALL list
   those projects under "Audio removed" with Relink and Delete actions.
6. WHEN the last Saved_Project and the Song_Draft of a removed Music_Item are deleted, THE
   application SHALL delete the removed Music_Item record.
7. THE application SHALL never cascade-delete a Saved_Project or Song_Draft as a side effect of
   deleting a Music_Item.
8. WHEN the user chooses Delete for a Saved_Project, THE application SHALL show a destructive
   confirmation naming the project with Delete and Cancel actions.
9. THE application SHALL provide no recovery for a confirmed Saved_Project deletion in V1 (no
   Recently Deleted list).
10. WHEN the user cancels the Music_Item or Saved_Project deletion confirmation, THE application
    SHALL change no data.
11. WHEN the loaded Music_Item is deleted without a switch to another queue entry, THE application
    SHALL stop playback and show the editor in Missing_Audio_State with the Song_Draft content
    visible and editable.
12. IF deleting the Managed_Audio_File fails, THEN THE application SHALL keep the Music_Item
    available, show an error stating that the audio could not be removed, and leave its Collection
    memberships and the Playback_Queue unchanged.

### Requirement 25: Provider-neutral source boundary (V1 scope)

**User Story:** As a developer, I want playback sources described by capabilities, so that adding a
streaming provider later doesn't require rewriting the editor.

#### Acceptance Criteria

1. THE application SHALL obtain playable audio for a Music_Item through a source-resolution
   interface keyed by the Source_Identity provider identifier, with `local` as the only V1
   provider.
2. THE `local` provider SHALL declare exact seeking, waveform/sample access, pitch-preserving
   speed, offline playback, queue control, background playback, repeat, and shuffle as supported,
   consistent with the shipped `expo-audio` playback-speed contract in ADR-011.
3. WHILE the loaded Music_Item's provider declares a capability unsupported, THE controls that
   depend on it SHALL be disabled, SHALL expose the accessibility state disabled, and SHALL name the
   missing capability in both an accessible hint and a visible description, excluding controls that
   the `playback-marker-control-dock` spec already gives a "coming soon" treatment.
4. WHEN the user activates a control disabled by criterion 3, THE application SHALL change no state.
5. IF source resolution for a Music_Item fails, THEN THE application SHALL set the Music_Item to
   Missing_Audio_State and offer Relink.
6. THE application SHALL store no provider credentials, tokens, or account identifiers in
   Saved_Projects, Song_Drafts, Music_Items, or CSV exports.

### Requirement 26: Persistence layout and integrity

**User Story:** As a user, I want a storage hiccup to never erase my projects, so that I can trust
BeatNote with months of work.

#### Acceptance Criteria

1. THE application SHALL store music library metadata, Song_Drafts, Saved_Projects, the
   Playback_Queue, library preferences, and the Migration_Journal in AsyncStorage under separate
   keys, so that a Song_Draft write rewrites no Saved_Project and no other Song_Draft.
2. IF a stored value cannot be read or parsed, THEN THE application SHALL make no write to that key,
   copy the raw value to a `<key>_corrupt_<timestamp>` key when readable, and show an error naming
   the affected data with a Retry action.
3. IF reading the Saved_Project set fails, THEN THE application SHALL block every Saved_Project write
   until a read succeeds, correcting the current behaviour in which
   `ProjectManager.getStoredProjects` returns an empty set and a following save overwrites all
   projects.
4. THE application SHALL keep Saved_Project storage keyed by Project_ID.
5. IF a write fails because storage is full, THEN THE application SHALL keep the previous stored
   value byte-identical, keep the in-memory state, and show "BeatNote is out of storage space"
   naming the affected item.
6. IF a write fails for any other reason, THEN THE application SHALL keep the previous stored value
   and the in-memory state, show an error naming the affected data with a Retry action, and retry
   automatically at most PERSISTENCE_AUTO_RETRY_LIMIT times before requiring a manual Retry.

### Requirement 27: Web compatibility

**User Story:** As a web user, I want the library, drafts, and queue to work in the browser, so that
web remains the primary test target.

#### Acceptance Criteria

1. WHERE the platform is web, THE application SHALL provide the Music_Library_Sheet, Import Audio
   via the browser file picker, drafts, Saved_Projects, the Playback_Queue, and queue controls.
2. WHERE the platform is web, THE application SHALL store imported audio bytes in the web audio
   store chosen in Open Question OQ-1 and SHALL keep metadata in AsyncStorage.
3. WHERE the platform is web, THE application SHALL hide Open_In and SHALL use platform-specific
   modules (`.web.ts`) for file storage, hashing, and free-space checks.
4. IF the web audio store rejects a write for quota, THEN THE application SHALL create no
   Music_Item, leave no partial bytes in the store, and report the failure per Requirement 3
   criterion 7.
5. WHERE the platform is web and two tabs are open, THE application SHALL detect a Saved_Project
   revision conflict at save time per Requirement 16 criterion 8.
6. WHERE the platform is web, WHEN the application starts and a Music_Item's bytes are absent from
   the web audio store (including after browser eviction or for projects that referenced
   prior-session object URLs), THE application SHALL show the Music_Item in Missing_Audio_State and
   keep its annotations.

### Requirement 28: Migration of existing projects

**User Story:** As an existing user, I want my current projects to move into the new library without
losing anything, so that upgrading is safe.

#### Acceptance Criteria

1. WHEN the application starts with Saved_Projects that have no `musicItemId`, THE application
   SHALL run a versioned migration that records per-project status in the Migration_Journal.
2. WHEN a legacy project's `audio.uri` resolves to a readable durable or live cache file, THE
   migration SHALL copy it into a Managed_Audio_File through the Import_Pipeline (including duplicate
   detection), set the project's `musicItemId`, Project_ID, and revision, and keep no source URI as
   a playback source.
3. WHEN a legacy project's `audio.uri` does not resolve, including purged cache files and web object
   URLs from a previous session, THE migration SHALL create a Music_Item in Missing_Audio_State
   titled from `audio.filename`, set the project's `musicItemId`, and keep every annotation and
   setting.
4. WHEN two legacy projects reference the same resolvable file or the same Content_Hash, THE
   migration SHALL associate both with one Music_Item.
5. WHEN two unresolvable legacy projects have an exactly equal, case-sensitive `audio.filename` and
   `metadata.duration` values within LEGACY_DURATION_TOLERANCE_MS (and equal Content_Hash where
   files are available), THE migration SHALL associate both with one Music_Item in
   Missing_Audio_State; IF either duration is absent, THEN THE migration SHALL create separate
   Music_Items.
6. WHEN the user Relinks a migrated Music_Item, THE application SHALL compare the chosen file's
   Original_Filename and measured duration with the legacy values and SHALL show "This looks like
   the original file" when both match within LEGACY_DURATION_TOLERANCE_MS, otherwise the mismatch
   confirmation from Requirement 5 criterion 8.
7. IF migration is interrupted, THEN THE next launch SHALL resume from the Migration_Journal,
   SHALL skip projects already migrated, and SHALL delete Managed_Audio_Files copied by the
   interrupted step that no Music_Item references.
8. FOR ALL legacy projects, running the migration twice SHALL produce the same Music_Items, the same
   associations, and no duplicate Managed_Audio_Files (idempotence).
9. THE migration SHALL preserve every unknown top-level and `settings` field of each project it
   writes.
10. WHEN the migration encounters a project whose version is newer than the running version, THE
    migration SHALL write nothing to that project, list it read-only in the Project_Manager, and
    record it as skipped in the Migration_Journal.
11. THE migration SHALL keep the legacy `audio.filename` and last-known `audio.uri` fields in each
    migrated project as informational data, so that an older BeatNote build reading the project can
    still list it.
12. WHEN migration finds unresolvable projects, THE application SHALL show "<n> projects need their
    audio reconnected" once per migration version, with an action that opens the Project_Manager's
    affected rows.
13. THE migration SHALL never delete, truncate, or overwrite a legacy project's markers,
    annotations, or settings.
14. WHILE migration is running, THE application SHALL disable Save, imports, and track switching and
    show "Updating your library…".
15. IF importing a resolvable legacy file fails, including from a storage-quota error, THEN THE
    migration SHALL leave the project unchanged, record the failure in the Migration_Journal, retry
    on each launch for at most MIGRATION_IMPORT_ATTEMPT_LIMIT attempts, and then create its
    Music_Item in Missing_Audio_State per criterion 3.

### Requirement 29: Accessibility and responsive behaviour

**User Story:** As a user relying on VoiceOver or large text, I want every new surface fully
operable, so that the library and queue are usable without sight or fine motor precision.

#### Acceptance Criteria

1. THE Song_Title_Control, Music_Library_Sheet rows and actions, Switch_Guard dialog, save prompts,
   CSV confirmation, Project_Manager actions, and queue controls SHALL each expose a non-empty
   accessibility label, a role, and disabled or selected state where applicable.
2. THE application SHALL give every new interactive element a touch target of at least 44 × 44
   points.
3. THE application SHALL convey current, missing, dirty, removed, and shuffle states with text or
   icons in addition to colour.
4. WHERE the platform is web, THE application SHALL make every new control reachable and operable by
   keyboard with a visible focus indicator.
5. THE new surfaces SHALL fit portrait widths of 320–480 points and landscape widths of 480–932
   points at text sizes up to MAX_TEXT_SCALE without horizontal scrolling, clipped actions, or
   controls under any safe-area edge.
6. WHEN the orientation changes, THE application SHALL preserve the loaded Music_Item, draft state,
   queue, open sheet or dialog, and any pending switch destination.
7. THE application SHALL use only colour tokens from `src/styles/common.ts` and icons from the
   shared `BeatNoteIcon` family for the new surfaces.
8. WHEN the Music_Library_Sheet, the Switch_Guard dialog, or a save prompt opens, THE application
   SHALL move VoiceOver focus (keyboard focus on web) to its title, and WHEN it closes, THE
   application SHALL return focus to the control that opened it.

### Requirement 30: Verification within the critical-test policy

**User Story:** As a maintainer, I want this feature protected by the existing critical journeys, so
that the suite stays small but release-blocking flows are covered.

#### Acceptance Criteria

1. THE implementation SHALL pass `npx tsc --noEmit`.
2. THE Playwright journey for project/import/export surfaces SHALL be extended to cover: import
   audio into the library, Save, Save as New Project, reopening the song resolving to the most recent
   project, the Switch_Guard dialog with Keep Draft & Switch, CSV replace-import with Undo, and a
   reload that restores a legacy project whose audio cannot be resolved into Missing_Audio_State
   followed by Relink.
3. THE Playwright journey for the responsive control dock SHALL be extended to cover Next, Previous,
   First, and Shuffle across two library items, including portrait and landscape.
4. THE iOS XCTest Files-picker and project save/relaunch cases SHALL be extended to verify the
   durable copy survives relaunch and that a dirty draft is restored after termination.
5. THE iOS XCTest CSV case SHALL be updated from append to confirmed replace.
6. THE implementation SHALL prefer extending the retained Playwright journeys and retained native
   XCTest cases, and SHALL add no new Playwright spec file.
7. WHERE Open_In delivery cannot be exercised within an existing retained native XCTest case, THE
   implementation MAY add one new native XCTest case for Open_In delivery, and THE design SHALL
   justify that case.
8. THE committed tests SHALL contain no `test.only` or `test.skip`.
9. THE implementation SHALL retain no unit tests after verification unless the design records a
   testing-strategy exception for migration or fingerprint invariants.
10. THE physical-device acceptance list SHALL include Open_In from Files and from a third-party app,
    background flush during termination, VoiceOver on the sheet and Switch_Guard, and large-text
    layout.

## Future and Provider Extensions

These are designed for but not implemented in V1. The V1 model must not block them.

- **F-1 User-created Collections:** create, rename, delete, and reorder Collections; move or copy
  Music_Items between them; build queues from any Collection.
- **F-2 Streaming providers:** Apple Music (MusicKit) and Spotify providers behind the Requirement 25
  interface, each declaring Playback_Capabilities (for example, no waveform access, no exact
  seeking, no pitch-preserving speed), with credentials held in the platform keychain only.
- **F-3 Share_Extension:** only if Open_In proves insufficient (for example, sources that only offer
  extension-based sharing).
- **F-4 Queue auto-advance and queue repeat:** advancing at end of track and repeating the whole
  queue, which need a non-blocking Switch_Guard policy during playback.
- **F-5 Recently Deleted:** a timed recovery bin for Saved_Projects and Music_Items.
- **F-6 Android Open_In:** `VIEW`/`SEND` intent filters for audio through a config plugin.
- **F-7 iCloud sync** of metadata and, optionally, Managed_Audio_Files.
- **F-8 Lite/Pro gating:** the saved-project limit hypothesis (three projects) applied through the
  capability/entitlement interface; V1 hard-codes no limit.
- **F-9 Native waveform extraction** for Managed_Audio_Files (`modules/waveform-extractor/`).

## Non-goals

- Implementing Apple Music, Spotify, or any streaming provider.
- A Share_Extension target.
- Stem-separation UI or any change to the deferred stem feature.
- A navigation library (ADR-007); sheets and pages remain modal surfaces.
- An additional global store (ADR-001).
- Storing audio bytes in AsyncStorage.
- Editing, trimming, or transcoding audio.
- Queue auto-advance at end of track in V1.
- Multiple drafts per Music_Item.
- Enforcing a saved-project limit or any paywall.
- Editing the generated `ios/` directory.
- Discard actions in the Switch_Guard dialog.

## New ADRs Needed

The design phase should propose these ADRs; steering files are not edited in this phase.

- **ADR-012 Music_Item identity and app-owned audio storage:** UUID identity, relative paths,
  Music_Directory location, backup policy, and deletion semantics.
- **ADR-013 Draft/baseline persistence model:** one draft per Music_Item, Content_Fingerprint dirty
  tracking, separate AsyncStorage keys, and the serialised Persistence_Pipeline.
- **ADR-014 Web audio storage:** the browser store for audio bytes and its quota behaviour.
- **ADR-015 Provider-neutral playback source and capabilities:** Source_Identity and
  Playback_Capabilities as the boundary for future providers.
- **ADR-016 Bottom-sheet implementation:** how the detented Music_Library_Sheet is built without a
  navigation library.

## Open Questions

Only decisions that materially change architecture are listed. Each has a recommended default that
the design phase should adopt unless the user decides otherwise.

1. **OQ-1 Web audio storage.** Options: IndexedDB blobs; Origin Private File System; or session-only
   web audio with relink after reload. **Recommended default:** IndexedDB behind a `.web.ts`
   storage adapter, because it is broadly supported and survives reload, with quota errors surfaced
   per Requirement 27.
2. **OQ-2 Backup of Managed_Audio_Files.** Options: include in device backup, or exclude (iOS
   `isExcludedFromBackup`). **Recommended default:** exclude by default to keep device backups small,
   relying on Content_Hash relink after restore; metadata, drafts, and projects stay backed up. This
   may need a small Expo Module or config-plugin-free native call if `expo-file-system` cannot set
   the attribute; the design should verify.
3. **OQ-3 Bottom-sheet technology.** Options: a custom sheet on the installed
   `react-native-gesture-handler` and `react-native-reanimated`; a third-party sheet library; or an
   Expo Module over `UISheetPresentationController`. **Recommended default:** custom sheet on the
   installed libraries, for web parity and no new dependency, accepting that native iOS sheet
   physics are approximated.
4. **OQ-4 Open_In delivery and in-place access.** At the start of the spec,
   `LSSupportsOpeningDocumentsInPlace` was `true`, so iOS could deliver security-scoped URLs to
   originals in Files rather than inbox copies. The spike considered keeping in-place access versus
   setting the key to `false` so iOS copies into `Documents/Inbox`. **Final decision:** `false`;
   simulator delivery used Inbox copies, and physical Files/third-party Open_In plus the preserved
   `.beatnote` declaration passed acceptance. The Import_Pipeline copies audio into app-owned
   storage and deletes the consumed Inbox copy (Requirement 3 criterion 11).
5. **OQ-5 Content_Hash method.** Hashing large files in JavaScript is slow. Options: the MD5
   digest available from `expo-file-system` file info; adding `expo-crypto` for SHA-256 over a
   streamed read; or a native module. **Recommended default:** platform-provided MD5 on native and
   Web Crypto SHA-256 on web, labelled per algorithm, since the hash detects duplicates and is not a
   security control.
6. **OQ-6 Project storage key layout.** Options: keep the single `beatnote_projects` value (rewritten
   on every save) or one key per Project_ID with an index key. **Recommended default:** one key per
   Project_ID plus an index, migrated from the single value, to satisfy Requirement 26 and reduce
   write size; this changes `ProjectManager` substantially.
7. **OQ-7 Maximum audio file size.** **Recommended default:** 500 MB, which comfortably covers
   lossless full-length tracks while bounding copy time and storage failures.
8. **OQ-8 Project version.** Options: additive `1.2.0` keeping legacy `audio` fields, or `2.0.0`.
   **Recommended default:** `1.2.0`, because older builds already preserve newer versions and can
   still list projects via the retained `audio` fields.
