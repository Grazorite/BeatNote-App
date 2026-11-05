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
| Architecture decisions (ADR-001…022), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
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

**Automation:** board upkeep follows the user-mandated `local-agent-orchestrator` lifecycle
(`/Users/galen/.codex/skills/local-agent-orchestrator/SKILL.md`).

---

## 📊 Active Project Status

**Last updated:** 2026-11-05
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (39)` Release build installed and launched on the physical iPhone · TestFlight pending
**Build gate:** `npx tsc --noEmit` (types) and `npm test` (critical Playwright journeys);
focused iOS XCTest for native surfaces changed by the task

### Milestone: M2 — Core choreography and rehearsal workflow (in progress)

M1 (core annotation MVP) is shipped. M2 makes annotation, rehearsal, persistence, and
sharing dependable on physical iOS devices, then adds the dance-specific features needed for a V2
Pro launch. Stem separation is deferred entirely to V3, beginning with a cloud-first beta and
potentially adding a hybrid path later. The browser build is a regression harness, not a product
target; Android is a far-future possibility only.

| Metric | Value |
|--------|-------|
| Annotation layers | 6 stable IDs (`vocals, drums, bass, piano, guitar, other`); stem controls hidden |
| Export formats implemented | 3 engines; CSV/PDF exposed in V1 and MIDI retained for V2 |
| Stem separation | Deferred; types, store fields, and cache preserved |
| Choreography features implemented | 6 of 6 in the V1 preview; physical-device acceptance remains |
| Permanent unit tests | 0; Jest is retained only for temporary implementation checks |
| iOS UI tests | 10 critical native integrations retained; all ten pass in focused simulator runs |
| E2E spec files | 2 (Playwright harness, 8 critical journeys) |
| Native Expo modules | 4 (`BeatNoteWaveform`, `LibraryStorage`, local `BeatNoteTempo` analysis, and `BeatNoteAudioSession`) |

### Current Focus

1. Physically review Release 37 BPM previews, queue navigation, waveform rendering and motion and confirm the existing library and projects after the in-place update.
2. Enrol for Apple distribution and pass TestFlight clean-install/update acceptance before starting
   V2 purchase enforcement.
3. Freeze and explicitly close V1 after distribution acceptance, recording any non-blocking limits.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed performance audits `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f`, plus native signposts `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integrations |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] V1.7 — Activate iOS/TestFlight: Apple Developer enrolment, real EAS project ID, signing,
      App Store Connect/privacy metadata, distribution, and clean install/update acceptance
- [ ] V1.8 — Freeze and explicitly close V1; record non-blocking limitations before V2 begins

### 🚧 In Progress





- [ ] Confirm the existing library and projects on the physical iPhone after the in-place update

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Lead the Pro showcase and comparison with automatic BPM and name the system playback controls.
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/features/entitlements/proPreview.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Commit Custom Order on release and resolve the track index against the latest queue.
      <sub>**Key Artifacts:** `src/components/ui/library/MusicLibraryRow.tsx`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `tests/ui-components.spec.ts`, `app.json`</sub>

- [x] Install and launch build 37 with BPM previews and library queue synchronization.
      <sub>**Key Artifacts:** `AGENTS.md`, `.kiro/steering/ios-testflight.md`, `docs/context/archive/beatnote-project-history.md`; signed release from `6b890c5`.</sub>

- [x] Clarify active BPM previews in the editor and rename the tempo picker.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/controls/DanceCountDisplay.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/styles/components/controls/bpmSuggestionCard.ts`, `src/styles/components/controls/projectControls.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Prepare build 37, pass the release gates, and publish the complete timing, waveform and
      queue-order work to `master` without installing it on the iPhone.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/controls/BeatAnchorControl.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/screens/BpmSettingsScreen.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedRowLiveLayers.tsx`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `src/hooks/useWaveformData.ts`, `src/styles/components/controls/bpmControl.ts`, `src/utils/queueOrder.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>


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

For user-facing app changes, finish with the signed in-place iPhone update and launch check in [the iOS workflow](.kiro/steering/ios-testflight.md), unless the user asks otherwise.

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

### 2026-11-05 — Lead Pro with tempo detection

**Agent:** Codex · **Commit(s):** Release 39 commit containing this entry
**Kanban moved:** Pro feature order → Done

**Changed:** The carousel opens on Tempo, then shows Speed, Playback and System playback controls. The first card explains BPM suggestion and count alignment. The last card names both the Lock Screen and Control Centre. The comparison follows the same priority.

