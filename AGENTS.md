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

**Last updated:** 2026-10-22
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
| iOS UI tests | 6 critical native integrations retained; focused V1 launch/settings check passes |
| E2E spec files | 2 (Playwright, 6 critical journeys) |
| Native Expo modules | 1 (`BeatNoteWaveform`, iOS AVAssetReader extraction) |

### Current Focus

1. Continue `local-music-library-queue` Phase 8 by restructuring the Project Manager (Task 36),
   followed by moving confirmed/reversible CSV import and export into it (Task 37); Music Library
   row actions and the Song Title toolbar integration are complete.
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
6. Advance 8-count/rehearsal features and provider-neutral monetisation groundwork; do not resume
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

- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Implement `local-music-library-queue` from its approved phased spec; Phase 0 and the pure
      foundations through the Phase 7 track-switch checkpoint and Phase 8 queue-control checkpoint
      are complete; the icon, bottom-sheet, overflow, row, list, search/sort, and picker-import
      surfaces, Music Library row actions, and Song Title toolbar integration are also complete,
      with the Project Manager restructure next
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

- [x] Add rename/delete/relink/Show Projects library actions and replace the legacy load-song path
      with the accessible Song Title control, filtered project routing, ordered queue announcements,
      and updated browser/native journeys
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/SongTitleControl.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/features/library/importPipeline.ts`, `src/features/library/libraryActions.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useAudioPlayer.ts`, `src/styles/components/controls/songTitleControl.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/setup.ts`, `tests/test-helpers.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Build the accessible Music Library sheet with reusable rows and overflow actions, scroll-safe
      loading/empty/error/search/sort states, persisted sorting, guarded track switching, import
      progress/cancellation/retry, and native/web audio-picker ingestion
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/OverflowMenu.tsx`, `src/components/ui/library/`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/features/library/importPipeline.ts`, `src/features/library/repositories.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/common/overflowMenu.ts`, `src/styles/components/library/`</sub>

- [x] Extend the shared icon family and add the accessible detented bottom-sheet primitive with
      Reduce Motion, safe-area/keyboard/rotation handling, focus restoration, and web focus trapping
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/index.ts`, `src/styles/components/common/bottomSheet.ts`, `src/utils/sheetDetent.ts`</sub>

- [x] Replace the reserved dock cells with queue navigation and Shuffle, then gate dependent
      playback surfaces against provider capabilities without regressing the direct-file transition
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/controls/RepeatControl.tsx`, `src/features/library/sourceResolver.ts`, `src/styles/components/controls/audioControls.ts`, `src/styles/components/controls/dockButton.ts`, `src/styles/layout/mainContent.ts`</sub>

- [x] Add all-or-nothing track switching, the dirty-project switch guard, rapid destination
      coalescing, directional failure skipping, launch restoration, and project/import routing
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/trackSwitch.ts`, `src/features/library/useLibraryLifecycle.ts`, `src/features/library/projectService.ts`, `src/features/library/importPipeline.ts`, `src/features/library/repositories.ts`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Add safe Save, Save as New, revision/name conflict handling, project rename/delete/open/revert,
      stored/current CSV export, accessible save prompts, and the V1.2 Project Manager cutover
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/projectService.ts`, `src/hooks/useStudioStore.ts`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/ConfirmDialog.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SaveProjectPrompt.tsx`, `src/utils/exportEngineCore.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Add per-song draft autosave with bounded latency, background flushing, foreground retry,
      persistent read/write/storage failure recovery, and cross-service dock notices
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/draftAutosave.ts`, `src/features/library/repositories.ts`, `src/features/library/useLibraryLifecycle.ts`, `src/components/ui/common/PersistenceBanner.tsx`, `src/components/layout/MainContent.tsx`</sub>

- [x] Add the serialized local-library boot lifecycle, resumable migration hydration, missing-file
      reconciliation, queue restoration, Retry locking, and protected orphan sweep
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/useLibraryLifecycle.ts`, `src/features/library/repositories.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Add the local music library, draft/project, queue, and switch slices; atomically apply track
      state; and move the active audio URI and transitional filename into the store
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `src/features/library/repositories.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`</sub>

- [x] Standardise the loop overview with the wrapped timeline palette and distinguish overview and
      canvas playheads using a shared amber core, dark underlay, and triangular cap
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/requirements.md`, `.kiro/specs/wrapped-waveform-canvas/tasks.md`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `tests/waveform-features.spec.ts`</sub>

