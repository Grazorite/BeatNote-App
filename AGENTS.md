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

**Last updated:** 2026-10-29
**Branch:** `codex/automatic-bpm-detection` · **Deploy:** Web (Netlify) · simulator and physical iOS dev launch verified · TestFlight pending
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
| iOS UI tests | 8 critical native integrations retained; focused V1 launch/settings, Open_In, and native BPM checks pass |
| E2E spec files | 2 (Playwright, 7 critical journeys) |
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Retest the physical-iPhone crash and latency fixes: annotation save, library rename, canvas seek,
   transport controls, portrait/landscape alignment, dock spacing, and Import Audio icon geometry.
2. Finish `automatic-bpm-detection` runtime acceptance: native cancellation latency, 150-second
   peak memory, browser long-task/long-song measurements, and representative real-song/physical-
   device evidence. Web production wiring, synthetic native accuracy, and Phases 2–7 are
   implemented; downbeat estimation remains deliberately open.
3. Complete `local-music-library-queue` physical-device acceptance (Task 44.4): Files and
   third-party Open_In, the provisional in-place-opening decision, backup/restore and relink,
   near-full storage, interruptions, force-quit flushing, VoiceOver, large text, and rapid queue use.
4. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
5. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
6. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
7. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
8. Keep the completed local choreography workflow stable while physical-device acceptance and the
   Apple Developer account remain outstanding; do not resume stem separation until the gates in
   `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Drafted the Phase 4.1 detector/test in `session-7adcd112-5f2d-43cf-9763-4af6440a1441`; the turn exhausted its token limit, then the orchestrator reviewed and repaired the implementation |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Execute `app-performance-optimization` Phase 0–1: fixtures, instrumentation, and physical
      Release-local baselines before any optimisation (spec drafted 2026-10-29, awaiting review)
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Stabilise and polish the physical-iPhone workflow: eliminate the Fabric/Yoga crashes when
      saving annotations or renaming songs, reduce interaction latency, align portrait/landscape
      chrome and dock spacing, and correct the Import Audio icon geometry
- [ ] Complete `automatic-bpm-detection` runtime acceptance; web provider, shared decode/worker,
      lifecycle/cache, suggestion preview/apply/restore, manual anchor/count controls, persistence,
      exports, retained browser flow, and octave-resolved native synthetic XCTest are implemented;
      measured long-song memory/cancellation, real-song accuracy, and physical acceptance remain
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

- [x] Retire the legacy `beatnote_projects` writers, reconcile the `local-music-library-queue` task list, and archive the completed `wrapped-waveform-canvas` spec
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `docs/context/archive/specs/wrapped-waveform-canvas/`, `src/utils/projectManager.ts`</sub>

- [x] Add bounded 0.05× decrement/increment buttons beside an inset playback-speed slider with 44×44
      targets, clear endpoint separation, accessible states, repeated-step dwell, and responsive coverage
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/requirements.md`, `.kiro/specs/playback-marker-control-dock/tasks.md`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Restore physical-iPhone launch under the iOS 27 SDK with a reproducible UIKit scene-lifecycle
      bridge while preserving Expo's launch bootstrap and local dev-client URL delivery
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `app.json`, `plugins/withIosSceneLifecycle.js`</sub>

- [x] Reconcile the completed waveform progress/playhead visuals and approve the requirements,
      architecture, and phased plan for automatic BPM, beat-anchor, and phrase-start assistance
      <sub>**Key Artifacts:** `.kiro/specs/automatic-bpm-detection/`, `docs/context/archive/specs/wrapped-waveform-canvas/requirements.md`, `docs/context/archive/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `tests/waveform-features.spec.ts`</sub>

- [x] Polish the V1 iPhone single-lane workflow by presenting the fixed `vocals` annotation lane
      honestly without exposing misleading multi-layer naming controls
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/utils/exportEngineCore.ts`, `src/utils/layers.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Raise the landscape loop overview above the home-indicator gesture zone and make dance-count
      guidance a persisted, default-off Settings option
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountDisplay.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/waveform/RhythmicGrid.tsx`, `src/components/ui/waveform/RowGutter.tsx`, `src/features/library/draftAutosave.ts`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/danceCountVisibilityControl.ts`, `src/types/project.ts`, `src/utils/persistedContent.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-10-29 — Close out library-queue spec bookkeeping and archive wrapped-waveform-canvas

