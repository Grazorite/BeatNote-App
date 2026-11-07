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

All native iOS code (CoreML inference, audio-session route observation, waveform extraction) is written as Expo
Modules (Swift + TypeScript interface) under `modules/`. No bare `react-native` native modules.
Native waveform extraction uses the `BeatNoteWaveform` module and an `AVAssetReader` streaming
decoder. UI clients call the platform `waveformExtraction` provider with an explicit `basic` or
`detailed` resolution; they do not import the native module or entitlement vendors directly.
`BeatNoteAudioSession` reports `AVAudioSession` output-route loss through the platform
`audioRoute` service so playback policy remains in the application hook rather than the module.
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

### ADR-011: Use expo-audio for pitch-preserved playback from 0.25× to 2×

Playback speed uses the existing `expo-audio` player, with `shouldCorrectPitch` always enabled and
`setPlaybackRate(speed, 'high')` applied at the player boundary. Supported values are normalized to
0.05× increments from 0.25× through 2×. A custom `AVAudioUnitTimePitch` Expo Module is not required
for this range; reconsider a native engine only if a future requirement exceeds the mobile player's
2× ceiling or physical-device quality proves insufficient.
Rationale: the installed cross-platform player already maps high-quality iOS correction to Apple's
spectral time-pitch algorithm, preserves pitch on web, and keeps rate state through its existing
play, pause, seek, loop, source, and background-audio lifecycle.

BeatNote exposes one truthful range and no range selector. A future requirement above 2× needs a
separate native playback-engine decision and full transport/audio-session acceptance; it must not be
represented by presets that the installed player silently clamps.

### ADR-012: Music item identity and app-owned audio storage

Each imported song receives a random, stable Music Item UUID that is independent of its path and
display title. Native audio is copied to `Library/Application Support/BeatNote/Music` as a relative
`<uuid>.<extension>` reference, excluded from backup, and removed only when BeatNote deletes its own
managed copy. The original external file is never treated as owned.
The validated duration stored on the Music Item is reused when switching songs; do not create a
second decoder/player merely to re-probe it. A bounded duration probe is only a compatibility path
for legacy records whose duration is absent or invalid.
Rationale: picker/cache URLs are purgeable, container paths change after restore, and title/path
identity would make rename, relink, and multiple projects per song unsafe.

### ADR-013: Per-song drafts and saved-project baselines

BeatNote stores one autosaved draft per Music Item and any number of Saved Projects as independent
per-key records with integer revisions. Dirty state compares a canonical content fingerprint with
the selected project's baseline fingerprint. All writes share one serialized persistence pipeline;
read failures block writes to the affected key. Manual song switches prompt over a dirty named
baseline. End-of-track Pro continuation, including Shuffle, bypasses that modal only after flushing
the current per-song draft; the named project is not overwritten, returning restores the dirty
draft, and a failed or timed-out flush aborts the automatic switch.
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
Rationale: a compatible provider such as a feasible Apple Music integration can be added without
rewriting the annotation editor or weakening local-file behavior. This is an extensibility boundary,
not a promise that every provider is legally or technically viable; ADR-019 governs
provider-specific release decisions.

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

### ADR-018: Separate local tempo-analysis providers

Automatic BPM analysis remains local-first and uses platform providers behind one TypeScript
contract. Web uses a self-contained onset-envelope/autocorrelation detector in a worker after a
shared waveform decode; iOS uses a separate `BeatNoteTempo` Expo Module that streams bounded windows
through `AVAssetReader` and Accelerate rather than extending `BeatNoteWaveform`. The web decision is
supported by the 2026-10-27 synthetic spike and retained 2026-10-28 worker workflow. Native
synthetic accuracy, cancellation/retry, and 150-second peak-memory acceptance now pass, so the ADR
is accepted; representative-song and browser performance evidence remain release acceptance work,
not architecture blockers. Import may enqueue analysis opportunistically, but Timing & BPM must
always expose an explicit Analyze Tempo action after relaunch, dismissal, or manual adjustment.
User-facing tempo values and selectable alternatives are whole BPM. Native candidate selection must
rank coherent pulse families rather than choosing the largest raw autocorrelation peak alone: include
half/double support, the common 3-against-2 alias, sub-frame peak interpolation, and a broad dance-
tempo prior. Changing that selection contract requires synthetic plus representative-song evidence.
Rationale: BeatNote needs its own beat-phase anchor regardless of third-party tempo libraries, while
the native analysis lifecycle and outputs differ materially from waveform rendering.

### ADR-019: Apple Music is the first streaming candidate; Spotify commercial streaming is blocked

V2 may run a MusicKit feasibility spike and, if it passes, offer Apple Music as a Pro playback-source
integration. The source must declare its real capabilities; until decoded audio access is proven,
assume no waveform extraction or local BPM analysis and use the timing-bar/manual-BPM fallback.
Apple Music authorization and subscription state are separate from the `beatnote.pro` entitlement.

