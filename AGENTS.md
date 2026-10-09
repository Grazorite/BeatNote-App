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

**Last updated:** 2026-10-09
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
| Unit tests | 68 passing (8 suites; row-density preset coverage added) |
| iOS UI tests | 9/9 baseline; Phase 12 focused native accessibility test 1/1; latest full rerun 8/9 (landscape lock) |
| E2E spec files | 5 (Playwright, 67 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Resolve simulator Portrait Orientation Lock / scene rotation, then rerun both landscape XCTest cases
   and the full suite. The latest failure occurs before landscape layout assertions: XCTest sets
   landscape but the app scene remains 402 x 874 portrait. Device Hub reproduces the sideways
   portrait scene when rotating hardware. The user has been asked to check simulator orientation lock.
2. Complete wrapped-canvas Phase 14 iOS acceptance, then Phase 15 cleanup and final regression.
   Phases 1-13 are implemented and verified; two phases remain.
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

- [ ] Implement wrapped waveform canvas — Phases 1-13 verified; Phase 14 iOS XCTest acceptance next, followed by Phase 15 cleanup and final regression. Phase 12 used DSH-Qwen session `session-6616ede1-4a1d-46cc-b8db-6b3989db4b33` for a bounded read-only review while Codex retained implementation and verification ownership. See `.kiro/specs/wrapped-waveform-canvas/`.
- [ ] Restore actual simulator landscape rotation, then rerun the two geometry-guarded landscape XCTest cases and full iOS suite
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

#### Test & build harness

- [x] Implement wrapped-canvas Phase 12 accessibility metadata and stable test identifiers
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 11 responsive reflow and side-by-side wide detail layout
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/waveform/WaveformWorkspace.tsx`, `src/styles/components/waveform/waveformWorkspace.ts`, `tests/waveform-features.spec.ts`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 10 explicit row-density presets and timestamp-safe reflow
      <sub>**Key Artifacts:** `src/components/ui/waveform/RowDensityControls.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `src/styles/components/waveform/rowDensityControls.ts`, `src/styles/components/waveform/wrappedWaveform.ts`, `src/utils/rowDensityPresets.ts`, `tests/unit/rowDensityPresets.test.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 9 compact annotation indicators, clustering, and detail-on-tap
      <sub>**Key Artifacts:** `src/utils/annotationClusters.ts`, `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `tests/unit/annotationClusters.test.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
- [x] Implement wrapped-canvas Phase 8 multi-row A/B loop highlighting
      <sub>**Key Artifacts:** `src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`</sub>
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

### 2026-10-06 — Complete responsive waveform reflow

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `c05b9ff`
**Kanban moved:** Wrapped-canvas Phase 11 responsive styling → Done; Phase 12 accessibility remains In Progress

**Changed:**

- Added a true side-by-side wrapped/detail workspace for wide and landscape layouts while retaining
  phone portrait's full detail-mode replacement. Docked panes share available width and may shrink
  without overlap.
- Removed the desktop/tablet 900 px minimum-content-width floor that caused clipping and horizontal
  page overflow on 844 px landscape and intermediate tablet widths.
- Strengthened responsive acceptance to cover portrait-to-landscape orientation-default row reflow,
  non-overlapping pane geometry, zero page overflow, and marker/annotation preservation and
  re-selection after resize.
- DSH-Qwen session `session-e4dac34e-c7cc-4084-8e01-1358eecff5a0` drafted only the docked style.
  Direct review fixed its portrait-pane `flex: 1` regression and owned the component integration,
  overflow repair, and tests. Existing safe-area and `keyboardShouldPersistTaps="handled"` paths were
  preserved.

**Key Artifacts** (from implementation commit `c05b9ff`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/layout/MainContent.tsx`,
`src/components/ui/waveform/WaveformWorkspace.tsx`,
`src/styles/components/waveform/waveformWorkspace.ts`, `tests/waveform-features.spec.ts`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 66 passed,
  including wide side-by-side geometry, no horizontal overflow, reflow, and data preservation.
- Focused `IOS_TEST_ONLY='testPrecisionDetailModeOpensAndRestoresWrappedRow()' npm run test:ios:ui`
  → 1 passed on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791251332686.xcresult` was inspected and reports one executed test.

**Not verified / known gaps:**

- Native landscape side-by-side geometry and orientation reflow remain unverified because the
  simulator scene-rotation lock persists; equivalent browser geometry/reflow acceptance is green.
- Physical-device safe-area, keyboard, and orientation acceptance remains outstanding.

**Next agent should:**

- Implement Phase 12 accessibility roles, labels, values, and stable identifiers across wrapped
  rows, markers, annotation indicators, density controls, and detail actions.

### 2026-10-06 — Add wrapped row-density presets

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `cd410fb`
**Kanban moved:** Wrapped-canvas Phase 10 density presets → Done; Phase 11 responsive reflow remains In Progress

**Changed:**

- Added explicit Spacious, Default, and Compact controls with stable identifiers. Presets map to
  1/2/3 phrases per row or 5/10/15-second duration rows and reuse the persisted single-store
  `rowDensity` contract.
- Kept density mapping pure and independently tested. Reflow changes only row projection geometry;
  marker timestamps and annotations remain unchanged across preset switches.
- Added semantic native gutter labels and portrait XCTest coverage for all three preset boundaries
  plus marker preservation. Optional landscape pinch remains intentionally omitted.
- DSH-Qwen session `session-fd5e84f5-c9e8-4ee7-ab0b-121d2eeb3625` drafted only the bounded control
  component and styles. Codex reviewed and refined that draft and directly owned mapping, store
  integration, accessibility, and browser/native acceptance.

**Key Artifacts** (from implementation commit `cd410fb`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/waveform/RowDensityControls.tsx`,
`src/components/ui/waveform/RowGutter.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`src/styles/components/waveform/rowDensityControls.ts`,
`src/styles/components/waveform/wrappedWaveform.ts`, `src/utils/rowDensityPresets.ts`,
`tests/unit/rowDensityPresets.test.ts`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 68 passed across 8 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 66 passed,
  including marker and annotation preservation while row boundaries reflow.
- Focused `IOS_TEST_ONLY='testWrappedRowDensityPresetsReflowWithoutChangingMarkers()' npm run test:ios:ui`
  → 1 passed on iPhone 17 Pro / iOS 26.2; result bundle
  `ios/build/BeatNoteUITests-1791225205452.xcresult` was inspected and reports one executed test.

**Not verified / known gaps:**

- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks its geometry-guarded landscape cases; physical-device acceptance remains outstanding.
- Optional preset-snapping landscape pinch was deliberately omitted until explicit controls and
  responsive Phase 11 styling are stable.

**Next agent should:**

- Implement Phase 11 responsive styling and automatic reflow across narrow portrait, wide
  landscape, and resizing while preserving current presets, gestures, and playback state.

### 2026-10-06 — Add compact wrapped annotation display

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `1ef5c47`
**Kanban moved:** Wrapped-canvas Phase 9 annotation display → Done; Phase 10 density presets remains In Progress

**Changed:**

- Projected non-empty layer annotations onto their owning wrapped rows and rendered bounded colored
  dots instead of inline text. Nearby cross-layer indicators collapse into an `xN` SVG badge.
- Added deterministic first-member-anchored pixel clustering that filters invalid coordinates,
  avoids transitive overgrowth, preserves input order, and averages each cluster's display position.
- Reused the existing marker-lane nearest-marker gesture so tapping either a dot or badge selects and
  seeks to that marker, reopening it in the shared `AnnotationField` without a competing recognizer.
- DSH-Qwen session `session-2896f3f5-a762-4579-9ab0-84de7632928a` implemented only the pure helper
  and focused unit tests. Codex reviewed it and directly owned projection, SVG, and interaction work.

**Key Artifacts** (from `git diff --name-only` plus untracked source):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/utils/annotationClusters.ts`,
`src/components/ui/waveform/WrappedRow.tsx`, `src/components/ui/waveform/WrappedWaveform.tsx`,
`tests/unit/annotationClusters.test.ts`, `tests/waveform-features.spec.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 62 passed across 7 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 65 passed,
  including real marker annotation, compact rendering, no inline text, and detail-on-tap restoration.
- Focused `IOS_TEST_ONLY=testWrappedRowSeekMarkerAndDragGestures npm run test:ios:ui` → 1 passed on
  iPhone 17 Pro / iOS 26.2; native SVG indicator and existing row tap/drag behavior both passed.

**Not verified / known gaps:**

- The count badge is covered by pure cluster tests and direct SVG review, but browser/native
  acceptance creates a single annotation because the web import shim cannot inject deterministic
  cross-layer annotations through Expo DocumentPicker.
- The complete iOS suite was not rerun because the existing simulator scene-rotation lock still
  blocks its geometry-guarded landscape case; physical-device acceptance remains outstanding.

**Next agent should:**

- Implement Phase 10 explicit row-density presets, preserving marker/annotation timestamps while
  row geometry reflows; keep any optional pinch gesture out unless preset controls are stable first.

### 2026-10-05 — Add multi-row A/B loop highlighting

**Agent:** orchestrator (Codex) + DSH-Qwen · **Commit(s):** `87f2f66`
**Kanban moved:** Wrapped-canvas Phase 8 A/B loop highlighting → Done; Phase 9 annotation display remains In Progress

**Changed:**

- Wired the existing session-only `loopStartMs`/`loopEndMs` bounds through the virtualized wrapped
  waveform and indexed the pure `loopSegmentsForRows` result by row.
- Added a defensive translucent SVG segment behind each affected row's waveform, markers, and
  playhead. Empty, non-finite, reversed, and out-of-row ranges render nothing; exact row boundaries
  retain the existing half-open ownership semantics.
- DSH-Qwen session `session-41471e66-4bb5-4f0a-a647-ef9a3dbf4dd3` implemented only the bounded
  `WrappedRow` overlay. Codex reviewed the geometry and directly implemented store/list integration.

**Key Artifacts** (from `git diff --name-only`):
`.kiro/specs/wrapped-waveform-canvas/tasks.md`,
`src/components/ui/waveform/WrappedRow.tsx`,
`src/components/ui/waveform/WrappedWaveform.tsx`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 51 passed across 6 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 64 passed.
- Existing loop utility tests cover clipped multi-row segments, exact-boundary ownership, full
  coverage without overlap, equal endpoints, and reversed inactive ranges.

**Not verified / known gaps:**

- The production UI does not yet expose A/B loop-bound controls, so the new visual overlay was not
  activated through browser or simulator UI. The later section-looping feature will supply that path.
- No iOS suite was rerun because Phase 8 is passive rendering over existing state and its specified
  gate is unit plus web regression; the existing landscape-lock and physical-device gaps remain.

**Next agent should:**

- Implement Phase 9 compact annotation indicators and clustering under direct interaction review,
  reusing the shared selected-marker annotation flow without rendering text inline.
