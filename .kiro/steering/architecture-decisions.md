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

All native iOS code (CoreML inference, AVAudioUnitTimePitch, waveform extraction) is written as Expo
Modules (Swift + TypeScript interface) under `modules/`. No bare `react-native` native modules.
Native waveform extraction uses the `BeatNoteWaveform` module and an `AVAssetReader` streaming
decoder. UI clients call the platform `waveformExtraction` provider with an explicit `basic` or
`detailed` resolution; they do not import the native module or entitlement vendors directly.
Rationale: Expo Modules integrate cleanly with EAS Build and don't require ejecting from Expo managed
workflow. The provider boundary keeps rendering portable and leaves future Lite/Pro policy separate
from audio decoding.

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

### ADR-011: Use expo-audio for pitch-preserved playback from 0.5× to 2×

Playback speed uses the existing `expo-audio` player, with `shouldCorrectPitch` always enabled and
`setPlaybackRate(speed, 'high')` applied at the player boundary. Supported values are normalized to
0.05× increments from 0.5× through 2×. A custom `AVAudioUnitTimePitch` Expo Module is not required
for this range; reconsider a native engine only if a future requirement exceeds the mobile player's
2× ceiling or physical-device quality proves insufficient.
Rationale: the installed cross-platform player already maps high-quality iOS correction to Apple's
spectral time-pitch algorithm, preserves pitch on web, and keeps rate state through its existing
play, pause, seek, loop, source, and background-audio lifecycle.

### ADR-012: Music item identity and app-owned audio storage

Each imported song receives a random, stable Music Item UUID that is independent of its path and
display title. Native audio is copied to `Library/Application Support/BeatNote/Music` as a relative
`<uuid>.<extension>` reference, excluded from backup, and removed only when BeatNote deletes its own
managed copy. The original external file is never treated as owned.
Rationale: picker/cache URLs are purgeable, container paths change after restore, and title/path
identity would make rename, relink, and multiple projects per song unsafe.

### ADR-013: Per-song drafts and saved-project baselines

BeatNote stores one autosaved draft per Music Item and any number of Saved Projects as independent
per-key records with integer revisions. Dirty state compares a canonical content fingerprint with
the selected project's baseline fingerprint. All writes share one serialized persistence pipeline;
read failures block writes to the affected key.
Rationale: per-key records avoid whole-library overwrite races, while explicit revisions and
fingerprints make save/autosave recovery deterministic.

### ADR-014: IndexedDB for durable web audio

The web implementation stores imported audio bytes in IndexedDB behind `audioStore.web.ts` while
AsyncStorage retains only metadata and relative identity. Quota failures abort atomically and are
reported without replacing the prior durable state.
Rationale: IndexedDB survives reload, supports binary files broadly, and needs no additional
dependency.

### ADR-015: Provider-neutral playback sources and capabilities

Music Items carry a provider-specific `SourceIdentity`; resolution returns a playable URI and a
`PlaybackCapabilities` contract. Playback, waveform, speed, repeat, queue, and shuffle surfaces
gate themselves from those capabilities instead of branching on local-file assumptions.
Rationale: Apple Music or Spotify providers can be added later without rewriting the annotation
editor or weakening local-file behavior.

### ADR-016: Custom detented bottom sheet without a navigation library

The Music Library uses a shared custom `BottomSheet` hosted in a transparent modal and built with
the installed gesture-handler and Reanimated stack. It owns safe areas, rotation, keyboard inset,
detents, Reduce Motion, focus trapping, and focus restoration on native and web.
Rationale: this preserves ADR-007, avoids another navigation dependency, and keeps one responsive
surface across platforms while accepting approximate rather than UIKit-native sheet physics.

### ADR-017: Provider-neutral product capabilities

Product access is expressed as stable capability keys behind one `EntitlementProvider` interface.
UI components do not import purchase SDKs, store product identifiers, or subscription-vendor state.
V1 uses a preview provider with no enforced paywalls; V2 may replace only that provider after
purchase, restore, refresh, offline-grace, and expiry behavior pass acceptance.
Rationale: separating product entitlement from playback-source capability keeps Apple Music/Spotify
integration independent of monetisation and prevents vendor details from spreading through the UI.

### ADR-018 (proposed): Separate local tempo-analysis providers

Automatic BPM analysis remains local-first and uses platform providers behind one TypeScript
contract. Web uses a self-contained onset-envelope/autocorrelation detector in a worker after a
shared waveform decode; iOS uses a separate `BeatNoteTempo` Expo Module that streams bounded windows
through `AVAssetReader` and Accelerate rather than extending `BeatNoteWaveform`. The web decision is
supported by the 2026-10-27 synthetic spike and retained 2026-10-28 worker workflow; the native pod
now compiles with bounded windows and utility-priority work. This ADR remains proposed until the
native prototype measures peak memory and cancellation latency on the 150-second fixture.
Rationale: BeatNote needs its own beat-phase anchor regardless of third-party tempo libraries, while
the native analysis lifecycle and outputs differ materially from waveform rendering.

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
