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

**Last updated:** 2026-10-16
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
| Choreography features implemented | 1 of 6 (section looping implemented; physical-device acceptance pending) |
| Permanent unit tests | 0; Jest is retained only for temporary implementation checks |
| iOS UI tests | 6 critical native integrations retained; focused V1 launch/settings check passes |
| E2E spec files | 2 (Playwright, 6 critical journeys) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   and landscape gestures/geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
4. Advance 8-count/rehearsal features and provider-neutral monetisation groundwork; do not resume
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
- [ ] Implement slow-down / pitch-preserve playback — `playbackSpeed` state + `modules/audio-time-stretch/`
- [ ] Add annotation vocabulary suggestion chips to `AnnotationField`
- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

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

- [x] Replace the Settings sliders glyph with a simple rounded gear in the shared icon family
      <sub>**Key Artifacts:** `src/components/icons/BeatNoteIcon.tsx`</sub>

- [x] Replace mobile Settings and Help with safe full-screen pages, make Help swap in immediately
      without stacking a modal, place Settings at the trailing toolbar edge, use iPhone-style
      right-edge push transitions over the live app without a white host flash, keep Settings Close
      free of back-navigation decoration, remove V1 BPM controls, make CSV action text readable on
      orange, and retain only critical tests
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/testing-strategy.md`, `package.json`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/ProjectControls.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/modals/ImportModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/styles/components/modals/exportModal.ts`, `src/styles/components/screens/helpScreen.ts`, `src/styles/layout/sidebar.ts`, `src/styles/theme.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`, `tests/ios/BeatNoteUITests.swift`, removed `tests/unit/`, `tests/core-functionality.spec.ts`, and `tests/quality-assurance.spec.ts`</sub>

