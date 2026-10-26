---
inclusion: always
---

# BeatNote — Project Overview

## What this app is

BeatNote is a cross-platform audio annotation tool built with Expo / React Native. It is primarily aimed at **choreographers and dancers** who need to map music structure (beats, phrases, stems) to movement. It is also useful for music producers and audio engineers.

The app is currently a personal tool with a clear path toward commercial release.

## Core user workflow

1. Import an audio file (MP3, WAV, M4A, AAC, OGG, FLAC) from the Music Library, Files picker, or
   iOS Open In; BeatNote keeps its own durable local copy.
2. Select songs with the Song Title control or queue controls. First, Previous, Next, and Shuffle
   navigate music items, not project files.
3. Tap to place beat markers during playback on the V1 annotation lane and add text annotations
   such as move names, choreography cues, and 8-counts.
4. Switch songs without losing work: every song has an autosaved draft, while explicitly saved
   projects provide named baselines and multiple versions per song.
5. Replay, seek, and rehearse the annotated music, then manage saved work and CSV replacement or
   export from Project Manager.

Post-core stem separation may later enhance this workflow, but it is not part of the core promise.

## Platforms

- **Web** — primary development and test target (Playwright E2E)
- **iOS** — primary mobile target (TestFlight → App Store)
- **Android** — secondary, supported via Expo

## Key domain concepts

- **Layer** — the persisted project schema retains six stable internal IDs (Vocals, Drums, Bass,
  Piano, Guitar, and Other) for compatibility and future expansion. The V1 phone editor exposes one
  annotation lane and hides layer-selection UI; its fixed internal `vocals` layer is presented as
  **Annotations** unless the user gives the lane a custom name. Mobile Settings exposes only that
  lane name, while desktop retains the multi-layer naming controls. Existing multi-layer projects
  remain readable, and CSV/PDF exports use the annotation-facing fallback without changing IDs.
- **Marker** — a timestamp placed on a layer, representing a beat, cue, or movement moment.
- **Annotation** — a text note attached to a marker.
- **Music Item** — a stable UUID and metadata record for one imported song. Native imports are
  copied into BeatNote's backup-excluded Music directory; web audio bytes live in IndexedDB.
- **Song draft** — the latest autosaved markers, annotations, and editor settings for one Music
  Item. It survives song switches and app restarts.
- **Saved Project** — a named, revisioned snapshot associated with one Music Item. A song may have
  multiple Saved Projects; the newest is selected by default when no dirty draft takes precedence.
- **Draft baseline** — the Saved Project revision and content fingerprint used to decide whether a
  draft is saved or dirty and whether a song switch needs confirmation.
- **Playback queue** — an ordered snapshot of Music Item IDs. First, Previous, Next, and Shuffle
  operate on this queue independently of Saved Projects.
- **Song Title control** — the leading toolbar control showing the current song. It opens the
  detented Music Library for import, search, sorting, rename, removal, relink, and project routing.
- **Stem count** — 2, 4, or 6 stems visible at once.
- **Viewport** — the visible time window on the waveform canvas (start time + duration).
- **Phone waveform canvas** — a fixed, non-scrolling full-song view. Its row count follows the
  available screen height and each row's timestamp span adapts to the loaded track duration. Gutter
  and waveform gestures seek or select; marker creation is exclusive to the bottom marker controls.
- **Magnetic snapping** — auto-aligning the playhead/marker to the nearest beat grid line or existing marker.
- **8-count** — standard dance phrase unit (8 beats). The grid should support 8-count alignment in addition to individual beats.
- **Ghost playhead** — a secondary playhead showing the last clicked position without committing to it.

## State management

All global state lives in `src/hooks/useStudioStore.ts` (Zustand). Do not introduce additional global state stores. Prefer local component state for UI-only concerns.

## File naming conventions

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` prefixed with `use`
- Utilities: `camelCase.ts`
- Styles: mirror the component path under `src/styles/`
- Tests: mirror the source path, suffix `.test.ts` for unit tests, `.spec.ts` for E2E

## Current limitations to be aware of

- Native export uses the iOS share sheet, but completing a share to a real external destination still
  needs physical-device acceptance.
- Native and web waveform extraction decode real audio through platform providers. Physical-device
  performance and audible playback quality still need acceptance on representative files.
- Open In and backup exclusion are implemented and simulator-tested; third-party delivery, files
  over 100 MB, restore behavior, and near-full-disk handling remain physical-device checks.
- Stem separation is deliberately deferred to V3. The existing foundation is preserved under
  `src/features/stemSeparation/`; release sequencing and resumption gates live in
  `release-roadmap.md`.
- The EAS project ID in `app.json` is a placeholder. Apple Developer account not yet purchased.
