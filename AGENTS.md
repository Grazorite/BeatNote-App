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
| Architecture decisions (ADR-001…020), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
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

**Last updated:** 2026-10-31
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
| Export formats implemented | 3 engines; CSV/PDF exposed in V1 and MIDI retained for V2 |
| Stem separation | Deferred; types, store fields, and cache preserved |
| Choreography features implemented | 6 of 6 in the V1 preview; physical-device acceptance remains |
| Permanent unit tests | 0; Jest is retained only for temporary implementation checks |
| iOS UI tests | 10 critical native integrations retained; all ten pass in focused simulator runs |
| E2E spec files | 2 (Playwright, 8 critical journeys) |
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Complete `app-performance-optimization` Phase 1 and validate the first evidence-backed changes.
   Phase 0 and all four required hitch baselines are recorded. O-3 static waveform artwork plus
   per-frame scrub/latest-wins seek coalescing are implemented and pass physical functional checks.
   A first post-change scrub trace improved the ratio 71.8%, p90 14.3%, and max 60.9%, but ran at
   Serious thermal state and cannot decide keep/revert; repeat it at Nominal before proceeding.
   Gated counters and repeated latency/memory/energy/contention baselines also remain open.
2. Keep basic automatic BPM in the V1 Lite candidate and finish its runtime acceptance: browser long-task/long-song measurements
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
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed performance audits `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f`, plus native signposts `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integrations |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Execute `app-performance-optimization` Phase 0–1: fixtures, instrumentation, and physical
      Release-local baselines before any optimisation; Phase 0 measurement foundation is complete,
      paced seek and all four required frame/hitch scenarios are registered, scrub-profiler evidence
      identifies CoreGraphics saturation, and keyboard editing fails its target; counters plus
      repeated latency/memory/energy and contention baselines remain pending. O-3 static artwork
      and per-frame scrub / latest-wins seek coalescing (tasks 7, 7.1) are implemented at the
      user's direction and pass physical functional acceptance; the first after-trace improved
      substantially but was thermally invalid, so Nominal after-measurements and keep/revert remain
      open
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
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Reorder the mobile media controls: portrait places annotation/speed/delete before the Play
      block and First/Previous/Next song after it; landscape pairs add/annotation, speed/delete,
      and Repeat/tri-state loop while keeping the speed chooser below the title bar and on-screen
      <sub>**Key Artifacts:** `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Audit the V1 product/repository state, refresh stale documentation and package metadata,
      remove unused source/dependencies, and add disabled-by-default Pro waveform artwork while
      preserving solid timing bars and the complete Lite annotation/rehearsal workflow
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/release-roadmap.md`, `README.md`, `package.json`, `src/components/ui/controls/WaveformVisibilityControl.tsx`, `src/features/entitlements/`, `src/hooks/useStudioStore.ts`, `src/utils/persistedContent.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Make wrapped-waveform scrubbing continuous across rows: one container-level horizontal-first
      scrub that follows the finger between rows and auto-continues from the trailing edge or gutter
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/utils/timelineMapping.ts`</sub>

- [x] Keep dock tooltips readable above annotation callouts in portrait and landscape, and dismiss
      the half-height Music Library by tapping its exposed backdrop without breaking modal focus
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/styles/components/common/bottomSheet.ts`, `src/styles/components/controls/annotationCallout.ts`, `src/styles/components/controls/controlDock.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Return the editor to its clean unloaded state after deleting the only loaded song and restore
      scrolling inside the half-height Music Library sheet
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/common/BottomSheet.tsx`, `src/features/library/libraryActions.ts`, `src/styles/components/common/bottomSheet.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-10-31 — Reorder the mobile media controls

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** mobile media-control ordering → Done

**Changed:**

- Portrait now keeps annotation, playback speed, and delete-previous-marker in that order on the
  leading side of Play, with First, Previous, and Next song in that order on the trailing side.
- Landscape now pairs Add marker with Annotation, Speed with Delete previous marker, and Repeat
  with the tri-state loop; the other marker and queue rows retain their order.
- Playback speed supports leading/trailing chooser alignment, and its raised landscape position is
  offset below the Song Title toolbar while keeping the complete chooser inside the viewport.
- The retained phone-dock journey now asserts both group orders, both landscape columns, chooser
  bounds in portrait and landscape, and explicit landscape toolbar/popup separation.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → passed.
- Focused phone-dock Playwright journey → passed; full retained Playwright gate → 8/8 passed.
- A freshly signed Release build succeeded, installed on physical iPhone `gæl (3)`, launched as
  `com.beatnote.app`, and remained running as PID 84239; temporary DerivedData was removed afterward.

**Not verified / known gaps:**

- The reordered controls are installed on the physical iPhone but still need the user's visual and
  interaction confirmation in both orientations.
- The shared working tree remains intentionally uncommitted with the broader V1 review, waveform,
  Settings, documentation, and performance work described by the preceding handover.

**Next agent should:**

- Confirm the portrait/landscape ordering and speed chooser placement with safe areas on the newly
  installed physical build before the next combined commit.

### 2026-10-31 — Review V1, clean the repository, and define the Pro waveform boundary

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** V1 product/repository review and waveform monetisation boundary → Done

**Changed:**

- Audited V1 against implemented code and active acceptance work. The core local
  annotation/rehearsal workflow is implemented; performance, representative-song BPM evidence,
  physical-device acceptance, Apple credentials, and TestFlight remain the release gates.
- Kept one useful local automatic-BPM suggestion in Lite and reserved advanced tempo intelligence
  for V2 Pro. Added Apple Music as a V2 feasibility candidate and explicitly blocked commercial
  Spotify streaming under its current published developer policy.
- Added `waveform.display` as a Pro capability plus a persisted, off-by-default setting. Wrapped and
  detail canvases and the overview strip now skip waveform extraction and use solid timing/progress
  bars while artwork is off; all core interactions remain available.
- Removed six unreachable source/style files, three unused direct icon dependencies, two stale debug
  logs, ignored `.DS_Store` files, placeholder repository metadata, and stale product documentation.
- Regenerated the ignored iOS codegen/Pods state, produced a locally signed Release bundle from the
  uncommitted working tree, and installed/launched it on the physical iPhone 15 Pro Max.
- Reordered Settings into Basic and Advanced groups on phone and desktop. Basic begins with the
  waveform toggle and annotation naming; Advanced contains BPM, anchor, dance counts, and count
  size. Off toggles now use an opaque dark track and white thumb for legibility.
- Replaced the toggle's separate state-driven colour and position animations with one shared
  progress value, so the track colour and thumb movement remain synchronized through both states.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, version consistency, and dependency-tree checks passed.
- Full retained Playwright gate passed 8/8, including the off-by-default solid bars and enabling the
  Pro preview waveform toggle.
- Jest reported no permanent unit tests, as expected. No native implementation changed; the retained
  iOS journey was updated to enable waveform artwork before asserting native decoded peaks.
- Release `xcodebuild` succeeded, `devicectl` installed `com.beatnote.app`, launch succeeded, and
  process PID 84021 was observed on iPhone `gæl (3)` / iOS 27.0.1. The 2.0 GB temporary DerivedData
  directory was removed after installation.
- The reordered Settings web journey and full retained Playwright gate passed 8/8. A second signed
  Release build was installed and launched on the same phone; its 1.9 GB temporary DerivedData and
  Playwright artifacts were removed.
- The toggle animation change passed TypeScript and the full retained Playwright gate 8/8. An
  initial unrelated landscape playback-speed positioning flake passed focused and on the full
  rerun. A third signed Release build was installed and launched on the same physical iPhone.

**Not verified / known gaps:**

- The updated iOS XCTest journey was not run. The build is installed and running physically, but the
  synchronized toggle transition still needs the user's visual confirmation. Purchase enforcement
  remains deliberately deferred to V2.
- The working tree is intentionally uncommitted; the user's active performance measurements and
  acceptance work remain the next release priority.

**Next agent should:**

- Confirm the synchronized Settings toggle transition on the installed phone, then continue the
  thermally valid Nominal run without mixing waveform-off Lite evidence with waveform-on O-3.

### 2026-10-31 — Stabilise and physically accept the first waveform optimisations

**Agent:** orchestrator (Codex + Kiro + DSH-Qwen) · **Commit(s):** this commit
**Kanban moved:** none; `app-performance-optimization` tasks 7 and 7.1 remain In Progress pending thermally valid after-rows

**Changed:**

- Wrapped rows and the overview now keep waveform/marker/loop artwork static, reveal a fixed
  played-colour copy with `ClipReveal`, and move the playhead with a transform. Scrub writes publish
  at most once per frame and flush on release.
- Tap seeks are latest-wins and lifecycle-safe. Scrub completion shares the seek drain; native
  pre-seek clock/status events cannot flash the waveform backwards or toggle the transport icon.
- Played waveform layers are pre-mounted for the fitted mobile rows, avoiding SVG-tree creation on
  large jumps. Ordinary Play no longer performs a redundant seek before starting audio.
- The profiling/testing docs now require temporary-artifact cleanup and record the preliminary
  after-trace plus the physical functional evidence.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and the full retained Playwright gate → passed (8/8).
- Earlier focused iPhone 17 Pro simulator journeys for landscape gestures and audio annotation /
  restore passed; DSH-Qwen review `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f` found the seek
  lifecycle/race hazards that were repaired before the final build.
- Signed Release-local build installed on iPhone 15 Pro Max / iOS 27.0.1. The user confirmed correct
  tint/playhead alignment, continuous cross-row scrub, final-target rapid seeks with audible resume,
  noticeably faster large jumps, no play-icon or waveform flicker, and prompt play/pause response.
- Serious-thermal diagnostic scrub trace: 198.38 ms/s, p90 100.02 ms, max 150.03 ms, improving the
  respective baseline metrics 71.8%, 14.3%, and 60.9%; invalid for keep/revert until Nominal repeat.
- Deleted every raw trace/export, `ios/build`, `/private/tmp/beatnote-release-dd`, Playwright report,
  and test-results directory after extracting results; no temporary build/trace cache was retained.

**Not verified / known gaps:**

- Repeat continuous scrub, steady playback, rapid taps, and paced seeks at Nominal thermal state;
  Requirement 10.4 keep/revert decisions remain open. The phone was deliberately left to cool.
- VoiceOver row values, gated counter totals, and repeated latency/memory/energy/contention evidence
  remain open. The view-level ablation was skipped at the user's direction.

**Next agent should:**

- Once the phone is Nominal, repeat the coordinated continuous-scrub Animation Hitches capture on
  the installed Release build, then record the valid after-row before deciding keep/revert.

### 2026-10-30 — Complete the required frame/hitch baseline set

**Agent:** orchestrator (Codex) · **Commit(s):** measured `ab697b7`; see `git log` (`docs: complete physical hitch baselines`)
**Kanban moved:** `app-performance-optimization` task 3.2 → Done; Phase 1 remains In Progress

**Changed:**

- Built and installed a Release-local bundle with `EXPO_PUBLIC_BEATNOTE_PERF=1`; its physical
  `seek.scrub` signpost confirms the native profiling bridge is active.
- Completed the remaining Music Library sheet and annotation/software-keyboard Animation Hitches
  scenarios and registered both results in the performance spec.
- At the user's request, deleted all raw BeatNote trace bundles, exported tables/logs, four Xcode
  DerivedData trees, and the temporary restored-documents folder after recording the summaries.

**Verified:**

- Five sheet open/settle/backdrop-dismiss cycles: one 16.670 ms hitch over 26.058 seconds
  (0.64 ms/s), passing at Nominal thermal state.
- Three annotation open/type/save cycles: seven hitches, 533.451 ms total over 36.240 seconds
  (14.72 ms/s), p50 16.670 ms, p90/max 233.385 ms, failing at Nominal thermal state.
- Cleanup increased internal free space from 104 MiB before trace relocation to 51 GiB after all
  BeatNote temporary artifacts were removed; the ignored raw-trace archive is gone.

**Not verified / known gaps:**

- Release-local exposes the diagnostic global only through a DevTools console that was not
  available in this run, so render/path/gesture counter totals still require Debug+Metro.
- The keyboard failure still needs a layout-focused trace before O-10 is authorised. Raw traces are
  intentionally unavailable after the user's cleanup request; only the registered metrics remain.

**Next agent should:**

- Run the Debug+Metro counter/React-profiler scenario, then capture a layout-focused annotation
  keyboard trace before choosing between O-3 and O-10.

### 2026-10-30 — Isolate scrub cost to native SVG drawing

**Agent:** orchestrator (Codex) · **Commit(s):** measured `7037118`
**Kanban moved:** none; `app-performance-optimization` Phase 1 remains In Progress

**Changed:**

- Captured a coordinated physical Time Profiler trace with Points of Interest requested, exported
  the 21 MB referenced sample table, and compared the active scrub burst with immediate recovery.
- Revised H-3: wrapped JS path generation is memoized, but static peaks/progress/markers/playhead
  share one SVG, so dynamic updates drive expensive native CoreGraphics redraws.
- Promoted O-3 to the first evidence-backed candidate after Phase 1; no optimisation was applied.

**Verified:**

- In the aligned 11-second scrub window, BeatNote used 10,847 ms of running samples: main thread
  9,799 ms (90.3%), CoreGraphics-inclusive 9,564 ms (88.2%), JS thread 857 ms (7.9%).
- The following 3.293 seconds remained at 1.09 average cores and were still CoreGraphics-dominant,
  matching the post-release hitch tail. Thermal state remained Nominal.
- Trace `/private/tmp/beatnote-s-medium-50-scrub-time-profiler.trace` contains BeatNote PID 66779
  and ran 31.293264 seconds.

**Not verified / known gaps:**

- The deployed `7037118` Release bundle emitted no BeatNote Points of Interest or fallback logs;
  its instrumentation flag was not on/observable, so render/path counter totals remain open.
- Library-sheet and annotation/keyboard hitch baselines, React commit counts, memory, energy,
  contention, Allocations, and Leaks remain open; Phase 2 must not start yet.

**Next agent should:**

- Deploy an internal Release bundle with `EXPO_PUBLIC_BEATNOTE_PERF=1`, capture the scrub counter
  snapshot, then complete the Library-sheet and annotation/keyboard hitch baselines.

<!-- end handover log -->
