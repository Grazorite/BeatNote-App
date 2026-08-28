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
| Stem separation architecture (hybrid Demucs) | [`.kiro/steering/stem-separation.md`](./.kiro/steering/stem-separation.md) |
| iOS build, entitlements, TestFlight setup | [`.kiro/steering/ios-testflight.md`](./.kiro/steering/ios-testflight.md) |
| Active feature spec — Demucs stem separation | [`.kiro/specs/demucs-stem-separation/`](./.kiro/specs/demucs-stem-separation) |

> **Deviation from the orchestrator default:** BeatNote keeps durable reference in `.kiro/steering/`
> (Kiro's always-loaded steering layer) rather than a `docs/context/` directory. Duplicating steering
> into `docs/context/` would create two sources of truth and break steering auto-injection. The
> Context Map above therefore points at the steering files directly.

**Automation:** board upkeep is enforced by the global `global-project-orchestrator` skill
(`~/.kiro/skills/global-project-orchestrator/SKILL.md`).

---

## 📊 Active Project Status

**Last updated:** 2026-08-28
**Branch:** `master` · **HEAD:** `d88b54b` · **Deploy:** Web (Netlify config present) · iOS pending
**Build gate:** `npx jest --testPathPatterns=unit` (unit) and `npm test` (Playwright E2E)

> **Gate caveat:** `npx tsc --noEmit` currently fails on two pre-existing issues unrelated to recent
> work — missing icon exports in `src/components/ui/controls/LayerControls.tsx` and a `cursor` type in
> `src/styles/components/controls/timelineScrollbar.ts`. Treat a clean typecheck as a separate To Do,
> not part of the standard gate, until those are fixed.

### Milestone: M2 — Stem separation & choreography features (in progress)

M1 (core annotation MVP for web) is shipped. M2 moves BeatNote toward its choreographer-focused
commercial release: real stem separation, dance-specific features, and an iOS build.

| Metric | Value |
|--------|-------|
| Stem layers | 6 (`vocals, drums, bass, piano, guitar, other`), modes 2 / 4 / 6 |
| Export formats implemented | 2 of 3 (CSV, MIDI; PDF planned) |
| Stem separation files | 2 of ~10 planned (`types.ts`, `stemCache.ts`) |
| Choreography features implemented | 0 of 6 (all in steering, none in code) |
| Unit tests | 26 passing (stem slice + stemCache) |
| E2E spec files | 5 (Playwright, web) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Advance the Demucs stem separation spec — separators, orchestration hook, and UI wiring.
2. Close the unit-test coverage gap the testing strategy requires (utils + real store actions).
3. Begin choreography features (8-count grid, custom layer names, PDF export).

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (sub-agent) | Codebase investigation before edits | Dispatch before touching unfamiliar paths |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Implement `onDeviceSeparator.ts` — CoreML path via native module (spec task 4)
- [ ] Implement `cloudSeparator.ts` — Replicate `facebook/demucs` polling path (spec task 5)
- [ ] Implement `useStemSeparation.ts` hook + `index.ts` public API (spec task 7)
- [ ] Implement the native `modules/stem-separation/` Expo Module (TS interface + Swift) (spec tasks 3, 14)
- [ ] Build stem separation UI — progress overlay, settings, storage screen, `StemsView` per-stem URIs (spec tasks 8–13)
- [ ] Add unit tests for `magneticSnapping`, `exportEngine`, `importEngine`, `projectManager` (testing strategy requires; none exist)
- [ ] Add unit tests for real store actions — `addMarker`, `removeMarker`, `removeLastMarker`, `redoLastMarker`, navigate, `setStemCount`, viewport constraints
- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Fix pre-existing `tsc` errors (LayerControls icon exports, timelineScrollbar cursor type) to make typecheck part of the gate
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Demucs stem separation feature — foundation landed (`types.ts`, `stemCache.ts`, store fields); next step is property tests for `stemCache` (spec task 2.1), then the native TS interface (spec task 3)

### ✅ Done

#### Core annotation MVP (web)

- [x] Global Zustand store — playback, viewport/zoom with centralized clamping, layers, markers, annotations, toggles
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`</sub>
- [x] Markers and annotations — add/remove/undo/redo, marker navigation, per-layer text annotations
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`, `src/components/ui/controls/AnnotationField.tsx`</sub>
- [x] Six-layer stem model with 2 / 4 / 6 visible-stem modes
      <sub>**Key Artifacts:** `src/hooks/useStudioStore.ts`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/StemSelector.tsx`</sub>
- [x] Waveform rendering, rhythmic grid, magnetic snapping, ghost playhead, BPM control
      <sub>**Key Artifacts:** `src/components/ui/waveform/`, `src/utils/magneticSnapping.ts`, `src/components/ui/controls/BpmControl.tsx`</sub>
- [x] Full single-screen UI — layout, controls, modals, HelpScreen, error boundary
      <sub>**Key Artifacts:** `src/features/studio/StudioScreen.tsx`, `src/components/layout/`, `src/components/ui/`</sub>

#### Data in / out

- [x] Platform-split export engine — CSV + MIDI, web/iOS implementations over a shared core
      <sub>**Key Artifacts:** `src/utils/exportEngine.ts`, `src/utils/exportEngine.web.ts`, `src/utils/exportEngine.ios.ts`, `src/utils/exportEngineCore.ts`, `src/utils/exportTypes.ts`</sub>
- [x] CSV import with layer mapping and row validation
      <sub>**Key Artifacts:** `src/utils/importEngine.ts`, `src/utils/importTypes.ts`, `src/components/ui/modals/ImportModal.tsx`</sub>
- [x] Project save/load round-trip via AsyncStorage
      <sub>**Key Artifacts:** `src/utils/projectManager.ts`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectModal.tsx`</sub>

#### Stem separation foundation

- [x] Shared types and store fields for stem separation (status / progress / URIs) — spec task 1
      <sub>**Key Artifacts:** `src/features/stemSeparation/types.ts`, `src/hooks/useStudioStore.ts`</sub>
- [x] `stemCache.ts` — AsyncStorage-backed cache metadata + Documents-directory stem files (FNV-1a hash)
      <sub>**Key Artifacts:** `src/features/stemSeparation/stemCache.ts`, `tests/unit/stemCache.test.ts`</sub>

#### Test & build harness

- [x] Jest unit test setup + Playwright E2E harness (5 spec files)
      <sub>**Key Artifacts:** `jest.config.js`, `tests/unit/`, `tests/*.spec.ts`, `playwright.config.ts`</sub>

#### Repo hygiene & tooling

- [x] Markdown lint clean across all 12 repo `.md` files (fixed 25 formatting issues in `design.md`)
      <sub>**Key Artifacts:** `.kiro/specs/demucs-stem-separation/design.md`</sub>
- [x] Migrated the 5 agent hooks from legacy `.kiro.hook` (v1) to v2 JSON; refined stale test command and scoped `update-live-docs` away from AGENTS.md
      <sub>**Key Artifacts:** `.kiro/hooks/coding-standards-check.json`, `.kiro/hooks/style-file-reminder.json`, `.kiro/hooks/ts-check-on-save.json`, `.kiro/hooks/test-file-check.json`, `.kiro/hooks/update-live-docs.json`</sub>

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
- **Keep only the latest 10 Handover Log entries.** When adding an 11th, delete the oldest.

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

*Newest first. Prepend new entries directly below this line. Keep only the latest 10 entries.*

### 2026-08-28 — Markdown lint clean-up and hook migration to v2

**Agent:** orchestrator (Claude Opus 4.8) · **Commit(s):** `9dde5f2`
**Kanban moved:** Repo hygiene & tooling items → Done

**Changed:**

- `design.md`: fixed all 25 markdown lint findings (emphasis-as-heading `**Validates:**` labels,
  blank lines around lists/headings, fenced-block languages). Formatting only — no content change.
- Migrated all 5 agent hooks from legacy `.kiro/hooks/*.kiro.hook` (v1 `when`/`then`) to v2
  `.kiro/hooks/*.json` (`trigger`/`action`). Deleted the 5 legacy files.
- Corrected the stale Jest flag in the test hook (`--testPathPatterns`) and scoped `update-live-docs`
  to durable steering/README only, leaving AGENTS.md to the orchestrator.

**Verified:**

- `mdlint.py` across all 12 repo `.md` files → 0 findings.
- All 5 v2 hook JSON files parse as valid JSON; `.kiro/hooks/` now contains only the v2 files.
- `git diff design.md` reviewed → purely whitespace/formatting.

**Not verified / known gaps:**

- Hooks are declared but not fired this session — v2 hooks activate on next session start.
- `ts-check-on-save` will report the known pre-existing `tsc` errors on every save until the
  "Fix pre-existing tsc errors" To Do item is done.

**Next agent should:**

- Continue the In Progress stem separation work (native module TS interface, spec task 3).

### 2026-08-28 — Board initialised; pending work committed

**Agent:** orchestrator (Claude Opus 4.8) · **Commit(s):** `570078c` (pending work), `797f20b` (board + docs)
**Kanban moved:** n/a — board initialised

**Changed:**

- Committed all pending working-tree changes as `570078c` (platform-split export engine, stem
  separation types + cache, demucs spec, Jest unit setup, app.json/eas.json) for a clean baseline.
- Created `AGENTS.md` as the dynamic handover orchestrator with a Context Map pointing to
  `.kiro/steering/` and the active spec (committed in `797f20b`).
- Reconciled documentation in `797f20b`: split README Features into "Available now" vs "Planned"
  so unbuilt features are no longer implied shipped; fixed stale demucs spec checkboxes (tasks 1.1,
  2, 2.1 done). Noted the `stemCache` hash deviates from the spec (FNV-1a, not SHA-256/js-sha256).

**Verified:**

- `npx jest --testPathPatterns=unit` → 26 passed, 2 suites.
- `git status` → working tree clean after commit `570078c`.
- Done column seeded from `src/` reads and git history; To Do seeded from the demucs spec tasks,
  `.kiro/steering/` planned features, and the testing-strategy coverage requirements.

**Not verified / known gaps:**

- `npx tsc --noEmit` fails on two pre-existing errors (LayerControls icon exports, timelineScrollbar
  cursor) that predate this session — typecheck is not yet a clean gate.
- Playwright E2E (`npm test`) was not run this session.
- Choreography features and stem separators are confirmed absent by grep, not by exhaustive read.

**Next agent should:**

- Pick up the In Progress item: write `stemCache` property tests (spec task 2.1), then implement the
  native module TS interface (spec task 3).
