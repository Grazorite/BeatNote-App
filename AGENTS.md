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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (36)` Release build installed and launched on the physical iPhone · TestFlight pending
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

1. Physically review Release 36 waveform rendering, timing controls, artwork and motion and confirm the existing library and projects after the in-place update.
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

- [x] Simplify BPM controls, remove waveform stripes, and install build 36.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `.kiro/steering/coding-standards.md`, `AGENTS.md`, `app.json`, `src/components/ui/controls/BeatAnchorControl.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/screens/BpmSettingsScreen.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedRowLiveLayers.tsx`, `src/hooks/useWaveformData.ts`, `src/styles/components/controls/bpmControl.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Verify and install combined build 35 with the Pro sparkle.
      <sub>**Key Artifacts:** `app.json`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/OutwardSparkle.tsx`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/components/ui/waveform/DanceGridLines.tsx`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Show the Pro dance grid and Timing shortcut, then install build 35 on iPhone.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountDisplay.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/screens/BpmSettingsScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/settings/ProFeatureDemo.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/settings/preferences.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/projectControls.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `src/components/ui/waveform/DanceGridLines.tsx`</sub>

- [x] Apply the About sparkle to the mobile Settings Pro button.
      <sub>**Key Artifacts:** `src/components/layout/Sidebar.tsx`, `src/components/ui/common/OutwardSparkle.tsx`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/styles/layout/sidebar.ts`</sub>

- [x] Improve BPM editing, tempo suggestions and dance-count guidance.
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/controls/BeatAnchorControl.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/screens/BpmSettingsScreen.tsx`, `src/styles/components/controls/bpmControl.ts`, `src/styles/components/controls/bpmSuggestionCard.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>


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

### 2026-11-05 — Polish BPM controls and remove waveform stroke bands

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Simplify BPM controls, remove waveform stripes, and install build 36 → Done

**Changed:** Timing & BPM opens with the toolbar toggle. Project BPM has ±10 and ±1 buttons beside the editable value. Shortened phrase, Count 1 and analysis guidance. The decoded waveform traces a filled outline for both the played and unplayed regions across the timeline, overview and detail views. Incremented to build 36 and installed in place.

**Verified:** TypeScript, version consistency and whitespace checks passed. All eight browser journeys passed across the suite and a focused rerun after updating waveform colour checks from stroke to fill. Constant-volume peak paths at three sample densities rendered a uniform interior. The focused iOS waveform, annotation and project restoration XCTest passed. Device services confirmed 1.0.0 (36) installed and launched on the iPhone.

**Not verified / known gaps:** The screenshot’s exact imported audio has not been visually reviewed on the physical phone since installation. Concurrent queue changes and prior test edits are present in the shared tree.

**Next agent should:** Collect physical build 36 feedback on the edited song with the waveform on and dance grid off.


### 2026-11-05 — Install combined build 35 with the Settings Pro sparkle

**Agent:** Codex · **Commit(s):** `65da670`
**Kanban moved:** Verify Pro sparkle in signed build 35 and install → Done

**Changed:** Combined the shared About and Settings sparkle, BPM editing, dance grid and Timing shortcut in build 35. Installed the signed update in place on the paired iPhone and gathered all current work for the requested local commit.

**Verified:** TypeScript, version consistency, whitespace and all eight browser journeys passed. The packaged JavaScript contains the Settings Pro sparkle and Timing shortcut. Device services reported version 1.0.0 (35) and successfully launched the installed app.

**Not verified / known gaps:** Physical visual and VoiceOver review remain open. The focused simulator run opened Timing and found the dance grid toggle. Its immediate hittability assertion for the Timing shortcut failed after tapping Back. The Pro sparkle was independently exercised in the browser.

**Next agent should:** Review the Timing shortcut on return from Settings and distinguish transition timing from a navigation failure.

### 2026-11-05 — Install the Pro dance grid and Timing shortcut on iPhone

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Pro grid, Timing shortcut and Release 35 installation → Done

**Changed:** The main rows and detail canvas plot dotted silver beats and thicker white Count 1 lines, independent of waveform visibility and count labels. Grid visibility is saved per project. The Pro toolbar shortcut between the song title and Save opens Timing & BPM and returns directly to the editor. Its visibility preference persists across songs. Incremented to build 35 and installed in place.

**Verified:** TypeScript, all eight browser journeys, version consistency and whitespace checks passed. Tested grid visibility with and without peaks, changing phrase length, both toggles, direct navigation and Lite gating. Signed Release build succeeded. Device services confirmed 1.0.0 (35) installed and launched on the paired iPhone.

**Not verified / known gaps:** Focused iOS Settings XCTest running. Physical review of line contrast, Marilag alignment and existing projects remains open. Shared workspace includes concurrent sparkle work.

**Next agent should:** Review the dotted grid and existing library on the iPhone with build 35.

### 2026-11-05 — Share the About sparkle with the mobile Settings Pro button

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Settings Pro sparkle → Done

**Changed:** About and Settings Pro share the same star and random outward motion. The Pro button emits one star every 1.8 seconds while visible. Reduce Motion and navigation away stop the effect.

**Verified:** TypeScript passed. A mobile browser captured three emissions with distinct trajectories, confirmed removal on Reduce Motion, opened Pro, returned and tapped the About logo. Seven regression journeys passed together and the Settings journey passed separately after the concurrent build-number update.

**Not verified / known gaps:** Physical review of the Pro sparkle remains open. The shared workspace includes concurrent BPM and device build work.

**Next agent should:** Check the Pro sparkle during the next iPhone review.

### 2026-11-05 — Make project BPM directly editable and clarify dance timing

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** BPM editing and dance-count guidance → Done

**Changed:** Project BPM is a numeric input with Done, validation (40–220), and ±1 controls. Timing setup is ordered as tempo, dance phrase, then Count 1. Related-tempo previews include 3/2 and 2/3 (104 → 156), explicitly show the preview BPM, and Keep Current cancels the preview. Updated existing browser/native journeys and choreography steering.

**Verified:** TypeScript and whitespace checks passed; all eight Playwright journeys passed, including manual entry, invalid input and related-tempo preview. Focused iOS Settings XCTest passed including entering 156 and dismissing the keyboard. Reviewed the settled mobile browser layout. Inspected phrase/count calculations and grid grouping.

**Not verified / known gaps:** No Marilag audio was analysed in this session; native detector ranking is unchanged. Related tempos are correction aids, not new measurements. No physical-device install or VoiceOver review. Existing Release 34 artwork changes and this work remain uncommitted and unpushed.

**Next agent should:** Include the timing improvements in the next requested iPhone build and review Marilag at the user's 156 BPM with Count 1 aligned.

<!-- end handover log -->
