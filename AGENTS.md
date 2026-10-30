# AGENTS.md — BeatNote · Dynamic Handover Orchestrator

> **This file is volatile state only.** Current milestones, live task board, handover protocol, and
> session log. It is designed to be read in full at the start of every session.
>
> **Durable project knowledge lives in [`.kiro/steering/`](./.kiro/steering) and the active spec
> under [`.kiro/specs/`](./.kiro/specs).** Those files are auto-loaded steering — do not duplicate
> architecture, conventions, or feature specs into this file.

## Context Map — load on demand

| Need | File |
|------|------|
| Product scope, users, workflow, domain glossary | [`.kiro/steering/project-overview.md`](./.kiro/steering/project-overview.md) |
| Architecture decisions (ADR-001…016), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
| Language, framework, and style conventions | [`.kiro/steering/coding-standards.md`](./.kiro/steering/coding-standards.md) |
| Test strategy — what to unit-test vs E2E | [`.kiro/steering/testing-strategy.md`](./.kiro/steering/testing-strategy.md) |
| Choreography feature designs (mostly planned) | [`.kiro/steering/choreography-features.md`](./.kiro/steering/choreography-features.md) |
| Release sequencing, Lite/Pro boundaries, monetisation gates | [`.kiro/steering/release-roadmap.md`](./.kiro/steering/release-roadmap.md) |
| Deferred stem separation architecture (V3) | [`.kiro/steering/stem-separation.md`](./.kiro/steering/stem-separation.md) |
| iOS build, entitlements, TestFlight setup | [`.kiro/steering/ios-testflight.md`](./.kiro/steering/ios-testflight.md) |
| Deferred feature spec — Demucs stem separation | [`.kiro/specs/demucs-stem-separation/`](./.kiro/specs/demucs-stem-separation) |
| Archived completed work and older handovers | [`docs/context/archive/beatnote-project-history.md`](./docs/context/archive/beatnote-project-history.md) |

