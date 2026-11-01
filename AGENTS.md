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
| Architecture decisions (ADR-001…020), core patterns | [`.kiro/steering/architecture-decisions.md`](./.kiro/steering/architecture-decisions.md) |
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

**Last updated:** 2026-11-02
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (10)` Release build installed physically · TestFlight pending
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
| Native Expo modules | 3 (`BeatNoteWaveform`, `LibraryStorage`, and local `BeatNoteTempo` analysis) |

### Current Focus

1. Finish automatic-BPM runtime acceptance (now a Pro-tier feature per the 2026-11-02 roadmap):
   representative real-song/physical-device evidence remains. Native cancellation/retry,
   150-second peak memory, synthetic accuracy, and all ten retained simulator journeys pass;
   downbeat estimation remains deliberately open.
2. Finish physical iOS acceptance: audio loading/playback, waveform scrubbing, background audio
   interruptions, and completing a share to an external destination. Simulator automation covers
   background audio playback, annotation/project restoration, CSV I/O, V1 settings, loop transport,
   landscape gestures/geometry, and real waveform rendering. Interactive Xcode 27 testing
   uses Product > Run / Cmd+R and Device Hub; Expo's `run:ios` currently cannot resolve the Simulator
   app on this host.
3. Complete physical-device playback-speed acceptance: musical pitch/artifact quality across the
   range, live adjustment, VoiceOver, Bluetooth output, interruptions, background playback, and loops.
4. Keep the completed local choreography workflow stable while physical-device acceptance and the
   Apple Developer account remain outstanding; do not resume stem separation until the gates in
   `.kiro/steering/release-roadmap.md` are satisfied.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed performance audits `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f`, plus native signposts `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integrations |
| `human` (user) | Apple Developer account, secrets, deploy approval | Purchase Apple Developer account to unblock iOS |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] Activate iOS/TestFlight — real EAS `projectId`, Apple credentials, Info.plist keys (blocked on Apple Developer account)

### 🚧 In Progress

- [ ] Stabilise and polish the physical-iPhone workflow: Control Centre/Now Playing, atomic song
      transitions, and coalesced rapid speed changes are implemented and locally verified; physical
      Repeat/Shuffle now pass; audible switching and Release-build latency remain open
- [ ] Complete `automatic-bpm-detection` runtime acceptance; shared decode/worker,
      lifecycle/cache, suggestion preview/apply/restore, manual anchor/count controls, persistence,
      exports, retained browser flow, octave-resolved native synthetic XCTest, cancellation/retry,
      and 150-second simulator memory are implemented; real-song accuracy and physical acceptance
      remain
