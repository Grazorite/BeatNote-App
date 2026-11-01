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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (7)` Release build installed physically · TestFlight pending
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

- [x] Smooth Custom Order dragging with stable row slots, midpoint hysteresis, and animated
      neighbour displacement; flatten the Settings root, restore Help & Support as a row, and move
      BeatNote Pro to a styled trailing crown action; install signed Release beta `1.0.0 (7)`
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/library/MusicLibraryRow.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/styles/layout/sidebar.ts`, `tests/ui-components.spec.ts`</sub>

- [x] Remove the media-control liquid-glass backdrop in both phone orientations, redraw the overview
      strip's Clear/Restore icons, reduce brittle browser UI coverage to eight core journeys, repair
      the two test-file lint issues, and install Release beta `1.0.0 (6)` on the physical iPhone
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/testing-strategy.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/icons/BeatNoteIcon.tsx`, `src/components/layout/MainContent.tsx`, `src/components/ui/controls/LoopClearControl.tsx`, `tests/ui-components.spec.ts`</sub>

- [x] Build the remaining Settings information architecture, wire persisted Continuous Play and
      Keep Screen On preferences, add safe Data and Pro previews, and repair the beta 5 breadcrumb
      truncation and Custom Order native drag-responder regressions
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `package.json`, `package-lock.json`, `src/components/KeepScreenAwakeController.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/library/MusicLibraryRow.tsx`, `src/components/ui/screens/ButtonConfigurationScreen.tsx`, `src/components/ui/screens/DataManagementScreen.tsx`, `src/components/ui/screens/PlaybackSettingsScreen.tsx`, `src/components/ui/screens/ProSettingsScreen.tsx`, `src/components/ui/settings/SettingsInfoRow.tsx`, `src/features/settings/preferences.ts`, `src/features/studio/StudioScreen.tsx`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/hooks/useWaveformData.ts`, `src/styles/components/common/headerBackButton.ts`, `src/styles/components/settings/settingsPage.ts`, `tests/ui-components.spec.ts`, `docs/context/archive/beatnote-project-history.md`</sub>

