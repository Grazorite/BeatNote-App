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

**Last updated:** 2026-10-10
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
| Unit tests | 70 passing (8 suites; fitted full-song row coverage added) |
| iOS UI tests | 14 cases; latest aggregate 12/14, with all corrected/changed cases passing focused reruns |
| E2E spec files | 5 (Playwright, 68 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   compact controls, project save/relaunch/restore, CSV I/O, settings drawer, wrapped gestures,
   responsive detail mode, orientation reflow, and landscape geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
2. Close the remaining unit-test coverage gap the testing strategy requires (utils + real store actions).
3. Advance 8-count/rehearsal features and provider-neutral monetisation groundwork; do not resume
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

- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

#### Test & build harness

- [x] Restrict marker creation to the bottom marker controls; gutter and waveform taps only seek or select
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/ios/BeatNoteUITests.swift`, `tests/waveform-features.spec.ts`</sub>
- [x] Fit the complete song into a fixed, non-scrolling phone waveform with timestamp-only gutters
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/hooks/useWrappedRows.ts`, `src/styles/components/waveform/`, `src/utils/rowLayout.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/unit/rowLayout.test.ts`, `tests/waveform-features.spec.ts`</sub>
- [x] Redesign the phone workspace as a fixed, single-layer canvas with no page/action-row scrolling
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformWorkspace.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/quality-assurance.spec.ts`, `tests/ui-components.spec.ts`</sub>
- [x] Complete wrapped-canvas Phases 14-15 native acceptance and renderer cleanup
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/index.ts`, `tests/ios/BeatNoteUITests.swift`; removed `src/components/ui/waveform/SimpleWaveform.tsx`</sub>
- [x] Implement wrapped-canvas Phase 12 accessibility metadata and stable test identifiers
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
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

### 2026-10-10 — Restrict marker creation to controls

**Agent:** orchestrator (Codex) · **Commit(s):** `1c252e5`
**Kanban moved:** Button-only marker creation → Done

**Changed:**

- Removed marker creation from wrapped-row taps. Blank waveform taps now seek, gutter taps open
  precision detail, and existing marker taps continue to select and seek.
- Kept marker creation exclusively on the bottom add-marker control and documented that interaction
  as a durable V1 product rule.
- Updated browser and native acceptance to assert that gutter, waveform, marker, and drag gestures
  never increase the marker count while the add-marker button does.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/steering/project-overview.md`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `tests/ios/BeatNoteUITests.swift`,
`tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 70 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed.
- Focused portrait fixed-workspace, wrapped-row gesture, and landscape reflow XTests each passed on
  iPhone 17 Pro / iOS 26.2; all three result bundles were inspected.

**Not verified / known gaps:**

- The full 14-case iOS aggregate was not rerun; focused native coverage exercises every changed
  marker-creation path. Physical-device acceptance remains outstanding.

**Next agent should:**

- Run physical-device acceptance, then address the top utility/store unit-test coverage item.

### 2026-10-09 — Fit full songs into the fixed phone canvas

**Agent:** orchestrator (Codex) · **Commit(s):** `1c252e5`
**Kanban moved:** Timestamp-only compact phone gutters → Done

**Changed:**

- Replaced the mobile wrapped-waveform `ScrollView` with a fixed canvas that renders every row at
  once. Row count follows available screen height, while timestamps partition the complete song.
- Reduced gutters to timestamp-only, vertically centered labels and made the compact marker lane
  proportional to row height so lower-row taps seek instead of accidentally adding markers.
- Kept desktop virtualization, density presets, and follow-playhead scrolling unchanged; documented
  the fixed full-song phone canvas as a durable product rule.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/steering/project-overview.md`, `src/components/ui/waveform/RowGutter.tsx`,
`src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`src/hooks/useWrappedRows.ts`, `src/styles/components/waveform/rowGutter.ts`,
`src/styles/components/waveform/wrappedRow.ts`, `src/styles/components/waveform/wrappedWaveform.ts`,
`src/utils/rowLayout.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`,
`tests/unit/rowLayout.test.ts`, `tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 70 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed,
  including fixed-canvas overflow, full-duration coverage, and compact gesture behavior.
- Native portrait fixed-canvas, compact row seek/marker gestures, landscape reflow/detail docking,
  and background playback continuity each passed focused on iPhone 17 Pro / iOS 26.2.
- Latest full native aggregate ran 14 cases: 12 passed; its two duration-expectation failures were
  corrected and both then passed focused (`BeatNoteUITests-1791535636043.xcresult` and
  `BeatNoteUITests-1791535683002.xcresult`).

**Not verified / known gaps:**

- A final all-14 aggregate was not rerun after the assertion-only fixture-duration correction.
- Physical-device safe-area, VoiceOver, interruption, and external share-destination checks remain.

**Next agent should:**

- Run physical-device acceptance, then address the top utility/store unit-test coverage item.

### 2026-10-09 — Fix the phone workspace to one screen

**Agent:** orchestrator (Codex) · **Commit(s):** `8b51e7d`
**Kanban moved:** Fixed single-layer phone workspace → Done

**Changed:**

- Replaced portrait's page and action-row scrollers with a fixed safe-area workspace. The wrapped
  waveform is now the only vertically scrollable surface, while the overview, transport, marker
  controls, and annotation field remain simultaneously reachable.
- Converted phone project actions to a compact fixed icon row, reduced waveform rows and controls,
  and hid phone-only layer, density, and follow chrome without removing desktop controls.
- Pinned phone editing to the canonical `vocals` lane while retaining all six stable layer IDs in
  persisted projects for compatibility, desktop use, and future V2 expansion.
- Updated the durable V1 product scope and replaced superseded native scroll/density assertions with
  fixed-layout, single-layer, gesture, follow-playhead, and reachability acceptance.

**Key Artifacts** (from implementation commit `8b51e7d`):
`.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`,
`src/components/layout/MainContent.tsx`, `src/components/ui/controls/ProjectControls.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `src/features/studio/StudioScreen.tsx`,
`src/styles/layout/mainContent.ts`, `tests/ios/BeatNoteUITests.swift`,
`tests/quality-assurance.spec.ts`, `tests/ui-components.spec.ts`.

**Verified:**

- Device Hub visual inspection on iPhone 17 Pro Max / iOS 26.2 → six waveform rows, overview, both
  control rows, annotation field, and all project actions fit in portrait without page scrolling.
- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 68 passed,
  including a loaded-track 375×667 viewport geometry check with no page/action-row overflow.
- Elevated full `IOS_SIMULATOR_ID=8716E9DD-B2FC-4614-8691-DC517F86B82E npm run test:ios:ui`
  → 14/14 passed; result bundle `ios/build/BeatNoteUITests-1791532193804.xcresult` was inspected.
  The final focused single-layer case also passed in `BeatNoteUITests-1791532576347.xcresult`.

**Not verified / known gaps:**

- Physical-device audio interruptions, VoiceOver, safe-area/orientation behavior, and completion of
  an external share remain outstanding. Additional stored lanes are preserved but intentionally not
  selectable in the V1 phone editor.

**Next agent should:**

- Run the physical-device acceptance checklist, then address the utility/store unit-test backlog.

### 2026-10-09 — Complete wrapped waveform acceptance

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `4f54e80`
**Kanban moved:** Wrapped-canvas Phases 14-15 → Done

**Changed:**

- Extended native acceptance to verify horizontal row seeking without vertical page movement,
  follow-playhead continuity through background and foreground, portrait detail replacement,
  landscape row reflow, marker preservation, and non-overlapping docked detail geometry.
- Corrected follow-toggle XCTest assertions to use the native switch value introduced by Phase 12
  accessibility semantics, then isolated each case with app termination and a controlled Files-picker
  retry to remove order-dependent system-modal leakage.
- Verified the prior iPhone 17 Pro failure was device-specific orientation-lock state. A fresh iPhone
  17 Pro Max simulator rotated correctly and passed the full portrait and landscape suite.
- Removed the unused `SimpleWaveform` renderer and its barrel export after repository search and
  DSH-Qwen session `session-12ef6a00-97a4-4668-961f-17ef01f37dc0` independently confirmed zero live
  consumers. Phase 12 review session `session-6616ede1-4a1d-46cc-b8db-6b3989db4b33` also completed
  with a pass and only non-blocking polish observations.

**Key Artifacts** (from implementation commit `4f54e80`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/index.ts`,
`src/components/ui/waveform/SimpleWaveform.tsx` (removed), `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 67 passed.
- Focused wrapped-row seek, follow/background, and landscape reflow/detail XTests each passed.
- Elevated full `IOS_SIMULATOR_ID=8716E9DD-B2FC-4614-8691-DC517F86B82E npm run test:ios:ui`
  → 14/14 passed on iPhone 17 Pro Max / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791516777967.xcresult` was inspected for the aggregate result.

**Not verified / known gaps:**

- Physical-device audio interruption, VoiceOver, safe-area/orientation, and external share-destination
  acceptance remain outstanding. The original iPhone 17 Pro simulator may still retain its local
  orientation-lock state; the app configuration itself supports all orientations.

**Next agent should:**

- Run the physical-device acceptance checklist, then address the top unit-test coverage backlog item.

### 2026-10-09 — Complete wrapped accessibility semantics

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `659617d`
**Kanban moved:** Wrapped-canvas Phase 12 accessibility → Done; Phase 14 iOS acceptance remains In Progress

**Changed:**

- Added adjustable row semantics with index, time range, phrase, and active playback value. Native
  values use `accessibilityValue`; explicit ARIA aliases cover the current React Native Web mapping.
- Added layer-aware marker labels with timestamp and annotated state, plus a descriptive follow
  toggle label. Existing gutter, density, detail, and stable identifier contracts remain intact.
- Separated the row accessibility surface from visual descendants so iOS VoiceOver can navigate the
  row and each accessible SVG marker independently instead of grouping markers beneath the row.
- Added focused web and iOS assertions for roles, labels, values, stable IDs, keyboard activation,
  marker visibility, and the unannotated-to-annotated label transition.
- DSH-Qwen session `session-6616ede1-4a1d-46cc-b8db-6b3989db4b33` received a bounded read-only
  review. It remained running without final findings at handover; Codex retained implementation and
  verification ownership.

**Key Artifacts** (from implementation commit `659617d`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 67 passed,
  including the new focused assistive-technology flow.
- Focused `IOS_TEST_ONLY='testWrappedRowSeekMarkerAndDragGestures()' npm run test:ios:ui` → 1 passed
  on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791507156618.xcresult` reports one executed, passing test.

**Not verified / known gaps:**

- The complete iOS suite and native landscape cases were not rerun because the existing simulator
  scene-rotation lock remains unresolved; physical-device VoiceOver acceptance is also outstanding.
- DSH-Qwen's read-only review had not completed at handover and supplied no accepted code changes.

**Next agent should:**

- Implement Phase 14 iOS acceptance coverage and resolve the simulator scene-rotation lock before
  the full suite, then finish Phase 15 cleanup and final regression.
