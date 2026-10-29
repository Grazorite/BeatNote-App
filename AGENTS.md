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
| iOS UI tests | 8 critical native integrations retained; focused V1 launch/settings, Open_In, and native BPM checks pass |
| E2E spec files | 2 (Playwright, 7 critical journeys) |
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Retest iOS Now Playing/Control Centre play-pause-seek, the atomic song-switch veil, and rapid
   playback-speed stepping on the physical iPhone; queue switching, rename, annotation, loop, dock,
   and portrait/landscape geometry have passed the current Debug/Metro device pass.
2. Finish `automatic-bpm-detection` runtime acceptance: native cancellation latency, 150-second
   peak memory, browser long-task/long-song measurements, and representative real-song/physical-
   device evidence. Web production wiring, synthetic native accuracy, and Phases 2–7 are
   implemented; downbeat estimation remains deliberately open.
3. Complete `local-music-library-queue` physical-device acceptance (Task 44.4): Files and
   third-party Open_In, the provisional in-place-opening decision, backup/restore and relink,
   near-full storage, interruptions, force-quit flushing, VoiceOver, large text, and rapid queue use.
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
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Drafted the Phase 4.1 detector/test in `session-7adcd112-5f2d-43cf-9763-4af6440a1441`; the turn exhausted its token limit, then the orchestrator reviewed and repaired the implementation |
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
      command/state synchronization, audible switching, and Release-build latency remain open
- [ ] Complete `automatic-bpm-detection` runtime acceptance; web provider, shared decode/worker,
      lifecycle/cache, suggestion preview/apply/restore, manual anchor/count controls, persistence,
      exports, retained browser flow, and octave-resolved native synthetic XCTest are implemented;
      measured long-song memory/cancellation, real-song accuracy, and physical acceptance remain
- [ ] Complete `local-music-library-queue` physical-device acceptance (Task 44.4); implementation,
      temporary durability/property checks, all six browser journeys, the isolated seven-case native
      suite, simulator rotation, and maximum Dynamic Type review are complete
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

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

- [x] Restore physical-iPhone launch under the iOS 27 SDK with a reproducible UIKit scene-lifecycle
      bridge while preserving Expo's launch bootstrap and local dev-client URL delivery
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `app.json`, `plugins/withIosSceneLifecycle.js`</sub>

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

### 2026-10-29 — Close out library-queue spec bookkeeping and archive wrapped-waveform-canvas