- [x] Keep timed annotation callouts readable during playback with a 2-second dwell, 350-millisecond
      fade, successive-annotation replacement, and source-marker editing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/utils/markerSelection.ts`, `tests/unit/markerSelection.test.ts`</sub>

- [x] Establish a typed colour-theme foundation with a registered immutable dark palette, semantic
      contract, compatibility access, and explicit rules for adding palettes and runtime switching
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `src/styles/theme.ts`, `src/styles/common.ts`, `tests/unit/theme.test.ts`</sub>

- [x] Replace the compact mobile annotation field with marker-gated modal editing, a bounded
      selected-marker callout, reversible marker deletion, the agreed portrait/landscape dock order,
      safe-area project padding, and orientation-stable glass sizing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `.kiro/steering/coding-standards.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/modals/AnnotationEditorModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/hooks/useDockToast.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/annotationCallout.ts`, `src/styles/components/modals/annotationEditorModal.ts`, `src/utils/markerSelection.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/unit/markerSelection.test.ts`, `tests/unit/studioStore.innerLoop.test.ts`, `tests/waveform-features.spec.ts`</sub>

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

### 2026-10-17 — Replace Settings sliders with a gear

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Settings gear icon → Done

**Changed:**

- Replaced the shared Settings sliders glyph with a conventional eight-tooth gear and centre hub,
  retaining BeatNote's 24×24 geometry, 1.75-point rounded stroke, button sizing, and accessibility.

**Verified:**

- `git diff --check` and `npx tsc --noEmit` → clean.
- Full retained Playwright gate on port 8082 → 6/6 critical journeys passed.
- Browser visual review at 393×852 → the gear is clear and balanced in the trailing phone toolbar slot.

**Not verified / known gaps:**

- Native simulator and physical-iPhone visual review were not rerun for this one-glyph change.
- The change remains uncommitted; the working tree contains only this icon update and handover state.

**Next agent should:**

- Continue the physical-device acceptance checklist, beginning with Settings/Help rotation and CSV
  share-sheet readability on real hardware.

### 2026-10-16 — Finish V1 settings and critical-test cleanup

**Agent:** orchestrator (Codex) · **Commit(s):** `fd99b7c`
**Kanban moved:** V1 full-screen settings/help, CSV contrast, and critical-only tests → Done

**Changed:**

- Replaced the phone's width-animated settings drawer with a safe-area-aware full-screen page in
  portrait and landscape, removing the bottom color gap and expansion-time text bunching.
- Removed visible BPM settings from V1 and rebuilt Help as a full-screen, mobile-first guide with
  touch controls before secondary web keyboard shortcuts.
- Added the semantic `onAccent` theme color and applied solid black, semibold text to both lines of
  the orange Import CSV and Export CSV actions.
- Made mobile Help swap into the existing Settings modal immediately instead of presenting a second
  full-screen native modal; its Back action returns to Settings, while Settings Close has no arrow.
- Moved Settings to the rightmost end of the mobile toolbar and replaced bottom-up modal motion with
  a 280-millisecond trailing-edge push: Settings enters from the right, Help pushes over it, and Back
  reverses that navigation while retaining the underlying page.
- Changed the mobile modal host to transparent `overFullScreen` presentation so the live BeatNote
  workspace remains behind the moving Settings page instead of exposing the native white host.
- Replaced 129 permanent unit tests, 11 redundant browser journeys, and 8 overlapping native cases
  with 6 critical Playwright journeys and 6 native integration cases. Jest remains available only
  for temporary test-first checks that must be removed after verification.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and `npm run test:unit` → clean; the temporary unit suite
  correctly reports no tests and exits successfully.
- Elevated Playwright gate on port 8082 → 6/6 critical journeys passed, including computed black
  text for both labels on both CSV actions.
- Focused iOS `testStudioLaunchesAndDocumentPickerOpens` → passed on iPhone 17 Pro / iOS 26.2;
  result bundle `ios/build/BeatNoteUITests-1792161700307.xcresult`.
- Device Hub loaded the fresh 1,175-module bundle; the portrait Settings page visibly fills the
  device, respects the safe area, has no BPM control or bottom strip, and no longer width-expands.
- Device Hub visual review confirmed the arrowless Settings Close and immediate in-surface Help
  navigation; the focused Settings/Help Playwright workflows pass 2/2.
- Device Hub confirmed the rightmost Settings placement and final native page geometry. Focused iOS
  launch/settings passed with the trailing-position assertion; result bundle
  `ios/build/BeatNoteUITests-1792162543533.xcresult`.
- Device Hub reloaded the transparent host and confirmed Settings covers the live app cleanly; the
  focused Settings transition browser workflow passes 1/1 after the host change.

**Not verified / known gaps:**

- Physical-device VoiceOver, touch comfort, and external CSV sharing remain pending.
- Native landscape Settings is covered by the responsive implementation and browser geometry check;
  Device Hub's manual rotate view rendered the simulator surface sideways during this pass.
- Metro is running on port 8081 so the mounted Debug app remains usable in Device Hub.

**Next agent should:**

- Continue physical-device acceptance, beginning with Settings/Help rotation and CSV share-sheet
  readability on real hardware.

### 2026-10-16 — Extend timed annotation readability

**Agent:** orchestrator (Codex) · **Commit(s):** `e6bd48f`
**Kanban moved:** Timed annotation dwell and successive replacement → Done

**Changed:**

- Extended the mobile annotation callout from a 100-millisecond playhead match to a 2-second
  media-time reading window followed by a 350-millisecond exit fade.
- Shortened the original 3-second proposal to 2 seconds after the user's on-device timing feedback.
- Made the newest reached annotated marker replace the prior callout immediately, while unannotated
  markers leave the current note visible and same-time ties prefer the active layer.
- Kept the lingering callout bound to its source marker for editing while preserving the dock
  Annotation button's strict near-marker gate.
- Recorded the timed-comment chronology decision in the playback-dock requirements, design, and
  completed task list.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 129/129 passed across 13 suites, including dwell, replacement, tie, and blank-marker cases.
- Focused timing suite after the 2-second adjustment → 5/5 passed; TypeScript remained clean.
- Full Playwright gate → 17/17 passed.

**Not verified / known gaps:**

- The fade and live music timing have not yet been visually assessed on a physical iPhone.
- The implementation, tests, specs, and archived handover rotation are included in `e6bd48f`.

**Next agent should:**

- Check the 2-second dwell and 350-millisecond fade on-device during the existing physical acceptance pass.

### 2026-10-16 — Establish the colour-theme foundation

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Typed colour-theme foundation → Done

**Changed:**

- Added a typed, immutable `ThemeColors` contract, the registered `darkTheme`, a default-theme name,
  and a pure palette accessor so future palettes must provide every semantic role.
- Kept the existing `colors` export as a compatibility alias to the registered dark palette, avoiding
  visual or behavioural churn while current module-level `StyleSheet` definitions remain static.
- Documented palette registration, semantic-token use, contrast/state requirements, and the boundary
  between today’s static palette and future runtime switching.

**Verified:**

- `git diff --check` and `npx tsc --noEmit` → clean.
- Unit gate → 126/126 passed across 13 suites, including the new registry/immutability tests.
- Full Playwright gate on port 8082 → 17/17 passed with the refactor preserving current rendering.

**Not verified / known gaps:**

- Dark remains the only complete palette; no user-facing theme selector or runtime provider was added.
- Existing colour literals outside the central palette remain migration debt and should move to
  semantic tokens when those components are next changed.
- This work and the prior user-approved icon/glass changes are included in `d533a72`.

**Next agent should:**

- Continue physical-device acceptance; add a second complete palette before introducing runtime
  theme selection or theme-aware style factories.

### 2026-10-16 — Replace compact annotations and harden marker deletion

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Marker-gated annotations, reversible deletion, and responsive dock refinement → Done

**Changed:**

- Replaced the compact phone annotation field with a dock action enabled only at a nearby marker,
  a native-stable modal draft editor with explicit Save/Cancel, and a bounded two-line callout above
  the overview. The callout uses a darker but still translucent liquid-glass surface.
- Added bounded marker-deletion history that preserves annotations, an actionable Undo toast, and a
  long-press menu for restoring the latest deletion or deleting all earlier markers with confirmation.
- Applied the exact portrait/landscape button order, standardised marker glyph size, reclaimed the
  removed landscape annotation-row height, added safe-area-aware Projects/Close padding, and made
  glass backdrops remeasure after rotation.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and unit gate → clean; 123/123 tests passed across 12 suites.
- Full Playwright gate → 17/17 passed, including annotation modal/callout, Undo, Projects padding,
  exact dock order, and portrait-landscape-portrait glass geometry.
- Focused native annotation test typed `Live marker note` character by character and passed; focused
  native landscape/orientation workflow passed on iPhone 17 Pro / iOS 26.2.
- Device Hub visual review confirmed the expanded unloaded landscape canvas, safe Projects/Close
  insets, and a full-width portrait dock after returning from landscape.

**Not verified / known gaps:**

- Physical-device VoiceOver, touch comfort, and keyboard acceptance remain pending.
- This work and the prior user-approved icon/glass changes are included in `d533a72`.

**Next agent should:**

- Continue the active physical-device acceptance checklist, especially VoiceOver actions and
  long-press deletion comfort on hardware.

