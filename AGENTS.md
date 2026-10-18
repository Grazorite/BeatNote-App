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
| Architecture decisions (ADR-001…010), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
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

**Last updated:** 2026-10-18
**Branch:** `master` · **Deploy:** Web (Netlify) · local iOS simulator verified · TestFlight pending
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
| iOS UI tests | 6 critical native integrations retained; focused V1 launch/settings check passes |
| E2E spec files | 2 (Playwright, 6 critical journeys) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   and landscape gestures/geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
4. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
5. Advance 8-count/rehearsal features and provider-neutral monetisation groundwork; do not resume
   stem separation until the gates in `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (sub-agent) | Codebase investigation before edits | Dispatch before touching unfamiliar paths |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Implement `local-music-library-queue` from its approved phased spec; Phase 0 and the pure
      Phase 1 foundations through CSV replace and migration planning are complete, with the
      persistence pipeline next
- [ ] Complete `playback-marker-control-dock` physical acceptance — implementation, simulator visual
      review, focused native checks, and web/unit gates pass; VoiceOver and real-device touch/keyboard
      comfort remain
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle
- [ ] Complete loop-range overview physical-device acceptance — implementation and retained critical
      browser/native flows pass; physical performance, VoiceOver, contrast, and audible-boundary checks remain

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Add reusable CSV preview/replace/undo and legacy migration planning transforms, and enforce
      version 1.0.0 parity across package metadata, Expo/Metro, and generated iOS development builds
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `.kiro/steering/ios-testflight.md`, `app.json`, `package.json`, `plugins/withVersionConsistency.js`, `scripts/check-version-consistency.js`, `src/utils/csvReplace.ts`, `src/utils/importEngine.ts`, `src/utils/migrationPlan.ts`</sub>

- [x] Stabilise direct playback-speed dragging, replace abrupt popup removal with an interruptible
      collapse/fade, remove redundant speed feedback, and keep loaded-song Annotation actionable
      with marker-prerequisite guidance
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Implement pitch-preserved playback speed from 0.5×–2× in 0.05× increments, with an adjustable
      popup slider, common presets, reset, project persistence, and responsive accessibility
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `.kiro/steering/architecture-decisions.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/ios-testflight.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/playbackSpeedControl.ts`, `src/types/project.ts`, `src/utils/playbackSpeed.ts`, `src/utils/projectManager.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Replace the Settings sliders glyph with a simple rounded gear in the shared icon family
      <sub>**Key Artifacts:** `src/components/icons/BeatNoteIcon.tsx`</sub>

- [x] Replace mobile Settings and Help with safe full-screen pages, make Help swap in immediately
      without stacking a modal, place Settings at the trailing toolbar edge, use iPhone-style
      right-edge push transitions over the live app without a white host flash, keep Settings Close
      free of back-navigation decoration, remove V1 BPM controls, make CSV action text readable on
      orange, and retain only critical tests
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/testing-strategy.md`, `package.json`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/styles/components/modals/exportModal.ts`, `src/styles/components/screens/helpScreen.ts`, `src/styles/layout/sidebar.ts`, `src/styles/theme.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, removed `tests/unit/`, `tests/core-functionality.spec.ts`, and `tests/quality-assurance.spec.ts`</sub>

- [x] Keep timed annotation callouts readable during playback with a 2-second dwell, 350-millisecond
      fade, successive-annotation replacement, and source-marker editing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/utils/markerSelection.ts`, `tests/unit/markerSelection.test.ts`</sub>

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

### 2026-10-18 — Add CSV migration transforms and version parity

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `1149eb5`
**Kanban moved:** local library CSV/migration decisions → In Progress

**Changed:**

- Added a shared CSV parser path that keeps legacy import errors while allowing a zero-row preview,
  reports existing/imported/skipped/beyond-duration counts, replaces all layer marker data, and
  captures/restores the actual prior draft state.
- Added deterministic legacy URI classification, missing-item matching, non-destructive V1.2
  project conversion, and resumable journal-step selection.
- Made `1.0.0` consistent across package and Expo configuration, generated iOS marketing/bundle
  metadata, the installed simulator app, and the running localhost Expo manifest. Added preflight
  checks before Metro and native run commands plus a prebuild plugin to prevent drift.
- DSH-Qwen produced the initial CSV transform, then stalled on the corrective follow-up. Codex
  removed its duplicated parser and guessed draft state before verification.

**Verified:**

- Temporary focused CSV and migration checks → 10/10 passed, including parser compatibility,
  zero-row preview, counts, replace/undo, URI classes, matching, preservation, and journal order;
  the temporary tests were then removed per policy.