**Agent:** orchestrator subagent (Kiro) · **Commit(s):** `uncommitted`
**Kanban moved:** `local-music-library-queue` Task 13.4 and spec bookkeeping → Done (only physical acceptance 1.2/44.4 remains in In Progress)

**Changed:**

- `src/utils/projectManager.ts`: removed the legacy whole-value writers `setStoredProjects`,
  `saveProject`, `deleteProject`, and `renameProject`, so nothing writes `beatnote_projects`. The
  read-only accessors, `withProjectDefaults`, `normalizePersistedLoop`, and `compareProjectVersion`
  remain.
- `.kiro/specs/local-music-library-queue/tasks.md`: reconciled against the audit by ticking 13.4,
  14.1, 13, 14, 15, 3, 7, and 10, marking the 28 optional `*` test tasks as dropped per the testing
  strategy, and correcting task 44.1 to seven Playwright journeys and ten XCTest cases.
- `wrapped-waveform-canvas` now lives in `docs/context/archive/specs/` (staged `git mv`).
- Rotated the 2026-10-28 automatic-BPM entry verbatim into
  `docs/context/archive/beatnote-project-history.md`.

**Verified:**

- Repo-wide search found no caller of the removed writers; `ProjectManager` has no importer and
  `compareProjectVersion` is the only export used elsewhere.
- `npx tsc --noEmit` → passed. `PLAYWRIGHT_PORT=8082 npm test` → 7/7 journeys passed.
- Search for `beatnote_projects` in `src/`, `tests/`, and `modules/` → only the read-path constants
  in `repositories.ts` and `projectManager.ts`, plus a test fixture seeding the legacy key.
- `mdlint.py` on `tasks.md` → clean.

**Not verified / known gaps:**

- Physical-device acceptance (Tasks 1.2 and 44.4) is still open, so tasks 1, 2, 44, and 44.4
  remain unticked and the `LSSupportsOpeningDocumentsInPlace` decision is still provisional.
- Historical entries in `docs/context/archive/beatnote-project-history.md` still cite the old
  `.kiro/specs/wrapped-waveform-canvas` path; they were left verbatim.
- iOS XCTest was not rerun; the change touches only JavaScript legacy-storage code.

**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `docs/context/archive/specs/wrapped-waveform-canvas/`, `src/utils/projectManager.ts`

**Next agent should:**

- Run the Task 44.4 physical-device matrix (Files and third-party Open In, backup/restore and
  relink, near-full storage, interruptions, VoiceOver); then close the spec.

### 2026-10-29 — Stabilise physical-iPhone editing and playback rendering

**Agent:** orchestrator (Codex) · **Commit(s):** `ec4d9c1`, `46bacc7`
**Kanban moved:** physical-iPhone crash, latency, and layout polish → In Progress (implementation verified locally; hardware retest pending)

**Changed:**

- Deferred annotation and library-rename store publication until their native iOS modals fully
  dismiss, and removed the redundant whole-studio keyboard-avoidance layout mutation implicated by
  three physical-device Fabric/Yoga ownership assertion crashes.
- Reduced playback-driven React work to the active wrapped row, playhead overlay, and time probe;
  made viewport following imperative, memoized row gestures, slowed visual sampling to 10 Hz, and
  stopped audio-status events from re-rendering the complete studio tree.
- Aligned the portrait/landscape toolbar with the waveform and control rail, restored bottom rail
  breathing room without shrinking touch targets, and moved the Import Audio arrow inward.
- Retained browser coverage for annotation persistence, rename/rename-back, toolbar geometry, dock
  clearance, and icon geometry; the concurrent speed-step implementation was included so its
  already-added retained assertions remain self-contained at this commit.
