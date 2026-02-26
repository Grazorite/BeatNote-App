---
inclusion: always
---

# BeatNote — Project Overview

## What this app is

BeatNote is a cross-platform audio annotation tool built with Expo / React Native. It is primarily aimed at **choreographers and dancers** who need to map music structure (beats, phrases, stems) to movement. It is also useful for music producers and audio engineers.

The app is currently a personal tool with a clear path toward commercial release.

## Core user workflow

1. Load an audio file (MP3, WAV, M4A, AAC, OGG, FLAC)
2. Optionally split the song into stems (Vocals, Drums, Bass, Piano, Guitar, Other) via Demucs
3. Select a stem layer and tap to place beat markers during playback
4. Add text annotations to markers (move names, choreography cues, 8-counts)
5. Export as CSV, MIDI, or PDF choreography sheet

## Platforms

- **Web** — primary development and test target (Playwright E2E)
- **iOS** — primary mobile target (TestFlight → App Store)
- **Android** — secondary, supported via Expo

## Key domain concepts

- **Layer** — one of six stems: Vocals, Drums, Bass, Piano, Guitar, Other. Each has its own colour, markers, and annotations.
- **Marker** — a timestamp placed on a layer, representing a beat, cue, or movement moment.
- **Annotation** — a text note attached to a marker.
- **Stem count** — 2, 4, or 6 stems visible at once.
- **Viewport** — the visible time window on the waveform canvas (start time + duration).
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

- `exportEngine.ts` only works on web (`Platform.OS === 'web'`). Native export (share sheet) is planned.
- `useWaveformData.ts` uses Web Audio API on web and a fallback sine wave on mobile. Real mobile waveform extraction is planned.
- Stem separation is not yet implemented. The architecture for it lives in `src/features/stemSeparation/`.
- The EAS project ID in `app.json` is a placeholder. Apple Developer account not yet purchased.
