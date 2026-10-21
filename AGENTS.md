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

**Last updated:** 2026-10-21
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

1. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
4. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
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

- [ ] Implement 8-count / phrase grid mode — `countSize` state, phrase snapping, transport count display
- [ ] Define the provider-neutral capability/entitlement interface and validate the Lite/Pro matrix (V1 groundwork; no enforced paywalls yet)
- [ ] Implement custom layer names — `Layer.customName`, inline edit, project persistence
- [ ] Implement PDF choreography export — `exportToPDF` + `PDFExportOptions`, add to `ExportModal`
- [ ] Add `Count (phrase:beat)` column to CSV export using `countSize`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Implement `local-music-library-queue` from its approved phased spec; Phase 0 and the pure
      foundations through the Phase 7 track-switch checkpoint are complete, with the queue store
      actions and dock controls next
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

### 2026-10-21 — Complete safe project semantics

**Agent:** orchestrator (Codex) + DSH-Qwen review · **Commit(s):** `b5a4883`, `1a567bf`, `0cc511b`
**Kanban moved:** local library safe Save/project semantics → In Progress (Phase 6 complete)

**Changed:**

- Added serialized Save/Save as New with revision, name, read-only, partial-write, collision, and
  in-flight edit/switch handling, plus project rename, deletion, same-song open/revert, and CSV
  export for live or stored content.
- Replaced the legacy Save modal with an accessible validated prompt and shared confirmation dialog;
  successful saves now use the dock toast and revision conflicts offer Overwrite or Save as New.
- Removed the store's legacy project save/load actions. The existing manager now uses V1.2 project
  summaries and services, with an isolated cross-song audio bridge until Task 28.6.

**Verified:**

- Temporary focused save/project checks → 28/28 passed across save, autosave races, rename/delete,
  open/revert, CSV export, recovery, and unknown-field preservation; suites removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Focused save-prompt journey → 1/1 passed; full retained Playwright gate → 6/6 passed.

**Not verified / known gaps:**

- The retained browser fixture still uses the Task 21.5 direct-audio shim, so it validates the
  prompt but cannot complete a library-backed save until the Phase 9 import surface replaces it.
- Same-song destructive open/revert confirmations remain Task 36.4; physical-device focus,
  VoiceOver, and save/open persistence acceptance remain outstanding.
- DSH-Qwen's Task 26.4 review identified ignored draft-write failures, which were surfaced before
  commit; its discarded-edit and stale-state concerns did not apply to the specified synchronous
  replacement path.

**Next agent should:**

- Implement Task 28.1's track-switch transaction core, then the pending-destination and rollback
  semantics before wiring queue controls.

### 2026-10-20 — Complete boot and draft autosave checkpoints

**Agent:** orchestrator (Codex) + context/review agents · **Commit(s):** `c6f8c7a`, `009fa5c`
**Kanban moved:** local library boot + autosave → In Progress (Phase 5 complete)

**Changed:**

- Added strict, retryable launch hydration with migration locking, repaired derived project indexes,
  missing-file reconciliation, queue restoration, and a protected post-boot orphan sweep.
- Added per-song draft autosave with a 500 ms debounce, 2 s maximum latency, execution-time content
  snapshots, fingerprint skips, coalesced serialized writes, background flush, and foreground retry.
- Centralized persistence failures in an accessible glass banner and forwarded monotonic library
  notices into mobile and desktop dock toasts.

**Verified:**

- Boot temporary checks → 7/7 passed; autosave temporary checks → 6/6 passed; both suites were
  removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Background/force-quit draft restoration still requires the retained native journey after track
  switching and launch restoration are wired in Phase 7, plus physical-device acceptance.
- DSH-Qwen's Task 24 audit failed without output; an independent reviewer found four edge cases,
  all corrected before the final gates.
- Concurrent uncommitted waveform/playhead work remains present and outside the autosave commit.

**Next agent should:**

- Implement Task 26 safe Save/Save as New semantics, beginning with the single pipeline operation
  and revision/name conflict results before replacing the legacy Save prompt.

### 2026-10-19 — Complete library store checkpoint

**Agent:** orchestrator (Codex) + reviewers · **Commit(s):** `03bbe4a`
**Kanban moved:** local library store/audio ownership → In Progress (Phase 4 complete)

**Changed:**

- Added the library, draft/project, queue, and switch slices, plus Import_Pipeline job mirroring and
  serialized queue persistence including queue removal.
- Added atomic track-state application for audio identity, normalized authored content, draft
  baseline, queue index, and session reset while preserving Repeat.
- Moved the playing URI and transitional filename into the store so queue switches cannot pair a
  new track with the prior song's save/export filename; notice IDs now remain monotonic across
  track commits.

**Verified:**

- Temporary focused store checks → 4/4 passed, then removed per policy.
- Version consistency → `1.0.0`; `npx tsc --noEmit`, the empty permanent unit gate, and
  `git diff --check` → clean.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Task 22 boot hydration, migration, missing-file reconciliation, and orphan sweeping are not wired.
- A DSH-Qwen read-only review task remained running without a completed report; independent focused
  review found and resolved the notice-ID and transitional-filename hazards.
- Physical-device Open-in delivery and existing hardware acceptance items remain pending.

**Next agent should:**

- Implement Task 22, beginning with strict singleton reads and the project-index I/O-failure guard,
  then add and mount the injectable boot lifecycle.

### 2026-10-19 — Harmonise waveform and playheads

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Overview waveform colour standardisation → Done

**Changed:**

- Replaced the overview's bright success-green waveform with the wrapped timeline's muted grey base
  and an active-layer-colour overlay clipped to elapsed playback.
- Kept semantic purple markers and teal loop state, then standardised both overview and active-row
  playheads on an amber core with a dark underlay and triangular top cap so they remain visible
  across every layer colour and cannot be mistaken for plain marker lines.
- Updated the waveform requirements and implementation plan, plus retained browser assertions for
  the muted waveform, elapsed colour, and both playheads' halo/core/cap treatment.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean for the scoped change.
- Focused retained waveform and dock journeys → 2/2 passed.
- Full retained Playwright gate → 6/6 critical journeys passed.

**Not verified / known gaps:**

- Physical-device contrast and visibility under different display brightness and accessibility
  settings remain part of loop-overview acceptance.
- Concurrent local-library repository/spec edits remain present and outside this task.

**Next agent should:**

- Check the overview palette and capped playhead on a physical iPhone, then continue loop-range
  VoiceOver, drag-performance, and audible-boundary acceptance.
