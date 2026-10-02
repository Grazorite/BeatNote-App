---
inclusion: always
---

# BeatNote — Stem Separation (Demucs)

## Release status

Stem separation is deferred while BeatNote completes its core annotation and rehearsal workflow.
The existing types, store state, cache implementation, tests, and detailed spec are preserved, but
no additional separator, native-module, or UI work should start until the gates in
[`release-roadmap.md`](./release-roadmap.md) are satisfied.

The planned release sequence is:

1. **V3 beta:** validate a managed, cloud-first 2-/4-stem workflow, demand, quality, latency, and
   unit economics.
2. **Later V3:** add on-device CoreML and hybrid routing only after benchmarks prove acceptable model size,
   processing time, memory, battery, and thermal behaviour.

The architecture below remains the target end state. Its original on-device-first implementation
order is no longer the release order.

## Target architecture: Hybrid approach

Two-tier system with automatic fallback:

1. **On-device (CoreML)** — lightweight model, ~30–60s processing, works offline
2. **Cloud API (Replicate.com)** — full Demucs htdemucs model, higher quality, requires internet

The user sees a single "Split Stems" action. In the eventual V3 hybrid release, the app can attempt
on-device processing first and offer cloud processing when the model is unavailable or unsuitable.
The V3 beta uses only the cloud path behind a feature flag. Until then,
`STEM_SEPARATION_UI_ENABLED` remains false and the full-mix waveform is shown even for a saved
multitrack view preference.

## Module location

```css
src/features/stemSeparation/
  index.ts                  # Public API — useStemSeparation hook
  useStemSeparation.ts      # Hook: orchestrates on-device vs cloud
  onDeviceSeparator.ts      # Calls native CoreML module
  cloudSeparator.ts         # Calls Replicate API
  stemCache.ts              # Persist/retrieve separated stem files
  types.ts                  # StemSeparationResult, StemSeparationStatus

modules/
  stem-separation/          # Expo Module (Swift + TS interface)
    ios/
      StemSeparationModule.swift
    src/
      index.ts              # TypeScript interface to native module
```

## Data flow

```css
User taps "Split Stems"
  → useStemSeparation checks stemCache for existing result
  → if cached: load stems directly
  → if not cached:
      → show progress UI (indeterminate → percentage)
      → attempt onDeviceSeparator
        → on success: cache stems, update store
        → on failure/timeout: offer cloudSeparator
      → cloudSeparator polls Replicate until complete
      → cache result, update store
```

## Stem output

Demucs produces 4 stems by default: `vocals`, `drums`, `bass`, `other`.
The 6-stem mode maps to htdemucs_6s which adds `piano` and `guitar`.
Match output files directly to the existing `LayerId` type.

## Caching

- Stem audio files stored in `expo-file-system` app Documents directory
- Cache key: hash of the source audio URI + stem count
- Each cached entry stores: `{ sourceHash, stemCount, stems: { [layerId]: fileUri }, createdAt }`
- Cache metadata persisted in AsyncStorage under key `beatnote_stem_cache`
- Users manage cache via Settings → Storage (shows size per song, manual delete)

## Progress UX

- Show a modal/overlay with a progress bar during processing
- On-device: update progress via native module callbacks (0–100%)
- Cloud: poll Replicate prediction status every 2s, map to 0–100%
- Allow cancellation — cancel native inference or delete Replicate prediction
- Show estimated time remaining based on song duration

## Store integration

`useStudioStore` already contains:

```typescript
stemSeparationStatus: 'idle' | 'processing' | 'complete' | 'error'
stemSeparationProgress: number  // 0–100
separatedStemUris: Partial<Record<LayerId, string>>  // file URIs per layer
setStemSeparationStatus: (status) => void
setStemSeparationProgress: (progress: number) => void
setSeparatedStemUris: (uris: Partial<Record<LayerId, string>>) => void
```

Types live in `src/features/stemSeparation/types.ts` (`StemSeparationStatus`, `StemSeparationMode`, `StemSeparationResult`, `StemCacheEntry`, `StemCacheMetadata`, `StemProgressEvent`, `StemSeparationError`).

## Waveform display after separation

When `separatedStemUris` is populated:

- Each stem layer in `StemsView` uses its own URI for waveform rendering
- The unified `WaveformCanvas` continues to use the original full-mix URI
- Toggling between unified and multitrack view switches between full-mix and per-stem waveforms

## Settings

Add to sidebar settings:

- Stem separation mode: `Auto` | `On-device only` | `Cloud only`
- Cloud processing allowance/credit status and an upgrade or credit-purchase action
- Cache management link → Storage screen

An API-key input is not part of the production V3 experience. It may exist only in development or
an explicitly labelled experimental build.

## Cloud API

- Replicate `facebook/demucs` remains the first provider candidate, not a permanent client contract.
- Production requests go through a managed backend with short-lived job authorization; service API
  keys are never bundled in the app binary.
- The backend owns quotas/credits, provider substitution, deletion/retention enforcement, and abuse
  controls.
- A user-provided key may remain available only for development or an explicitly labelled
  experimental mode.

## On-device model

- Use the `htdemucs` model exported to CoreML format
- Model file bundled in the app binary (adds ~50–80MB to app size — acceptable)
- Inference runs on the Neural Engine via CoreML, not CPU
- Minimum iOS version for Neural Engine: iOS 14+ (already within Expo's target range)

Before implementation, replace the current size/time assumptions with measurements from candidate
models running on the minimum supported physical device. Model licensing and App Store distribution
constraints must also be confirmed.
