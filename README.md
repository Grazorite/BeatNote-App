# BeatNote

> Local-first music annotation and rehearsal for choreographers and dancers.

BeatNote imports a song into an app-owned local library, presents a wrapped full-song timeline, and
lets a choreographer place markers, write movement cues, align dance counts, loop sections, rehearse
at pitch-preserved speeds, and export the work as CSV or a choreography PDF.

The project is in V1 stabilisation. The core workflow is implemented on web and iOS; performance,
representative-song tempo analysis, physical-device audio behavior, external sharing, and TestFlight
remain release gates. See [AGENTS.md](./AGENTS.md) for live status.

## Core workflow

1. Import local MP3, WAV, M4A, AAC, OGG, or FLAC audio through the Music Library, Files, or iOS Open In.
2. Play or scrub the wrapped timeline and add markers from the marker controls.
3. Attach choreography annotations and align BPM, beat anchor, phrase start, and 4/6/8-count guidance.
4. Rehearse with section loops, Repeat/Shuffle, queue navigation, and 0.5×–2× pitch-preserved playback.
5. Keep per-song drafts or named project revisions, then export CSV or a printable PDF choreography sheet.

## V1 feature set

- App-owned local music library with durable import, relink, rename, removal, search, sort, and queue controls
- Per-song autosaved drafts plus named, revisioned projects
- Fixed-height wrapped timeline with continuous cross-row scrubbing and a full-song loop overview
- Optional decoded waveform artwork in the canvas and overview strip (Pro preview, off by default); solid timing bars preserve the complete Lite workflow
- Unlimited markers and free-text annotations on the V1 phone annotation lane
- Marker navigation, undo/redo, vocabulary suggestions, and timed annotation callouts
- BPM, beat-anchor, phrase-start, 4/6/8-count guidance, snapping, and non-destructive automatic BPM suggestions
- Loop range, between-marker loop, Repeat/Shuffle, and Control Centre / Now Playing integration
- Pitch-preserved playback from 0.5× to 2×
- CSV import/replacement and CSV/PDF export through download or the iOS share sheet
- Background playback and responsive portrait/landscape controls

The six-layer project schema and MIDI engine remain for compatibility and future Pro expansion, but
the V1 phone editor exposes one annotation lane and CSV/PDF export only.

## Release direction

- **V1:** finish performance work, automatic-BPM runtime evidence, physical-device acceptance, and TestFlight setup.
- **V2 Pro:** purchases/restore, multiple layers, professional workflow depth, advanced tempo tools,
  toggleable waveform artwork, and an Apple Music feasibility spike/integration if MusicKit satisfies BeatNote's seeking and lifecycle requirements.
- **Spotify:** not currently scheduled. Spotify's published developer policy prohibits commercial
  streaming integrations, so it cannot honestly be sold as a BeatNote paid feature without an
  approved partnership or a policy change.
- **V3:** managed cloud stem-separation beta, followed by on-device/hybrid work only if demand and benchmarks justify it.

Basic local automatic BPM assistance remains part of the proposed Lite workflow. V2 may monetise
advanced tempo intelligence such as tempo maps, deeper downbeat/phrase assistance, and batch or
configurable re-analysis—not the first useful BPM suggestion.

See [the release and monetisation roadmap](./.kiro/steering/release-roadmap.md) for the capability matrix and provider constraints.

## Tech stack

| Area | Technology |
| --- | --- |
| App | Expo SDK 54, React Native 0.81.5, React 19, TypeScript |
| State | Zustand |
| Playback | `expo-audio` with native lock-screen/background integration |
| Waveform | `BeatNoteWaveform` Expo Module on iOS; Web Audio provider on web |
| Tempo | Local `BeatNoteTempo` Expo Module on iOS; worker-based detector on web |
| Storage | AsyncStorage metadata, app-owned native files, IndexedDB web audio |
| Graphics and gestures | React Native SVG, Reanimated, Gesture Handler |
| Export | CSV, `expo-print`/share sheet on iOS, browser print/download on web |
| Testing | TypeScript, focused Playwright journeys, focused iOS XCTest |

## Project structure

```text
src/
├── components/              # Layout, controls, library, project, and waveform UI
├── features/
│   ├── analysis/            # Automatic-BPM lifecycle and cache
│   ├── entitlements/        # Provider-neutral Lite/Pro capability policy
│   ├── library/             # Music items, app-owned audio, drafts, projects, queue
│   ├── performance/         # Gated diagnostics for the active optimisation work
│   ├── stemSeparation/      # Preserved V3 foundation; no V1/V2 UI
│   └── studio/              # Main studio composition
├── hooks/                   # Audio, store, responsive interaction, waveform hooks
├── services/                # Platform waveform and BPM-analysis providers
├── styles/                  # Component-mirrored styles
├── types/                   # Persistent and runtime contracts
└── utils/                   # Export, timing, snapping, playback, validation

modules/
├── beatnote-tempo/          # Local iOS tempo analysis
├── beatnote-waveform/       # Streaming iOS waveform extraction
└── library-storage/         # Native managed-file and instrumentation boundary

.kiro/specs/                 # Active feature/performance specifications
.kiro/steering/              # Durable product and architecture decisions
docs/context/archive/        # Completed specs and historical handovers
```

## Development

```bash
npm install
npm run web              # Expo web development server
npx tsc --noEmit         # TypeScript gate
npm test                 # Retained Playwright journeys
npm run test:unit        # Temporary Jest checks, if a task currently has any
```

Focused native integration checks use:

```bash
IOS_TEST_ONLY=<testCase> npm run test:ios:ui
```

To run the iOS app, start Metro with `npm start -- --dev-client`, open `ios/BeatNote.xcworkspace`
(run `npx expo prebuild -p ios` first if it is missing), choose the `BeatNote` scheme and a
simulator or device, then press Run. `npm run ios` currently cannot resolve the Simulator app on
Xcode 27 hosts. The iOS build requires Xcode and the generated native project. TestFlight additionally requires an
Apple Developer account and real EAS credentials; see
[`.kiro/steering/ios-testflight.md`](./.kiro/steering/ios-testflight.md).

## Documentation

- [Live project status and handover](./AGENTS.md)
- [Product overview](./.kiro/steering/project-overview.md)
- [Release and monetisation roadmap](./.kiro/steering/release-roadmap.md)
- [Architecture decisions](./.kiro/steering/architecture-decisions.md)
- [Testing strategy](./.kiro/steering/testing-strategy.md)

## License

MIT
