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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (44)` Release build installed and launched on the physical iPhone · TestFlight pending
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

1. Physically review Release 44 timeline demo markers and label resets in Marilag, switch summaries, Pro pagination and queue navigation and confirm the existing library and projects after the in-place update.
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

- [x] Prepare the accumulated build 40–44 changes for publication on master.
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `README.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/HorizontalLayerSelector.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/components/ui/controls/WaveformVisibilityControl.tsx`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/settings/ProFeatureCarousel.tsx`, `src/components/ui/settings/ProFeatureDemo.tsx`, `src/components/ui/settings/SettingsSubpage.tsx`, `src/features/entitlements/capabilityService.ts`, `src/features/entitlements/proPreview.ts`, `src/features/library/projectService.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `src/hooks/useWaveformData.ts`, `src/styles/components/controls/layerNameSettings.ts`, `src/styles/components/modals/switchGuardDialog.ts`, `src/styles/components/settings/proSettings.ts`, `src/utils/draftResolution.ts`, `src/utils/persistedContent.ts`, `src/utils/projectChangeSummary.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Clarify the timeline demo and reuse the editor’s marker shields. Install build 44.
      <sub>**Key Artifacts:** `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/settings/ProFeatureDemo.tsx`, `tests/ui-components.spec.ts`</sub>

- [x] Fix named-project label resets, disable Display in Lite, refine the Pro demos, and install build 42.
      <sub>**Key Artifacts:** `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/release-roadmap.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/components/ui/settings/ProFeatureDemo.tsx`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/layerNameSettings.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Save annotation labels explicitly, show net changes at song switches, and connect Pro pagination to scrolling. Install build 41.
      <sub>**Key Artifacts:** `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/release-roadmap.md`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/components/ui/settings/SettingsSubpage.tsx`, `src/components/ui/settings/ProFeatureCarousel.tsx`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/features/entitlements/proPreview.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/layerNameSettings.ts`, `src/styles/components/settings/proSettings.ts`, `src/styles/components/modals/switchGuardDialog.ts`, `src/utils/draftResolution.ts`, `src/utils/persistedContent.ts`, `src/utils/projectChangeSummary.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add Pro timeline appearance, preserve Lite rehearsal tools, and install build 40.
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/choreography-features.md`, `.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `README.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/HorizontalLayerSelector.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/components/ui/controls/WaveformVisibilityControl.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/settings/ProFeatureDemo.tsx`, `src/features/entitlements/capabilityService.ts`, `src/features/entitlements/proPreview.ts`, `src/hooks/useStudioStore.ts`, `src/hooks/useWaveformData.ts`, `tests/ui-components.spec.ts`</sub>





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

### 2026-11-05 — Publish the build 44 changes

**Agent:** Codex · **Commit(s):** Build 44 commit containing this entry
**Kanban moved:** Prepare builds 40–44 for publication → Done

**Changed:** Collected Pro timeline appearance, marker artwork, label persistence, switch summaries, carousel changes, tests and documentation since build 39 into one release commit.

**Verified:** TypeScript, version consistency and whitespace checks passed. All eight browser journeys passed on build 44, which was also installed and launched on the paired iPhone.

**Not verified / known gaps:** Hands-on review of Marilag remains pending.

**Next agent should:** Collect physical feedback on Marilag and the timeline demo.

### 2026-11-05 — Match the timeline demo to the editor

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Timeline demo captions and marker artwork → Done

**Changed:** Removed “Timing bars” and the redundant waveform caption. The timeline demo uses the editor’s hollow and filled shield paths, head placement and marker lines for a plain and an annotated marker.

**Verified:** TypeScript and version checks passed. A phone-sized browser check found both shield paths and checked the waveform-off, waveform-on and renamed frames. Device services confirmed 1.0.0 (44) installed and launched.

**Not verified / known gaps:** Hands-on review of the demo on the physical display is pending. Changes remain uncommitted.

**Next agent should:** Collect physical feedback on the timeline demo and Marilag reset.

### 2026-11-05 — Keep reset labels when saving a named project

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Label persistence, Display tier access and Pro demos → Done

**Changed:** Reset flushes the draft immediately. Saving a named project preserves its current label, including an explicitly cleared label. The annotation-label Save action uses white text when enabled. Display & Annotations closes and disables in Lite like Timing & BPM. The timeline demo shows a usable “Vocals” label, and the system controls demo drops its lock icon.

**Verified:** A separate named project reproduced the stale “Notes” label before the fix. The browser checks now cover reset in both stored records and reloading the editor, the white Save text and the disabled Lite setting. TypeScript and the focused iOS Settings test passed. Installed 1.0.0 (42) over the existing iPhone app, verified the installed version, and launched it.

**Not verified / known gaps:** Marilag’s saved data was not opened or edited during verification. Builds 40 through 42 remain uncommitted.

**Next agent should:** Confirm Marilag’s label on the physical phone after Reset and Save Project.

### 2026-11-05 — Explicit label saves, switch summaries and continuous pagination

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** label Save, switch prompt and Pro carousel → Done

**Changed:** Save and keyboard Done apply an annotation label to the song draft. The switch guard snapshots the net authored changes against the named saved project, covering markers, notes, labels, timing, playback, loops and other project settings. The scrollable summary distinguishes newer or unavailable baselines. Pro pagination follows fractional scroll progress in both directions with a Reduce Motion snap. Timeline appearance precedes Playback and uses shorter copy.

**Verified:** TypeScript, version, whitespace and all eight browser journeys passed. The final library journey rerun checked blur, explicit Save, and marker/label changes in the switch prompt. A mixed-content check covered additions, removals, duplicate markers, edited notes, settings and reverted content. The focused iOS Settings journey passed. Fractional browser offsets produced a stretching and retracting pill on forward and reverse scroll. Device services confirmed 1.0.0 (41) installed in place and launched.

**Not verified / known gaps:** Hands-on physical gesture feel and VoiceOver review remain. Build 40 work and these changes remain uncommitted.

**Next agent should:** Collect physical feedback on the switch prompt and Pro pagination in build 41.


### 2026-11-05 — Pro timeline appearance

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Timeline appearance gates and Pro demonstration → Done

**Changed:** Pro enables waveform artwork and annotation-lane renaming/reset. Lite keeps saved labels readable and the waveform preference intact for a return to Pro. The Display & Annotations entry sits immediately above Timing & BPM. A fifth Pro card demonstrates the two settings, and the comparison distinguishes scrubbing from waveform artwork. Updated product guidance.

**Verified:** TypeScript, version and whitespace checks passed. Eight browser journeys passed, including Pro → Lite → Pro with a saved waveform choice and label. The focused iOS Settings journey passed. A phone-sized browser check confirmed the new row order, all demo stages and the Reduce Motion frame. Device services confirmed 1.0.0 (40) installed in place and launched on the physical iPhone.

**Not verified / known gaps:** Hands-on physical appearance and VoiceOver review remain open.

**Next agent should:** Collect feedback on the new timeline appearance controls in build 40.







<!-- end handover log -->
