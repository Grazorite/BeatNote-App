---
inclusion: always
---

# BeatNote — Architecture Decisions

## Decisions log

### ADR-001: Single Zustand store

All global state lives in `useStudioStore.ts`. No additional stores.
Rationale: the app has one primary screen (StudioScreen) with tightly coupled state. Multiple stores would add coordination complexity without benefit.

### ADR-002: Playwright for E2E, Jest for unit tests

Playwright runs against the web build — it tests real browser behaviour including gestures, audio APIs, and file downloads. Jest tests pure logic in utils and store actions without a DOM or RN environment.
Rationale: avoids the complexity of React Native Testing Library for logic that doesn't need a component tree.

### ADR-003: Expo Modules API for native iOS features

All native iOS code (CoreML inference, AVAudioUnitTimePitch, waveform extraction) is written as Expo Modules (Swift + TypeScript interface) under `modules/`. No bare `react-native` native modules.
Rationale: Expo Modules integrate cleanly with EAS Build and don't require ejecting from Expo managed workflow.

### ADR-004: Hybrid stem separation (on-device + cloud)

On-device CoreML for offline/fast use, Replicate API for higher quality. User controls preference in settings.
Rationale: on-device alone is too slow for a good UX on older devices; cloud alone requires internet and ongoing cost. Hybrid gives the best of both.

### ADR-005: AsyncStorage for project persistence (web + mobile)

Projects stored as JSON in AsyncStorage. iCloud sync layered on top for iOS via expo-file-system iCloud container paths.
Rationale: AsyncStorage works identically on web and mobile, keeping the persistence layer simple. iCloud is additive, not a replacement.

### ADR-006: Styles mirroring component structure

Every component has a corresponding style file under `src/styles/` at the same relative path.
Rationale: makes styles easy to find, avoids style sprawl in component files, and keeps components focused on structure and behaviour.

### ADR-007: No navigation library

The app is a single-screen tool. React Navigation or Expo Router would add unnecessary complexity.
Rationale: modals and overlays handle all secondary views (HelpScreen, ExportModal, etc.).

### ADR-008: LayerId is immutable

The six `LayerId` values (`vocals`, `drums`, `bass`, `piano`, `guitar`, `other`) are fixed internal keys. Display names can be customised via `Layer.customName`.
Rationale: LayerId is used as a key in project files, CSV exports, and Demucs output mapping. Changing it would break backwards compatibility.

### ADR-009: Marker timestamps in milliseconds

All timestamps stored and passed as milliseconds (number). Audio player APIs use seconds — convert at the boundary (`ms / 1000` when calling player, `* 1000` when reading).
Rationale: integer milliseconds avoid floating point precision issues in marker comparison logic.

### ADR-010: No default Replicate API key in binary

Users must provide their own Replicate API key for cloud stem separation. Stored in `expo-secure-store`.
Rationale: prevents API key abuse and unexpected costs. The app is heading toward commercial release where users should manage their own cloud costs or a subscription model can be introduced later.

## Patterns to follow

### Platform branching

```typescript
// Prefer file extensions for large platform differences
exportEngine.web.ts
exportEngine.ios.ts

// Use Platform.OS for small inline differences
if (Platform.OS === 'ios') { ... }
```

### Store action pattern

```typescript
// Always use set((state) => ...) when reading existing state
addMarker: (timestamp) => set((state) => ({
  allLayersData: state.allLayersData.map(layer =>
    layer.id === state.activeLayerId
      ? { ...layer, markers: [...layer.markers, timestamp] }
      : layer
  )
}))
```

### Error boundary

`ErrorBoundary.tsx` wraps the entire app. Component-level errors that are recoverable should use the `ErrorModal` via `useCustomAudioPlayer`'s `showError`. Unrecoverable errors bubble to `ErrorBoundary`.

### Viewport constraints

Viewport start time must always satisfy: `0 ≤ viewportStartTime ≤ songDuration - viewportDuration`. Enforce this in `setViewportStartTime` and `setViewportDuration` — never let components do their own clamping.