- [x] Standardise real waveform extraction between the web build and native iOS, replacing native
      synthetic peaks with an AVAssetReader Expo module and keeping resolution behind a
      capability-ready provider boundary for a future Lite/Pro distinction
      <sub>**Key Artifacts:** `.kiro/specs/wrapped-waveform-canvas/`, `.kiro/steering/architecture-decisions.md`, `.kiro/steering/release-roadmap.md`, `modules/beatnote-waveform/`, `package.json`, `src/components/ui/controls/LoopOverviewTrack.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/hooks/useWaveformData.ts`, `src/services/waveformExtraction*`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Keep the playback-speed popup above the central Play control and make the first Speed press
      during or immediately after dismissal reopen it without a dead tap
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/controlDock.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Add reusable CSV preview/replace/undo and legacy migration planning transforms, and enforce
      version 1.0.0 parity across package metadata, Expo/Metro, and generated iOS development builds
      <sub>**Key Artifacts:** `.kiro/specs/local-music-library-queue/tasks.md`, `.kiro/steering/ios-testflight.md`, `app.json`, `package.json`, `plugins/withVersionConsistency.js`, `scripts/check-version-consistency.js`, `src/utils/csvReplace.ts`, `src/utils/importEngine.ts`, `src/utils/migrationPlan.ts`</sub>

- [x] Stabilise direct playback-speed dragging, replace abrupt popup removal with an interruptible
      collapse/fade, remove redundant speed feedback, and keep loaded-song Annotation actionable
      with marker-prerequisite guidance
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/styles/components/controls/playbackSpeedControl.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

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

### 2026-10-22 — Complete library actions and Song Title navigation

**Agent:** orchestrator (Codex) + local review agent · **Commit(s):** `1094996`, `eed382f`, `ad064e2`, `ca2e56c`
**Kanban moved:** Music Library row actions and Song Title toolbar → In Progress (Tasks 34–35 complete)

**Changed:**

- Added identity-preserving rename, file-first safe deletion, retained missing-audio drafts and
  projects, confirmed relink, and per-song Show Projects routing without changing queue position.
- Replaced the direct load-song shim with a one-line accessible Song Title control that hosts the
  mounted library sheet, shows missing state, and keeps Save available for editable missing-audio
  drafts.
- Centralized queue-origin title announcements at successful transaction commit so Skip and rapid
  coalescing announce in commit order; added routed modal focus handling and race-safe native waits.
- Preserved the toolbar CSV buttons until Task 37.4. This resolves the sequencing conflict between
  `.kiro/specs/local-music-library-queue/requirements.md` Requirement 8.1/8.9 (final four actions)
  and `.kiro/specs/local-music-library-queue/tasks.md` Task 37.4 (explicit removal owner) while the
  retained CSV journeys still target those buttons.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, legacy-loader
  search, and `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed with durable WAV import.
- Focused iPhone 17 Pro / iOS 26.2 simulator launch/picker journey → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792679367535.xcresult`.
- Local reviewer found announcement, focus, and native-wait races; all were corrected and the
  resulting TypeScript/diff checks passed. The requested DSH bridge remained unavailable.

**Not verified / known gaps:**

- The focused XCTest passed before its final filename-specific wait was hardened; that test-only
  change was not rebuilt after review. Physical-device picker/import, VoiceOver, sheet gestures,
  keyboard/search, row-action failure paths, and relink remain unverified.
- Toolbar CSV actions intentionally remain until Task 37.4; therefore the final Requirement 8.1
  four-action layout is not yet complete.
- Concurrent uncommitted waveform/playhead edits remain outside all four commits.

**Next agent should:**

- Implement Task 36.1 `CurrentProjectSection`, then Task 36.2 `ProjectRow` before replacing the
  current Project Manager with the sectioned surface.

### 2026-10-22 — Complete the Music Library sheet

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `af1ef7a`, `654f8ab`, `bef8830`
**Kanban moved:** Music Library sheet and picker import → In Progress (Task 33 complete)

**Changed:**

- Added the accessible glass overflow menu, current/missing library rows, and cancellable or
  retryable import-progress rows with stable identifiers and large-text-safe controls.
- Added the scroll-safe Music Library sheet with exact loading, migration, empty, no-match, and
  read-error states; Imported Music filtering; persisted sort; diacritic-insensitive search; project
  counts; and guarded row switching with inline failure recovery.
- Moved sheet dismissal to the fully committed library-switch path, including guarded continuation,
  and added a session-only failure channel so provisional commits and rollbacks never dismiss the
  sheet or lose the row-level Retry action.
- Wired the native/web document picker to the shared durable Import Pipeline, including MIME and
  web extension filters, no-base64 web ingestion, cancellation semantics, queue rebuild/open, and
  dock confirmations.

**Verified:**

- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean after each checkpoint.
- Full retained Playwright gate → 6/6 critical journeys passed after Tasks 33.1–33.2, 33.3, and 33.4.
- Installed Expo DocumentPicker source confirms the web `accept` attribute joins the supplied MIME
  and extension filters; a read-only second review found no remaining P1/P2 issues in Task 33.3.

**Not verified / known gaps:**