- `npm run check:version`, `npx tsc --noEmit`, `git diff --check`, and the empty permanent unit gate
  → clean; `npx expo prebuild --platform ios --no-install` reapplied native configuration.
- Elevated retained Playwright gate on port 8082 → 6/6 critical journeys passed.
- The running Expo localhost manifest reports version `1.0.0` and iOS build `1`; the installed
  iPhone 17 Pro simulator app reports `CFBundleShortVersionString` `1.0.0` and build `1`.

**Not verified / known gaps:**

- CSV transforms and migration decisions are not wired to repositories, store actions, or UI yet.
- The physical iPhone development client was not inspected directly; its localhost manifest is
  aligned, but a native binary version change would still require rebuilding that client.
- Concurrent playback-dock edits remain uncommitted and outside `1149eb5`.

**Next agent should:**

- Implement Task 11's serialised persistence pipeline, then the typed repositories that consume it.

### 2026-10-18 — Build project and draft persistence foundations

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `0c0e0f0`, `1e0fa29`
**Kanban moved:** local library project/draft foundations → In Progress

**Changed:**

- Added the V1.2 saved-project, persisted-content, and per-song draft contracts while keeping the
  legacy `BeatNoteProject` shape and load path intact; moved `LayerId` to the shared project domain
  and re-exported it from the store for compatibility.
- Added pure extraction/application and project-envelope mapping that preserve unknown top-level,
  settings, and layer fields, plus canonical serialisation and versioned 106-bit content fingerprints.
- Added invalid-record isolation for every library storage family, the six-rule song-load resolver,
  dirty/switch/save planning helpers, and project-name/export/grouping decisions.
- Preserved a concurrent installed `expo-dev-client` addition as the separate dependency commit
  `1e0fa29`; DSH-Qwen review and validator delegations were cancelled after they stalled without
  output or file changes.

**Verified:**

- Temporary focused unit checks → 17/17 passed across fingerprint, persisted-content round trip,
  draft resolution, validation isolation, and name/grouping behavior; files were then removed per
  the temporary-test policy.
- `npx tsc --noEmit`, `git diff --check`, Markdown lint for the updated task list, and the empty
  permanent unit command → clean.
- Elevated retained Playwright gate on port 8082 → 6/6 critical journeys passed.

**Not verified / known gaps:**

- The new pure utilities are not wired to repositories, autosave, track switching, or UI yet.
- Physical-device Open-in delivery and all existing hardware acceptance items remain pending.
- Native prebuild/autolinking was not rerun specifically for the concurrent `expo-dev-client` addition.

**Next agent should:**

- Implement Task 9.1 CSV preview/replace transforms, then continue into the persistence pipeline and
  repositories that consume these validated records.

### 2026-10-18 — Start local music library foundations

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `d7e9e2a`
**Kanban moved:** `local-music-library-queue` Phase 0 and non-overlapping Phase 1 work → In Progress

**Changed:**

- Reconciled the new spec with the shipped playback-speed ADR: provider/library decisions now use
  ADR-012 through ADR-016, local pitch-preserving speed remains supported, and `ImportJobView` is
  defined instead of referenced implicitly.
- Added the library, queue, migration, CSV-import, and shared-constant type foundations, plus pure
  queue/sort/search/shuffle/navigation and import/duplicate/relink/orphan decision utilities.
- Ran the OQ-4 spike in an isolated app ID and recorded a provisional
  `LSSupportsOpeningDocumentsInPlace = false` decision in the design. The disposable app and build
  directory were removed afterwards.
- DSH-Qwen audited the Open-in surface successfully. Its isolated queue implementation failed twice
  without producing a file; Codex cancelled it and implemented/reviewed the utility directly.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and Markdown lint for the changed spec files → clean.
- Elevated full retained Playwright gate on port 8082 → 6/6 critical journeys passed after the
  playback and library foundation commits were reconciled.
- Temporary queue and import-decision checks → 7/7 passed, then removed per project policy.
- Prebuild preserved the `.beatnote` declaration under both in-place settings and added the scratch
  MP3/M4A declaration without editing the repository's native project.
- On iPhone 17 Pro / iOS 26.2 Simulator, warm and cold M4A delivery reached React Native Linking
  under both settings as `Documents/Inbox` copies; MP3 also reached both paths with the key `true`.

**Not verified / known gaps:**

- Physical Files and third-party-app delivery remains blocked on a signed device build, so the key
  decision is provisional. Simulator `openurl` cannot prove security-scoped in-place behaviour.
- A `.beatnote` host URL opened Files UI instead of Linking; its declaration was preserved, but its
  delivery path still needs physical-device validation.
