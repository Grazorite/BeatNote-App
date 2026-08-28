# BeatNote

> Professional multi-track audio annotation tool for choreographers, dancers, and music producers.

BeatNote lets you load a song, split it into stems, annotate beats and movements across multiple layers, and export your work — all in a clean, dark, mobile-first interface.

---

## Who it's for

Primarily choreographers and dancers who need to map music structure to movement. Also useful for music producers, session musicians, and audio engineers.

---

## Core workflow

1. Load a song (MP3, WAV, M4A, AAC, OGG, FLAC)
2. Split into stems (Vocals, Drums, Bass, Piano, Guitar, Other) — *planned, see Roadmap*
3. Select a layer and tap to place beat markers during playback
4. Add text annotations to markers (move names, cues, counts)
5. Export as CSV or MIDI (PDF choreography sheet planned)

---

## Features

### Available now

- 6-layer model with 2 / 4 / 6 stem-count modes
- Unified and multitrack waveform views
- Magnetic snapping to beat grid and existing markers
- BPM control with rhythmic grid overlay
- Ghost playhead for non-destructive position preview
- Loop marker and repeat playback modes
- Tap-to-beat marker placement with undo/redo and marker navigation
- Per-marker text annotations
- Project save/load via AsyncStorage
- CSV + MIDI export, CSV import
- Keyboard shortcuts (web)
- Responsive: desktop, tablet, mobile

### Planned

See the Roadmap section below for status. Not yet implemented: Demucs stem separation
(on-device + cloud), 8-count grid mode, slow-down / pitch-preserve playback, PDF choreography
export, customisable layer names, iCloud sync, and share-sheet import/export.

> **Live project state** — features in flight, the task board, and the handover log live in
> [`AGENTS.md`](./AGENTS.md), the single source of truth for current work.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Expo SDK 54 + React Native 0.81.5 |
| Language | TypeScript (strict) |
| State | Zustand |
| Audio | expo-audio + AVAudioEngine (iOS native) |
| Stem separation | Demucs (CoreML on-device) + cloud fallback |
| Graphics | react-native-svg + react-native-reanimated |
| Gestures | react-native-gesture-handler v2 |
| Storage | AsyncStorage + iCloud (iOS) |
| Testing | Playwright (E2E, web) + Jest (unit, critical logic) |
| CI/CD | EAS Build + TestFlight |

---

## Quick start

```bash
npm install
npx expo start          # web dev server
npx expo start --ios    # iOS simulator
```

---

## Project structure

```css
src/
├── components/
│   ├── icons/          # Custom SVG icons
│   ├── layout/         # Sidebar, MainContent, StemsView
│   └── ui/
│       ├── common/     # Reusable primitives
│       ├── controls/   # Audio, marker, layer controls
│       ├── modals/     # Save, export, import, project manager
│       ├── screens/    # HelpScreen
│       └── waveform/   # WaveformCanvas, StemWaveform, RhythmicGrid
├── features/
│   ├── studio/         # Main StudioScreen
│   └── stemSeparation/ # Demucs integration (on-device + cloud)
├── hooks/
│   ├── useStudioStore.ts       # Global Zustand store
│   ├── useAudioPlayer.ts       # Playback, scrub, tap-to-beat
│   ├── useWaveformData.ts      # Waveform peak extraction
│   ├── useKeyboardShortcuts.ts # Web keyboard bindings
│   └── ...
├── styles/             # Organised per-component styles
├── types/              # TypeScript definitions
└── utils/
    ├── exportEngine.ts     # CSV, MIDI, PDF export
    ├── importEngine.ts     # CSV import
    ├── projectManager.ts   # AsyncStorage project CRUD
    └── magneticSnapping.ts # Snap-to-grid logic
tests/                  # Playwright E2E + Jest unit tests
.kiro/steering/         # Project steering docs (always loaded)
```

---

## Testing

```bash
npm test                    # Playwright E2E (web)
npm run test:ui             # Playwright interactive UI
npx jest --testPathPattern=unit  # Jest unit tests
```

---

## iOS / TestFlight

Requires Apple Developer account ($99/year). Once configured:

```bash
eas build --platform ios --profile preview   # TestFlight build
eas submit --platform ios                    # Submit to TestFlight
```

See `.kiro/steering/ios-testflight.md` for full setup guide.

---

## Roadmap

- [x] Multi-track annotation (web)
- [x] Project save/load
- [x] CSV + MIDI export
- [ ] iOS port + TestFlight
- [ ] Demucs stem separation (on-device CoreML + cloud fallback)
- [ ] PDF choreography export
- [ ] 8-count grid mode
- [ ] Slow-down / pitch-preserve playback (iOS)
- [ ] iCloud sync
- [ ] Share sheet import/export
- [ ] Customisable layer names
- [ ] Storage management screen

---

## License

MIT
