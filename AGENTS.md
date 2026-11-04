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
| Architecture decisions (ADR-001…022), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
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

**Automation:** board upkeep follows the user-mandated `local-agent-orchestrator` lifecycle
(`/Users/galen/.codex/skills/local-agent-orchestrator/SKILL.md`).

---

## 📊 Active Project Status

**Last updated:** 2026-11-05
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (32)` Release build installed and launched on the physical iPhone · TestFlight pending
**Build gate:** `npx tsc --noEmit` (types) and `npm test` (critical Playwright journeys);
focused iOS XCTest for native surfaces changed by the task

### Milestone: M2 — Core choreography and rehearsal workflow (in progress)

M1 (core annotation MVP) is shipped. M2 makes annotation, rehearsal, persistence, and
sharing dependable on physical iOS devices, then adds the dance-specific features needed for a V2
Pro launch. Stem separation is deferred entirely to V3, beginning with a cloud-first beta and
potentially adding a hybrid path later. The browser build is a regression harness, not a product
target; Android is a far-future possibility only.

| Metric | Value |
|--------|-------|
| Annotation layers | 6 stable IDs (`vocals, drums, bass, piano, guitar, other`); stem controls hidden |
| Export formats implemented | 3 engines; CSV/PDF exposed in V1 and MIDI retained for V2 |
| Stem separation | Deferred; types, store fields, and cache preserved |
| Choreography features implemented | 6 of 6 in the V1 preview; physical-device acceptance remains |
| Permanent unit tests | 0; Jest is retained only for temporary implementation checks |
| iOS UI tests | 10 critical native integrations retained; all ten pass in focused simulator runs |
| E2E spec files | 2 (Playwright harness, 8 critical journeys) |
| Native Expo modules | 4 (`BeatNoteWaveform`, `LibraryStorage`, local `BeatNoteTempo` analysis, and `BeatNoteAudioSession`) |

### Current Focus

1. Physically review Release 32 artwork, copy and motion and confirm the existing library and projects after the in-place update.
2. Enrol for Apple distribution and pass TestFlight clean-install/update acceptance before starting
   V2 purchase enforcement.
3. Freeze and explicitly close V1 after distribution acceptance, recording any non-blocking limits.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed performance audits `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f`, plus native signposts `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integrations |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] V1.7 — Activate iOS/TestFlight: Apple Developer enrolment, real EAS project ID, signing,
      App Store Connect/privacy metadata, distribution, and clean install/update acceptance
- [ ] V1.8 — Freeze and explicitly close V1; record non-blocking limitations before V2 begins

### 🚧 In Progress

- [ ] Confirm the existing library and projects on the physical iPhone after the in-place update

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Install Release 32 with the fixed About title and prepare all work for the requested commit and push.
      <sub>**Key Artifacts:** `AGENTS.md`, `app.json`, `assets/`, `.kiro/steering/ios-testflight.md`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `tests/ui-components.spec.ts`</sub>

- [x] Keep “BeatNote for iOS” visible during the five logo pulses.
      <sub>**Key Artifacts:** `AGENTS.md`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `tests/ui-components.spec.ts`</sub>

- [x] Ship the two-colour waveform icon and five About-logo pulses on the paired iPhone as build 31.
      <sub>**Key Artifacts:** `assets/`, `app.json`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `tests/ui-components.spec.ts`, `.kiro/steering/ios-testflight.md`</sub>

