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
- Solid timing bars and seeking; decoded waveform artwork is an optional, off-by-default toggle
- BPM, beat anchor, 8-count guidance, and the non-destructive local automatic-BPM suggestion are
  Pro-tier features, exposed as previews in V1
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

- Unlimited saved projects per song (Lite allows one; autosaved drafts are never limited)
- All six layers and custom layer names (the six-layer expansion also anticipates V3 stems)
- Advanced pitch-preserving playback-speed controls: fine slider/button adjustment, range and
  preset-count configuration, and long-press custom preset values. Lite retains the built-in
  pitch-preserved speed presets.
- BPM tooling as a whole: manual BPM, beat anchor, 8-count/phrase grid and guidance, and automatic
  BPM detection. Most choreographers do not work from BPM, so this is a convenience tier.
- Continuous playback: the next queued track loads automatically when the current one ends. Lite
  stops at the end of the track unless Repeat is on.
- Resume play: the last played track and playback position are saved and restored on launch
- Remote playback control: headset buttons, lock-screen controls, and Control Centre / Now Playing
  (background audio itself stays in Lite)
- PDF choreography sheets and MIDI export
- Advanced snapping, reusable project templates, and custom annotation vocabularies
- Advanced tempo intelligence: tempo maps, deeper downbeat/phrase assistance, batch/configurable
  re-analysis, and professional confidence/diagnostic controls
- Ad-free experience (see Lite advertising)
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
- Seek, scrub, loop, and use solid timing/progress bars
- Optionally enable decoded waveform artwork (user-controlled, off by default)
- Add, edit, navigate, and delete unlimited markers and annotations
- Choose from the built-in pitch-preserved speed presets; fine increments and preset editing are Pro
- Play in the background; playback stops at the end of a track unless Repeat is on
- Autosave a draft for every song, plus one named saved project per song
- Use one annotation lane on phone; additional layers are a Pro expansion
- Export basic CSV
- Work without an account
- See a static banner ad on library and project-management screens only
- Pause safely when a connected headset or audio route disconnects
- Choose whether the screen stays awake while using the app or only while playing
- Configure seek-button behaviour and seek duration
- Use data-management actions, including removing imported copies and clearing derived caches
- View About, licences, version, privacy choices, and a future Send Feedback entry

Lite does not include BPM, beat anchor, or 8-count tooling. Markers, annotations, looping, seeking,
and rehearsal speed remain complete without them.

The saved-project limit is one per song, applied only to creating an additional Saved Project. It
never blocks opening or editing an existing project, and never limits per-song drafts. Do not expose
additional phone annotation lanes during V1 validation.

### Lite advertising

- A single static banner only, on the Music Library and Project Manager screens.
- Never in the editor, transport, or any active annotation/rehearsal session. No interstitial,
  video, audio, or full-screen ads, and nothing that touches the playback audio session.
- `beatnote.pro` removes ads. Missing or failed ad loads must collapse silently.
- Defer ad-SDK integration to V2 and review the App Tracking Transparency prompt, App Store privacy
  label, and regional consent requirements first. Prefer non-personalised ads to avoid tracking
  prompts where possible.

### Lite/Pro capability matrix

The stable Pro entitlement key is `beatnote.pro`. Product UI asks the capability service about the
keys below and never imports a purchase SDK or store-product identifier. V1 uses the preview
provider, which grants implemented preview features without enforcing a paywall.

| Capability key | Lite | Pro |
|---|---:|---:|
| `projects.unlimited` | No (one saved project per song; drafts unlimited) | Yes |
| `layers.multiple` | No (one phone lane) | Yes |
| `layers.customNames` | No | Yes |
| `waveform.display` | Yes; user-controlled and off by default (ungated) | Yes |
| `playback.pitchPreservingSpeed` | Yes; built-in pitch-preserved presets | Yes |
| `playback.advancedSpeed` | No | Fine slider/buttons, adjustable range, and long-press custom preset editing |
| `playback.continuous` | No (stops at track end unless Repeat is on) | Yes |
| `playback.resume` | No (launch restores the track, paused at the start) | Yes |
| `playback.remoteControls` | No (in-app controls only) | Yes |
| `ads.removed` | No (static banner on library/project screens) | Yes |
| `export.pdf` | No (CSV remains) | Yes |
| `export.midi` | No (CSV remains) | Yes |
| `snapping.advanced` | No | Yes |
| `analysis.bpm` | No (manual BPM, anchor, and 8-count grid) | Yes |
| `projects.templates` | No | Yes |
| `annotations.customVocabulary` | No (built-in suggestions remain) | Yes |
| `analysis.autoBpm` | No | Yes |
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
cost.

### Initial pricing hypothesis

