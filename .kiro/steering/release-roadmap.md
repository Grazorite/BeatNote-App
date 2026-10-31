---
inclusion: always
---

# BeatNote — Release and Monetisation Roadmap

## Product promise

BeatNote helps choreographers and dancers load a song, mark important moments, write movement cues,
rehearse sections, and share the result. Stem separation is an optional enhancement, not a
prerequisite for the core product.

## Product principles

- Monetise depth, scale, convenience, and processing cost rather than basic annotation.
- Never interrupt an active annotation session with a marker limit or hold existing work behind a
  paywall.
- Decide tier boundaries before public release so a later paid launch does not remove features that
  users reasonably understood to be permanently free.
- Keep user projects readable and exportable after a subscription or entitlement expires.
- Introduce upgrade prompts at expansion moments: creating another project, enabling more layers,
  requesting a professional export, or starting compute-intensive processing.

## Release sequence

### V1 — Core validation

Goal: prove that annotation and rehearsal are reliable on a physical iPhone and on the web.

- Reliable local audio import, playback, seeking, scrubbing, and background playback
- Unlimited markers and text annotations within a project
- One visible annotation lane in the V1 phone editor; preserve the six-layer project schema for
  compatibility and V2 expansion
- Marker editing, navigation, undo, and redo
- Solid timing bars, seeking, and BPM / 8-count guidance; decoded waveform artwork is a disabled-by-default Pro preview
- One non-destructive local automatic-BPM suggestion with manual BPM/anchor correction
- Section looping and practical rehearsal controls
- Reliable local project save, reopen, and CSV export
- Physical-device acceptance and adequate unit/E2E coverage
- Define entitlement identifiers and feature-gate boundaries, but do not make payment integration a
  blocker for validating the core workflow

V1 beta features may be temporarily available for testing only when they are clearly labelled as
previews. Do not silently make a previously permanent free feature paid later.

### V2 — Pro launch

Goal: start charging for professional depth after the core workflow is dependable. Monetisation does
not depend on stem separation.

Pro candidates:

- Unlimited saved projects
- All six layers and custom layer names
- Toggleable decoded waveform artwork in the wrapped canvas, detail canvas, and overview strip,
  disabled by default. Lite retains solid timing/progress bars with the same seeking, markers,
  loops, playhead, BPM grid, and annotation workflow. V1's preview provider exposes the toggle but
  no purchase entitlement is enforced yet.
- Pitch-preserving slow playback
- PDF choreography sheets and MIDI export
- Advanced snapping, reusable project templates, and custom annotation vocabularies
- Advanced tempo intelligence: tempo maps, deeper downbeat/phrase assistance, batch/configurable
  re-analysis, and professional confidence/diagnostic controls
- Apple Music as a provider integration if a V2 technical/policy spike proves acceptable seeking,
  playback lifecycle, catalog identity, and degraded-mode behavior

Before V2 ships, implement and verify purchase, restore-purchase, entitlement refresh, offline grace,
and expiry handling. The app must not corrupt or hide existing project data when entitlement state
changes.

### V3 — Stem-separation beta and hybrid path

Goal: validate demand, output quality, latency, privacy expectations, and unit economics without
committing to a large on-device model.

- Begin with a small invited or Pro beta and one free trial separation
- Prefer 2- or 4-stem output before supporting 6 stems
- Route provider credentials through a managed backend; never ship a service API key in the client
- Use credits or an explicit processing allowance because every cloud job has variable cost
- Support upload progress, processing progress, cancellation, retry, expiration, and local caching
- Delete uploaded source audio and transient cloud outputs according to a documented retention policy

Cloud stems advance beyond beta only when measured demand and margins justify the operational cost.
No stem-splitting UI ships in V1 or V2. The V3 beta is the first user-facing release; the offline
path below is a later V3 milestone, not a prerequisite for its beta.

#### Later V3 milestone — On-device and hybrid stem separation

Goal: add a durable offline Pro workflow after cloud validation proves that users value the feature.

- Benchmark candidate CoreML models on supported physical devices before committing to a bundled model
- Set explicit limits for model size, processing time, peak memory, battery use, and thermal impact
- Implement the Expo native module, cancellation, cache/storage management, and interruption recovery
- Add per-stem waveform generation and 4-/6-stem output only after the inference path is stable
- Retain cloud processing as an optional quality or compatibility fallback

## Proposed Lite baseline

The Lite tier must complete a real project:

- Import and play supported local audio
- Seek, scrub, loop, and use solid timing/progress bars without decoded waveform artwork
- Add, edit, navigate, and delete unlimited markers and annotations
- Use the basic beat and 8-count workflow
- Save a small number of local projects
- Use one annotation lane on phone; additional layers are a V2 Pro expansion
- Export basic CSV
- Work without an account

