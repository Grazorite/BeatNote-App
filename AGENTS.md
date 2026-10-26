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

**Last updated:** 2026-10-26
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
| iOS UI tests | 7 critical native integrations retained; focused V1 launch/settings and Open_In checks pass |
| E2E spec files | 2 (Playwright, 7 critical journeys) |
| Native Expo modules | 2 (`BeatNoteWaveform` extraction and `LibraryStorage` persistence/Open_In) |

### Current Focus

1. Complete `local-music-library-queue` physical-device acceptance (Task 44.4): Files and
   third-party Open_In, the provisional in-place-opening decision, backup/restore and relink,
   near-full storage, interruptions, force-quit flushing, VoiceOver, large text, and rapid queue use.
2. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
3. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
4. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
5. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
6. Keep the completed local choreography workflow stable while physical-device acceptance and the
   Apple Developer account remain outstanding; do not resume stem separation until the gates in
   `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (sub-agent) | Codebase investigation before edits | Dispatch before touching unfamiliar paths |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Complete `local-music-library-queue` physical-device acceptance (Task 44.4); implementation,
      temporary durability/property checks, all six browser journeys, the isolated seven-case native
      suite, simulator rotation, and maximum Dynamic Type review are complete
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

- [x] Polish the V1 iPhone single-lane workflow by presenting the fixed `vocals` annotation lane
      honestly without exposing misleading multi-layer naming controls
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/utils/exportEngineCore.ts`, `src/utils/layers.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Raise the landscape loop overview above the home-indicator gesture zone and make dance-count
      guidance a persisted, default-off Settings option
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountDisplay.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/features/library/draftAutosave.ts`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/danceCountVisibilityControl.ts`, `src/types/project.ts`, `src/utils/persistedContent.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add the built-in choreography vocabulary as accessible suggestion chips in the desktop
      annotation field and iPhone editor while preserving free-form annotation entry
      <sub>**Key Artifacts:** `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/AnnotationSuggestionChips.tsx`, `src/components/ui/modals/AnnotationEditorModal.tsx`, `src/utils/annotationSuggestions.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add configurable PDF choreography sheets with project header, timeline, marker list,
      phrase/count grid, optional notes, native iOS generation/sharing, and web print-to-PDF
      <sub>**Key Artifacts:** `package.json`, `src/components/ui/modals/ExportModal.tsx`, `src/features/library/projectService.ts`, `src/utils/exportEngineCore.ts`, `src/utils/exportEngine.ios.ts`, `src/utils/exportEngine.web.ts`, `src/utils/exportTypes.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add project-scoped custom layer names with inline desktop and Settings editing, draft/project
      persistence, restored display names, accessibility labels, and named exports
      <sub>**Key Artifacts:** `src/components/ui/controls/HorizontalLayerSelector.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/hooks/useStudioStore.ts`, `src/types/project.ts`, `src/utils/layers.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-10-26 — Polish the V1 annotation lane

**Agent:** orchestrator (Codex) · **Commit(s):** `6b66a21`
**Kanban moved:** truthful V1 iPhone annotation-lane naming → Done

**Changed:**

- Replaced the misleading mobile Layer names section with one Annotation lane field backed by the
  existing stable `vocals` ID; untouched lanes present as Annotations without rewriting stored IDs.
- Kept desktop multi-layer naming intact and preserved every explicit custom name through draft and
  saved-project restoration.
- Applied the annotation-facing fallback to CSV, PDF, and MIDI labels while retaining legacy
  `Vocals` as a valid CSV import label.

**Verified:**

- Temporary annotation fallback/export logic checks → 2/2 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, empty permanent unit gate, disabled-test
  search, and `git diff --check` → clean for the completed change.
- Focused mobile Settings and project-restoration journeys → 2/2 passed.
- Full retained Playwright gate → 7/7 journeys passed.

**Not verified / known gaps:**

- Spoken VoiceOver, physical-iPhone keyboard behavior, and the final export share destination remain
  part of the existing hardware acceptance backlog.
- Concurrent wrapped-waveform/playhead edits and the untracked automatic-BPM spec remain outside
  `6b66a21`.

**Next agent should:**

- Begin the physical-iPhone acceptance pass from the current `1.0.0` development build.

### 2026-10-26 — Improve landscape safety and dance-count controls

**Agent:** orchestrator (Codex) · **Commit(s):** `eb683b8`
**Kanban moved:** landscape overview safety and default-off dance counts → Done

**Changed:**

- Raised the landscape canvas by the device bottom safe area plus additional spacing, with an
  18-point minimum clearance in environments that do not report safe-area insets.
- Added an accessible Settings switch for phrase/count guidance, defaulted it off, and persisted it
  per song draft/project while keeping phrase snapping and exports independent of visibility.
- Hid live transport counts, row-gutter counts, phrase labels, and phrase emphasis when disabled;
  documented that counts derive from BPM and song time zero rather than audio analysis.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, empty permanent unit gate, disabled-test
  search, and `git diff --check` → clean for the completed change.
- Focused Settings, landscape dock, and restoration browser checks → 3/3 passed.
- Full retained Playwright gate → 7/7 journeys passed, including default-off state, toggle-on
  persistence after reload, and at least 18 points of landscape overview clearance.

**Not verified / known gaps:**

- Physical-iPhone home-indicator swipe comfort and spoken VoiceOver behavior remain part of the
  existing hardware acceptance backlog.
- Concurrent wrapped-waveform/playhead edits remain uncommitted and outside `eb683b8`.

**Next agent should:**

- Run the physical-device acceptance items when a signed iPhone and Apple Developer account are
  available; all currently listed local-only implementation work is complete.

### 2026-10-26 — Add annotation suggestion chips

**Agent:** orchestrator (Codex) · **Commit(s):** `b89171c`
**Kanban moved:** annotation vocabulary suggestions → Done

**Changed:**

- Added the approved Hit, 8-count, Formation, Freeze, Turn, Jump, and Accent vocabulary as one
  reusable, horizontally scrollable chip row.
- Shared the chips between the desktop inline field and iPhone annotation modal; taps append to the
  current note within its length limit and never prevent arbitrary free-form text.
- Converted the modal input to controlled state so chip updates and typed edits remain synchronized.

**Verified:**

- Temporary vocabulary/append/limit unit checks → 2/2 passed, then removed per repository policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit` and `git diff --check` → clean.
- New retained browser journey → passed, including all seven chips, multi-chip append, free-form
  replacement, save, and reopen.