BeatNote will use an auto-renewing subscription for the public Pro launch. Singapore storefront
launch prices are provisional until App Store price-point mapping and willingness-to-pay testing:

- S$3.98 monthly
- S$19.98 yearly, positioned as the default and best-value option
- A 7-day Pro trial on the yearly plan, subject to App Store configuration and conversion testing

Singapore App Store evidence observed on 2026-11-02 includes Music Speed Changer at S$14.98 yearly
and S$29.98 lifetime, and Capo at S$19.98 yearly with monthly price points of S$3.98 and S$6.98.
BeatNote should launch near the lower-middle of that range while its V2 feature set and reliability
mature.

Pricing evidence: [Music Speed Changer](https://apps.apple.com/sg/app/music-speed-changer-audio/id6738125207)
and [Capo](https://apps.apple.com/sg/app/capo-learn-music-by-ear/id887497388).

For beta testers, founders, and early supporters, offer a limited S$49.98 lifetime unlock. It
should be time- or cohort-limited, clearly exclude metered cloud stem-processing credits, and not be
the default public offer. If a public lifetime product is introduced later, test S$79.98 or higher
so it does not undermine the yearly subscription.

### Settings and support roadmap

The Settings information architecture uses the supplied Audipo screens as a functional reference
without copying its visual design. Ignore Audipo's mark-display mode. The root stays deliberately
small: Debug, Basic, one Advanced navigation row, and Support. Timing/BPM/count controls live on a
dedicated Pro subpage rather than expanding inline. The About page currently exposes the real
version/build, licence status, the project feedback link, and the truthful current diagnostic policy.
Remaining planned groups are:

- Playback: continuous play (Pro), pause on headset disconnect (Lite), and keep-screen-on (Lite)
- Button configuration: seek-button mapping and seek duration (Lite); speed range, preset count,
  fine slider/buttons, and long-press preset editing (Pro)
- Data management (Lite): import/export entry points, delete imported copies, clear derived caches,
  and destructive marker/project actions with explicit confirmation
- About (Lite): expand dependency licence notices before App Store release; any future crash or
  usage diagnostics must be opt-in and reflected on this page before collection begins

Settings toggles provide optimistic visual feedback immediately on tap and then reconcile with the
controlled store/entitlement value. This prevents expensive library/audio renders from making a
successful toggle interaction appear stuck; persistence and capability state remain authoritative.

### Lite banner placement

V1 reserves a Lite-only placeholder for an eventual standard banner. Pro does not allocate this
space, so its editor keeps the current layout. The placeholder follows Apple's iPhone standard
banner creative ratio of 1242 × 166 pixels:

- Portrait: below the transport/control dock and above the bottom safe area
- Landscape: below the loop overview strip inside the canvas column, not beneath the side controls
- Never overlay the waveform, transport, annotation editor, toast, or playback controls

The initial `Ad space` placeholder validates layout only. An ad SDK, consent flow, fill/collapse
behaviour, and production creative are V2 work.

Reference: [Apple standard banner specifications](https://ads.apple.com/apple-news/publishers/help/ad-specs/0045-standard-double-large-mrec-banner-specs).

### Current cache and storage policy

- Imported audio is not a disposable cache. Native imports are copied into BeatNote's
  backup-excluded Application Support music directory and remain until the user removes the song.
- Temporary picker/Open_In copies in the OS cache or Inbox are deleted after a successful managed
  import. Staging files and unreferenced managed audio are swept after startup once they are old
  enough to avoid racing an active import.
- Native/web waveform data is derived and held in memory for reuse during the app session; it is not
  a user-managed persistent waveform cache today.
- Web decoded-audio work is bounded to two recent decode requests and is evicted after analysis
  consumes it. Browser audio originals remain in IndexedDB as library content, not cache.
- Automatic-BPM analysis is persisted per music item in AsyncStorage, versioned/fingerprinted, and
  removed when its source song is deleted or analysis is invalidated.
- Stem-cache metadata and deletion helpers exist only for the deferred V3 foundation and are not
  user-facing in V1.

Before exposing “Clear derived caches,” implement one coordinated action that clears BPM analysis,
session waveform/decode caches, and future stem derivatives without deleting imported audio,
projects, markers, or annotations. “Delete imported files” must remain a separate destructive action
that explains BeatNote removes only its managed copies, not the originals in Files.

## Gates for resuming stem work

Do not resume the deferred Demucs implementation merely because core tasks are quiet. Resume when:

- physical-device audio, background, scrub, save/reopen, and share acceptance pass;
- the required utility and store-action unit coverage is in place;
- the core 8-count, looping, rehearsal, and export workflow is stable;
- the Lite/Pro capability matrix and stem business model are agreed; and
- a short technical spike has measured provider cost/latency or on-device feasibility on real audio.
