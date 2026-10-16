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
| Export formats implemented | 2 of 3 (CSV exposed in V1; MIDI retained for V2; PDF planned) |
| Stem separation | Deferred; types, store fields, cache, and cache tests preserved |
| Choreography features implemented | 1 of 6 (section looping implemented; physical-device acceptance pending) |
| Unit tests | 126 passing (13 suites) |
| iOS UI tests | Latest aggregate: 8/14 passed and 6 simulator tests were signal-killed; focused dock/range and V1 launch checks pass |
| E2E spec files | 4 (Playwright, 17/17 passing) |
| Native Expo modules | 0 (`modules/` directory does not exist yet) |

### Current Focus

1. Complete physical-device acceptance for `playback-marker-control-dock`; its portrait 2×8 dock,
   landscape two-column/central-2×2-play rail, marker actions, tri-state looping, shared overview toast, reserved controls,
   speed contract, safe-area/keyboard handling, and simulator acceptance are implemented.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, long-track overview tap/drag seeking, annotation during playback,
   compact controls, project save/relaunch/restore, CSV I/O, settings drawer, wrapped gestures,
   responsive detail mode, orientation reflow, and landscape geometry. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device acceptance for the loop-range editor: drag/playback performance,
   VoiceOver adjustment, contrast, and audible boundary quality.
4. Close the remaining production-unit coverage gap, then advance 8-count/rehearsal features and
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

- [ ] Complete `playback-marker-control-dock` physical acceptance — implementation, simulator visual
      review, focused native checks, and web/unit gates pass; VoiceOver and real-device touch/keyboard
      comfort remain
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle
- [ ] Complete loop-range overview physical-device acceptance — Phases 1–17 and the automated gate are verified (116 unit, 16 E2E, 14/14 iOS); physical performance, VoiceOver, contrast, and audible-boundary checks remain

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Establish a typed colour-theme foundation with a registered immutable dark palette, semantic
      contract, compatibility access, and explicit rules for adding palettes and runtime switching
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `src/styles/theme.ts`, `src/styles/common.ts`, `tests/unit/theme.test.ts`</sub>

- [x] Replace the compact mobile annotation field with marker-gated modal editing, a bounded
      selected-marker callout, reversible marker deletion, the agreed portrait/landscape dock order,
      safe-area project padding, and orientation-stable glass sizing
      <sub>**Key Artifacts:** `.kiro/specs/playback-marker-control-dock/`, `.kiro/steering/coding-standards.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/AnnotationDockButton.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockButton.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/modals/AnnotationEditorModal.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/hooks/useDockToast.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/annotationCallout.ts`, `src/styles/components/modals/annotationEditorModal.ts`, `src/utils/markerSelection.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/unit/markerSelection.test.ts`, `tests/unit/studioStore.innerLoop.test.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Unify portrait/landscape media glass and every custom menu, then correct annotation dots,
      full-field glass, long-text overflow, and unloaded media-control states
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/ErrorModal.tsx`, `src/components/ui/controls/AnnotationField.tsx`, `src/components/ui/controls/BpmControl.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/MarkerDockButton.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/waveform/WrappedRow.tsx`, `src/styles/common.ts`, `src/styles/components/`, `src/styles/layout/sidebar.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Bring transient dock popups into the liquid-glass family, center wrapped-row gutter timestamps,
      and describe the V1 CSV's BPM-derived timing precisely
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/specs/playback-marker-control-dock/design.md`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/GlassBackdrop.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/ExportModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/styles/components/controls/controlDock.ts`, `src/styles/components/controls/playbackSpeedControl.ts`, `src/styles/components/waveform/rowGutter.ts`, `tests/ui-components.spec.ts`, `tests/ios/BeatNoteUITests.swift`</sub>

- [x] Modernise and refine every button icon with a shared custom BeatNote family, including the
      single-note audio glyph, thin open repeat grammar, bounded-range cue, invariant marker sizing,
      solid rounded transport, and subdued active/operation fills
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/specs/playback-marker-control-dock/`, `src/components/icons/`, `src/components/layout/StemsView.tsx`, `src/components/ui/common/VerticalSegmentedControl.tsx`, `src/components/ui/controls/`, `src/components/ui/screens/HelpScreen.tsx`</sub>

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

### 2026-10-16 — Unify glass surfaces and annotation states

**Agent:** orchestrator (Codex) · **Commit(s):** `d533a72`
**Kanban moved:** Full-surface liquid-glass and annotation/unloaded-state cleanup → Done

**Changed:**

- Confirmed portrait and landscape media controls share `GlassBackdrop`, then extended the same
  restrained material to Settings, Help, Projects, Save, Import, Export, and app error panels.
- Replaced unrelated blue/green modal fills and harsh borders with shared glass, subtle highlights,
  BeatNote orange primary actions, neutral glass actions, and semantic destructive actions.
- Made annotated-marker indicators violet and borderless, moved annotation glass into the field's
  exact bounds, and added tail truncation while idle with normal horizontal scrolling while editing.
