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

**Last updated:** 2026-10-14
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
| Choreography features implemented | 1 of 6 (section looping implemented; physical-device acceptance pending) |
| Unit tests | 124 passing (11 suites) |
| iOS UI tests | 15/15 passing on iPhone 17 Pro Max / iOS 26.2 simulator |
| E2E spec files | 5 (Playwright, 69 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   compact controls, project save/relaunch/restore, CSV I/O, settings drawer, wrapped gestures,
   responsive detail mode, orientation reflow, and landscape geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
2. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
3. Close the remaining unit-test coverage gap, then advance 8-count/rehearsal features and
   provider-neutral monetisation groundwork; do not resume
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

- [ ] Add remaining unit tests for `magneticSnapping`, `exportEngine`, `importEngine`, and broader `projectManager` scenarios
- [ ] Add unit tests for real store actions — `addMarker`, `removeMarker`, `removeLastMarker`, `redoLastMarker`, navigate, `setStemCount`, viewport constraints
- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle
- [ ] Complete loop-range overview physical-device acceptance — Phases 1–16 and the automated gate are verified (124 unit, 69 E2E, focused iOS loop case); physical performance, VoiceOver, contrast, and audible-boundary checks remain

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

#### Test & build harness

- [x] Smooth loop-range dragging and separate the clear/restore action from full-song content
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/components/ui/controls/LoopClearControl.tsx`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/controls/LoopRangeLayer.tsx`, `src/components/ui/controls/LoopRangeOverview.tsx`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/`, `tests/ui-components.spec.ts`, `tests/unit/studioStore.loop.test.ts`, `tests/waveform-features.spec.ts`</sub>
- [x] Refine loop controls after simulator review — restore mutually exclusive marker/range loops,
      simplify status chrome, use icon-only clear/restore, and apply a complementary teal range palette
      <sub>**Key Artifacts:** `.kiro/specs/loop-range-overview/`, `src/components/icons/LoopMarkerIcon.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useKeyboardShortcuts.ts`, `src/hooks/useStudioStore.ts`, `src/styles/`, `src/utils/loopRange.ts`, `tests/unit/`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
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

### 2026-10-13 — Smooth and separate the loop overview controls

**Agent:** orchestrator (Codex) · **Commit(s):** `9ff4bab`
**Kanban moved:** Loop-range drag jank and overview overlap → Done

**Changed:**

- Removed per-frame native accessibility announcements from pointer drags and retained targeted,
  once-per-action handle announcements for keyboard and adjustable accessibility changes. Memoized
  the static overview track and made the store skip identical settled range writes.
- Measured gesture/full-song geometry from a dedicated track region and placed the icon-only
  clear/restore control in a fixed sibling slot. Its 44-point effective target no longer covers the
  playhead, marker indicators, range body, or handles.
- Updated the requirements, design, task checklist, unit test, and browser acceptance coverage for
  the action-slot geometry and gesture hot-path behavior.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 124 passed across
  11 suites; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed,
  including a non-overlap assertion between the track and clear/restore control.
- Focused native loop-drag XCTest passed, then the full aggregate passed 15/15 on iPhone 17 Pro /
  iOS 26.2; result bundles `BeatNoteUITests-1791886084082.xcresult` and
  `BeatNoteUITests-1791886222558.xcresult` were inspected.

**Not verified / known gaps:**

- Subjective drag smoothness still needs the user's simulator retest and the required physical-
  iPhone ~60fps gate. Physical VoiceOver announcements, rendered contrast, and audible loop-boundary
  quality also remain outside simulator automation.

**Next agent should:**

- Have the user retest range creation/move/resize in Device Hub, then complete task 25.2 on a
  physical iPhone before marking the loop-range feature fully Done.

### 2026-10-13 — Refine loop controls after simulator review

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `7d51b3a`
**Kanban moved:** Loop-control simulator refinements → Done

**Changed:**

- Restored the marker-segment loop button, store state, keyboard shortcut, and playback behavior.
  Marker and custom-range loops are mutually exclusive; enabling either disables the other, while
  whole-song repeat remains independent.
- Removed the visible grand-total marker and current-time captions while retaining 1×1 non-layout
  automation probes, replaced clear/restore text with trash/undo icons, and changed the range palette
  from orange to complementary teal.
- Amended `.kiro/specs/loop-range-overview/requirements.md`, `design.md`, and `tasks.md` because the
  user's explicit request to preserve marker looping conflicted with Requirement 15's retirement
  rule. The explicit request won; the historical retirement phase is labelled superseded.
- DSH-Qwen session `session-1e89499a-afdd-4c1c-bd02-3fed3de1f3f9` reviewed coexistence and boundary
  risks. Its previous-sample boundary and regression-test advice informed the implementation; store
  mutual exclusion was retained as a stronger invariant than simultaneous flags with precedence.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 123 passed across
  11 suites; `git diff --check` → clean.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed.
- Device Hub was restarted; Xcode built and launched BeatNote on iPhone 17 Pro / iOS 26.2. Visual
  inspection confirmed the fifth marker-loop control, hidden captions, and fixed-row fit. Teal token
  contrast measured 10.11:1 enabled and 3.88:1 disabled against `#111111`.

**Not verified / known gaps:**

- The native XCTest aggregate was not rerun after this refinement. The app was exercised directly in
  the simulator, but creating a range with computer-use drag did not reliably trigger the native pan
  gesture, so the rendered teal range and icon-only clear/restore should be checked manually next.
- Physical-device performance, VoiceOver, contrast, and audible-boundary acceptance remain open.

**Next agent should:**

- In the running simulator, drag a loop range and visually check teal selection plus trash/undo;
  then test mutual exclusion by alternating the marker-loop and range-loop buttons.

### 2026-10-12 — Complete loop-range overview automated implementation

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `251b60f`
**Kanban moved:** Loop-range overview → In Progress (automated implementation complete; physical-device gate remains)

**Changed:**

- Implemented the single loop-range model end to end: validated range math and store actions,
  project-schema 1.1.0 migration/persistence, armed playback wrapping, keyboard commands, and
  retirement of the marker-segment loop.
- Replaced `TimelineScrollbar` with the compact full-song range editor, including native/web
  create/move/resize gestures, clear/restore, transport enablement, wrapped-row/detail projection,
  viewport following, and accessible adjustable handle semantics.
- Added unit/property, Playwright, and XCTest coverage for range behavior, persistence, interaction
  isolation, layout, playback wrap, and native save/relaunch/restore. Fixed overlay pointer capture,
  native accessibility-tree visibility, aggregate state timing, and simulator orientation issues
  encountered during verification.
- DSH-Qwen session `session-5f492eba-8623-4c8f-a399-e8b8706bf74f` reviewed the Phase 12 XCTest
  changes. Accepted its transport-tolerance and async-test concerns where supported by the result
  bundles; retained direct ownership of gesture/audio assertions and the physical VoiceOver gate.

**Key Artifacts** (from `git status` / `git diff --name-only`):
`.kiro/specs/loop-range-overview/`, `src/utils/loopRange.ts`, `src/hooks/useStudioStore.ts`,
`src/hooks/useAudioPlayer.ts`, `src/hooks/useLoopRangeGesture.ts`, `src/hooks/useViewportFollow.ts`,
`src/components/ui/controls/`, `src/components/ui/waveform/`, `src/types/project.ts`,
`src/utils/projectManager.ts`, `tests/unit/`, `tests/ui-components.spec.ts`,
`tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 120 passed across 11 suites.
- Elevated `PLAYWRIGHT_PORT=8082 EXPO_NO_TELEMETRY=1 npm test -- --reporter=dot` → 69 passed.
- Focused native overview, loop-wrap/transport, and save/relaunch/restore cases passed; elevated full
  aggregate → 15/15 passed on iPhone 17 Pro Max / iOS 26.2. Inspected result bundle
  `ios/build/BeatNoteUITests-1791739669368.xcresult`.

**Not verified / known gaps:**

- Physical-iPhone acceptance remains required before the feature is Done: sustained drag/playback
  performance, actual VoiceOver increment/decrement announcements, rendered contrast, and audible
  loop-boundary quality. XCTest verifies the adjustable semantics but cannot reliably invoke React
  Native custom accessibility actions.
- Implementation, specification, and tests are committed in `251b60f`; this handover/archive update
  is recorded separately.

**Next agent should:**

- Run simulator-first exploratory acceptance, then task 25.2 from
  `.kiro/specs/loop-range-overview/tasks.md` on a physical iPhone; if it passes, mark the feature Done.

### 2026-10-10 — Specify loop-range overview (planning only)

**Agent:** orchestrator (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** Loop-range overview → To Do (new planned feature; spec authored)

**Changed:**

- Authored a Requirements-First feature spec under `.kiro/specs/loop-range-overview/`
  (`requirements.md`, `design.md`, `tasks.md`) to repurpose `TimelineScrollbar` into a compact
  full-song loop-range editor: draggable start/end handles, range move, clear/restore, a transport
  loop toggle, range projection onto wrapped rows, and range-aware playback with an armed-wrap rule.
- Documented a one-loop-model consolidation: reuse the existing session-only `loopStartMs`/
  `loopEndMs` with validating setters plus a new `isLoopRangeEnabled`, retire the marker-segment
  loop (`isLoopMarkerActive`/`toggleLoopMarker`, its `MarkerButton` button, rebind `L`), and keep
  whole-song repeat with defined precedence. Persistence bumps the project schema to 1.1.0.
- Added the planned-feature card to the Kanban To Do column and rotated the oldest handover entry
  (2026-10-09 wrapped accessibility semantics) verbatim into the archive to keep five live entries.
- No application code changed; this is a specification/planning artifact only.

**Key Artifacts** (from `git status`): `.kiro/specs/loop-range-overview/requirements.md`,
`.kiro/specs/loop-range-overview/design.md`, `.kiro/specs/loop-range-overview/tasks.md`,
`.kiro/specs/loop-range-overview/.config.kiro`, `AGENTS.md`,
`docs/context/archive/beatnote-project-history.md`.

**Verified:**

- `validate_spec_format` → 0 issues for `requirements.md` and `tasks.md`.
- `design.md` is markdown-lint clean (`mdlint.py` → 0 findings). `validate_spec_format` reports 4
  residual `design/missing-property-validates` warnings on 4 of 10 correctness properties; every
  property has an accurate `**Validates: Requirements ...**` line in the project's canonical form,
  and the warnings persisted across six formatting variants (same form the shipped
  wrapped-waveform-canvas spec uses), so they are treated as a validator-detection quirk, not a
  content gap.
- Spec grounded in the real code (store loop fields, `TimelineScrollbar`, `useAudioPlayer` poll,
  `loopSegmentsForRows`, `projectManager`, gesture config), read before writing.

**Not verified / known gaps:**

- No build/test/lint of application code was run — nothing was implemented. tsc/Jest/Playwright/
  XCTest are task checkpoints, not yet executed.
- Unresolved product decisions D-1..D-9 remain (min loop length, whether `loopEnabled` persists,
  replacing the retired marker loop, tap-to-seek, clear/restore affordance, desktop viewport strip,
  jump-when-started-after-end, restore-window length/focus, newer-version writability).
- The 4 design-validator warnings above were not cleared.

**Next agent should:**

- Begin Phase 1 of `.kiro/specs/loop-range-overview/tasks.md` (pure `src/utils/loopRange.ts` +
  `compareProjectVersion` with unit/property tests), keeping gesture and audio-boundary work direct.
