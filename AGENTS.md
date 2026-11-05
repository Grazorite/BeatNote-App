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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (52)` Release build installed and launched on the physical iPhone · TestFlight pending
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

1. Physically review the Release 50 timing controls, project changes, dance-count labels, prompt changes, About layout, Telegram feedback handoff, timeline demo markers and label resets in Marilag, switch summaries, Pro pagination and queue navigation and confirm the existing library and projects after the in-place update.
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


- [ ] Check system Previous/Next from the physical Lock Screen and Control Centre during playback.

- [ ] Physically verify Control Centre skipping with a customised interval on build 50.





- [ ] Confirm the existing library and projects on the physical iPhone after the in-place update

### ⏸ Deferred — V2/V3

- [ ] Playlist management in Lite, with automatic continuous playback gated to Pro.

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Add bulk speed preset reset and selectable system song/interval buttons. Install build 52.
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `modules/beatnote-audio-session/ios/BeatNoteAudioSessionModule.swift`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/features/entitlements/proPreview.ts`, `src/features/settings/preferences.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/services/audioRoute.ios.ts`, `src/services/audioRoute.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Distinguish default, edited and saved tempos; install build 51.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `AGENTS.md`, `app.json`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/features/library/draftAutosave.ts`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/bpmControl.ts`, `src/styles/components/controls/projectControls.ts`, `src/types/project.ts`, `src/utils/persistedContent.ts`, `src/utils/recordValidation.ts`, `tests/ui-components.spec.ts`, `src/hooks/useBpmStatus.ts`</sub>

- [x] Update timing and playback controls, Projects hierarchy and revert details; record future Lite playlists.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `modules/beatnote-audio-session/ios/BeatNoteAudioSession.podspec`, `modules/beatnote-audio-session/ios/BeatNoteAudioSessionModule.swift`, `modules/beatnote-audio-session/src/index.ts`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/DanceCountDisplay.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/modals/ConfirmDialog.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/projects/CurrentProjectSection.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/DataManagementScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/features/entitlements/proPreview.ts`, `src/features/settings/preferences.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useModernToggleAnimation.ts`, `src/hooks/useStudioStore.ts`, `src/services/audioRoute.ios.ts`, `src/services/audioRoute.ts`, `src/styles/components/common/modernToggle.ts`, `src/styles/components/controls/bpmControl.ts`, `src/styles/components/controls/danceCountVisibilityControl.ts`, `src/styles/components/modals/confirmDialog.ts`, `src/styles/components/modals/projectManagerModal.ts`, `src/styles/components/projects/currentProjectSection.ts`, `src/utils/persistedContent.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Exercise prompt failures and simplify the existing regression journeys.
      <sub>**Key Artifacts:** `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`</sub>

- [x] Use secondary grey for the main canvas dance counts and install build 49.
      <sub>**Key Artifacts:** `AGENTS.md`, `app.json`, `src/styles/components/waveform/rowGutter.ts`, `tests/ui-components.spec.ts`, `docs/context/archive/beatnote-project-history.md`</sub>





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

### 2026-11-05 — Install system transport modes and preset reset in build 52

**Agent:** Codex · **Commit(s):** Build 52 publication commit containing this entry
**Kanban moved:** Preset reset and Control Centre mode → Done

**Changed:** Pro Playback Settings choose interval skipping or queue navigation on iOS. System Previous goes directly to the preceding song. Button Configurations can restore default speeds across all preset layouts with confirmation.

**Verified:** Types and eight browser journeys passed. Temporary checks covered reset/cancel, mode and interval persistence, and queue navigation after the restart threshold. Device services verified build 52 installed and launched.

**Not verified / known gaps:** The simulator opened Control Centre without rendering its media tile, so an actual system-button press still needs physical confirmation.

**Defaults:** New installations use 10-second system seeking. Lite disables both system button choices and the interval selector. Existing explicit Pro preferences are preserved.

**Next agent should:** Try both directions on the physical Lock Screen with Change songs selected and a multi-song queue.

### 2026-11-05 — Compact BPM status in build 51

**Agent:** Codex · **Commit(s):** uncommitted
**Kanban moved:** Tempo status and signed installation → Done

**Changed:** The toolbar mutes the untouched 120, brightens a chosen tempo and adds an orange dot for unsaved tempo edits. Timing settings and accessibility expose the status in words. Accepted analysis at exactly 120 survives save and reload.

**Verified:** Types, eight browser journeys and focused Settings XCTest passed. Temporary checks confirmed contrast, dot transitions, unrelated marker edits, returning to the saved tempo, and manual and analysed 120 after reload. The physical phone reported version 1.0.0 (51) installed.

**Not verified / known gaps:** iOS denied launch because the phone was locked. Hands-on VoiceOver review remains open. Old 120 BPM projects lacking evidence of tempo selection display the default state.

**Next agent should:** Confirm launch after unlock.

### 2026-11-05 — Install timing and project refinements in build 50

**Agent:** Codex · **Commit(s):** Build 50 commit containing this entry
**Kanban moved:** Requested UI, roadmap changes and physical installation → Done

**Changed:** Independent Control Centre interval, aligned Settings titles and toggle captions, count-label update optimisation, ±5 BPM buttons, opt-in timing displays, project colour hierarchy and detailed revert confirmation. Lite playlists are on the roadmap with continuous play gated to Pro.

**Verified:** TypeScript, version and whitespace checks, eight browser journeys, temporary 375-point timing/revert check and focused native Settings XCTest passed. The paired iPhone accepted the in-place update, launched BeatNote, and reported version 1.0.0 (50).

**Not verified / known gaps:** Control Centre behaviour and toggle feel await hands-on review.

**Next agent should:** Confirm a changed system skip interval during playback on the physical iPhone.

### 2026-11-05 — Audit prompt failures and trim regression assertions

**Agent:** Codex · **Commit(s):** Test edits in `5eeef01`. Audit results recorded in the commit containing this entry.
**Kanban moved:** Prompt audit and full suite review → Done

**Changed:** Removed redundant colour, spacing and PDF markup assertions. Toast checks target the visible message instead of its transient live-region attribute. Removed temporary fault-injection checks after execution.

**Verified:** TypeScript and eight browser journeys passed, including the final build 49 browser run. All ten aggregate simulator results reported one pass each and zero failures. Temporary browser checks exercised bulk marker cancel/delete/undo, project open/save/revert/rename/delete, CSV read and CSV/PDF export errors, playback and seek failures, queue recovery, Telegram and both crash clipboard outcomes.

**Not verified / known gaps:** Failures were injected into disposable browser data. Physical VoiceOver remains a hands-on check.

**Next agent should:** Collect physical accessibility and library feedback.

### 2026-11-05 — Install build 49 with quieter dance-count labels

**Agent:** Codex · **Commit(s):** Build 49 commit containing this entry; build 48 is `5eeef01`
**Kanban moved:** Canvas dance-count contrast and build 49 installation → Done

**Changed:** The phrase/count text below each main canvas timestamp uses the secondary text colour. Incremented the iOS build to 49 and updated the About expectation. Prepared build 48 prompt changes and build 49 label styling as separate commits for the requested master push.

**Verified:** TypeScript, version consistency, whitespace and all eight browser regression journeys passed. A focused mobile render with counts enabled confirmed white timestamps (#ffffff) and grey count text (#999999). Signed release 49 passed signature verification. Device services independently reported 1.0.0 (49) installed and launched the app.

**Not verified / known gaps:** Physical readability with the user's songs remains for device review. Native XCTest was not rerun for the colour change.

**Next agent should:** Collect physical feedback on the contrast between timestamps and counts.






<!-- end handover log -->