- Disabled every media/dock action until audio is loaded, including reserved track, shuffle, speed,
  and previous-marker removal controls; essential Load Audio, Projects, and Settings remain usable.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites; full Playwright gate → 17/17 passed.
- Device Hub loaded the refreshed 1,325-module native bundle; portrait Settings and Projects glass
  panels were visually inspected. Landscape dock use of the shared backdrop is code- and browser-verified.

**Not verified / known gaps:**

- The new native iOS assertions were not run through Xcode; physical-device VoiceOver, keyboard,
  and touch-comfort acceptance remain pending.
- The user's concurrent icon work and prior polish changes are included in `d533a72`.

**Next agent should:**

- Run focused native launch/annotation/orientation tests, then continue physical-device acceptance.

### 2026-10-16 — Refine glass popups, gutters, and CSV wording

**Agent:** orchestrator (Codex) + context-gatherer · **Commit(s):** `d533a72`
**Kanban moved:** Liquid-glass popups, centered gutters, and precise V1 CSV contents → Done

**Changed:**

- Reused `GlassBackdrop` for the dock toast and playback-speed chooser, adding a lighter translucent
  toast variant with 12-point corners and a subtle 10%-white highlight instead of the saturated teal
  toast outline.
- Centered every wrapped-row timestamp horizontally and vertically within its full-height gutter box.
- Replaced the vague CSV claim with the exact current behavior: timestamps, BPM-derived 4-beat
  `bar:beat` timing, and annotations; Help and Export now use matching wording.
- Documented the liquid-glass popup rule in durable styling guidance and the dock design.

**Verified:**

- `npx tsc --noEmit` and `git diff --check` → clean.
- Unit gate → 119/119 passed across 11 suites.
- Focused phone dock/workspace Playwright workflows → 2/2 passed; full Playwright gate → 17/17 passed.

**Not verified / known gaps:**

- Native simulator visual inspection was not rerun; native CSV copy coverage was updated for the next
  aggregate.
- Routine native success alerts and system pickers/share sheets retain platform styling; this change
  targets the custom transient dock popup family.
- The user's concurrent icon-proportion work and this polish are included in `d533a72`; no unrelated
  dirty changes were reverted.

**Next agent should:**

- Run the native visual/VoiceOver acceptance pass, then continue the active full-surface glass work.

### 2026-10-15 — Create and refine the BeatNote icon family

**Agent:** orchestrator (Codex) + context-gatherer + DSH-Qwen Leonardo concept pass · **Commit(s):** `d533a72`
**Kanban moved:** Modernise and simplify every button icon; define custom-icon principles → Done

**Changed:**

- Added a central 24×24 `BeatNoteIcon` SVG family spanning project/data actions, transport,
  choreography markers, loop utilities, disclosure/view controls, and annotation-layer instruments,
  then simplified the first concept pass to iOS-inspired monoline geometry and stronger negative space.
- Refined the set from the user's visual references: reduced audio loading to one music note, restored
  a familiar save-file silhouette, enlarged CSV direction arrows, rounded and filled transport
  geometry, and unified every marker action around one single-border shield silhouette.
- Made add/remove marker operations subdued green/red without cramped `+`/`−` cues, made
  remove-previous a red shield with its left arrow on the right, preserved one full-size shield in
  every navigation composite, and placed marker or `•—•` bounded-range cues inside the thin open
  repeat chassis.
- Added a muted control-state orange distinct from the brighter timeline/brand accent and applied it
  consistently to filled active buttons and selected segmented controls.
- Replaced every current button's direct Lucide use while retaining numeric BPM/speed controls as
  text, existing button chrome, test IDs, accessible names/states, and control behavior.
- Codified the rounded 1.75-point outline, one-silhouette/one-modifier limit, optical balance,
  small-size legibility, and accessibility requirements in durable steering; primary transport
  glyphs use simple solid geometry while detailed decorative motifs are explicitly avoided.
- Updated the playback-dock design/task record to make the shared custom family the ongoing source
  for dock glyphs. DSH task `session-cb84715b-2187-4e71-9b6b-83ec0b16139b` supplied the bounded
  first-pass concepts; Codex retained the clearer bookmark language for marker navigation.

**Verified:**

- `git diff --check`, `npx tsc --noEmit`, and the unit gate → clean; 119/119 tests passed across 11 suites.
- Elevated full Playwright gate on port 8082 → 17/17 passed.
- Desktop browser visual inspection of unloaded and fixture-loaded states → the toolbar and dock
  render the single note, open repeat chassis, solid rounded transport, invariant marker shields,
  subdued state colours, and the compact bounded-range cue at actual control size.
- Browser assertions confirm add-marker transitions green add → red remove → green add while the
  existing repeat/inner-loop behavior and accessible state checks remain intact.

**Not verified / known gaps:**

- Native simulator and physical-iPhone visual/VoiceOver review were not rerun for the icon-only change.
- The icon work and the three earlier local commits are included in the push containing `d533a72`.

**Next agent should:**

- Continue physical-device visual/VoiceOver acceptance for the completed icon family.

