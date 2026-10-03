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

**Last updated:** 2026-10-04
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
| Export formats implemented | 2 of 3 (CSV, MIDI; PDF planned) |
| Stem separation | Deferred; types, store fields, cache, and tests preserved |
| Choreography features implemented | 0 of 6 (all in steering, none in code) |
| Unit tests | 46 passing (6 suites; wrapped-core/store/persistence coverage added) |
| iOS UI tests | 9/9 baseline; latest full rerun 8/9 (simulator stayed portrait in landscape case) |
| E2E spec files | 5 (Playwright, 60 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Resolve simulator Portrait Orientation Lock / scene rotation, then rerun both landscape XCTest cases
   and the full suite. The latest failure occurs before landscape layout assertions: XCTest sets
   landscape but the app scene remains 402 x 874 portrait. Device Hub reproduces the sideways
   portrait scene when rotating hardware. The user has been asked to check simulator orientation lock.
2. Implement wrapped-canvas Phase 3 hook, then virtualized rendering and gestures; Phases 1-2 are
   verified in TypeScript, unit tests, and web E2E, but the wrapped view is not yet user-visible.
3. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   compact controls, project save/relaunch/restore, CSV I/O, and settings drawer. Landscape waveform
   and CSV I/O were covered by earlier runs but need revalidation after the rotation lock is resolved. Interactive Xcode 27
   testing uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the
   Simulator app on this host.
4. Close the remaining unit-test coverage gap the testing strategy requires (utils + real store actions).
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

- [ ] Add unit tests for `magneticSnapping`, `exportEngine`, `importEngine`, `projectManager` (testing strategy requires; none exist)
- [ ] Add unit tests for real store actions — `addMarker`, `removeMarker`, `removeLastMarker`, `redoLastMarker`, navigate, `setStemCount`, viewport constraints
- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement section looping for rehearsal and physical-device acceptance coverage
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Implement wrapped waveform canvas — Phases 1-2 verified; Phase 3 hook and Phases 4-5 UI/gestures next. DSH-Qwen tasks `session-278a3c6a-0b90-4d71-9aee-c60befec182d` and `session-9aa93a72-8217-4ed6-befa-9e5093653830` hit `max-tokens` without files; Codex completed this slice. See `.kiro/specs/wrapped-waveform-canvas/`.
- [ ] Restore actual simulator landscape rotation, then rerun the two geometry-guarded landscape XCTest cases and full iOS suite
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

#### Product planning

- [x] Re-sequence releases around the core annotation/rehearsal workflow; define V1 monetisation groundwork, V2 Pro launch, V2.x cloud stem beta, and V3 on-device/hybrid stems
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `.kiro/steering/stem-separation.md`, `.kiro/steering/architecture-decisions.md`, `.kiro/specs/demucs-stem-separation/`, `README.md`, `AGENTS.md`</sub>

#### Test & build harness

- [x] Implement wrapped-canvas Phases 1-2: deterministic row geometry, timeline mapping, and single-store state with unit/property coverage
      <sub>**Key Artifacts:** `src/utils/rowLayout.ts`, `src/utils/timelineMapping.ts`, `src/hooks/useStudioStore.ts`, `tests/unit/rowLayout.test.ts`, `tests/unit/timelineMapping.test.ts`, `tests/unit/studioStore.wrapped.test.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Add standalone wrapped-row gutter scaffolding and backwards-compatible wrapped preference persistence
      <sub>**Key Artifacts:** `src/components/ui/waveform/RowGutter.tsx`, `src/styles/components/waveform/rowGutter.ts`, `src/types/project.ts`, `src/utils/projectManager.ts`, `src/hooks/useStudioStore.ts`, `tests/unit/projectManager.wrapped.test.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Refine iOS mobile studio layout, expose toolbar scrolling, and hide deferred stem UI for V3
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/layout/mainContent.ts`, `src/features/stemSeparation/featureFlags.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Close iOS mobile acceptance defects — overview tap/drag seeks, live marker annotations, compact fixed controls, full-width waveform, landscape CSV actions, and long-track simulator coverage
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/long-test-track.m4a`</sub>
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

### 2026-10-04 — Add wrapped gutter and preference persistence

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Wrapped gutter scaffolding + preference persistence → Done; wrapped UI integration remains In Progress

**Changed:**

- Added the standalone `RowGutter` component and mirrored token-based styles without exporting,
  mounting, or adding gestures; UI integration remains under direct Codex review.
- Persisted only `primaryView`, `countSize`, `rowDensity`, and `followPlayhead`; legacy projects are
  normalized to wrapped/8/phrase/follow defaults. Added round-trip and exclusion tests for transient
  loop, selection, manual-scroll, and derived-row state.
- Fresh DSH sessions `session-8fccb6c4-90a1-4a23-9ee7-52746d510286` and
  `session-cee5ed24-b3fc-44e2-984e-a131ffc279cc` failed before editing because Ollama could not open
  the Qwen manifest on the external model volume (`operation not permitted`); Codex used the
  orchestrator fallback and implemented/reviewed both bounded tasks directly.

**Key Artifacts** (from `git diff --name-only` plus untracked source): `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `src/components/ui/waveform/RowGutter.tsx`,
`src/styles/components/waveform/rowGutter.ts`, `src/types/project.ts`,
`src/utils/projectManager.ts`, `src/hooks/useStudioStore.ts`,
`tests/unit/projectManager.wrapped.test.ts`, `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `npx tsc --noEmit` → clean; focused persistence suite → 2 passed.
- `npm run test:unit -- --runInBand` → 46 passed across 6 suites; elevated
  `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 60 passed.
- `git diff --check` → clean; contract checker with five-item Done/log limits → 0 errors.

**Not verified / known gaps:**

- `RowGutter` is intentionally not exported or rendered yet. Phase 3 hook, wrapped row/list
  rendering, UI integration, and all wrapped gestures remain open and were not modified.
- DSH-Qwen remains unavailable until host permissions allow Ollama to read
  `/Volumes/s_cx_g/Ollama/models/manifests/registry.ollama.ai/library/qwen3.8-sharp-uncensored-q4/latest`.
- Existing simulator landscape-rotation and physical-device acceptance gaps remain unchanged. All
  wrapped-canvas work in the shared worktree remains uncommitted.

**Next agent should:**

- Implement and directly review Phase 3 `useWrappedRows`, then build the non-gesture wrapped row/list
  rendering around the completed gutter; keep `MainContent` integration and gestures in Codex.

### 2026-10-03 — Build wrapped-canvas core and isolate simulator rotation

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Wrapped-canvas Phases 1-2 → Done; remaining canvas implementation → In Progress

**Changed:**

- Added pure integer-ms row layout and timeline mapping with half-open boundary ownership, loop
  clipping, phrase labels, and fast-check properties. Added wrapped-view preferences/session fields
  and setters to the existing Zustand store; no wrapped UI is rendered yet.
- Switched `MainContent` to `useWindowDimensions` for orientation changes. Corrected the long-track
  drag XCTest to capture its pre-drag clock before interacting, and made landscape tests require an
  actual landscape app frame rather than accepting portrait execution.
- Two bounded DSH-Qwen attempts ended at `max-tokens` with no files; Codex implemented and reviewed
  the entire completed slice. The user was asked to check simulator Portrait Orientation Lock.

**Key Artifacts** (from `git diff --name-only` plus untracked source): `.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`AGENTS.md`, `src/components/layout/MainContent.tsx`, `src/hooks/useStudioStore.ts`,
`src/utils/rowLayout.ts`, `src/utils/timelineMapping.ts`, `tests/ios/BeatNoteUITests.swift`,
`tests/unit/rowLayout.test.ts`, `tests/unit/timelineMapping.test.ts`,
`tests/unit/studioStore.wrapped.test.ts`, `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 44 passed; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 60 passed
  against the final `MainContent` orientation-hook change.
- Initial full `npm run test:ios:ui` on committed baseline → 9/9 passed. Post-change full rerun →
  8/9 passed (`ios/build/BeatNoteUITests-1790958927382.xcresult`); long-track drag passed after
  the assertion fix. Focused landscape rerun confirms the simulator did not rotate the app scene.

**Not verified / known gaps:**

- Latest iOS gate is not green. XCTest and Device Hub rotate the simulated hardware, but BeatNote
  remains in a portrait 402 x 874 scene; the in-test AX dump shows the portrait dock. The app's
  generated Info.plist supports landscape and source has no explicit orientation lock. The cause may
  be the simulator's Portrait Orientation Lock; do not call this an app layout defect until that is
  checked. The CSV landscape test now also asserts actual rotation and has not been rerun.
- Wrapped rendering, virtualization, gestures, persistence, and physical-device acceptance are not
  implemented/verified. All work listed above is uncommitted in the shared worktree.

**Next agent should:**

- Verify simulator orientation lock is off, rerun both focused landscape tests and the full suite,
  then implement Phase 3 `useWrappedRows` and Phase 4 virtualized rendering against the completed
  pure core. Keep integration/audio/gesture ownership in Codex; delegate only bounded, testable
  leaf files to DSH-Qwen using the 32K local-model context.

### 2026-10-03 — Verify committed mobile refinements

**Agent:** orchestrator (Codex) · **Commit(s):** `b3e516b` (created by Kiro)
**Kanban moved:** iOS mobile studio refinements → Done; wrapped waveform canvas → In Progress

**Changed:**

- No application files changed in this verification pass. The committed mobile layout, toolbar cue,
  deferred stem UI, and annotation typing fix were rechecked before beginning the wrapped-canvas spec.
- Resolved workflow selection conflict: the current user request controls the next task under
  `/Users/galen/.codex/skills/local-agent-orchestrator/references/lifecycle.md`, rather than the
  default top-card selection in `AGENTS.md`.

**Key Artifacts** (from `git diff b3e516b^ b3e516b --name-only`): `src/components/layout/MainContent.tsx`,
`src/components/layout/Sidebar.tsx`, `src/components/ui/controls/AnnotationField.tsx`,
`src/components/ui/controls/ProjectControls.tsx`, `src/styles/layout/mainContent.ts`,
`src/features/stemSeparation/featureFlags.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 9 passed, 0 failed on iPhone 17 Pro / iOS 26.2 simulator; result bundle
  `ios/build/BeatNoteUITests-1790957454247.xcresult`.
- Xcode emitted its existing post-test `simctl` diagnostics warning without failing XCTest.

**Not verified / known gaps:**

- Physical-device interruption/share acceptance and pixel-level review across iPhone sizes remain open.
- The earlier overview-drag timeout did not reproduce; no test or app change was made for it.

**Next agent should:**

- Implement and review Phase 1 pure wrapped-row utilities and tests before changing the store or UI.

### 2026-10-02 — Specify wrapped waveform canvas (planning only)

**Agent:** orchestrator (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** Wrapped waveform canvas → To Do (new planned feature; spec authored)

**Changed:**

- Authored a new Design-First feature spec under `.kiro/specs/wrapped-waveform-canvas/`
  (`design.md`, `requirements.md`, `tasks.md`) replacing the single long waveform with a wrapped,
  score-like timeline while retaining the continuous waveform as a precision detail mode.
- Design grounds all layout in pure utilities (`rowLayout.ts`, `timelineMapping.ts`) with a
  half-open `[startMs, endMs)` boundary-ownership invariant; adds only derived row geometry (never
  persisted) and a small set of new single-store fields (`primaryView`, `countSize`, `rowDensity`,
  `followPlayhead`, `loopStartMs/loopEndMs`, `selectedRowIndex`).
- Added the planned-feature card to the Kanban To Do column.
- No application code changed; this is a specification/planning artifact only.

**Key Artifacts** (new, from `git status`): `.kiro/specs/wrapped-waveform-canvas/design.md`,
`.kiro/specs/wrapped-waveform-canvas/requirements.md`,
`.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`.kiro/specs/wrapped-waveform-canvas/.config.kiro`, `AGENTS.md`.

**Verified:**

- `validate_spec_format` → 0 issues for `requirements.md`, `design.md`, and `tasks.md`.
- Spec grounded in the real code (store, `WaveformCanvas`, `TimelineScrollbar`, `useWaveformData`,
  gesture config, `STEM_SEPARATION_UI_ENABLED`), read before writing.
- Subsequent whole-tree pre-commit checks: `npx tsc --noEmit` → clean;
  `npm run test:unit -- --runInBand` → 26 passed; elevated
  `PLAYWRIGHT_PORT=8082 npm test -- --reporter=list` → 60 passed.
- `npm run test:ios:ui` → 8 passed and 1 failed on iPhone 17 Pro / iOS 26.2; focused rerun
  reproduced `testLongTrackOverviewTapAndDragSeek` timing out at `BeatNoteUITests.swift:147`.

**Not verified / known gaps:**

- The wrapped waveform feature is specified but not implemented.
- The committed pre-existing mobile-layout work does not have a fully green iOS UI gate: overview
  drag seeking failed to update the playback label within five seconds in both the full and focused
  simulator runs. The other eight iOS UI tests passed; Xcode also emitted its existing post-test
  `simctl` diagnostic warning.
- Unresolved product decisions: final density presets, exact detail-panel geometry on tablets,
  whether `countSize` ships with this feature or the separate 8-count task, and whether A/B loop
  state (`loopStartMs/loopEndMs`) is introduced here or by the section-looping task.
- Pre-existing uncommitted working-tree changes (unrelated prior work) were preserved untouched.

**Next agent should:**

- Begin Phase 1 of `.kiro/specs/wrapped-waveform-canvas/tasks.md` (pure `rowLayout.ts` +
  `timelineMapping.ts` with unit/property tests) behind the existing unified-waveform structure.

### 2026-10-02 — Re-sequence monetisation and stem separation

**Agent:** orchestrator (Codex GPT-6) · **Commit(s):** `uncommitted`
**Kanban moved:** Demucs stem separation → Deferred V2.x/V3; release and monetisation roadmap → Done

**Changed:**

- Added a durable release roadmap defining the complete Lite baseline, V1 entitlement groundwork,
  V2 Pro launch, V2.x cloud stem beta, and V3 on-device/hybrid stem path.
- Parked all unfinished Demucs work while preserving its completed types, store/cache foundation,
  tests, requirements, and design.
- Revised the future cloud architecture to keep service credentials behind a managed backend and
  treat compute credits separately from local Pro capabilities.
- Reordered the live board around physical-device acceptance, unit coverage, and the core
  choreography/rehearsal workflow.

**Key Artifacts** (from `git diff --name-only`): `.kiro/specs/demucs-stem-separation/design.md`,
`.kiro/specs/demucs-stem-separation/requirements.md`, `.kiro/specs/demucs-stem-separation/tasks.md`,
`.kiro/steering/architecture-decisions.md`, `.kiro/steering/project-overview.md`,
`.kiro/steering/release-roadmap.md`, `.kiro/steering/stem-separation.md`, `AGENTS.md`, `README.md`,
`docs/context/archive/beatnote-project-history.md`.

**Verified:**

- Documentation links and roadmap references reviewed; `git diff --check` and the project contract
  checker pass.
- No application code or entitlement behavior changed.

**Not verified / known gaps:**

- Lite/Pro limits, App Store products/prices, purchase provider, cloud provider economics, model
  licensing, stem quality, latency, and physical-device CoreML performance remain product or
  technical validation work.

**Next agent should:**

- Complete physical-device acceptance, then close the required unit-coverage gaps before starting
  V1 entitlement groundwork or additional core choreography features.