- [ ] Run physical-device acceptance for audio/scrubbing/background/share; simulator suite covers core workflow and background playback lifecycle

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Keep annotation, toast, and speed-chooser exits anchored above the overview; add persisted
      tap/hold seek-button behaviour and 0.5–30 second distances with signed on-button cues; install
      Release beta `1.0.0 (10)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/features/settings/preferences.ts`, `src/styles/components/settings/settingsPage.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Repair the landscape annotation editor and Settings edge gestures; add reversible marker
      deletion, annotated overview markers, smoother transient UI, current-project rename, flatter
      Settings subpages, sheet-native Music dismissal, and install Release beta `1.0.0 (9)`
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/`, `src/components/ui/modals/`, `src/components/ui/projects/CurrentProjectSection.tsx`, `src/components/ui/screens/`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Match the overview delete glyph to the supplied rounded trash reference, add restrained Pro
      sparkles, move waveform/annotation settings into a Display & Annotations page, add edge-swipe
      Back navigation, add persisted bidirectional library sorting, and install Release beta
      `1.0.0 (8)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/screens/DisplaySettingsScreen.tsx`, `src/features/library/`, `src/hooks/useStudioStore.ts`, `src/styles/components/library/musicLibrarySheet.ts`, `src/styles/layout/sidebar.ts`, `src/types/library.ts`, `src/types/queue.ts`, `src/utils/queueOrder.ts`, `src/utils/recordValidation.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Smooth Custom Order dragging with stable row slots, midpoint hysteresis, and animated
      neighbour displacement; flatten the Settings root, restore Help & Support as a row, and move
      BeatNote Pro to a styled trailing crown action; install signed Release beta `1.0.0 (7)`
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/library/MusicLibraryRow.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/styles/layout/sidebar.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Remove the media-control liquid-glass backdrop in both phone orientations, redraw the overview
      strip's Clear/Restore icons, reduce brittle browser UI coverage to eight core journeys, repair
      the two test-file lint issues, and install Release beta `1.0.0 (6)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/testing-strategy.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/LoopClearControl.tsx`, `tests/ui-components.spec.ts`</sub>

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

### 2026-11-02 — Anchor transient exits and add seek-button configuration

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** anchored feedback exits and configurable transport seeking → Done

**Changed:**

- Replaced exit-time layout animation for annotations and dock toasts with retained, opacity-only
  presence: each item fades fully where it is anchored before its layout slot is removed. Playback
  speed dismissal now uses a short in-place fade and subtle scale instead of translating toward the
  overview strip.
- Replaced the Button Settings seek placeholders with persisted tap/hold behaviour and all requested
  distances from 0.5 to 30 seconds. Previous/Next display signed `−/+Ns` cues under their track
  icons, clamp seeks to track bounds, and remain accessible while either seeking or queue navigation
  is available.
- Updated Help and durable UI rules, incremented to `1.0.0 (10)`, and installed/launched the signed
  physical Release build.

**Verified:**

- `npx tsc --noEmit`, version consistency, and `git diff --check` → passed.
- Full retained Playwright regression → 8/8 passed, including persisted settings, default track
  navigation, tap-to-seek, signed badge display, and boundary clamping.
- Focused iOS `testLandscapeGesturesAndCompactControls` passed after regenerating the ignored React
  Native codegen cache; Xcode Release build, physical install, and launch also succeeded.

**Not verified / known gaps:**

- Physical visual/touch confirmation remains for fade anchoring, badge legibility, and long-press
  ergonomics in both orientations.

**Next agent should:**

- Incorporate the user's beta 10 physical feedback before adding another transport gesture mode.

### 2026-11-02 — Repair annotation, navigation, and project workflows in beta 9

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** annotation/navigation/project polish → Done

**Changed:**

- Made the landscape annotation editor keyboard-safe with a compact, scrolling body, fixed actions,
  and an explicit keyboard Done control. Marker removal now offers Undo and preserves annotations;
  the overview uses filled heads for annotated markers and outlined heads for plain markers.
- Smoothed annotation callout, toast, and speed-control transitions without remounting successive
  annotation content. Settings now uses a dedicated native edge responder for both submenu-to-root
  and root-to-app gestures; the Music Library sheet relies on its grabber, backdrop, and downward
  dismissal rather than a redundant Back button.
- Added Rename to the loaded project's own actions, reusing the atomic project rename path. Flattened
  standalone Settings toggles and informational rows while retaining cards for real option groups
  and actions. Incremented, signed, installed, and launched physical Release beta `1.0.0 (9)`.

**Verified:**

- `npx tsc --noEmit`, `git diff --check`, and full retained Playwright regression → passed, 8/8.
- Focused iOS `testLandscapeGesturesAndCompactControls` and
  `testStudioLaunchesAndDocumentPickerOpens` → passed, covering the compact editor, sheet dismissal,
  transparent dock assertions, and both Settings edge-swipe levels.
- Xcode Release build succeeded; device services confirmed install and launch as `com.beatnote.app`.

**Not verified / known gaps:**

- Physical touch/visual confirmation remains for the editor keyboard ergonomics, popup timing,
  marker head distinction, edge capture width, flattened subpages, and project rename affordance.
- This commit also includes the preceding beta 8 work, which had not yet been committed separately.

**Next agent should:**

- Incorporate the user's beta 9 physical feedback before widening navigation or animation scope.

### 2026-11-02 — Add display navigation, reversible sorting, and beta 8 polish

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** display/navigation, overview glyph, Pro sparkle, and reversible sorting → Done

**Changed:**

- Redrew the overview Clear action as the supplied rounded, open trash can and reduced the mobile
  Pro control while adding two restrained, low-amplitude looping sparkles around it.
- Moved waveform visibility and annotation-label controls from the flat Settings root into a new
  Display & Annotations submenu. Added native leading-edge, left-to-right Back gestures to the
  Settings root and every Settings/detail page while keeping explicit Back controls.
- Made each non-Custom Music Library sort reverse between ascending and descending when its selected
  button is tapped again. The persisted direction now follows queue construction and migration;
  Custom Order remains manually arranged and never reverses. Its selected direction arrow animates
  through a half-turn.
- Incremented iOS to `1.0.0 (8)`, installed the signed Release on `gæl (3)`, and launched it.

**Verified:**

- `npx tsc --noEmit`, `npm run check:version`, and `git diff --check` → passed before closeout.
- Full retained Playwright regression harness → 8/8 passed in 16.3 seconds, covering the Display
  submenu and both directions of non-Custom sorting.
- The built app reports version/build `1.0.0/8`; device services confirmed installation, launch,
  and running process 3780 as `com.beatnote.app`.

**Not verified / known gaps:**

- The delete glyph, Pro sparkle restraint, smaller Pro control, native edge-swipe feel, and sort
  arrow transition still need the user's visual/touch confirmation on the installed phone.
- The host's standalone strict code-sign verification reports `CSSMERR_TP_NOT_TRUSTED`, but the
  device accepted and launched the signed build. No focused iOS XCTest was run because native module
  behaviour did not change.

**Next agent should:**

- Incorporate the user's beta 8 visual/touch feedback, especially edge-swipe capture width and the
  sparkle intensity, before expanding Settings further.

### 2026-11-02 — Smooth Custom Order and flatten Settings

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** stable-slot Custom Order and flat Settings root → Done

**Changed:**

- Kept the dragged library row in its original list slot while held. Crossing a neighbour now
  animates that neighbour into the open slot; the persisted array changes only after the lifted row
  settles at release. Added six-point midpoint hysteresis to prevent boundary jitter.
- Removed every category heading from the Settings root while retaining local headings inside its
  deeper pages. Help & Support is again a normal root navigation row.
- Replaced the trailing Help icon with an accent-filled `Pro` button and a crown glyph that opens
  BeatNote Pro; the wider desktop Settings surface retains its Pro navigation row.
- Kept the browser regression focused: the existing library journey now verifies that DOM order
  stays stable while a row is held and that the order persists after release.
- Incremented the iOS build to `1.0.0 (7)` and installed the signed Release on `gæl (3)`.

**Verified:**

- `npx tsc --noEmit`, `npm run check:version`, and `git diff --check` → passed.
- Full retained Playwright regression harness → 8/8 passed in 14.6 seconds, including Settings,
  held Custom Order movement, and post-release persistence.
- Signed Release build `1.0.0 (7)` succeeded, its built Info.plist reports version/build `1.0.0/7`,
  and device services confirmed installation, launch, and running process 3632 as `com.beatnote.app`.

**Not verified / known gaps:**

- Native spring feel, neighbour motion, header spacing, and the flat Settings hierarchy are installed
  but still need the user's physical-iPhone visual and touch confirmation.
- No native module behaviour changed, so no focused iOS XCTest was run.

**Next agent should:**

- Incorporate the user's beta 7 feedback, tuning only the spring/hysteresis values if native touch
  still feels off.

### 2026-11-02 — Simplify the media dock and install beta 6

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** transparent media dock, overview icons, and core browser coverage → Done

**Changed:**

- Removed the shared liquid-glass gradient behind the phone media controls in portrait and
  landscape while retaining each control's own contrast and grouping.
- Redrew the overview strip's Clear action as a conventional trash can and Restore as a clean
  counter-clockwise arrow, increasing both glyphs to 18 points for legibility.
- Reduced the Playwright harness from nine broad journeys to eight core behavioural journeys and
  narrowed assertion sets to persisted outcomes and meaningful failure boundaries. Removed the two
  reported test-file lint issues: import ordering and a fixed animation timeout.
- Incremented the iOS build to `1.0.0 (6)`, regenerated native codegen including RNWorklets, and
  installed and launched the signed Release build on physical iPhone `gæl (3)`.

**Verified:**

- `npx tsc --noEmit`, `npm run check:version`, and `git diff --check` → passed.
- Full reduced Playwright regression harness → 8/8 passed in 15.8 seconds.
- Signed Release build `1.0.0 (6)` succeeded, its built Info.plist reports version/build `1.0.0/6`,
  and device services confirmed both installation and launch as `com.beatnote.app`.

**Not verified / known gaps:**

- The user still needs to visually confirm the transparent dock and revised Clear/Restore glyphs in
  both orientations, plus the Settings breadcrumb and Custom Order drag fixes bundled into beta 6.
- No focused iOS XCTest was run because this task changed React Native UI/assets rather than native
  module behaviour.

**Next agent should:**

- Incorporate the user's physical beta 6 feedback, then continue the top physical-acceptance item.

<!-- end handover log -->
