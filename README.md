# BeatNote App

A professional React Native audio annotation app for multi-track music analysis and beat marking.

## Features

### Phase 1: Core Foundation

- Expo + TypeScript React Native setup
- Animated SVG waveform visualization using react-native-svg
- Real-time waveform animation with react-native-reanimated

### Phase 2: Audio Integration & Modularization

- Audio playback with expo-av
- File loading with expo-document-picker
- "Tap to beat" functionality with timestamp markers
- Zustand state management
- Modular component architecture (AudioControls, WaveformCanvas, TapButton)
- Custom hooks (useAudioPlayer, useWaveformAnimation, useStudioStore)

### Phase 3: Professional Multi-Track System

- **Music Stem Annotation**: Vocals, Drums, Bass, Piano, Other (replaces generic beats/notes)
- **Visual Markers**: Distinct markers per stem type (lines, circles, thickness variations)
- **Timeline Navigation**: Scrollable timeline with viewport scrubber
- **Adobe Audition-Style Workflow**: Auto-follow playhead, click-to-position, drag-to-scrub
- **Forward-Compatible Data**: Layer persistence across stem count changes (2→4→5 stems)
- **Modern Gesture System**: Migrated to react-native-gesture-handler v2 Gesture API

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Language**: TypeScript
- **State Management**: Zustand
- **Audio**: expo-av
- **Graphics**: react-native-svg, react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **File Handling**: expo-document-picker
- **Testing**: Playwright

## Installation

```bash
# Clone the repository
git clone https://github.com/Grazorite/BeatNote-App.git
cd BeatNote-App

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Usage

1. **Load Audio**: Tap "Load Song" to select an audio file
2. **Select Stems**: Choose 2, 4, or 5 stem separation mode
3. **Choose Layer**: Select which stem to annotate (vocals, drums, bass, piano, other)
4. **Navigate**: Use timeline scrubber or click/drag on waveform to navigate
5. **Add Markers**: Tap "TAP" button or click on waveform to place markers
6. **Toggle Visibility**: Show/hide markers for each stem layer

## Project Structure

```text
src/
├── components/ui/          # Reusable UI components
│   ├── AudioControls.tsx   # Play/pause and load controls
│   ├── LayerControls.tsx   # Layer selection and visibility
│   ├── StemSelector.tsx    # Stem count selection (2/4/5)
│   ├── TapButton.tsx       # Marker placement button
│   ├── TimelineScrollbar.tsx # Timeline navigation
│   └── WaveformCanvas.tsx  # Main waveform display
├── features/studio/        # Feature-specific components
│   └── StudioScreen.tsx    # Main studio interface
└── hooks/                  # Custom React hooks
    ├── useAudioPlayer.ts   # Audio playback logic
    ├── useStudioStore.ts   # Global state management
    └── useWaveformAnimation.ts # Waveform rendering
```

## Key Features

### Multi-Track Annotation

- **Vocals**: Full-height red lines
- **Drums**: Thick cyan lines (top section)
- **Bass**: Purple lines (bottom section)  
- **Piano**: Yellow circles (center)
- **Other**: Orange circles (bottom)

### Timeline Navigation

- Viewport shows 20-second window of full song
- Auto-scroll follows playhead during playback
- Drag viewport rectangle to navigate
- Click timeline to jump to position

### Professional Workflow

- Pause/resume during scrubbing
- Precise marker placement
- Layer-based organization

## Development

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Platform-specific builds
npm run android
npm run ios
npm run web
```

## License

MIT License - see LICENSE file for details
