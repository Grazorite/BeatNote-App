# BeatNote

> Professional multi-track audio annotation and beat marking application

BeatNote is a cross-platform React Native application designed for musicians, producers, and audio engineers to annotate and mark beats across multiple audio stems with precision and ease.

## Features

### Multi-Track Audio Analysis

- **6-Layer Stem Support**: Vocals, Drums, Bass, Piano, Guitar, Other
- **Flexible Stem Modes**: Switch between 2, 4, or 6 stem configurations
- **Visual Markers**: Distinct visual representations for each stem type
- **Layer Management**: Toggle visibility and focus on specific stems

### Precision Annotation

- **Tap-to-Beat**: Real-time marker placement during playback
- **Timeline Navigation**: Precise scrubbing and positioning
- **Magnetic Snapping**: Automatic alignment to beat grid
- **Text Annotations**: Add contextual notes to markers
- **Keyboard Shortcuts**: Professional workflow acceleration

### Professional Interface

- **Unified & Multitrack Views**: Switch between consolidated and separated stem views
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly interface for extended sessions
- **Collapsible Sidebar**: Maximize workspace when needed
- **Help System**: Built-in shortcuts and usage guide

### Project Management

- **Save/Load Projects**: Persistent project storage with metadata
- **CSV Import/Export**: Data interchange with external tools
- **Audio File Support**: Multiple format compatibility
- **Version Control**: Project versioning and modification tracking

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Language**: TypeScript
- **State Management**: Zustand
- **Audio Processing**: expo-audio
- **Graphics**: react-native-svg + react-native-reanimated
- **Gestures**: react-native-gesture-handler v2
- **File System**: expo-document-picker + expo-file-system
- **Testing**: Playwright (60+ E2E tests)
- **Storage**: AsyncStorage for persistence

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/BeatNote-App.git
cd BeatNote-App

# Install dependencies
npm install

# Start development server
npx expo start
```

### Platform-Specific Launch

```bash
# Web development
npm run web

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Usage Guide

### Basic Workflow

1. **Load Audio**: Import your audio file using "Load Song"
2. **Configure Stems**: Select 2, 4, or 6 stem mode based on your needs
3. **Select Layer**: Choose which stem to annotate (vocals, drums, etc.)
4. **Add Markers**: Use TAP button or click waveform to place markers
5. **Navigate**: Use timeline controls or keyboard shortcuts
6. **Annotate**: Add text descriptions to important markers
7. **Save Project**: Export your work for future sessions

### Keyboard Shortcuts

- `Space`: Play/Pause
- `T`: Add marker at current position
- `←/→`: Navigate between markers
- `Shift + ←/→`: Skip to start/end
- `+/-`: Zoom timeline
- `?`: Show help screen

## Project Architecture

```text
src/
├── components/
│   ├── icons/              # Custom SVG icons
│   ├── layout/             # Layout components (Sidebar, MainContent)
│   ├── ui/
│   │   ├── common/         # Reusable UI components
│   │   ├── controls/       # Audio and marker controls
│   │   ├── modals/         # Modal dialogs
│   │   └── waveform/       # Waveform visualization
│   └── ErrorBoundary.tsx   # Error handling
├── features/
│   └── studio/             # Main studio interface
├── hooks/                  # Custom React hooks
│   ├── useAudioPlayer.ts   # Audio playback logic
│   ├── useStudioStore.ts   # Global state management
│   └── useKeyboardShortcuts.ts # Keyboard handling
├── styles/                 # Organized styling system
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
│   ├── projectManager.ts   # Project save/load
│   ├── exportEngine.ts     # Data export
│   └── importEngine.ts     # Data import
└── animations/             # Animation configurations
```

## Testing

```bash
# Run all tests
npm test

# Interactive test UI
npm run test:ui

# Debug mode
npm run test:debug

# Generate test report
npm run test:report
```

**Test Coverage**: 60+ E2E tests covering:

- Core functionality
- UI components
- Waveform features
- Quality assurance
- Performance benchmarks
- Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage for new features
- Use conventional commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons from [Lucide React Native](https://lucide.dev/)
- Testing powered by [Playwright](https://playwright.dev/)

---

Made with ❤️ for the music production community
