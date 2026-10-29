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

**Last updated:** 2026-10-29
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
| E2E spec files | 2 (Playwright, 7 critical journeys) |
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Retest whole-track Repeat and shuffled end-of-track advancement on the physical iPhone; Control
   Centre play/pause, timeline seek, and ±10-second skip now pass alongside queue switching, rename,
   annotation, loop, dock, and portrait/landscape geometry in the current Debug/Metro device pass.
2. Finish `automatic-bpm-detection` runtime acceptance: browser long-task/long-song measurements
   and representative real-song/physical-device evidence remain. Native cancellation/retry,
   150-second peak memory, synthetic accuracy, and all ten retained simulator journeys pass;
   downbeat estimation remains deliberately open.
3. Complete `local-music-library-queue` physical-device acceptance (Task 44.4): every reported
   iPhone 15 Pro Max / iOS 27.0.1 case passes except importing a file over 100 MB, for which no
   suitable fixture was available.
4. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
5. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
6. Keep the completed local choreography workflow stable while physical-device acceptance and the
   Apple Developer account remain outstanding; do not resume stem separation until the gates in
   `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Reviewed native runtime-test options in `session-4c09729c-9534-4122-a787-b1af8277f26a`; the orchestrator retained end-to-end XCTest because the Expo Module definition is not a typed direct-call test API |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Execute `app-performance-optimization` Phase 0–1: fixtures, instrumentation, and physical
      Release-local baselines before any optimisation (spec drafted 2026-10-29, awaiting review)
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Stabilise and polish the physical-iPhone workflow: Control Centre/Now Playing, atomic song
      transitions, and coalesced rapid speed changes are implemented and locally verified; physical
      Repeat/Shuffle end-of-track behavior, audible switching, and Release-build latency remain open
- [ ] Complete `automatic-bpm-detection` runtime acceptance; web provider, shared decode/worker,
      lifecycle/cache, suggestion preview/apply/restore, manual anchor/count controls, persistence,
      exports, retained browser flow, octave-resolved native synthetic XCTest, cancellation/retry,
      and 150-second simulator memory are implemented; browser measurements, real-song accuracy,
      and physical acceptance remain
- [ ] Complete `local-music-library-queue` physical-device acceptance (Task 44.4); implementation,
      temporary durability/property checks, all seven browser journeys, the isolated ten-case native
      suite, simulator rotation, and all reported physical cases pass; only a >100 MB import remains
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Complete simulator runtime automation for automatic BPM cancellation and 150-second memory,
      and keep the iOS project sheet mounted across Files picker callbacks
      <sub>**Key Artifacts:** `.kiro/specs/automatic-bpm-detection/tasks.md`, `modules/beatnote-tempo/ios/BeatNoteTempoModule.swift`, `scripts/ios-ui-test.js`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Pass physical-iPhone acceptance for `playback-marker-control-dock` and `loop-range-overview`
      (VoiceOver deliberately skipped) and archive both specs
      <sub>**Key Artifacts:** `docs/context/archive/specs/playback-marker-control-dock/`, `docs/context/archive/specs/loop-range-overview/`, `AGENTS.md`</sub>

- [x] Adopt the BeatNote app icon across icon, adaptive icon, splash, and favicon
      <sub>**Key Artifacts:** `app.json`, `assets/beatnote-icon-source.svg`, `assets/beatnote-icon.svg`, `assets/beatnote-icon-shield.svg`, `assets/beatnote-mark.svg`, `.kiro/steering/ios-testflight.md`, `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`, `assets/favicon.png`</sub>

- [x] Retire the legacy `beatnote_projects` writers, reconcile the `local-music-library-queue` task list, and archive the completed `wrapped-waveform-canvas` spec
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `docs/context/archive/specs/wrapped-waveform-canvas/`, `src/utils/projectManager.ts`</sub>

- [x] Add bounded 0.05× decrement/increment buttons beside an inset playback-speed slider with 44×44
      targets, clear endpoint separation, accessible states, repeated-step dwell, and responsive coverage
      <sub>**Key Artifacts:** `docs/context/archive/specs/playback-marker-control-dock/requirements.md`, `docs/context/archive/specs/playback-marker-control-dock/tasks.md`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-10-29 — Fix Repeat and shuffled track completion

**Agent:** orchestrator (Codex) · **Commit(s):** `e785a85`
**Kanban moved:** physical-iPhone playback polish → In Progress (implementation verified locally; hardware retest pending)

**Changed:**

- Moved whole-track completion onto Expo Audio's native `didJustFinish` signal so iOS cannot clear
  the playing state and tear down the polling effect before Repeat seeks to zero.
- Added guarded shuffled completion: Repeat takes precedence; otherwise Shuffle switches to the next
  entry in its randomized order and continues playback. Stale or repeated completion callbacks
  during source replacement are ignored.
- Updated the approved queue contract and recorded the physical library acceptance report: every
  Task 44.4 case passes on iPhone 15 Pro Max / iOS 27.0.1 except the unavailable >100 MB fixture.

**Verified:**

- Focused retained completion journey → Repeat restarted the same title near zero and Shuffle moved
  to another queued title; the pre-existing dock journey passed after the stale-event guard.
- `npx tsc --noEmit`, empty permanent unit gate, version consistency, `git diff --check`, and the
  full retained Playwright gate → passed, now 8/8 journeys.
- Markdown lint and the orchestrator contract checker → passed; the updated bundle launched on the
  connected physical iPhone through the active wired Metro server.

**Not verified / known gaps:**

- Physical Repeat and shuffled natural completion still need the user's hands-on confirmation.
- The >100 MB import remains the sole open Task 44.4 case. VoiceOver remains deliberately deferred
  by the product owner, and Debug/Metro performance is not Release evidence.

**Next agent should:**

- Ask the user to let one short track complete with Repeat on, then with Repeat off and Shuffle on;
  after both pass, source or generate a >100 MB audio fixture to close Task 44.4.

### 2026-10-29 — Complete native BPM runtime automation

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `b12b240`, `3ce9025`
**Kanban moved:** automatic-BPM simulator runtime automation → Done; hardware/browser acceptance remains In Progress

**Changed:**

- Added an explicit accessible cancel/retry state and a DEBUG-only cancellable delay so the retained
  UI journey proves a cancelled native request releases the single-flight queue without changing BPM
  or anchor state.
- Added a measured 150-second native journey with distinct warm-up/measured fixtures and bounded
  XCTest memory/clock metrics; hardened the Files fixture picker as the retained suite grew to ten.
- Kept the iOS project page sheet mounted while CSV/relink document pickers resolve, repaired stale
  launch/export/landscape assertions, and dismissed the share sheet so XCTest finalizes cleanly.
- Retained the concurrent Now Playing cleanup fix that avoids clearing controls on an already
  released Expo Audio shared object.

**Verified:**

- Native cancellation/retry → passed; cancellation exposed an explicit no-change state and retry
  produced a suggestion before the injected ten-second delay could expire.
- 150-second fixture → suggestion in 9.414 seconds at 261,950.992 kB peak physical app memory
  (about 255.8 MiB); a repeat measured 252,726.752 kB in 9.430 seconds.
- All ten retained native cases have passing focused result bundles, including CSV/share,
  background playback, landscape controls, and Open In. Full retained Playwright gate → 7/7.
- `npx tsc --noEmit`, JavaScript syntax, Swift parse, and `git diff --check` → passed.

**Not verified / known gaps:**

- Browser long-task/long-song/import-latency measurements, representative real-song accuracy,
  physical-device heat/battery/background/Bluetooth behavior, and downbeat estimation remain open.
- Now Playing cleanup has static/browser evidence only; the current Control Centre and physical
  command/state retest remains the top hardware task.

**Next agent should:**

- Collect the browser performance measurements, then run representative real-song BPM and playback
  coexistence acceptance on the physical iPhone.

### 2026-10-29 — Wire Control Centre and smooth native track changes

**Agent:** orchestrator (Codex) · **Commit(s):** `0987b7a`
**Kanban moved:** physical-iPhone playback polish → In Progress (implementation verified locally; hardware retest pending)

**Changed:**

- Registered the loaded Expo Audio player with iOS Now Playing, published the library display title,
  and mirrored remote play/pause/seek status into BeatNote's playback state.
- Kept the previous waveform mounted beneath a destination-labelled loading veil during an atomic
  track switch, blocked conflicting canvas/dock input, and faded in the committed song while
  respecting Reduce Motion.
- Debounced native playback-rate reconfiguration while audio is playing so a burst of speed-button
  taps applies only the final value instead of repeatedly interrupting the engine.

**Verified:**

- Human physical-iPhone feedback confirmed queue audio, title, waveform, markers, and most-recent
  project all switch to the correct song; the abrupt presentation motivated the transition polish.
- `npx tsc --noEmit`, `git diff --check`, the focused phone-dock journey, and the full retained
  Playwright gate (7/7) passed. The journey proves the loading veil appears and six rapid speed
  increments produce one native playback-rate assignment.

**Not verified / known gaps:**

- Control Centre visibility/metadata, remote play/pause/seek synchronization, audible rapid-speed
  behavior, and transition comfort still require the connected physical iPhone.
- Debug/Metro landscape latency is not Release/TestFlight performance evidence; VoiceOver remains
  deliberately deferred by the product owner.

**Next agent should:**

- Relaunch the current bundle on the iPhone, play a local song, and verify Control Centre metadata,
  remote commands, the switch veil, and uninterrupted rapid speed stepping.

### 2026-10-29 — Pass physical acceptance for control dock and loop range; archive both specs

**Agent:** orchestrator (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** `playback-marker-control-dock` and `loop-range-overview` physical acceptance → Done

**Changed:**

- `playback-marker-control-dock` and `loop-range-overview` `tasks.md`: ticked the final regression
  and physical-device acceptance tasks (27, 27.2, 25, 25.2) on the human's report that the
  physical-iPhone QA passed, with a note that VoiceOver was skipped.
- Moved both specs to `docs/context/archive/specs/`.
- Rotated the 2026-10-29 physical iOS 27 launch entry into the history archive.

**Verified:**

- Human reported physical-iPhone QA complete and passing for both features. No open checkbox
  remains in either archived `tasks.md`.

**Not verified / known gaps:**

- VoiceOver announcements and adjustment for the tri-state inner-loop value, reserved controls, and
  loop handles were deliberately skipped by the product owner and remain unverified.
- Specific physical results (frame rate, contrast, boundary audibility) were reported verbally and
  are not recorded as measurements.
- Historical log entries still cite the old `.kiro/specs/` paths for these two specs.

**Next agent should:**

- Continue the remaining physical acceptance: Task 44.4 (library queue), BPM runtime evidence, and
  audio/background/share checks.

### 2026-10-29 — Adopt the BeatNote app icon

**Agent:** orchestrator (Kiro) · **Commit(s):** see `git log` (`feat: adopt BeatNote app icon`)
**Kanban moved:** app icon and splash artwork → Done

**Changed:**

- Renamed the Recraft export to `assets/beatnote-icon-source.svg` (untouched original); derived a
  clean full-bleed `beatnote-icon.svg` (no rounded corners, no C2PA metadata), a transparent
  `beatnote-mark.svg`, and an alternate `beatnote-icon-shield.svg` using the in-app marker shield.
- Centred the artwork optically: group scaled to 92% and lifted 12 px. The bars carry the mass
  below the bounding-box centre, so moving down would have looked bottom-heavy.
- Regenerated `icon.png`, `adaptive-icon.png` (mark at 68%, inside the Android safe zone),
  `splash-icon.png` (mark at 70%), and a 48-px `favicon.png`.
- `app.json`: splash and Android adaptive-icon backgrounds changed from `#000000` to `#1E1C1D`.
- `.kiro/steering/ios-testflight.md`: documented the brand-asset pipeline.

**Verified:**

- Viewed `icon.png` (final) plus diamond/shield renders at 400, 120, 60, and 29 px; the diamond
  was kept for its cleaner silhouette. Earlier renders of the adaptive and splash PNGs looked right.

**Not verified / known gaps:**

- No iOS or Android rebuild; the icon is not yet seen on a device or simulator home screen.
- The final `adaptive-icon.png`, `splash-icon.png`, and `favicon.png` were not re-inspected after
  the centring change; 18–29 px legibility is a dot at best.
- The shield alternate was compared but not shipped; the final choice is the product owner's.

**Next agent should:**

- Run `npx expo prebuild -p ios` and check the icon and splash on a simulator.

<!-- end handover log -->