The initial saved-project hypothesis is three projects. Validate that limit with users before
hard-coding it; do not expose additional phone annotation lanes during V1 validation.

### Lite/Pro capability matrix

The stable Pro entitlement key is `beatnote.pro`. Product UI asks the capability service about the
keys below and never imports a purchase SDK or store-product identifier. V1 uses the preview
provider, which grants implemented preview features without enforcing a paywall.

| Capability key | Lite | Pro |
|---|---:|---:|
| `projects.unlimited` | No (three-project hypothesis) | Yes |
| `layers.multiple` | No (one phone lane) | Yes |
| `layers.customNames` | No | Yes |
| `waveform.display` | No (solid timing/progress bars remain) | Yes; user-controlled and off by default |
| `playback.pitchPreservingSpeed` | No (1× remains) | Yes |
| `export.pdf` | No (CSV remains) | Yes |
| `export.midi` | No (CSV remains) | Yes |
| `snapping.advanced` | No (basic beat/count guidance remains) | Yes |
| `projects.templates` | No | Yes |
| `annotations.customVocabulary` | No (built-in suggestions remain) | Yes |
| `analysis.autoBpm` | Yes (one local suggestion plus manual correction) | Yes |
| `analysis.advancedTempo` | No | Yes |
| `sources.appleMusic` | No | Candidate, subject to V2 feasibility |

This matrix does not gate project readability, existing annotations, basic CSV export, or access to
previously saved data. Stem-processing credits remain a separate metered product capability.

## Streaming provider integrations

Streaming access is a playback-source capability, not the same thing as the `beatnote.pro` product
entitlement. A user may need both BeatNote Pro and a separate provider subscription. Losing either
must not hide or corrupt existing BeatNote projects.

### Apple Music — V2 Pro feasibility candidate

MusicKit supports user authorization, catalog/library selection, subscription capability checks,
in-app playback, queue control, playback state, and a settable playback time. It is therefore the
first provider worth evaluating for a paid convenience integration:

- [MusicKit overview](https://developer.apple.com/musickit/)
- [MusicKit framework](https://developer.apple.com/documentation/musickit)
- [MusicPlayer playback time](https://developer.apple.com/documentation/musickit/musicplayer/playbacktime)

The public MusicKit surface documents controlled playback and metadata, not a decoded PCM/file
contract suitable for BeatNote's waveform extraction or local BPM detector. Until an implementation
spike proves otherwise, an Apple Music source must advertise `waveformAccess = false` and
`decodedAudioAnalysis = false`; the editor falls back to a timing bar and manual BPM. The spike must
also verify exact seeking, looping, speed control, background behavior, authorization revocation,
subscription loss, storefront changes, and stable catalog identity before the feature enters V2.

BeatNote Pro may charge for BeatNote's integration/workflow, but must not imply that it includes an
Apple Music subscription.

### Spotify — blocked for a paid BeatNote integration

Do not schedule Spotify streaming as a commercial Pro feature under the current published terms.
Spotify's iOS/Web Playback documentation says commercial streaming integrations are prohibited, its
iOS SDK controls the separate Spotify app rather than exposing an audio asset, and Development Mode
is intentionally unsuitable for a scalable business:

- [Spotify iOS SDK policy notes](https://developer.spotify.com/documentation/ios/getting-started)
- [Spotify quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Spotify 2026 development-mode policy](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security)

Revisit only after a written Spotify partnership/approval or a material policy change. A simple
external deep link may be considered separately, but it is not a BeatNote playback-source
integration and must not be marketed as one.

## Monetisation implementation timing

Start the architecture during V1, then activate charging in V2:

1. Define stable entitlement keys and a single capability-checking interface.
2. Keep UI components unaware of the purchase provider; they ask whether a capability is available.
3. Add analytics for upgrade-screen impressions, purchases, restores, and feature demand without
   recording audio or annotation contents.
4. Exercise sandbox purchases and restore flows before placing any feature behind the entitlement.
5. Launch Pro only after physical-device core acceptance passes and project persistence/export are
   considered reliable.

Stem credits are separate from the local Pro entitlement because cloud processing has recurring
cost. The final store products and prices remain a product decision and are not fixed by this roadmap.

## Gates for resuming stem work

Do not resume the deferred Demucs implementation merely because core tasks are quiet. Resume when:

- physical-device audio, background, scrub, save/reopen, and share acceptance pass;
- the required utility and store-action unit coverage is in place;
- the core 8-count, looping, rehearsal, and export workflow is stable;
- the Lite/Pro capability matrix and stem business model are agreed; and
- a short technical spike has measured provider cost/latency or on-device feasibility on real audio.
