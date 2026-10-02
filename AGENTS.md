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

**Last updated:** 2026-10-02
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
| Unit tests | 26 passing (stem slice + stemCache) |
| iOS UI tests | 9 passing on iPhone 17 Pro / iOS 26.2 simulator |
| E2E spec files | 5 (Playwright, 60 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   landscape waveform and CSV I/O, compact controls, project save/relaunch/restore, and settings drawer. Interactive Xcode 27
   testing uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the
   Simulator app on this host.
2. Close the unit-test coverage gap the testing strategy requires (utils + real store actions).
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
- [ ] Implement wrapped waveform canvas (planned, spec ready) — pure row-layout/mapping utilities, virtualized wrapped rows, per-row seek/markers/progress, follow-playhead, responsive detail mode; see `.kiro/specs/wrapped-waveform-canvas/`
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement section looping for rehearsal and physical-device acceptance coverage
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Refine iOS mobile studio layout, expose toolbar scrolling, and hide deferred stem UI for V3
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

- [x] Close iOS mobile acceptance defects — overview tap/drag seeks, live marker annotations, compact fixed controls, full-width waveform, landscape CSV actions, and long-track simulator coverage
      <sub>**Key Artifacts:** `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/long-test-track.m4a`</sub>
- [x] Enable iOS background audio playback and verify time continuity through background/foreground in XCTest
      <sub>**Key Artifacts:** `app.json`, `src/hooks/useAudioPlayer.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/background-audio.m4a`</sub>
- [x] Route native timeline gestures to JS state safely, preserve vertical scrolling, and compact phone controls; cover landscape tap/drag in XCTest
      <sub>**Key Artifacts:** `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/SimpleWaveform.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/markerButton.ts`, `src/styles/components/controls/projectControls.ts`, `tests/ios/BeatNoteUITests.swift`</sub>
- [x] Repair Playwright marker, layer-selector, audio-loading, and responsive assertions; full suite is green
      <sub>**Key Artifacts:** `tests/setup.ts`, `tests/core-functionality.spec.ts`, `tests/quality-assurance.spec.ts`, `tests/test-discovery.spec.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/HorizontalLayerSelector.tsx`</sub>
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

### 2026-10-01 — Close mobile iOS acceptance defects

**Agent:** orchestrator (Codex GPT-6) · **Commit(s):** `9fffab3`
**Kanban moved:** iOS mobile acceptance defects → Done; physical-device acceptance remains In Progress

**Changed:**

- Made the overview timeline seek on tap and drag, and resized it to its measured width.
- Kept a newly added marker selected for annotation while playback advances; made the project toolbar respond to taps while the annotation keyboard is open.
- Replaced the wrapping mobile toolbar with a fixed horizontal action row and bottom control dock; corrected waveform height/width and mobile safe-area padding.
- Added a 150-second audio fixture and iOS UI coverage for overview seeking, live annotation, and landscape CSV actions; documented the manual simulator path.

**Key Artifacts** (from `git diff --name-only`, plus the new fixture): `.gitignore`, `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `playwright.config.ts`, `scripts/ios-ui-test.js`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/styles/components/controls/projectControls.ts`, `src/styles/layout/mainContent.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/long-test-track.m4a`.

**Verified:**

- `npm run test:ios:ui` → 9 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790818599021.xcresult`.
- Focused save/relaunch/restore XCTest passed with the annotation keyboard open.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `PLAYWRIGHT_PORT=8082 npm test -- --reporter=list` → 60 passed; `git diff --check` → clean.
- `git push origin master` → `origin/master` advanced to `9fffab3`; working tree clean after the implementation commit.

**Not verified / known gaps:**

- Physical iPhone audio interruptions, visual rotation/safe-area quality, and sharing to a real external destination remain manual acceptance checks. Simulator geometry assertions do not prove pixel-perfect layout on every device.
- Xcode emits existing dependency/module-cache and post-test `simctl` diagnostics despite all nine XCTest cases passing.
- The implementation commit and long-track fixture are pushed; physical-device acceptance is still pending.

**Next agent should:**

- Run physical-device acceptance, then close the unit-coverage gaps before advancing native stem separation.

### 2026-10-01 — Enable and verify iOS background playback

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Simulator background-playback acceptance → Done; physical-device acceptance remains In Progress

**Changed:**

- Enabled iOS background audio capability and configured Expo Audio to play in silent mode and continue while the app is backgrounded.
- Added a 30-second AAC fixture and an XCTest that confirms the playback clock advances across a background/foreground transition; made annotation-field UI testing wait for the rendered value before saving.
- Documented simulator coverage and real-device interruption gaps in `.kiro/steering/ios-testflight.md`.
- **Workflow conflict resolved:** `AGENTS.md` had 20 live completed cards, while `~/.codex/skills/local-agent-orchestrator/references/lifecycle.md` defaults to five; archived 16 older cards and the oldest handover in `docs/context/archive/beatnote-project-history.md`. Preserved the explicit 10-entry log cap from `AGENTS.md`.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `app.json`, `scripts/ios-ui-test.js`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/hooks/useAudioPlayer.ts`, `tests/ios/BeatNoteUITests.swift`, `docs/context/archive/beatnote-project-history.md`; `tests/fixtures/background-audio.m4a` is ignored by the repository's media pattern and must be force-added.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test -- --reporter=list` → 60 passed; initial sandbox run could not bind Expo's web server, elevated rerun passed.
- `npm run test:ios:ui` → 6 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790790644556.xcresult`.
- Focused background-playback XCTest → passed; `git diff --check` → clean.
- `python3 ~/.codex/skills/local-agent-orchestrator/scripts/validate_contract.py <project-root>` → 0 contract errors before board compaction.

**Not verified / known gaps:**

- Real-device call/audio-route interruptions and external-destination sharing remain manual acceptance checks.
- Xcode emits existing dependency/module-cache diagnostics and a post-test `simctl` lookup warning; XCTest reports all six cases Passed.

**Next agent should:**

- Run physical-device audio interruption and external-share acceptance, then return to the unit-coverage gap.

### 2026-09-30 — Fix iOS timeline gestures and compact phone controls

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Native timeline gesture errors + phone control sizing → Done; physical-device acceptance remains In Progress

**Changed:**

- Routed tap/pan callbacks that access Zustand or React state through the JS thread, and constrained pans to horizontal movement so vertical page scrolling can reach the overview timeline.
- Made phone detection orientation-aware on native platforms while preserving width-based web breakpoints; reduced mobile transport/marker controls to 52-point targets and tightened project actions.
- Added a landscape iOS UI test covering waveform and overview timeline tap/drag, absence of the runtime error screen, and compact control dimensions.

**Key Artifacts** (from `git diff --name-only`): `AGENTS.md`, `src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/SimpleWaveform.tsx`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/markerButton.ts`, `src/styles/components/controls/projectControls.ts`; `tests/ios/BeatNoteUITests.swift` is present as an untracked file in `git status`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test -- --reporter=list` → 60 passed across 5 Playwright specs.
- `npm run test:ios:ui` → 5 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790758734538.xcresult`.
- The landscape XCTest tapped and dragged both gesture surfaces and asserted the runtime error screen was absent; `git diff --check` → clean.

**Not verified / known gaps:**

- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- Xcode still prints module-cache/debugger diagnostics and a post-test `simctl` diagnostic warning; XCTest passes despite these host-tooling warnings.

**Next agent should:**

- Complete the physical-device acceptance checklist, then return to the remaining unit-coverage and Demucs work.

### 2026-09-30 — Rerun automated regression gates

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Automated regression gates → reverified; physical-device acceptance remains In Progress

**Changed:**

- Verification-only rerun; no implementation or test source files were changed. Updated this handover with current results and the native-runtime warning discovered after app relaunch.
- Relaunched BeatNote in the iPhone 17 Pro simulator and left Metro serving for manual acceptance.

**Key Artifacts** (from `git diff --name-only`): `AGENTS.md` (verification record; source changes remain from prior uncommitted work).

**Verified:**

- `npx tsc --noEmit` → clean; `npx jest --testPathPatterns=unit --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test` → 60 passed across 5 Playwright spec files.
- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790748329968.xcresult`.
- Metro status endpoint → `packager-status:running`; simulator screenshot confirms BeatNote Studio renders after relaunch.

**Not verified / known gaps:**

- Metro logs Reanimated worklet errors for `setViewportLocked`, `setViewportStartTime`, and `dispatchSetState` on the UI thread. `TimelineScrollbar` pan callbacks call Zustand setters directly; waveform scrubbing needs investigation because XCTest does not cover this gesture path.
- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- Xcode emitted a post-test diagnostic that it could not find `simctl`; the XCTest result bundle reports all four cases Passed.

**Next agent should:**

- Investigate/fix the native TimelineScrollbar worklet callback errors, verify waveform scrubbing, then continue physical-device acceptance.

### 2026-09-29 — Repair web regressions and verify the clean iOS picker path

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Playwright regression failures → Done; clean-simulator Files picker → Done; physical-device acceptance remains In Progress

**Changed:**

- Replaced ambiguous marker/layer text queries with stable test IDs, loaded the audio fixture through the real picker flow, and aligned responsive/accessibility checks with actual touch behavior.
- Exposed the marker button's native/web accessibility role, label, and disabled state.
- Updated XCTest Files navigation to browse `On My iPhone > BeatNote` when the simulator's Recents list is empty.
- Documented the Xcode 27 Device Hub workflow and Expo CLI Simulator-app limitation.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `src/components/ui/controls/HorizontalLayerSelector.tsx`, `src/components/ui/controls/MarkerButton.tsx`, `tests/setup.ts`, `tests/core-functionality.spec.ts`, `tests/quality-assurance.spec.ts`, `tests/test-discovery.spec.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed.
- `EXPO_NO_TELEMETRY=1 npm test` → 60 passed across 5 Playwright spec files.
- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro / iOS 26.2 simulator; result bundle `ios/build/BeatNoteUITests-1790673519618.xcresult`.
- `git diff --check` → clean.
- Xcode 27 Cmd+R built and launched BeatNote on iPhone 17 Pro; Metro bundled 2,957 modules and a simulator screenshot confirmed the Studio screen rendered.

**Not verified / known gaps:**

- Physical-device playback/scrubbing/background/share acceptance remains outstanding.
- `npm run ios -- --device 'iPhone 17 Pro'` stops with `Can't determine id of Simulator app`; use the Xcode 27 workspace Run action and Device Hub on this host.
- Native dependency deprecation/nullability warnings remain; they did not fail the iOS UI suite.

**Next agent should:**

- Complete the physical-device acceptance checklist, then address the missing utility/store unit-test coverage before advancing native stem separation.

### 2026-09-24 — Make iOS project workflow reachable and automate restore

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Mobile layout blocker → Done; save/relaunch/restore acceptance → Done

**Changed:**

- `StudioScreen.tsx`, `MainContent.tsx`, and layout styles: removed the nested outer scroll view,
  use the full phone viewport when the overlay sidebar is closed, pin project controls while scrolling,
  stack transport/marker controls on narrow screens, and prevent the annotation field from flexing
  beyond the visible mobile content.
- `SidebarToggle.tsx`, `ProjectControls.tsx`, and `AnnotationField.tsx`: expose stable sidebar test IDs,
  provide a drawer-reopen control, use compact wrapping project controls, and size annotations for mobile.
- `BeatNoteUITests.swift`: run acceptance in portrait, close the overlay sidebar, enter an annotation,
  save a project, terminate/relaunch, load the project, verify its marker/annotation/audio state, and
  delete the temporary project.
- `.kiro/steering/ios-testflight.md`: document current automated coverage and remaining physical
  device checks.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`,
`src/features/studio/StudioScreen.tsx`, `src/components/layout/MainContent.tsx`,
`src/components/ui/controls/SidebarToggle.tsx`, `src/components/ui/controls/ProjectControls.tsx`,
`src/components/ui/controls/AnnotationField.tsx`, `src/styles/features/studioScreen.ts`,
`src/styles/layout/mainContent.ts`, `src/styles/components/controls/projectControls.ts`,
`tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro, iOS 26.1 simulator; includes drawer open/close,
  project round-trip, valid/invalid import, and share-sheet export.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `git diff --check` → clean.
- `EXPO_NO_TELEMETRY=1 npm test` → 52 passed, 8 failed; older checks have stale marker, responsive,
  and sidebar expectations. These web failures were not repaired as part of iOS hardening.
- Result bundle: `ios/build/BeatNoteUITests-1790233343129.xcresult`.

**Not verified / known gaps:**

- Physical-device audio behavior, waveform scrubbing, background interruptions, and sharing to an
  external app remain manual acceptance checks.
- The Playwright suite is not a clean regression gate yet; its 8 failing checks need separate review.
- Xcode reports a post-test simulator diagnostics `simctl` lookup warning and UIKit UIScene lifecycle
  deprecation warnings; the XCTest run itself passes.

**Next agent should:**

- Complete physical-device audio/scrub/background/share acceptance. Separately update stale Playwright
  assumptions and expand unit coverage before advancing the Demucs native interface.

### 2026-09-24 — Add repeatable iOS XCTest acceptance workflow

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** Automated iOS acceptance tests → Done; core iOS acceptance → In Progress

**Changed:**

- `plugins/withIosUiTests.js`, `app.json`, `package.json`, `package-lock.json`: generate a
  `BeatNoteUITests` Xcode target and shared scheme on Expo prebuild; add `npm run test:ios:ui`.
- `scripts/ios-ui-test.js`, `tests/ios/BeatNoteUITests.swift`, `tests/fixtures/`: automate simulator
  build, Metro startup, fixture staging, launch, audio playback, annotation, CSV import validation,
  and share-sheet export. Results are saved as ignored `.xcresult` bundles.
- `src/hooks/useScrollZoom.ts`: guard the web-only DOM event hookup from native views. XCTest found
  the `element.addEventListener is not a function` startup crash previously seen in the simulator.
- Added test IDs to interactive controls and enabled loading saved projects when no audio is loaded.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`,
`App.tsx`, `app.json`, `package-lock.json`, `package.json`, `src/components/layout/MainContent.tsx`,
`src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`,
`src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/AudioControls.tsx`,
`src/components/ui/controls/LayerControls.tsx`, `src/components/ui/controls/MarkerButton.tsx`,
`src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`,
`src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`,
`src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectModal.tsx`,
`src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`,
`src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`,
`src/hooks/useAudioPlayer.ts`, `src/hooks/useScrollZoom.ts`, `src/hooks/useStudioStore.ts`,
`src/styles/components/controls/timelineScrollbar.ts`, `tests/fixtures/test-audio.wav`,
`plugins/withIosUiTests.js`, `scripts/ios-ui-test.js`, `tests/fixtures/invalid-import.csv`,
`tests/fixtures/valid-import.csv`, `tests/ios/BeatNoteUITests.swift`.

**Verified:**

- `npm run test:ios:ui` → 4 passed on iPhone 17 Pro, iOS 26.1 simulator.
- `npx tsc --noEmit` → clean; `npm run test:unit -- --runInBand` → 26 passed; `git diff --check` → clean.
- Xcode 27 rebuild and XCTest result bundle at `ios/build/BeatNoteUITests-1790230527899.xcresult`.

**Not verified / known gaps:**

- Save/relaunch/restore remains manual: focusing the annotation field scrolls project controls out of
  view, and the project controls are clipped in portrait. UI layout needs keyboard/scroll hardening.
- Physical-device audio, scrubbing, background interruptions, and sharing to an external destination
  are not covered by simulator automation. Xcode logs a simulator diagnostics warning after tests,
  but the XCTest result itself passes.

**Next agent should:**

- Fix the mobile nested-scroll/keyboard layout so project controls remain reachable, then add project
  save/relaunch/restore back to the UI suite and complete a physical-device acceptance pass.

### 2026-09-24 — Partial iOS workflow acceptance; restore project audio

**Agent:** orchestrator (Codex GPT-5) · **Commit(s):** `uncommitted`
**Kanban moved:** iOS core workflow acceptance → In Progress (simulator UI interaction unavailable)

**Changed:**

- `src/components/ui/controls/TimelineScrollbar.tsx`: removed an unused lowercase web-SVG `<defs><clipPath><rect>` block that crashed React Native SVG when rendering the iOS studio; screenshots and Metro logs identified this as the load-screen error.
- `src/hooks/useStudioStore.ts`, `src/hooks/useAudioPlayer.ts`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/layout/MainContent.tsx`, `src/features/studio/StudioScreen.tsx`: loading a saved project now routes its saved audio URI and original filename into the audio player. Previously project data restored but the player remained unset.
- `AGENTS.md`, `.kiro/steering/ios-testflight.md`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, `plugins/withIosPodDeploymentTarget.js`, and the iOS-safe layout/SVG files under `src/`: local simulator baseline, earlier TypeScript fixes, and this acceptance pass remain uncommitted in the shared worktree.

**Key Artifacts** (from `git diff --name-only`): `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `App.tsx`, `app.json`, `package-lock.json`, `package.json`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/StemsView.tsx`, `src/components/ui/controls/LayerControls.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/TimelineScrollbar.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/StemWaveform.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/studio/StudioScreen.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/timelineScrollbar.ts`; `plugins/withIosPodDeploymentTarget.js` is new and untracked.

**Verified:**

- Xcode 27 built and launched the app in the iPhone 17 Pro simulator; Metro bundled the app and the studio screen rendered.
- The supplied simulator screenshot and Metro stack trace pinpointed the lowercase SVG tags in `TimelineScrollbar`; removed them. Metro is running in normal development mode at port 8081 for simulator reload.
- `npx tsc --noEmit` → clean.
- `npm run test:unit -- --runInBand` → 26 passed, 2 suites.
- `git diff --check` → clean.

**Not verified / known gaps:**

- Simulator UI taps are unavailable through the exposed computer-control surface, so document-picker audio load, playback/scrub, markers, save/relaunch, import, and share-sheet export were not interactively exercised.
- Physical-device behavior and `npm test` Playwright E2E were not run. Cached audio URI availability after OS cache eviction remains a risk for saved projects.

**Next agent should:**

- Complete the iOS core workflow acceptance checklist interactively in Simulator or on an iPhone, especially project reload and Files/share interoperability; fix any defects before starting native stem-separation work.