- [x] Refine iOS Settings and navigation with a compact root, dedicated Pro Timing & BPM subpage,
      About/support page, native UI-thread toggle feedback, marker-violet annotation identity,
      standard 20-point menu titles, leading breadcrumb Back controls, Lite speed presets with Pro
      fine controls, and physically installed beta `1.0.0 (5)`
      <sub>**Key Artifacts:** `.kiro/steering/coding-standards.md`, `.kiro/steering/release-roadmap.md`, `app.json`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/HeaderBackButton.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/controls/LayerNameSettings.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/settings/`, `src/components/ui/waveform/WaveformDetailPanel.tsx`, `src/features/entitlements/`, `src/hooks/useModernToggleAnimation.ts`, `src/styles/`, `tests/ui-components.spec.ts`</sub>

- [x] Polish the iOS library and utility surfaces with 36-character middle title truncation,
      persisted lifted Custom Order with neighbouring rows shifting during the held drag,
      equal-height Lite ad slots, centred menu/page
      titles with left-aligned Back controls, Debug-first Settings, iPhone-focused Help, and a
      freshly installed physical Release build
      <sub>**Key Artifacts:** `.kiro/steering/project-overview.md`, `src/components/layout/Sidebar.tsx`, `src/components/ui/ads/LiteAdPlaceholder.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/HeaderBackButton.tsx`, `src/components/ui/controls/SongTitleControl.tsx`, `src/components/ui/library/MusicLibraryRow.tsx`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/modals/ProjectManagerModal.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/features/library/repositories.ts`, `src/hooks/useStudioStore.ts`, `src/types/library.ts`, `src/utils/displayText.ts`, `src/utils/queueOrder.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-11-02 — Complete Settings architecture and repair beta 5 regressions

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** Settings expansion and beta 5 breadcrumb/Custom Order regressions → Done

**Changed:**

- Added compact Playback, Button Configuration, Data Management, and BeatNote Pro destinations.
  Continuous Play and Keep Screen On are persisted and functional; unfinished headset, seek,
  custom-preset, bulk deletion, and StoreKit rows are visibly and truthfully labelled placeholders.
- Continuous Play now controls actual Pro queue advancement. Keep Screen On uses Expo's native wake
  lock for always or while-playing modes. Data Management reports imported-copy usage, clears only
  derived waveform/BPM caches after confirmation, and confirms current-song marker deletion.
- Reduced breadcrumb padding so the `Settings` label fits its balanced header slot. Kept each Music
  Library row's PanResponder stable across live reorder renders so a held native drag is not lost as
  neighbours move.
- Repaired two new tests: radio choices now expose `aria-checked`, and the completion journey waits
  for playback to stop before changing tier, eliminating a false timing failure.

**Verified:**

- `npx tsc --noEmit`, `npm run check:version`, `git diff --check`, and the orchestrator contract
  checker → passed.
- Focused Settings, tier, Continuous Play, annotation/data-confirmation, and drag coverage passed;
  full retained Playwright regression harness → 9/9 passed.

**Not verified / known gaps:**

- The smaller breadcrumb, uninterrupted held-row movement, native wake lock, and all new Settings
  pages have not yet been installed or inspected on a physical iPhone.
- Pause on headset disconnect, configurable seek buttons, configurable/custom speed presets, bulk
  audio/project/all-data deletion, full dependency notices, and StoreKit remain labelled future work.

**Next agent should:**

- Build/install the next physical beta and verify the Settings breadcrumb, Custom Order drag feel,
  Keep Screen On modes, and compact Settings pages before expanding another placeholder.

### 2026-11-02 — Polish Settings, navigation, ordering, and tier controls

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** iOS Settings/navigation, live custom ordering, and speed tier split → Done

**Changed:**

- Kept the Settings root compact: Debug and Basic remain inline, Advanced links to a dedicated Pro
  Timing & BPM page, Support links only to About BeatNote, and Help lives in the trailing header
  icon instead of taking another list row.
- Added an About page with the real version/build, current licence status, the GitHub feedback
  channel, and an explicit statement that no crash or usage diagnostics are currently collected.
- On iOS, modern toggles now recognize the tap and animate entirely on the native UI thread before
  sending the explicit intended value to JavaScript. Rapid debug-tier taps no longer derive from a
  stale captured tier, while persistence and capability state remain authoritative.
- The single annotation-lane swatch now uses the same shared violet as its visible markers instead
  of the legacy vocals-layer red.
- Standardised menu/submenu titles on the shared 20-point token and replaced navigation Close
  actions with leading iOS-style breadcrumb Back controls across Settings, Help, Music, Projects,
  and waveform detail.
- Custom Order now updates as the held row crosses each neighbour, using layout animation so the
  other rows move before release while the lifted row stays under the finger.
- Lite now retains every built-in pitch-preserved speed preset. Pro adds the fine slider and
  increment/decrement controls; long-press custom preset editing is reserved for its planned Pro
  implementation. Installed signed Release beta `1.0.0 (5)` on the connected physical iPhone.

**Verified:**

- `npx tsc --noEmit`, version consistency, and `git diff --check` → passed.
- Full retained Playwright regression harness → 9/9 passed, including root/subpage navigation,
  rapid debug-tier changes, marker-violet identity, Lite/Pro speed surfaces, standard header sizes,
  leading Back controls, and live pre-release custom-order movement.
- Signed Release build `1.0.0 (5)` succeeded after regenerating ignored React Native codegen and
  installed and launched on iPhone `gæl (3)` as `com.beatnote.app`.

**Not verified / known gaps:**

- Physical confirmation of breadcrumb layout, held-drag animation, heavy-load toggles, violet
  identity, and Lite/Pro speed surfaces remains with the user.
- Full dependency licence notices, an in-app feedback composer, Playback/Button Configuration, and
  Data Management pages remain future work; current feedback opens the project issue form.

**Next agent should:**

- Unlock and inspect beta 5 on the physical phone, especially held-row movement and the Lite/Pro
  speed chooser, before expanding Settings further.

### 2026-11-02 — Polish the iOS library and utility surfaces

**Agent:** orchestrator (Codex) · **Commit(s):** `this commit`
**Kanban moved:** iOS library and utility polish → Done

**Changed:**

- Long song names now middle-truncate after 36 characters while accessibility retains the full
  title; the toolbar and library row both keep recognisable beginnings and endings.
- Music Library now has a persisted Custom Order sort. First activation adopts the current order,
  the full-width final sort choice exposes lifted drag handles without scrolling the sheet,
  VoiceOver increment/decrement actions rearrange songs, and other sort modes do not discard the
  saved custom arrangement.
- Lite ad creatives now reserve the same 50-point height in portrait and landscape, with the
  portrait safe-area spacer kept outside the measured ad slot.
- Debug moved to the top of Settings, and Help & Support now documents the iPhone/Files/share-sheet
  workflow without browser shortcuts.
- Settings/detail, Help, Music Library, bottom-sheet, and Projects headers now keep their titles
  centred. All menu titles share the 20-point navigation token and every return action uses a
  left-side iOS breadcrumb Back control; Settings retains Help in the balanced trailing slot.

**Verified:**

- `npx tsc --noEmit`, version consistency, diff checks, and the orchestrator contract check passed;
  full retained Playwright regression harness → 9/9 passed after settling animated page transitions.
- Signed Release build succeeded, installed on physical iPhone `gæl (3)`, launched as
  `com.beatnote.app`, and remained running as PID 2665; temporary DerivedData was removed.

**Not verified / known gaps:**

- Physical visual and touch confirmation of title truncation, custom-order dragging, ad height,
  Debug placement, and Help content remains with the user; no native implementation changed, so no
  focused iOS XCTest was run.

**Next agent should:**

- Incorporate the user's feedback from the installed build, especially drag feel and row behaviour
  with a larger real music library.

<!-- end handover log -->