**Verified:** TypeScript, all eight browser journeys and whitespace checks passed. A phone-sized browser check verified each demo position and the comparison label. Device services confirmed Release 39 was installed in place. The phone reported 1.0.0 (39) and launched the app.

**Not verified / known gaps:** Physical visual review remains. This change updates presentation data and copy. No dedicated native UI test was rerun.

**Next agent should:** Collect feedback on the Pro showcase alongside the existing physical library review.


### 2026-11-05 — Release 38 Custom Order drop

**Agent:** Codex · **Commit(s):** Build 38 commit containing this entry

**Changed:** Commit the previewed slot on release, detach row transforms and resolve the destination by ID at switch completion.

**Verified:** Types, eight browser journeys, focused row geometry check and navigation logic for every sort direction passed. Physical device reported build 38 and launched.

**Not verified / known gaps:** Physical drag and hold-to-switch with the user's library awaits confirmation.

**Next agent should:** Confirm repeated drag and immediate hold-to-switch with the user's library.

### 2026-11-05 — Install combined build 37 on the paired iPhone

**Agent:** Codex · **App source:** `6b890c5` (includes preview commit `f27e150`)
**Kanban moved:** Install build 37 on the paired iPhone → Done

**Changed:** Installed the signed release in place over build 36. It includes the editor preview indicator, expandable tempo picker and queue synchronization for library sorting and Custom Order. Recorded the standing preference to install verified user-facing changes and confirm launch on the paired iPhone.

**Verified:** Built from an isolated snapshot of the committed combined source. TypeScript and all eight Playwright journeys passed, including the preview workflow and Previous/Next after reordering. The native Release build and signature check passed. Checked the build number, preview labels and queue symbol in the packaged app. Device services reported BeatNote 1.0.0 (37) installed on the iPhone 15 Pro Max and launched it.

**Not verified / known gaps:** Physical interaction with the user's own songs, queue and saved projects remains for device review. Installation handover edits are local.

**Next agent should:** Collect physical feedback on BPM preview and Previous/Next with the user's library order.


### 2026-11-05 — Identify the active tempo preview in the editor

**Agent:** Codex · **Commit(s):** Separate preview commit following `671487b`
**Kanban moved:** Editor BPM preview and tempo picker → Done

**Changed:** When previewing, the editor shows preview and project BPM together and lets the user return directly to Timing. The optional toolbar button and count labels follow the preview. The expandable Preview related tempos control swaps position with Keep Current, exposes its expanded state, and closes after selection.

**Verified:** TypeScript and all eight browser journeys passed, with a focused rerun for the final picker wording. The browser checked preview with the shortcut hidden, navigation back from the indicator, and cancellation. The focused iOS automatic BPM, preview and anchor-controls XCTest passed.

**Not verified / known gaps:** Installed build 36 contains the preceding waveform/BPM fixes. The new preview UI is awaiting a future physical build. Queue edits are excluded from both commits.

**Next agent should:** Include the preview indicator in the next requested iPhone build.


### 2026-11-05 — Prepare and publish build 37

**Agent:** orchestrator (Codex) · **Commit(s):** Included in the build-37 publication commit containing this entry
**Kanban moved:** Build 37 versioning, final release gate, commit and push → Done

**Changed:**

- Incremented the iOS source build from 36 to 37 and updated the in-app About expectation. Per the
  user's request, no native build was installed; the physical iPhone remains on Release 36.
- Reconciled the complete shared tree: simplified timing controls, filled waveform rendering,
  Music Library order/transport synchronization, matching steering, and retained browser/native
  acceptance updates.
- Replaced a timing-sensitive playback-annotation visibility assertion with a page-side observer of
  the actual popup event. The behavior under test is unchanged, while parallel worker stalls can no
  longer miss the intentionally short two-second callout.

**Verified:**

- `npx tsc --noEmit`, `npm run check:version`, and `git diff --check` passed.
- Final full retained Playwright regression passed 8/8 on build 37. The first full run passed 7/8;
  the annotation journey passed focused, identifying a transient-observation race rather than an
  app regression, and the final event-based assertion passed in the full parallel suite.
- The focused iOS automatic-BPM suggestion, preview-in-editor, apply/restore and anchor-controls
  journey passed against build 37's source on iPhone 17 Pro simulator.

**Not verified / known gaps:**

- This session did not build, install, or physically review build 37. The user reported that a
  separate agent is handling its device installation, whose outcome is not claimed here. TestFlight
  distribution and existing-library/project confirmation remain open.

**Next agent should:**

- Reconcile the separate build-37 installation result, then physically verify Previous/Next after
  sorting or reordering at least three real songs.

<!-- end handover log -->
