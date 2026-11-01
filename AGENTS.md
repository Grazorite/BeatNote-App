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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (13)` Release build installed physically · TestFlight pending
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

- [x] Remove non-actionable speed copy, emphasize selected preset counts, tighten playback captions,
      implement persisted pause-on-headset-disconnect behavior, suppress duplicate annotation
      callouts, lower standalone toasts, repair the Xcode 27 native gate, and install beta `1.0.0 (13)`
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/coding-standards.md`, `.kiro/steering/ios-testflight.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `modules/beatnote-audio-session/`, `plugins/withIosPodDeploymentTarget.js`, `scripts/ios-ui-test.js`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/features/settings/preferences.ts`, `src/hooks/useAudioPlayer.ts`, `src/services/audioRoute.ios.ts`, `src/services/audioRoute.ts`, `src/styles/components/controls/playbackSpeedControl.ts`, `src/styles/components/settings/settingsPage.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Repair the retained annotation fade; simplify capability wording; add direct and accelerated
      seek/speed adjustment; implement Pro speed ranges, 4/8/12 presets, custom preset editing and
      default restoration; install Release beta `1.0.0 (12)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/PlaybackSpeedPresetEditor.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/features/settings/preferences.ts`, `src/hooks/useAcceleratingPress.ts`, `src/styles/components/modals/playbackSpeedPresetEditor.ts`, `src/styles/components/settings/settingsPage.ts`, `src/utils/markerSelection.ts`, `src/utils/playbackSpeed.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Redraw the annotation action from the supplied bubble/list reference, make Tap Seeks the
      default with conditional signed badges and 0.5-second custom distance steps, keep annotation
      fades in a fixed overview slot, and install Release beta `1.0.0 (11)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/features/settings/preferences.ts`, `src/styles/components/settings/settingsPage.ts`, `src/styles/layout/mainContent.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Keep annotation, toast, and speed-chooser exits anchored above the overview; add persisted
      tap/hold seek-button behaviour and 0.5–30 second distances with signed on-button cues; install
      Release beta `1.0.0 (10)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/AnnotationCallout.tsx`, `src/components/ui/controls/ControlDock.tsx`, `src/components/ui/controls/DockToast.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/QueueTrackButton.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/features/settings/preferences.ts`, `src/styles/components/settings/settingsPage.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Repair the landscape annotation editor and Settings edge gestures; add reversible marker
      deletion, annotated overview markers, smoother transient UI, current-project rename, flatter
      Settings subpages, sheet-native Music dismissal, and install Release beta `1.0.0 (9)`
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/project-overview.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/layout/`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/controls/`, `src/components/ui/modals/`, `src/components/ui/projects/CurrentProjectSection.tsx`, `src/components/ui/screens/`, `src/styles/`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

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

### 2026-11-02 — Add headset safety and stabilise transient feedback

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** speed copy, headset disconnect, and popup retriggering → Done

**Changed:**

- Removed the two informational speed rows that did not change behavior, added an accent outline to
  selected preset-count and speed buttons, and grouped Continuous Play with its caption without the large
  intervening gap.
- Added a persisted, default-on Pause on Headset Disconnect setting. The new
  `BeatNoteAudioSession` Expo module reports iOS output-route loss; the audio hook pauses safely or,
  when the user opts out, resumes after expo-audio's automatic route-change pause.
- Suppressed native-clock jitter from retriggering the same timed annotation after its display
  window closes. Standalone dock toasts now use the empty annotation slot instead of floating a row
  too high, while annotation exits retain their in-place opacity fade.
- Repaired Xcode 27.1 native builds by selecting source-built React Native, keeping only the
  incompatible `fmt` pod on C++17, and making the XCTest harness refresh Pods/codegen after prebuild.
  Incremented to `1.0.0 (13)` and installed the signed Release app
  on the connected physical iPhone.

**Verified:**

- `npx tsc --noEmit`, version consistency, and `git diff --check` → passed.
- Full retained Playwright regression → 8/8 passed, including persisted headset preference,
  compact caption geometry, retained annotation fade, and lower no-annotation toast placement.
