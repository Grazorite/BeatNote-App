# BeatNote Project History

This archive preserves completed work and the oldest handover entry moved out of the live board to
keep `AGENTS.md` concise. Archived checklist items and the handover entry are copied verbatim.

## Archived Completed Work

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

- [x] Mobile workspace scroll/toolbar layout and an always-reachable settings drawer toggle
      <sub>**Key Artifacts:** `src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Jest unit test setup + Playwright E2E harness (5 spec files)
      <sub>**Key Artifacts:** `jest.config.js`, `tests/unit/`, `tests/*.spec.ts`, `playwright.config.ts`</sub>
- [x] Regeneratable portrait-mode Xcode UI-test target and iOS simulator workflow for launch,
      audio/annotation, project save/relaunch/restore, CSV import validation, and share-sheet export
      <sub>**Key Artifacts:** `plugins/withIosUiTests.js`, `scripts/ios-ui-test.js`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/`</sub>
- [x] Clean strict TypeScript gate — replaced missing layer icon imports and corrected web cursor typing
      <sub>**Key Artifacts:** `src/components/ui/controls/LayerControls.tsx`, `src/styles/components/controls/timelineScrollbar.ts`</sub>
- [x] Local iOS simulator baseline — reproducible prebuild, Xcode 27 build, simulator launch,
      safe-area layout, and native-safe SVG rendering
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, `plugins/withIosPodDeploymentTarget.js`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`</sub>

#### Repo hygiene & tooling

- [x] Markdown lint clean across all 12 repo `.md` files (fixed 25 formatting issues in `design.md`)
      <sub>**Key Artifacts:** `.kiro/specs/demucs-stem-separation/design.md`</sub>
- [x] Migrated the 5 agent hooks from legacy `.kiro.hook` (v1) to v2 JSON; refined stale test command and scoped `update-live-docs` away from AGENTS.md
      <sub>**Key Artifacts:** `.kiro/hooks/coding-standards-check.json`, `.kiro/hooks/style-file-reminder.json`, `.kiro/hooks/ts-check-on-save.json`, `.kiro/hooks/test-file-check.json`, `.kiro/hooks/update-live-docs.json`</sub>

## Archived Handover Log

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
