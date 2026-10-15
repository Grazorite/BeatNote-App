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

**Last updated:** 2026-10-15
**Branch:** `master` · **Deploy:** Web (Netlify) · local iOS simulator verified · TestFlight pending
**Build gate:** `npx tsc --noEmit` (types), `npx jest --testPathPatterns=unit` (unit), and `npm test`
(Playwright E2E)

### Milestone: M2 — Core choreography and rehearsal workflow (in progress)

M1 (core annotation MVP for web) is shipped. M2 makes annotation, rehearsal, persistence, and
sharing dependable on physical iOS devices, then adds the dance-specific features needed for a V2
Pro launch. Stem separation is deferred entirely to V3, beginning with a cloud-first beta and
potentially adding a hybrid path later.

| Metric | Value |
|--------|-------|
| Annotation layers | 6 stable IDs (`vocals, drums, bass, piano, guitar, other`); stem controls hidden |
| Export formats implemented | 2 of 3 (CSV exposed in V1; MIDI retained for V2; PDF planned) |
| Stem separation | Deferred; types, store fields, cache, and cache tests preserved |
| Choreography features implemented | 1 of 6 (section looping implemented; physical-device acceptance pending) |
| Unit tests | 119 passing (11 suites) |
| iOS UI tests | Latest aggregate: 8/14 passed and 6 simulator tests were signal-killed; focused dock/range and V1 launch checks pass |
| E2E spec files | 4 (Playwright, 16/16 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   compact controls, project save/relaunch/restore, CSV I/O, settings drawer, wrapped gestures,
   responsive detail mode, orientation reflow, and landscape geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
4. Close the remaining production-unit coverage gap, then advance 8-count/rehearsal features and
   provider-neutral monetisation groundwork; do not resume
   stem separation until the gates in `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (sub-agent) | Codebase investigation before edits | Dispatch before touching unfamiliar paths |
| `DSH-Qwen Leonardo` (local design worker) | Bounded icon-system concept pass | Propose a modern, quirky custom icon language after the scoped icon audit |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Add remaining unit tests for `magneticSnapping`, `exportEngine`, `importEngine`, and broader `projectManager` scenarios
- [ ] Add unit tests for real store actions — `addMarker`, `removeMarker`, `removeLastMarker`, `redoLastMarker`, navigate, `setStemCount`, viewport constraints
- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Modernise the complete button icon set and document reusable custom-icon design principles;
      preserve existing semantics, accessibility labels, and control-state behavior
- [ ] Complete `playback-marker-control-dock` physical acceptance — implementation, simulator visual
      review, focused native checks, and web/unit gates pass; VoiceOver and real-device touch/keyboard
      comfort remain
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle
- [ ] Complete loop-range overview physical-device acceptance — Phases 1–17 and the automated gate are verified (116 unit, 16 E2E, 14/14 iOS); physical performance, VoiceOver, contrast, and audible-boundary checks remain

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Fix terminal loop-range playback and endpoint geometry: song-end ranges wrap after native
      completion, endpoint grips remain fully visible, and the track retains exact full-song mapping
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/hooks/useAudioPlayer.ts`, `src/components/ui/controls/LoopRangeLayer.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/utils/loopRange.ts`, `tests/ui-components.spec.ts`, `tests/unit/loopRange.test.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Polish the loaded overview and mobile lower controls: remove the action-slot gap, retain the
      end-of-song playhead, and add restrained glass gradients plus roomier annotation padding
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/styles/components/controls/loopRangeOverview.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Add an 8-point gap above the phone dock and keep the annotation field blank and non-interactive
      until audio is loaded
      <sub>**Key Artifacts:** `src/components/ui/controls/AnnotationField.tsx`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Simplify the unloaded phone waveform prompt to “Load a song” and center it within the full
      available timeline workspace
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/wrappedWaveform.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Align startup settings, project/audio actions, and CSV import/export with the one-lane V1 UX:
      start with settings closed, distinguish raw audio from saved Projects, expose CSV-only I/O,
      report marker counts instead of hidden layers, and explain the remaining BPM behavior
      <sub>**Key Artifacts:** `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/hooks/useStudioStore.ts`, `src/types/project.ts`, `src/utils/projectManager.ts`, `tests/ui-components.spec.ts`, `tests/unit/projectManager.wrapped.test.ts`, `tests/unit/studioStore.wrapped.test.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

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

### 2026-10-15 — Fix terminal loop and endpoint grip

**Agent:** orchestrator (Codex) · **Commit(s):** `cf652dc`
**Kanban moved:** Terminal range loop and endpoint handle correction → Done

**Changed:**

- Kept the range body mapped to the exact 0%/100% track endpoints while insetting only the
  eight-pixel endpoint grips, preventing the end grip from being covered by the adjacent action.
- Added Expo Audio completion-state handling and deferred the broader end-of-track pause path for an
  armed terminal range, so a range ending at songDuration wraps instead of stopping at 2:29.
- Centralised endpoint-visible playhead projection in a tested utility and removed a timing-sensitive
  browser gesture assertion while retaining direct geometry coverage.
- Updated the loop-range requirements, design, and completed task record for the corrected contract.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites; full Playwright gate → 16/16 passed.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792045957150.xcresult`.

**Not verified / known gaps:**

- Physical-device audible boundary quality and VoiceOver remain pending.
- The correction is committed in `cf652dc`; it and earlier commits `ba06384` / `adb2f54` remain
  local because the remote destination still requires explicit ownership approval.

**Next agent should:**

- Push the three local commits after the user explicitly confirms the `Grazorite/BeatNote-App`
  GitHub destination, preserving the unrelated concurrent icon/control worktree edits.
### 2026-10-15 — Polish overview and glass controls

**Agent:** orchestrator (Codex) · **Commit(s):** `ba06384`
**Kanban moved:** Overview/action alignment and lower-control polish → Done

**Changed:**

- Removed spacing between the overview track and its fixed action slot while keeping the disabled
  trash control visible before a range exists.
- Inset the overview playhead by two pixels at both endpoints so it remains visible at song end.
- Added restrained diagonal glass gradients behind the annotation and dock surfaces, increased
  annotation horizontal padding, and preserved popup overflow above the dock.
- Narrowed the native dock/range check to deterministic geometry and state assertions; loop-boundary
  calculations remain covered by the dedicated unit/property suite.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Full Playwright gate → 16/16 passed.
- Focused iOS `testLoopRangeToggleAndTransportFits` → 1/1 passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792045036902.xcresult`.

**Not verified / known gaps:**

- The final glass intensity and spacing still need the user's simulator visual review.
- Physical-device VoiceOver, touch comfort, software-keyboard behavior, and sustained drag/playback
  performance remain open.
- The implementation, specs, tests, and accumulated V1 cleanup are committed in `ba06384`.

**Next agent should:**

- Relaunch the app for the user's simulator visual pass, then continue physical-device acceptance.

### 2026-10-15 — Refine the unloaded annotation field

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Add breathing room and silence the unloaded annotation field → Done

**Changed:**

- Added an 8-point portrait gap between the annotation field and the control dock; landscape retains
  its compact zero-bottom-margin rail layout.
- Removed the redundant unloaded annotation placeholder and blocked pointer interaction until a song
  is loaded, while retaining the existing disabled input semantics.
- Added browser coverage for the blank placeholder, non-editable state, and minimum dock spacing.

**Verified:**

- `npx tsc --noEmit` → clean.
- Focused Playwright V1 startup/settings workflow → 1/1 passed at 393×852.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun for this small spacing and disabled-state change.
- The repository remains uncommitted with the previously documented dock/loop and V1 cleanup work;
  no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun the full automated aggregates, then
  continue the physical-device acceptance checklist.

### 2026-10-15 — Center the unloaded waveform prompt

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Center and simplify the unloaded wrapped-waveform empty state → Done

**Changed:**

- Shortened the empty-state message from “Load a song to view the wrapped timeline” to “Load a song”.
- Made the phone placeholder flex into the available waveform workspace, removing the fixed-height
  appearance and centering the message horizontally and vertically.
- Added browser geometry coverage for exact centering within the unloaded waveform container.

**Verified:**

- `npx tsc --noEmit` → clean.
- Focused Playwright V1 startup/settings workflow → 1/1 passed, including center-point geometry at
  393×852.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun for this small flexbox/copy-only refinement.
- The repository remains uncommitted with the previously documented dock/loop and V1 cleanup work;
  no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun the full automated aggregates, then
  continue the physical-device acceptance checklist.

### 2026-10-15 — Align V1 startup and project data actions

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `uncommitted`
**Kanban moved:** Align startup settings, project/audio actions, and CSV import/export → Done

**Changed:**

- Start phone sessions with the settings drawer closed and use a settings gear for reopening it.
- Replaced the ambiguous song/folder pairing with a music-file action for choosing raw audio and a
  library action labelled Projects for saved BeatNote projects; replacing audio now warns that
  existing markers and annotations retain their timestamps.
- Made V1 import/export explicitly CSV-only, removed the MIDI choice from the V1 export surface,
  report marker counts rather than hidden layer counts, and surface imported/skipped-row totals.
- Renamed BPM to Project BPM and documented its live uses in musical timing and beat-sized loop
  adjustments; the fixed phone waveform layout remains independent of BPM.
- Updated help copy, persistence summaries, web/unit coverage, and native workflows to match the
  single annotation-lane V1 product surface while preserving multi-layer and MIDI internals.

**Verified:**

- `npx tsc --noEmit` → clean; unit gate → 118 passed across 11 suites.
- Focused Playwright V1 startup/settings toolbar workflow → 1/1 passed.
- Native CSV import/share and project save/restore workflows passed in the latest aggregate on
  iPhone 17 Pro / iOS 26.2.
- Focused native launch/settings/audio-picker workflow → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792044180964.xcresult`.

**Not verified / known gaps:**

- The full Playwright aggregate is 15/16 because the concurrent dock workflow cannot find its new
  `annotation-glass` assertion; the focused V1 workflow passes.
- The full native aggregate is 8/14: six tests, including the launch workflow, were killed by the
  simulator rather than reporting assertion failures; the focused V1 launch rerun passes.
- The repository remains uncommitted with the previously documented dock/loop work and this V1
  cleanup; no unrelated dirty changes were reverted.

**Next agent should:**

- Resolve the concurrent dock/glass test instability, rerun both full aggregates, then continue the
  physical-device acceptance checklist.