- The dependency alignment and playback-speed work were reconciled separately in `738c3ae`; the
  installed dependency tree now matches the committed manifests.
- Task 3.2 and the dependent project/draft utilities remain the next implementation slice.

**Next agent should:**

- Implement Task 3.2 and the dependent persisted-content/fingerprint utilities.

### 2026-10-18 — Refine speed-popup interaction and annotation guidance

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `738c3ae`
**Kanban moved:** Playback-speed direct-manipulation refinement → Done

**Changed:**

- Made slider coordinates stable across the full track so the thumb follows a drag without jumping
  when it passes over the fill or thumb, while retaining 0.05× normalization from 0.5× through 2×.
- Removed redundant speed toasts, increased the popup's glass opacity, and added a 700-millisecond
  dwell followed by a 420-millisecond collapse/fade toward the Speed control.
- Made that dismissal interruptible: touching the fading popup restores it immediately, and Speed,
  preset, and Reset presses all use the same transition instead of abruptly unmounting the panel.
- Kept Annotation enabled whenever audio is loaded; away from a marker it now leaves the editor
  closed and shows the actionable "Add a marker first" toast.
- DSH-Qwen task `session-2a700c81-465d-4e6d-90eb-32babefb66e9` supplied the bounded popup draft;
  Codex reviewed it and corrected web-coordinate stability and interrupted-animation completion.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean before lifecycle bookkeeping.
- Focused retained dock journey → 1/1 passed, including exact intermediate drag values, fade
  interruption, delayed auto-close, and animated button/preset/Reset dismissal.
- Full retained Playwright gate on port 8082 → 6/6 critical journeys passed, including loaded-song
  Annotation prerequisite feedback.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2,
  including 2× pitch-preserved rate/reset, loaded-song Annotation feedback, and loop transport;
  result bundle `ios/build/BeatNoteUITests-1792259719500.xcresult`.

**Not verified / known gaps:**

- Physical-device touch feel, VoiceOver, Bluetooth output, and audible pitch/artifact quality remain
  part of the active playback-speed acceptance checklist.
- Concurrent `local-music-library-queue` work and its untracked files remain outside this task.

**Next agent should:**

- Complete the on-device playback-speed checklist, paying particular attention to interrupting the
  fade with a second touch and dragging continuously at 0.5× and 2×.

### 2026-10-17 — Ship pitch-preserved playback speed

**Agent:** orchestrator (Codex) · **Commit(s):** `738c3ae`
**Kanban moved:** Slow-down / pitch-preserve playback → Done

**Changed:**

- Added normalized global and project-persisted playback speed from 0.5× through 2× in 0.05×
  increments, defaulting safely to 1× for missing or invalid project values.
- Replaced the placeholder speed chooser with a responsive glass popup containing a live slider,
  current value, endpoints, eight common presets, Reset to 1×, and adjustable accessibility actions.
- Connected the store to `expo-audio`, forcing pitch correction on and requesting its high-quality
  algorithm whenever the speed or underlying player changes; no custom native module is needed for
  the supported range.
- Updated the playback-dock spec and durable architecture/iOS guidance to replace the superseded
  custom-module and web pitch-shift assumptions.
- DSH-Qwen delegation session `session-a4538ec3-46a5-4e53-8fe0-d7b431adb5b2` failed before producing
  output or edits; Codex implemented and verified the feature directly.

**Verified:**

- Temporary normalization checks → 2/2 passed for invalid input, clamping, and 0.05× quantization;
  the temporary test was removed per the project testing policy.
- `npx tsc --noEmit` and `git diff --check` → clean.
- Full retained Playwright gate on port 8082 → 6/6 passed; the dock journey verifies the 0.75×
  preset, slider-only 0.85× value, browser engine rate and pitch flag, popup bounds in both
  orientations, rotation persistence, and reset.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2; 2×
  advanced the media clock faster than wall time, reset returned to 1×, and loop transport remained
  intact. Result bundle: `ios/build/BeatNoteUITests-1792196091966.xcresult`.

**Not verified / known gaps:**

- Physical-device listening is still required for pitch fidelity and artifacts across the range,
  plus VoiceOver, live adjustment comfort, Bluetooth, interruptions, and background/loop behavior.
- Expo/Jest dependencies were aligned with the Expo SDK 54 recommendations in the same commit.
- The local-music library foundations were committed separately in `d7e9e2a`.

**Next agent should:**

- Run the playback-speed physical-device checklist with music containing exposed vocals and sustained
  notes, checking 0.5×, 0.75×, 1.25×, 1.5×, and 2× through speakers and Bluetooth.