> **Deviation from the orchestrator default:** BeatNote keeps durable reference in `.kiro/steering/`
> (Kiro's always-loaded steering layer) rather than a `docs/context/` directory. Duplicating steering
> into `docs/context/` would create two sources of truth and break steering auto-injection. The
> Context Map above therefore points at the steering files directly.

**Automation:** board upkeep is enforced by the global `global-project-orchestrator` skill
(`~/.kiro/skills/global-project-orchestrator/SKILL.md`).

---

## 📊 Active Project Status

**Last updated:** 2026-10-30
**Branch:** `master` (work happens here; no feature branches) · **Deploy:** Web (Netlify) · simulator and physical iOS dev launch verified · TestFlight pending
**Build gate:** `npx tsc --noEmit` (types) and `npm test` (critical Playwright journeys);
focused iOS XCTest for native surfaces changed by the task

### Milestone: M2 — Core choreography and rehearsal workflow (in progress)

M1 (core annotation MVP for web) is shipped. M2 makes annotation, rehearsal, persistence, and
sharing dependable on physical iOS devices, then adds the dance-specific features needed for a V2
Pro launch. Stem separation is deferred entirely to V3, beginning with a cloud-first beta and
potentially adding a hybrid path later.

| Metric | Value |
|--------|-------|
| Annotation layers | 6 stable IDs (`vocals, drums, bass, piano, guitar, other`); stem controls hidden |
| Export formats implemented | 2 of 3 (CSV exposed in V1; MIDI retained for V2; PDF planned) |
| Stem separation | Deferred; types, store fields, and cache preserved |
| Choreography features implemented | 2 of 6 (section looping and pitch-preserved speed implemented; physical-device acceptance pending) |
| Permanent unit tests | 0; Jest is retained only for temporary implementation checks |
| iOS UI tests | 10 critical native integrations retained; all ten pass in focused simulator runs |
| E2E spec files | 2 (Playwright, 8 critical journeys) |
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Complete `app-performance-optimization` Phase 1 before applying any optimisation. Phase 0 is
   complete: reference fixtures, deterministic projects, instrumentation/counters, guides, audit,
   simulator signpost visibility, and physical overhead are verified. The first S-medium/50 paced
   seek sample passes its instrumented completion target, while rapid tapping produces failing
   proxy hitch evidence; IVL diagnosis and repeated latency/frame/memory/energy/contention baselines
   remain.
2. Finish `automatic-bpm-detection` runtime acceptance: browser long-task/long-song measurements
   and representative real-song/physical-device evidence remain. Native cancellation/retry,
   150-second peak memory, synthetic accuracy, and all ten retained simulator journeys pass;
   downbeat estimation remains deliberately open.
3. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
4. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
5. Keep the completed local choreography workflow stable while physical-device acceptance and the
   Apple Developer account remain outstanding; do not resume stem separation until the gates in
   `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed read-only audit `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and native signpost implementation `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integration |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Execute `app-performance-optimization` Phase 0–1: fixtures, instrumentation, and physical
      Release-local baselines before any optimisation; Phase 0 measurement foundation is complete,
      the first paced seek sample is registered, and rapid-input hitch diagnosis plus repeated
      latency/frame/memory/energy and contention baselines remain pending
- [ ] Stabilise and polish the physical-iPhone workflow: Control Centre/Now Playing, atomic song
      transitions, and coalesced rapid speed changes are implemented and locally verified; physical
      Repeat/Shuffle now pass; audible switching and Release-build latency remain open
- [ ] Complete `automatic-bpm-detection` runtime acceptance; web provider, shared decode/worker,
      lifecycle/cache, suggestion preview/apply/restore, manual anchor/count controls, persistence,
      exports, retained browser flow, octave-resolved native synthetic XCTest, cancellation/retry,
      and 150-second simulator memory are implemented; browser measurements, real-song accuracy,
      and physical acceptance remain
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Keep dock tooltips readable above annotation callouts in portrait and landscape, and dismiss
      the half-height Music Library by tapping its exposed backdrop without breaking modal focus
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/styles/components/common/bottomSheet.ts`, `src/styles/components/controls/annotationCallout.ts`, `src/styles/components/controls/controlDock.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Return the editor to its clean unloaded state after deleting the only loaded song and restore
      scrolling inside the half-height Music Library sheet
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/common/BottomSheet.tsx`, `src/features/library/libraryActions.ts`, `src/styles/components/common/bottomSheet.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Complete and archive `local-music-library-queue`, including Files/third-party Open_In,
      app-owned storage, per-song drafts/projects, queue controls, Repeat/Shuffle completion,
      restore/relink, low-storage behavior, and a 107,604,078-byte physical-device import
      <sub>**Key Artifacts:** `docs/context/archive/specs/local-music-library-queue/`, `.kiro/steering/ios-testflight.md`, `.kiro/steering/project-overview.md`, `src/features/library/`, `src/hooks/useAudioPlayer.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Complete simulator runtime automation for automatic BPM cancellation and 150-second memory,
      and keep the iOS project sheet mounted across Files picker callbacks
      <sub>**Key Artifacts:** `.kiro/specs/automatic-bpm-detection/tasks.md`, `modules/beatnote-tempo/ios/BeatNoteTempoModule.swift`, `scripts/ios-ui-test.js`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Pass physical-iPhone acceptance for `playback-marker-control-dock` and `loop-range-overview`
      (VoiceOver deliberately skipped) and archive both specs
      <sub>**Key Artifacts:** `docs/context/archive/specs/playback-marker-control-dock/`, `docs/context/archive/specs/loop-range-overview/`, `AGENTS.md`</sub>

---

## 🔄 Zero-Instruction Handover Protocol

An incoming agent must be able to resume with **no verbal briefing**. Follow this exactly.

### On session start

1. **Read this file top to bottom.** It is the single source of current truth.
2. **Read the newest Handover Log entry** — it states what changed, what is verified, and what is
   explicitly *not* verified.
3. **Pick the top unblocked `In Progress` item**, else the top `To Do` item. Do not invent work.
4. **Load only the context files you need** from the Context Map. Do not bulk-read steering.
5. **Confirm the working tree is clean** (`git status --porcelain`). If dirty, reconcile against the
   newest log entry before editing.

### While working

6. **Move the item to `In Progress`** before the first edit.
7. **Investigate before editing.** Never propose changes to code you have not read.
8. **Verify before claiming done** using the build gate in Active Project Status.

### On task completion

9. **Tick the checkbox and move the item to `✅ Done`** immediately — never batched.
10. **Append `Key Artifacts`** from `git diff --name-only`, not from memory.
11. **Prepend a Handover Log entry** using the template below.
12. **Update `📊 Active Project Status`** if counts, milestone, or focus changed.
13. **If a rule changed, update the matching `.kiro/steering/` file in the same commit.**

### On session close

14. **If `To Do` and `In Progress` are both empty, halt and ask the user for more backlog** — do not
    self-generate scope.
15. Leave the tree either committed or explicitly described in the newest log entry.

### Non-negotiables

- **Do not create, switch, or push branches (including `codex/*`) or worktrees unless the user
  explicitly asks.** Work on the current branch, which is `master`. Never force-push, and never
  push to the remote unless asked.
- Static knowledge never goes in this file; volatile state never goes in `.kiro/steering/`.
- No new Markdown files in the repo root beyond `README.md` and `AGENTS.md`.
- State plainly what was verified and what was not. A command exiting 0 is not proof of correctness.
- **Keep only the latest 5 Handover Log entries.** Move older entries verbatim to the linked archive.

### Handover Log entry template

```markdown
### YYYY-MM-DD — <short title>

**Agent:** <role/model> · **Commit(s):** `<sha>` or `uncommitted`
**Kanban moved:** <item> → <column>

**Changed:**

- <file or area>: <what and why>

**Verified:**

- <command/check> → <result>

**Not verified / known gaps:**

- <explicit gap, stale data, or deferred work>

**Next agent should:**

- <single clearest next action>
```

---

## 📝 Reverse-Chronological Handover Log

*Newest first. Prepend new entries directly below this line. Keep only the latest 5 entries.*

### 2026-10-30 — Quantify paced seek completion and rapid-input hitches

**Agent:** orchestrator (Codex) · **Commit(s):** `36a266f`
**Kanban moved:** none; `app-performance-optimization` Phase 1 remains In Progress

**Changed:**

- Added a flag-gated, post-signpost unified-log duration fallback because Xcode 27's physical
  modeled interval table omitted overlapping seek intervals even though the app emitted them.
- Registered the first physical S-medium/50 wrapped-waveform latency sample and the separate
  slow-then-rapid Animation Hitches evidence without promoting either to a full Phase 1 baseline.
- Updated the findings and profiling guide so future captures reconcile modeled intervals with the
  fallback count and do not confuse the instrumented completion endpoint with audible timing.

**Verified:**

- Final 20 paced taps: p50 46.77 ms, p90 51.20 ms, max 54.01 ms from handler entry through player
  seek completion and the following animation frame; the instrumented endpoint passes 100 ms.
- Slow-then-rapid trace: six hitches, 1,658.698 ms total over 51.348242 seconds (32.30 ms/s), longest
  550.12 ms, Nominal thermal state; user confirmed visible lag during rapid tapping.
- Signed Release-local build installed and launched on iPhone 15 Pro Max; Swift parse,
  `npx tsc --noEmit`, and retained Playwright gate (8/8) passed.

**Not verified / known gaps:**

- External-video first feedback, audible-position timing, ±20 ms seek accuracy, and the other
  Debug/Release, S-long/500, frame, memory, energy, and contention scenarios remain open.
- The focused iOS annotation/project test reached the app but failed while waiting for the Music
  Library sheet to close under a manually staged simulator run; the official clean staging path was
  not rerun, so this native-touch verification gap remains explicit.
- Three unrelated deleted `.kiro/hooks/` files remain unstaged user work.

**Next agent should:**

- Capture the rapid wrapped-seek IVL breakdown in task 4.4, then run the scripted continuous-scrub
  hitch baseline before choosing any optimisation.

### 2026-10-30 — Complete the performance measurement foundation

**Agent:** orchestrator (Codex) · **Commit(s):** `915117e` (measured build), `0b60092`; see `git log` (`docs: register local performance fixtures`)
**Kanban moved:** `app-performance-optimization` Tasks 1.1 and 2.3 → Done; Phase 0 → Done; Phase 1 remains In Progress

**Changed:**

- Built and installed otherwise matching signed Release-local bundles with
  `EXPO_PUBLIC_BEATNOTE_PERF=0` and `=1`, then captured paired 60-second foreground playback Time
  Profiler traces on the reference iPhone.
- Recorded the raw trace paths, bundle checksums, sampling windows, CPU result, and thermal state in
  the performance results register; raw Instruments artifacts remain outside Git.
- Generated ignored local-only medium AAC/MP3 and ten-minute stress WAV/AAC derivatives from one
  representative source, then registered their absolute paths, measured metadata, and SHA-256
  checksums. No copyrighted audio is tracked by Git.
- Generated and checksummed the deterministic S-medium and S-long 0/50/500-marker descriptor/CSV
  pairs under the ignored local performance directory, ready for device import.

**Verified:**

- Both builds installed and launched on iPhone 15 Pro Max / iOS 27.0.1 with the same bundle ID and
  development team; their JS bundles had distinct expected checksums.
- Flag off averaged 46.97% process CPU; flag on averaged 42.95%. The on-minus-off delta was -4.02
  percentage points (-8.57% relative), so positive instrumentation overhead was 0; both traces
  remained in the Fair thermal state.
- `ffprobe` verified both 233.433-second medium encodes and both 600-second stress encodes at
  44.1 kHz stereo; `shasum -a 256` recorded a stable identity for each local file.
- The project generator produced all six expected descriptor/CSV pairs with fixed seed `20261029`;
  their checksums are recorded in `fixtures.md`.

**Not verified / known gaps:**

- This was one same-song pair, and the song metadata/marker count was not captured. The negative
  delta shows no added CPU in this pair but also exposes run-to-run variance; it is not a Phase 1
  latency, frame, memory, or energy baseline.
- All repeated physical latency, frame, memory, energy, contention, and render baselines remain open.
- Three unrelated deleted `.kiro/hooks/` files remain unstaged user work.

**Next agent should:**

- Generate the fixed S-medium/50 project, then collect the first repeated Release-local physical
  latency/frame baseline before implementing any candidate from `findings.md`.

### 2026-10-30 — Verify native waveform and BPM signposts

**Agent:** orchestrator (Codex) · **Commit(s):** `e4f1900`
**Kanban moved:** `app-performance-optimization` Task 2.2 → Done; Phase 0–1 remains In Progress

**Changed:**

- Gave `BeatNoteWaveform` and `BeatNoteTempo` independent, thread-safe opt-in signpost gates and
  enabled each gate immediately before its native operation. This avoids relying on mutable static
  state crossing static Expo-module boundaries.
- Kept the new native methods optional in JS so Metro can still load against an older installed
  binary; removed the now-unnecessary cross-pod LibraryStorage dependency.
- Recorded the simulator trace and interval labels in the performance task ledger and results
  register; raw Instruments output remains outside Git.

**Verified:**

- Instruments Logging trace `/private/tmp/beatnote-signposts-local-gates.trace` on iPhone 17 Pro
  Simulator / iOS 26.2 contains `track.switch`, `waveform.decode`, `bpm.analysis`, and `draft.write`.
- `npx tsc --noEmit`, Swift parse, and `git diff --check` → passed; retained Playwright gate → 8/8.
- Focused `testAutomaticBpmSuggestionAndAnchorControls` → passed in 55.608 seconds; focused
  `testAudioAnnotationAndProjectRestore` → passed in 71.147 seconds.

**Not verified / known gaps:**

- Physical flag-on/flag-off overhead, local medium/stress fixture metadata, and every Release-local
  physical baseline remain open; simulator evidence cannot pass an acceptance threshold.
- Three unrelated deleted `.kiro/hooks/` files remain unstaged user work.

**Next agent should:**

- Register local S-medium/S-stress fixture paths and checksums, then measure 60-second physical
  signpost overhead before collecting the Release-local baselines.

### 2026-10-30 — Separate annotation callouts from tooltips and add sheet backdrop dismissal

**Agent:** orchestrator (Codex) · **Commit(s):** see `git log` (`fix: keep mobile feedback and sheets accessible`)
**Kanban moved:** mobile feedback stacking and Music Library outside-tap dismissal → Done

**Changed:**

- Mobile feedback now shares one ordered overlay stack: transient dock tooltips render above the
  current annotation callout with a fixed gap in both portrait and landscape.
- The half-height Music Library now closes when its exposed backdrop is tapped; the backdrop sits
  behind the sheet, remains outside the focus order, and restores focus to the Song Title control.
- The retained journeys cover non-overlap in both orientations plus backdrop dismissal and modal
  title/return-focus behavior.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → passed.
- Focused mobile-dock and Music Library journeys → passed; full retained Playwright gate → 8/8.

**Not verified / known gaps:**

- The stacking and backdrop dismissal have not yet been hand-tested on the physical iPhone.
- Three unrelated deleted `.kiro/hooks/` files remain unstaged user work.

**Next agent should:**

- Reload the development build on the iPhone and confirm tooltip/callout ordering in both
  orientations and outside-tap dismissal at the Music Library's medium detent.

### 2026-10-30 — Reset the editor after deleting its only song

**Agent:** orchestrator (Codex) · **Commit(s):** see `git log` (`fix: restore unloaded music state`)
**Kanban moved:** active-song deletion reset → Done

**Changed:**

- `libraryActions.ts`: deleting the current song with no adjacent queue destination now clears the
  active selection and resets the authored/editor session to the same unloaded state as first launch.
- `BottomSheet.tsx`: detents now resize the bottom-anchored sheet instead of translating a
  full-height list below the viewport, so the Music Library can scroll while half open.
- Hidden removed records, saved projects, and song drafts remain available for relinking; only the
  stale active selection and capability-gated editor state are cleared.
- The retained library/project journey now verifies “Choose Music”, “Load a song”, disabled
  controls, the absence of missing-source diagnostic text, and medium-detent list scrolling.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → passed.
- Focused library/project journey → passed; full retained Playwright gate → 8/8 passed.

**Not verified / known gaps:**

- The corrected delete flow has not yet been rerun on the physical iPhone shown in the report.
- Three unrelated deleted `.kiro/hooks/` files remain unstaged user work.

**Next agent should:**

- Reload the current development build on the iPhone, import one song, delete it, and confirm the
  clean unloaded canvas and dock without capability descriptions.

<!-- end handover log -->