**Agent:** orchestrator subagent (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** `local-music-library-queue` Task 13.4 and spec bookkeeping → Done (only physical acceptance 1.2/44.4 remains in In Progress)

**Changed:**

- `src/utils/projectManager.ts`: removed the legacy whole-value writers `setStoredProjects`,
  `saveProject`, `deleteProject`, and `renameProject`, so nothing writes `beatnote_projects`. The
  read-only accessors, `withProjectDefaults`, `normalizePersistedLoop`, and `compareProjectVersion`
  remain.
- `.kiro/specs/local-music-library-queue/tasks.md`: reconciled against the audit by ticking 13.4,
  14.1, 13, 14, 15, 3, 7, and 10, marking the 28 optional `*` test tasks as dropped per the testing
  strategy, and correcting task 44.1 to seven Playwright journeys and ten XCTest cases.
- `wrapped-waveform-canvas` now lives in `docs/context/archive/specs/` (staged `git mv`).
- Rotated the 2026-10-28 automatic-BPM entry verbatim into
  `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- Repo-wide search found no caller of the removed writers; `ProjectManager` has no importer and
  `compareProjectVersion` is the only export used elsewhere.
- `npx tsc --noEmit` → passed. `PLAYWRIGHT_PORT=8082 npm test` → 7/7 journeys passed.
- Search for `beatnote_projects` in `src/`, `tests/`, and `modules/` → only the read-path constants
  in `repositories.ts` and `projectManager.ts`, plus a test fixture seeding the legacy key.
- `mdlint.py` on `tasks.md` → clean.

**Not verified / known gaps:**

- Physical-device acceptance (Tasks 1.2 and 44.4) is still open, so tasks 1, 2, 44, and 44.4
  remain unticked and the `LSSupportsOpeningDocumentsInPlace` decision is still provisional.
- Historical entries in `docs/context/archive/beatnote-project-history.md` still cite the old
  `.kiro/specs/wrapped-waveform-canvas` path; they were left verbatim.
- iOS XCTest was not rerun; the change touches only JavaScript legacy-storage code.

**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `docs/context/archive/specs/wrapped-waveform-canvas/`, `src/utils/projectManager.ts`

**Next agent should:**

- Run the Task 44.4 physical-device matrix (Files and third-party Open In, backup/restore and
  relink, near-full storage, interruptions, VoiceOver); then close the spec.

### 2026-10-29 — Stabilise physical-iPhone editing and playback rendering

**Agent:** orchestrator (Codex) · **Commit(s):** `ec4d9c1`, `46bacc7`, `28dcbb9`, `6299b66`, `4f1b4da`
**Kanban moved:** physical-iPhone crash, latency, and layout polish → In Progress (implementation verified locally; hardware retest pending)

**Changed:**

- Deferred annotation and library-rename store publication until their native iOS modals fully
  dismiss, and removed the redundant whole-studio keyboard-avoidance layout mutation implicated by
  three physical-device Fabric/Yoga ownership assertion crashes.
- Reduced playback-driven React work to the active wrapped row, playhead overlay, and time probe;
  made viewport following imperative, memoized row gestures, slowed visual sampling to 10 Hz, and
  stopped audio-status events from re-rendering the complete studio tree.
- Aligned the portrait/landscape toolbar with the waveform and control rail, restored bottom rail
  breathing room without shrinking touch targets, and moved the Import Audio arrow inward.
- Retained browser coverage for annotation persistence, rename/rename-back, toolbar geometry, dock
  clearance, and icon geometry; the concurrent speed-step implementation was included so its
  already-added retained assertions remain self-contained at this commit.
- Kept one stable mobile body/waveform tree across rotation so decoded peaks are no longer discarded
  and replaced by placeholder lines while the landscape hierarchy remounts; waveform sizing now
  follows one batched measured-layout update instead of transient screen dimensions.
- Moved loop drag/resize previews out of the global project store, coalesced them to animation
  frames, and commit the valid range once on release so wrapped-row geometry and persistence do not
  rebuild for every finger-move event.
- Suppressed only React playhead/time publication while a loop gesture is active so audio playback
  and loop-boundary decisions continue without competing SVG renders, then catch up on release.
- Measure the outer landscape rail and assign explicit equal heights to all ordinary control rows,
  with Play exactly twice that height and vertically centred; retained coverage now requires all
  twelve ordinary controls to match within one pixel.
- Corrected the playback-visual suppression boundary from touch-down to activated pan, so pressing
  and holding a loop range without moving no longer freezes the playhead.

**Verified:**

- Three iPhone crash reports symbolicated to the same
  `YogaLayoutableShadowNode::layout` owner assertion during modal/text-input tree changes.
- `npx tsc --noEmit`, version consistency, empty permanent unit gate, and `git diff --check` → passed.
- Full retained Playwright gate → 7/7 journeys passed after the final audio-status optimization.
- Physical iPhone 15 Pro Max → song rename completed without exit; marker annotation saved and
  reopened with its text intact. No new BeatNote crash report was produced afterward.
- A later reopen failure was traced to Metro no longer listening on port 8081, not an app crash;
  Metro was restarted, the wired payload was relaunched, 1,478 modules bundled, and both the app
  process and packager were confirmed live.
- Physical follow-up found ordinary waveform and transport response improved, while loop dragging
  and rotation still exposed lag; the follow-up implementation passed the two focused responsive
  journeys and the full retained Playwright gate (7/7), then bundled and launched on the iPhone.
- A second physical follow-up confirmed loop management was substantially better but still lagged
  during playback and showed over-tall landscape marker rows. The final focused journeys and full
  retained Playwright gate passed again (7/7); device relaunch was deferred because iOS reported the
  connected phone locked.
- Long-press regression coverage now plays audio while holding a stationary loop range and requires
  the time probe to continue advancing. Landscape coverage also requires Play to stay within
  1.9–2.1× ordinary height and share the rail's vertical centre. Both focused journeys passed, and
  the corrected bundle was relaunched successfully on the physical iPhone.
- The follow-up exact-height implementation passed the focused phone-dock journey, TypeScript,
  `git diff --check`, and the full retained Playwright gate (7/7); physical inspection remains open.

**Not verified / known gaps:**

- Physical input-to-visual latency and final portrait/landscape comfort still require hands-on
  confirmation. Debug/Metro latency must not be treated as Release/TestFlight performance evidence.
- Broader Instruments/Hermes profiling, long-song memory evidence, and RN/Expo upgrade evaluation
  remain suitable for a dedicated performance specification rather than speculative V1 rewrites.
- The shared tree still contains unrelated uncommitted BPM/native-test, agent-state, and app-icon
  work; the listed commits isolate the completed physical-iPhone changes from that concurrent state.

**Next agent should:**

- Retest stationary loop holds, loop editing during playback, and the exact 1:2 centred landscape
  rail geometry; then collect Release/TestFlight evidence separately from Metro overhead.

<!-- end handover log -->