- Kept one stable mobile body/waveform tree across rotation so decoded peaks are no longer discarded
  and replaced by placeholder lines while the landscape hierarchy remounts; waveform sizing now
  follows one batched measured-layout update instead of transient screen dimensions.
- Moved loop drag/resize previews out of the global project store, coalesced them to animation
  frames, and commit the valid range once on release so wrapped-row geometry and persistence do not
  rebuild for every finger-move event.

**Verified:**

- Three iPhone crash reports symbolicated to the same
  `YogaLayoutableShadowNode::layout` owner assertion during modal/text-input tree changes.
- `npx tsc --noEmit`, version consistency, empty permanent unit gate, and `git diff --check` → passed.
- Full retained Playwright gate → 7/7 journeys passed after the final audio-status optimization.
- Physical iPhone 15 Pro Max → song rename completed without exit; marker annotation saved and
  reopened with its text intact. No new BeatNote crash report was produced afterward.
- A later reopen failure was traced to Metro no longer listening on port 8081, not an app crash;
  Metro was restarted, the wired payload was relaunched, 1,478 modules bundled, and both the app
  process and packager were confirmed live.
- Physical follow-up found ordinary waveform and transport response improved, while loop dragging
  and rotation still exposed lag; the follow-up implementation passed the two focused responsive
  journeys and the full retained Playwright gate (7/7), then bundled and launched on the iPhone.

**Not verified / known gaps:**

- Physical input-to-visual latency and final portrait/landscape comfort still require hands-on
  confirmation. Debug/Metro latency must not be treated as Release/TestFlight performance evidence.
- Broader Instruments/Hermes profiling, long-song memory evidence, and RN/Expo upgrade evaluation
  remain suitable for a dedicated performance specification rather than speculative V1 rewrites.
- The shared tree still contains unrelated staged spec-archive moves and uncommitted BPM,
  performance-spec, speed-control, and project-manager work; `ec4d9c1` and `46bacc7` isolate the
  completed physical-iPhone changes from that concurrent state.

**Next agent should:**

- Retest loop creation/move/resize and repeated portrait/landscape rotation in the running iPhone
  bundle, then collect Release/TestFlight performance evidence separately from Metro overhead.

### 2026-10-29 — Add precise playback-speed step buttons

**Agent:** orchestrator (Codex) · **Commit(s):** `ec4d9c1`
**Kanban moved:** playback-speed decrement/increment controls → Done

**Changed:**

- Added 44×44 minus and plus controls on either side of the existing speed slider, reusing the
  established 0.05× normalization so each press updates pitch-preserved playback immediately.
- Inset the slider track, thumb, and range labels by 12 points inside their column so the thumb no
  longer spills into either button's visual space at the 0.5× or 2× endpoint.
- Disabled the controls at 0.5× and 2×, added explicit accessible labels/hints/states, and retained
  the popup's interruptible 700-millisecond dwell so repeated stepping remains comfortable.
- Updated the playback-speed contract and retained responsive dock journey for both directions and
  lower/upper bound behavior.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → passed with the concurrent physical-iPhone work present.
- Focused responsive dock journey → passed, including 1×→0.95×→1× stepping, disabled controls at
  0.5× and 2×, measured thumb/button separation at both endpoints, presets, slider dragging,
  dismissal/reopen, and portrait/landscape geometry.
- Full retained Playwright gate → 7/7 critical journeys passed after one earlier unrelated
  library-menu/server retry.

**Not verified / known gaps:**

- Physical-iPhone touch comfort, VoiceOver pronunciation, and maximum Dynamic Type remain part of
  the existing playback-control acceptance backlog.
- The wider dirty tree belongs to the concurrent physical-iPhone/runtime work and remains uncommitted;
  this task changed only the documented speed-control files and their shared retained journey.

**Next agent should:**

- Exercise repeated −/+ presses with VoiceOver on the physical iPhone, then continue the active
  Fabric/Yoga crash and interaction-latency investigation.

### 2026-10-29 — Verify physical iOS 27 launch