- [x] V1.6 — Reconcile and commit the exact V1 release candidate; pass TypeScript, all eight
      browser journeys, all ten retained iOS journeys, version consistency, and whitespace checks
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Polish app copy and align navigation, control and feedback animations. Verify renewed signing and install Release 30.
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `AGENTS.md`, `App.tsx`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/animations/MotionPreference.tsx`, `src/animations/components/animatedToggle.ts`, `src/animations/motion.ts`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/AnimatedSegmentedControl.tsx`, `src/components/ui/common/AppModal.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/common/VerticalSegmentedControl.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/AudioControls.tsx`, `src/components/ui/controls/BeatAnchorControl.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/components/ui/controls/CountSizeControl.tsx`, `src/components/ui/controls/DanceCountVisibilityControl.tsx`, `src/components/ui/controls/DebugTierControl.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/controls/PlayPauseControl.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/controls/RepeatControl.tsx`, `src/components/ui/controls/SidebarToggle.tsx`, `src/components/ui/controls/WaveformVisibilityControl.tsx`, `src/components/ui/library/ImportProgressRow.tsx`, `src/components/ui/library/MusicLibraryRow.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/modals/AnnotationEditorModal.tsx`, `src/components/ui/modals/CsvReplaceConfirm.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/PlaybackSpeedPresetEditor.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/DataManagementScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/components/ui/screens/ProSettingsScreen.tsx`, `src/components/ui/settings/ProFeatureCarousel.tsx`, `src/components/ui/settings/ProFeatureDemo.tsx`, `src/features/entitlements/proPreview.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useAnimatedCollapse.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useLayerSelectorAnimation.ts`, `src/hooks/useModernToggleAnimation.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

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

- **Do not create, switch, or push branches (including `codex/*`) or worktrees unless the user
  explicitly asks.** Work on the current branch, which is `master`. Never force-push, and never
  push to the remote unless asked.
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


### 2026-11-05 — Install Release 32 and publish icon polish

**Agent:** Codex · **Commit(s):** Included in the release-32 commit containing this entry
**Kanban moved:** Release 32 installation and publication preparation → Done

**Changed:** Incremented the iOS build to 32 and installed the signed update in place. The About logo pulses five times one second apart while “BeatNote for iOS” stays visible. Includes the orange waveform and violet centre artwork and all accumulated documentation changes. User explicitly requested committing and pushing all work to master.

**Verified:** TypeScript, version consistency, whitespace checks and all eight browser journeys passed. Signed Release build succeeded. Device services independently reported 1.0.0 (32) installed and successfully launched it.

**Not verified / known gaps:** Physical visual review and VoiceOver remain for the user. Native Settings coverage passed for Release 31; no new native test run for the title-only adjustment. Commit and push results are reported in the session response after this entry is saved.

**Next agent should:** Collect physical Release 32 feedback, then continue TestFlight preparation.


### 2026-11-05 — Keep the About title during logo pulses

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** Keep the About title visible → Done

**Changed:** The About title now always reads “BeatNote for iOS”. Five pulses and their one-second spacing remain unchanged. Reduce Motion keeps the logo static. Updated the existing browser assertion.

**Verified:** TypeScript, all eight browser journeys and whitespace checks passed. The preceding Release 31 focused iOS Settings journey also passed before this text-only adjustment.

**Not verified / known gaps:** This adjustment has not been rebuilt or installed on the iPhone. Installed Release 31 still shows the numbers. Existing artwork and release changes remain uncommitted.

**Next agent should:** Include the fixed title in the next requested device build.

### 2026-11-05 — Install Release 31 with five logo pulses

**Agent:** Codex · **Commit(s):** `uncommitted`
**Kanban moved:** About easter egg → Done

**Changed:** Orange waveform bars flank a violet centre bar and diamond. A tap starts five numbered pulses one second apart. Reduce Motion uses the numbers alone.

**Verified:** TypeScript and eight browser journeys passed, including counts 1–5 and reset. The paired iPhone reported version 1.0.0 build 31 and launched after in-place installation.

**Not verified / known gaps:** Physical iPhone appearance and VoiceOver delivery await device review.

**Next agent should:** Include one About icon tap in the upcoming device review.

### 2026-11-05 — Reconcile and pass the exact V1 candidate

**Agent:** orchestrator (Codex) · **Commit(s):** `4dd88dd`, `32db18b`
**Kanban moved:** V1.6 exact release-candidate gate → Done

**Changed:**

- Reconciled the accumulated V1 implementation into `4dd88dd`, then incorporated the completed
  Release 30 copy/motion handover in `32db18b` without overwriting its concurrent work.
- Corrected the long-track XCTest performance journey so its measured pass returns from the warm-up
  BPM subpage to a known Studio state before opening the second fixture. The app's tempo analysis
  had succeeded; the prior failure was test navigation state leaking between invocations.

**Verified:**

- TypeScript, version consistency and whitespace checks passed. Jest's intentionally empty permanent
  unit suite passed with `--passWithNoTests`; licence generation retained all 16 native notices.
- All eight Playwright journeys passed on an isolated local port. An earlier launch attempt was
  discarded because sandboxed Expo port probing collided with another active local server.
- All ten retained iOS journeys passed consecutively on iPhone 17 Pro simulator from exact commit
  `32db18b`, including annotation restore, tempo suggestion/cancel/retry/long-track memory, looping,
  CSV/share, background recovery with repeated Library switching, landscape, and Open In.

**Not verified / known gaps:**

- Release 30 is installed and launches on the physical iPhone, but hands-on copy/motion, VoiceOver,
  and preservation of the existing library/projects remain for the user to confirm.
- Apple distribution, App Store Connect metadata and TestFlight clean-install/update acceptance are
  V1.7 and have not started.

**Next agent should:**

- Guide the user through V1.7 beginning with Apple Developer enrolment, then configure the stable
  production identifiers and App Store Connect record before producing a TestFlight candidate.

### 2026-11-05 — Copy and motion polish on Release 30

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted` on top of `4dd88dd`
**Kanban moved:** copy and motion polish and renewed-profile launch → Done

**Changed:**

- Reviewed app strings across the studio, controls, Help, Settings, library, project and export flows,
  Pro demonstrations, progress messages, errors and accessibility hints. Replaced technical import
  states and repetitive instructions. Destructive prompts describe the scope and recovery options.
- Added shared page, control and feedback timing and one live system motion preference. The mobile
  Pro sparkle stops when its button is hidden. Native dialogs, library motion, annotation and
  speed popups and the Pro carousel respond to Reduce Motion.
- Documented copy and motion conventions. Installed the signed update over the existing app.

**Verified:**

- TypeScript, version and whitespace checks passed. All eight browser journeys passed after
  correcting a stale assertion about the dance-count caption. A mobile browser check switched Reduce
  Motion on during a running demo, observed a static frame across a stage interval, and confirmed
  comparison dismissal and Help navigation. Inspected Help at 393 × 852.
- Focused native Settings/Files journey passed on iPhone 17 Pro. The first attempt stopped at the
  Expo launcher before loading the app. Opening the local Metro URL resolved it. Xcode reported
  one pass and zero failures on the rerun.
- Release 29 launched before installation, resolving the trust blocker. Device services independently
  reported 1.0.0 (30) after installation and successfully launched it.

**Not verified / known gaps:**

- Hands-on copy, VoiceOver, motion feel and existing saved content still need physical confirmation.
  The full ten-test release gate remains open. This polish revision is uncommitted.

**Next agent should:**

- Collect physical Release 30 feedback, then reconcile the final V1 candidate and run its exact-tree gate.


<!-- end handover log -->