- Focused iOS `testLandscapeGesturesAndCompactControls` passed after a clean source build. Signed
  Release beta 13 built successfully and device services confirmed installation as `com.beatnote.app`.

**Not verified / known gaps:**

- Physical wired/Bluetooth disconnect behavior, annotation jitter around a real device clock, and
  the final visual spacing still need hands-on confirmation. The phone was locked after install, so
  device services could not launch beta 13 automatically.
- Expo-audio on iOS clamps playback above 2×. The existing experimental 4× configuration is not a
  working physical-iOS guarantee until a native speed engine replaces that boundary.

**Next agent should:**

- Unlock and inspect beta 13, then physically verify both states of Pause on Headset Disconnect and
  confirm annotations appear only once as playback crosses a marker.

### 2026-11-02 — Repair annotation fading and add Pro speed configuration

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** fade, numeric acceleration, capability copy, and speed configuration → Done

**Changed:**

- Moved the annotation callout to a retained core native opacity animation lasting 650 ms. It keeps
  its rendered text and fixed slot until the fade completes, including interrupted/replacement exits.
- Made seek distance directly editable and retained 0.5-second normalization. Holding seek or fine
  speed `−/+` now repeats at an exponentially increasing rate while respecting configured bounds.
- Removed redundant tier names from ordinary Settings descriptions. Unavailable Pro capabilities
  remain visible, greyed out, with the short note `Pro only`.
- Added persisted Pro speed ranges (`0.5×–2×` or `0.25×–4×`), 4/8/12 useful preset layouts, and
  long-press per-slot editing. The editor saves a normalized value or clears it with Use Default;
  Lite retains its standard built-in presets without fine/configuration controls.
- Incremented to `1.0.0 (12)` and installed the signed Release build on the physical iPhone.

**Verified:**

- `npx tsc --noEmit`, version consistency, and `git diff --check` → passed.
- Full retained Playwright regression → 8/8 passed. Existing journeys now verify partial opacity
  during annotation exit, direct seek entry, Lite `Pro only` gates, both speed ranges, preset counts,
  and custom preset save/default restoration without adding another journey.
- Focused iOS `testLandscapeGesturesAndCompactControls` passed. The signed Release app reports
  `1.0.0/12`, and device services confirmed installation as `com.beatnote.app`.

**Not verified / known gaps:**

- Automatic launch was denied because the physical iPhone was locked. Physical confirmation remains
  for fade visibility, keyboard entry, accelerated holds, chooser density, and preset editing.

**Next agent should:**

- Incorporate the user's physical beta 12 feedback, especially the visible fade duration and the
  12-button chooser in landscape.

### 2026-11-02 — Refine the annotation action and Tap Seeks defaults

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** annotation icon, fixed fade slot, and configurable Tap Seeks → Done

**Changed:**

- Replaced the annotation action with a themeable filled rounded speech bubble and inset list marks,
  matching the supplied reference without introducing a raster asset.
- Made Tap Seeks the first and default transport behaviour. Signed distances appear only in that
  mode; Tap Changes Track keeps the transport icons uncluttered. Seek distance is now adjustable
  from 0.5 to 30 seconds in exact 0.5-second steps, including accessible increment/decrement paths.
- Kept persistent toast and annotation layout slots above the overview so opacity exits cannot move
  downward when either child finishes unmounting. Updated durable UI rules and Help accordingly.
- Incremented to `1.0.0 (11)` and installed the signed Release build on the connected physical iPhone.

**Verified:**

- `npx tsc --noEmit`, version consistency, and `git diff --check` → passed.
- Full retained Playwright regression → 8/8 passed, including the Tap Seeks default, conditional
  badge visibility, actual seek behaviour, Tap Changes Track, and a persisted 5.5-second distance.
- Focused iOS `testLandscapeGesturesAndCompactControls` passed. The signed Release app reports
  `1.0.0/11`, and device services confirmed installation as `com.beatnote.app`.

**Not verified / known gaps:**

- Automatic launch was denied because the physical iPhone was locked. Physical visual/touch
  confirmation remains for the new icon, in-place fade, badge legibility, and distance stepper.

**Next agent should:**

- Incorporate the user's physical beta 11 feedback before adding more transport modes.

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

<!-- end handover log -->
