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

Target end state: on-device CoreML for offline use with an optional managed cloud fallback for
quality or compatibility. No stem UI ships before V3. Sequence a cloud-first V3 beta, followed by
on-device/hybrid implementation later in V3 if demand and physical-device benchmarks justify it.
Rationale: cloud-first is the smaller experiment for validating user value and economics; committing
to a large native model before that validation creates substantial delivery and maintenance risk.

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

No provider service key is bundled in the app. A production cloud beta routes jobs through a managed
backend that enforces entitlements, credits, retention, and abuse controls. User-provided keys are
limited to development or an explicitly labelled experimental mode.
Rationale: this prevents key extraction and unexpected cost while supporting a commercial credit or
allowance model without coupling the client permanently to one provider.

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