**Agent:** orchestrator (Codex) · **Commit(s):** `32a3161`
**Kanban moved:** physical-iPhone iOS 27 scene launch → Done

**Changed:**

- Closed the scene-lifecycle launch task after validating the generated config-plugin output on an
  iPhone 15 Pro Max running iOS 27.0.1.
- Documented the locally signed Xcode/CLI workflow and the wired local Metro payload path used when
  the phone is not on the Mac's Wi-Fi network.

**Verified:**

- Signed Debug device build with Xcode 27.1 and the iOS 27.1 SDK → succeeded for
  `com.beatnote.app`; installation and `devicectl` launch both succeeded on the connected phone.
- Native shell → reached Expo Development Build without the former UIScene runtime failure.
- Local wired payload URL → Metro bundled 1,370 modules and the physical phone rendered the
  BeatNote studio UI; startup also completed the library orphan sweep.
- Background/foreground scene cycle → after foregrounding iOS Settings, BeatNote reactivated with
  its loaded song, waveform, markers, playhead, and loop state intact.
- Version consistency, `npx tsc --noEmit`, the intentionally empty unit gate, JavaScript syntax,
  full retained Playwright gate (7/7), `git diff --check`, and orchestrator close-contract
  validation → passed.

**Not verified / known gaps:**

- Physical Files/third-party Open In, background audio continuity, interruptions,
  Bluetooth, and the remainder of the existing device acceptance matrix are still open.
- The public-tunnel option was deliberately not used; the verified development path stays local to
  the Mac/iPhone wired connection.

**Next agent should:**

- Continue Task 44.4 with physical Files import and third-party Open In, then exercise playback,
  backgrounding, and force-quit draft restoration with a representative song.

### 2026-10-29 — Verify native BPM and restore scene launch

**Agent:** orchestrator (Codex) · **Commit(s):** `32a3161`
**Kanban moved:** automatic-BPM native runtime coverage → In Progress (synthetic workflow verified; performance and hardware acceptance remain)

**Changed:**

- Retained an eighth iOS UI journey that generates and imports a 12-second 120-BPM WAV, accepts
  either the direct estimate or its octave-resolved alternative, and exercises preview, overlay,
  apply, restore, Set Count 1, and both anchor-nudge sizes.
- Added the reproducible iOS 27 scene-lifecycle config plugin. It keeps Expo's React Native/dev-
  launcher bootstrap in `didFinishLaunching`, attaches that window to the connected scene, and
  forwards scene lifecycle, URLs, and user activities through the app delegate.
- Updated the automatic-BPM plan and iOS steering with measured native evidence and the remaining
  cancellation, memory, real-song, Open_In, and physical-device gaps.

**Verified:**

- Focused iPhone 17 Pro / iOS 26.2 simulator journey
  `testAutomaticBpmSuggestionAndAnchorControls` → passed; the native provider returned 60.09 BPM
  with a 120.19 BPM double-tempo alternative, both within the spec's octave-resolved ±0.5-BPM band.
- The same journey verified Expo Dev Launcher no longer crashes under scene adoption, then imported
  audio and completed the full BPM/anchor interaction flow.
- `npx tsc --noEmit`, version consistency, the intentionally empty unit gate, JavaScript syntax,
  Swift parse, config-plugin idempotence, and `git diff --check` → passed.

**Not verified / known gaps:**

- Native cancellation latency, 150-second peak memory, representative real-song accuracy,
  downbeat estimation, and physical-device behavior remain open.
- The complete eight-case native suite and Open_In case were not rerun after scene adoption; only
  the focused launch/import/BPM journey passed. The retained Playwright gate could not start in the
  sandbox because Expo's port scan overflowed to 65536, and the unsandboxed retry was rejected when
  the approval reviewer hit its usage limit; the prior feature commit's full 7/7 gate remains the
  latest browser evidence.

**Next agent should:**

- Run the focused native cancellation/long-fixture memory checks, then the full native suite with
  Open_In before the physical-iPhone scene-lifecycle and automatic-BPM acceptance pass.

<!-- end handover log -->