- The sheet is not mounted until Task 35.2, so integrated native/web visual checks, VoiceOver,
  keyboard/search, detent gestures, and real picker/import interaction remain pending.
- The requested DSH bridge discovery was retried, but no `dsh_collab` or `dsh_task_*` tool was
  exposed; a local Codex reviewer completed Task 33.3 review, while its later Task 33.4 pass hit an
  account usage limit before reporting.
- Concurrent uncommitted waveform/playhead edits remain outside all three commits.

**Next agent should:**

- Implement Task 34.1 music-item rename, then Task 34.2 deletion semantics.

### 2026-10-22 — Add icons and accessible bottom sheet

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `721e004`, `4bf2c9b`
**Kanban moved:** local library icons and bottom sheet → In Progress (Tasks 31–32 complete)

**Changed:**

- Added the seven missing shared glyphs and verified the complete nine-icon set remains distinct at
  18 px without colour; existing chevron-down and warning glyphs were retained.
- Added the pure sheet-detent resolver and a reusable liquid-glass BottomSheet with medium/large
  detents, header-only pan, animated dismissal, safe areas, keyboard expansion, and rotation refits.
- Added live Reduce Motion handling, accessible detent switching and Close, title/return focus,
  web Tab/Shift-Tab trapping, Escape dismissal, and cancelled-pan recovery.

**Verified:**

- Temporary detent property checks → 3/3 passed, then removed per policy.
- Chromium icon grid → all nine glyphs legible and distinguishable at exactly 18 px.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- The primitive is not mounted until the Music Library surface lands, so real sheet drag, keyboard,
  focus, VoiceOver, and rotation behavior still require integrated simulator and physical checks.
- The DSH bridge was unavailable in this Codex session; local Ollama and the configured Qwen model
  were available, so implementation continued in Codex after the required preflight report.
- Concurrent uncommitted waveform/playhead edits remain outside both commits.

**Next agent should:**

- Implement Task 33.1 OverflowMenu, then Task 33.2 MusicLibraryRow and ImportProgressRow.

### 2026-10-21 — Complete queue controls and capability gates

**Agent:** orchestrator (Codex) + DSH-Qwen partial audit · **Commit(s):** `83c1660`, `0dab428`
**Kanban moved:** local library queue controls → In Progress (Phase 8 checkpoint complete)

**Changed:**

- Replaced all four reserved dock cells with First, Previous, Next, and Shuffle controls backed by
  serialized queue actions, pending-switch-aware navigation, accessible states, and failure recovery.
- Applied provider capability gates to exact-seek navigation, waveform/overview interaction,
  playback speed, queue controls, Repeat, and Shuffle, with visible and accessibility explanations.
- Preserved local capabilities for the transitional direct-file loader, basic Play for sources
  without exact seeking, and the normal choose-music explanations when no source is loaded.

**Verified:**

- Temporary queue-action checks → 5/5 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.
- Focused iPhone 17 Pro / iOS 26.2 simulator transport journey → 1/1 passed; result bundle
  `ios/build/BeatNoteUITests-1792554646546.xcresult`.

**Not verified / known gaps:**

- Physical-device queue switching, provider-gated presentation, and VoiceOver remain unverified.
- DSH-Qwen later returned a partial low-severity audit before exhausting its token window; the
  actionable exact-seek and empty-state concerns had already been resolved before commit.
- Concurrent uncommitted waveform/playhead edits remain outside both queue commits.

**Next agent should:**

- Implement Task 31.1's shared icon glyphs, then Task 32's bottom-sheet primitive.

### 2026-10-21 — Complete track-switch transactions

**Agent:** orchestrator (Codex) + DSH-Qwen attempted audit · **Commit(s):** `ed00dac`
**Kanban moved:** local library track switching → In Progress (Phase 7 complete)

**Changed:**

- Added the single track-switch coordinator with preflight draft flushing, source resolution,
  duration probing, one-state audio/content/queue commit, player readiness, post-load persistence,
  rollback, directional Skip, and last-request coalescing.
- Added the exact dirty-project guard with Save & Switch, Keep Draft & Switch, Cancel, nested
  naming/revision handling, and accessibility title focus.
- Restored the persisted launch item through the transaction and routed explicit project opens and
  user-facing duplicate imports through the same guarded path; removed the cross-song audio shim.

**Verified:**

- Temporary transaction/launch checks → 20/20 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Native/physical-device switching, VoiceOver dialog traversal, interruption handling, and
  Open-in delivery remain unverified.
- DSH-Qwen exhausted its token window without returning an audit; the additional internal reviewer
  also hit its usage limit without findings.
- Concurrent uncommitted waveform/playhead and lifecycle-log edits remain outside `ed00dac`.

**Next agent should:**

- Implement Task 29.1 queue actions using `navigationBaseIndex`, then replace the reserved dock
  controls in Task 29.2.