Do not place Spotify streaming on the commercial roadmap under its current published terms. The
Spotify iOS/Web Playback documentation prohibits commercial streaming integrations, App Remote
controls the separate Spotify app, and Development Mode is not a scalable product foundation. Reopen
the decision only with written Spotify approval/partnership or a material policy change.

Rationale: provider-neutral code cannot remove provider policy, DRM, subscription, or decoded-audio
constraints. Naming a blocked integration as a paid feature would create product and legal risk.

### ADR-020: Waveform artwork is an optional Pro display setting

Decoded waveform artwork in the wrapped canvas, detail canvas, and overview strip is a persisted
`showWaveform` setting that defaults to false and requires Pro (revised 2026-11-05). Lite shows timing bars and preserves the saved
preference and custom annotation labels. Disabling artwork prevents extraction requests from these surfaces. With artwork off, the same timeline renders solid timing/progress bars with identical
seeking, scrubbing, marker, loop, playhead, and annotation behavior.

Rationale: waveform artwork adds useful visual precision and measurable extraction/drawing cost,
but it is not required to complete BeatNote's core annotation and rehearsal workflow. Keeping the
timeline interaction model identical avoids degrading Lite or creating incompatible projects.

### ADR-021: Bound native audio seeks and recover the player after iOS suspension

Every awaited native `expo-audio` seek must have a finite application-level timeout. Foregrounding
invalidates the JavaScript seek drain so a native operation abandoned during suspension cannot keep
transport, canvas seeking, or song switching serialized behind it. If the retained player remains
unloaded after a short foreground grace period, BeatNote recreates the iOS player for the same
URI. The first Play after foregrounding also checks for clock movement. A failed Play or a stalled
start gets one fresh-player attempt. Restore playback speed and position, reconfigure the session
for Play, and respect newer pause, seek and song-switch actions. Keep the current project loaded
throughout recovery. After 15 minutes away, proactively replace a paused player on foreground even
if its item still reports loaded. Never interrupt healthy background playback or automatically play
a paused rehearsal. A Play tap during replacement updates the pending intent and starts once ready.
Configure the session before waiting on replacement readiness and again on the first foreground
Play. Cancel unfinished recovery when leaving the foreground so suspended wall-clock deadlines
cannot surface an old error on return. Failed recovery retains the selected position and marks the
player for replacement; the fallback's Reload Audio action starts a fresh same-song attempt using
the latest player, and ignores a prompt for a song that has since changed. Refresh only audio, never
the app or project store, so unsaved choreography remains intact.

Expo SDK 54's iOS `AudioPlayer.seekTo` implementation is patched during prebuild to use
`AVPlayer.seek(...completionHandler:)` with weak ownership and to cancel pending seeks when the
shared player is released. Keep the config plugin idempotent and fail prebuild on an unknown
upstream implementation. Remove the patch only after upgrading to an `expo-audio` version that
contains the equivalent upstream lifecycle fix and rerunning background/foreground transport,
canvas, queue-switch, loop, and Repeat acceptance on a physical device.

Rationale: a retained iOS process can survive hours in the background while an async AVFoundation
seek continuation never resolves. Without both the native lifecycle correction and bounded app
transactions, one stale seek can indefinitely block otherwise independent editor interactions.

### ADR-022: Player readiness completes a track switch before retryable bookkeeping

A track switch is user-complete once the destination source is loaded and ready. Recent-play and
queue persistence runs through the retryable storage pipeline after that point and must never keep
the Music Library busy, keep the editor blocked, or roll playable audio back. Native pause/play
commands around the transition remain bounded. Waveform extraction for a newly published URI waits
until the switch coordinator is idle so its `AVAssetReader` cannot contend with destination player
setup. The coordinator reads readiness from the player that owns the requested URI and checks
again while waiting in case a native event was missed. The final waveform consumer leaving cancels
its iOS reader. Native peak arrays and the in-memory cache are bounded for long rehearsals.

Library selections present the dirty-project guard inside the open sheet. Once the selection can
proceed, dismiss the sheet and show the Studio transition used by transport switches. On failure,
restore the Library row with its retry action. Only the coordinator owns switch progress. A late
bookkeeping completion merges the played timestamp without changing the active queue. Resolve the
selected song against the project summaries reconciled at boot and maintained by project writes.
Rebuilding the full index on each tap reads every saved project before playback can start.

Rationale: after iOS suspension, a stale AsyncStorage operation can hold the serialized persistence
queue even though AVPlayer has successfully changed source. Treating nonessential metadata as part
of the visible transaction made Library taps appear hung while queue navigation seemed successful.

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