- Full retained Playwright gate → 7/7 journeys passed; the permanent unit gate remains intentionally
  empty and the disabled-test search is clean.
- iPhone 17 Pro simulator build with Expo Print → succeeded, then the current 1.0.0 app was installed
  and launched against the running Metro server on localhost:8081.

**Not verified / known gaps:**

- Spoken VoiceOver chip traversal and physical-device keyboard behavior remain part of hardware
  acceptance.
- Concurrent wrapped-waveform/playhead edits remain uncommitted and outside `b89171c`.

**Next agent should:**

- Run the physical-device acceptance items when a signed iPhone and Apple Developer account are
  available; all currently listed local-only implementation work is complete.

### 2026-10-26 — Add choreography PDF export

**Agent:** orchestrator (Codex) · **Commit(s):** `948da9d`
**Kanban moved:** PDF choreography export → Done

**Changed:**

- Added shared, escaped print-ready choreography HTML with configurable project header, timeline,
  marker table, phrase/count grid, and annotation notes.
- Added `exportToPDF` across the export boundary and Project Manager flow; iOS creates and shares a
  real PDF through Expo Print, while web opens the system print-to-PDF workflow.
- Made the expanded export surface scroll-safe and exposed accessible checkbox state for every PDF
  section option.

**Verified:**

- Temporary PDF rendering/escaping/option unit checks → 2/2 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, empty permanent unit gate, and
  `git diff --check` → clean.
- Focused Project Manager/export browser journey → passed, including PDF option visibility and
  checkbox state changes.
- iPhone 17 Pro / iOS 27.1 simulator build → succeeded with `ExpoPrint` linked into the app target.

**Not verified / known gaps:**

- Completing an actual external share and visually reviewing multi-page output on a physical iPhone
  remain part of hardware acceptance.
- Concurrent wrapped-waveform/playhead edits remain uncommitted and outside `948da9d`.

**Next agent should:**

- Add built-in annotation vocabulary suggestion chips without replacing free-form entry.

### 2026-10-26 — Add custom layer names

**Agent:** orchestrator (Codex) · **Commit(s):** `8df8c71`
**Kanban moved:** custom layer names → Done

**Changed:**

- Added optional `customName` content without changing the six immutable layer IDs or defaults.
- Added inline desktop editing plus an iPhone-accessible Layer names Settings section with reset,
  length normalization, keyboard focus handling, and immediate dirty-state tracking.
- Routed custom display names through the active-layer label, multitrack/wrapped views, project
  persistence, restoration, CSV export, and accessibility labels.

**Verified:**

- Temporary normalization/persistence unit checks → 2/2 passed, then removed per repository policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit` and `git diff --check` → clean.
- Focused browser project journey → passed, including rename, save/copy, song switch, newest-project
  restoration, and restored custom name in mobile Settings.

**Not verified / known gaps:**

- Spoken VoiceOver and physical-keyboard behavior remain part of hardware acceptance.
- Concurrent wrapped-waveform/playhead edits remain uncommitted and outside `8df8c71`.

**Next agent should:**

- Implement PDF choreography export and expose its options from the Project Manager export flow.
