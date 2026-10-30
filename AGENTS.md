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
   seek sample passes its instrumented completion target, while the required continuous cross-row
   scrub fails at 703.49 ms/s hitch time and untouched playback passes at 1.94 ms/s. Scrub-profiler
   evidence now isolates the failure to main-thread CoreGraphics work. The Music Library sheet
   passes at 0.64 ms/s, while annotation editing with the keyboard fails at 14.72 ms/s; the flag-on
   physical scrub signpost is verified. Gated counter totals and repeated latency/memory/energy/
   contention baselines remain.
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
      paced seek and all four required frame/hitch scenarios are registered, scrub-profiler evidence
      identifies CoreGraphics saturation, and keyboard editing fails its target; counters plus
      repeated latency/memory/energy and contention baselines remain pending
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

- [x] Make wrapped-waveform scrubbing continuous across rows: one container-level horizontal-first
      scrub that follows the finger between rows and auto-continues from the trailing edge or gutter
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/utils/timelineMapping.ts`</sub>

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

### 2026-10-30 — Pass the steady-playback hitch baseline

**Agent:** orchestrator (Codex) · **Commit(s):** measured `7037118`
**Kanban moved:** none; `app-performance-optimization` Task 3.2 remains In Progress

**Changed:**

- Captured a clearly cued 65-second Animation Hitches run with S-medium/50 playing untouched and
  evaluated the final 60 seconds as the steady-playback baseline.
- Registered the passing result and narrowed the severe prior tail to scrub/recovery behavior rather
  than ordinary playhead playback.

**Verified:**

- Four BeatNote hitches totalled 116.692 ms over 60 seconds: 1.94 ms/s, p50/p90/max 33.34 ms.
  This passes the < 5 ms/s ratio and < 50 ms single-hitch targets at Nominal thermal state.
- Trace `/private/tmp/beatnote-s-medium-50-steady-playback.trace` contains BeatNote PID 66779 and
  ran 66.146213 seconds; the final 60 seconds were measured.
- The repository remained clean at measured commit `7037118`; no product code changed.

**Not verified / known gaps:**

- The scrub hot path and post-release recovery still lack Time Profiler and render/path evidence.
- Library-sheet and annotation/keyboard hitch baselines remain open, as do the other Phase 1
  latency, memory, energy, contention, and render scenarios.

**Next agent should:**

- Capture the continuous cross-row scrub in Time Profiler with the existing signposts/counters,
  then inspect the dominant JS/main-thread stacks before proposing any optimisation.

### 2026-10-30 — Capture the continuous cross-row scrub baseline

**Agent:** orchestrator (Codex) · **Commit(s):** measured `7037118`
**Kanban moved:** none; `app-performance-optimization` Task 3.2 remains In Progress

**Changed:**

- Rejected the pre-fix and interrupted scrub traces, then captured a clearly cued 30-second
  Animation Hitches run against Kiro's deployed cross-row scrub fix.
- Registered the first required continuous-scrub hitch result and updated the findings without
  attributing the failure to an unprofiled React, path, Fabric, or render-server cause.

**Verified:**

- The aligned ten-second scrub window contains 152 BeatNote hitches totalling 7,034.902 ms:
  703.49 ms/s, p50 16.67 ms, p90 116.69 ms, and max 383.42 ms. The < 10 ms/s target fails.
- Trace `/private/tmp/beatnote-s-medium-50-continuous-scrub-v4.trace` contains BeatNote PID 66779,
  ran 31.244636 seconds, and remained in the Nominal thermal state.
- The repository was clean at measurement commit `7037118`; no product code changed in this step.

**Not verified / known gaps:**

- Hitch activity continued after the instructed release, so a separate steady-playback trace must
  distinguish ordinary playhead cost from scrub-specific work.
- Time Profiler/render/path evidence and the Library-sheet and annotation/keyboard hitch scenarios
  remain open; this result does not authorise an optimisation by itself.

**Next agent should:**

- Capture 60 seconds of steady Release-local playback in Animation Hitches, then profile the scrub
  path with Time Profiler plus the existing render/path counters.

### 2026-10-30 — Scrub continuously across wrapped waveform rows

**Agent:** orchestrator (Kiro) · **Commit(s):** see `git log` (`fix: scrub continuously across wrapped waveform rows`)
**Kanban moved:** cross-row wrapped-waveform scrubbing → Done

**Changed:**

- `WrappedWaveform.tsx`: replaced the per-row pan gestures with one stable container-level pan.
  It keeps horizontal-first activation (`activeOffsetX ±6`, `failOffsetY ±12`), maps container
  y to a row and x to time within that row, and auto-advances about one row per 1.5 s while the
  finger holds in the trailing 20 px edge zone or over the leading gutter.
- `WrappedRow.tsx`: rows retain only the tap/marker-selection gesture; scrub props and store
  writes moved to the container. `timelineMapping.ts` gained `scrubPointerToTimestamp`.
- Project-overview steering documents the cross-row scrub rule. The previously staged deletion of
  three `.kiro/hooks/` files is included at the user's request.

**Verified:**

- `npx tsc --noEmit` → passed. Temporary Playwright checks (hold at row end reaches row 1;
  drag down after activation lands under the finger in row 3) → passed, then deleted.
- Full retained Playwright gate → 8/8 passed.
- Signed Release-local build with the embedded bundle installed on the iPhone 15 Pro Max; the user
  confirmed cross-row following and edge continuation work on the physical phone.

**Not verified / known gaps:**

- The earlier failed physical retests were caused by a stale on-device bundle: no Metro server was
  running and the dev client never fetched new JavaScript over Wi-Fi or the wired link-local
  address. That connectivity problem is unresolved; a Release rebuild was used instead.
- Desktop/web virtualised rows inside the ScrollView were checked only through the retained
  browser gate; scrubbing that scrolls rows out of the rendered window is not exercised.
- Edge-zone width and auto-advance rate are first values; VoiceOver and landscape comfort were not
  separately assessed.

**Next agent should:**

- Resume `app-performance-optimization` task 4.4 (rapid wrapped-seek IVL breakdown) on a
  Release-local build, and diagnose why the dev client cannot reach local Metro before relying on it.

<!-- end handover log -->
