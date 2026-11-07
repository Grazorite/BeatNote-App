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

**Last updated:** 2026-11-08
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (59)` Release build installed and launched on the physical iPhone · TestFlight pending
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
| iOS UI tests | 10 critical native integrations retained; all ten passed on build 58, affected journeys and accessibility audited on build 59 |
| E2E spec files | 2 (Playwright harness, 8 critical journeys) |
| Native Expo modules | 4 (`BeatNoteWaveform`, `LibraryStorage`, local `BeatNoteTempo` analysis, and `BeatNoteAudioSession`) |

### Current Focus

1. Confirm overnight same-song recovery and physical system Previous/Next with unsaved edits on build 59. Saved-data preservation and custom interval controls passed; manual VoiceOver was waived.
2. Signing, beta metadata and approved privacy declaration are ready. Complete candidate acceptance,
   then upload the first internal TestFlight build and verify clean installation and update.
3. Freeze and explicitly close V1 after distribution acceptance, recording non-blocking limits.

### Agent Assignments

| Agent / Role | Owns | Current assignment |
|--------------|------|--------------------|
| `orchestrator` (primary session agent) | AGENTS.md upkeep, task sequencing, handover | Keep board + log current on every completion |
| `context-gatherer` (DSH-Qwen) | Scoped investigation / light implementation | Completed performance audits `session-b21ea04d-e305-4b1a-802f-d1b8934c426a` and `session-95fd531c-fdd4-467a-a92c-dd6ab7063d1f`, plus native signposts `session-5d8e713b-9ae5-49cf-8a72-1fd082f4d970`; orchestrator/Kiro reviewed and repaired the integrations |
| `human` (user) | Apple Developer account, secrets, deploy approval | Review V1 acceptance and complete Apple authentication/metadata prompts |

---

## 📋 Live Kanban Board

### 🔜 To Do

- [ ] V1.8 — Freeze and explicitly close V1; record non-blocking limitations before V2 begins

### 🚧 In Progress

- [ ] V1.7 — Signing, EAS, App Store Connect beta metadata, privacy/support URLs and the approved Data Not Collected declaration are configured. Upload to TestFlight after candidate acceptance and complete clean-install/update acceptance.
- [ ] Confirm same-song Play and position after a real overnight suspension on physical iPhone build 59. Build 56 added proactive refresh after the build 55 failure.
- [ ] Check physical Lock Screen/Control Centre Previous/Next with unsaved edits: draft saves, song switches, and edits return when switching back. Failed saves must block the switch.

### ⏸ Deferred — V2/V3

- [ ] Playlist management in Lite, with automatic continuous playback gated to Pro.

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Add overview elapsed/total time and spacing, fix Pro-toggle cancellation, preserve drafts during system song changes, verify iPad/accessibility, prepare distribution metadata, and install build 59. Record user-passed saved-data and interval checks.
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/coding-standards.md`, `.kiro/steering/ios-testflight.md`, `.kiro/steering/project-overview.md`, `.kiro/steering/release-roadmap.md`, `.kiro/steering/testing-strategy.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `eas.json`, `scripts/ios-ui-test.js`, `src/components/layout/MainContent.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/ui/common/BottomSheet.tsx`, `src/components/ui/common/ModernToggle.tsx`, `src/components/ui/controls/DebugTierControl.tsx`, `src/components/ui/controls/LoopRangeOverview.tsx`, `src/components/ui/controls/OverviewTime.tsx`, `src/components/ui/controls/PlaybackSpeedControl.tsx`, `src/components/ui/controls/SidebarToggle.tsx`, `src/components/ui/modals/ConfirmDialog.tsx`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/components/ui/screens/HelpScreen.tsx`, `src/components/ui/settings/SettingsSubpage.tsx`, `src/components/ui/waveform/WaveformCanvas.tsx`, `src/features/entitlements/capabilityService.ts`, `src/features/library/trackSwitch.ts`, `src/features/studio/StudioScreen.tsx`, `src/hooks/useAppSafeAreaInsets.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useStudioStore.ts`, `src/styles/components/controls/loopRangeOverview.ts`, `src/styles/components/controls/overviewTime.ts`, `src/styles/components/settings/aboutSettings.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/setup.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Stabilise the landscape annotation browser journey across asynchronous rotation and verify the full suite.
      <sub>**Key Artifacts:** `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`, `tests/waveform-features.spec.ts`</sub>

- [x] Default new installations to Lite, retain saved tiers and the bananas unlock, configure the supplied App Store ID, and review V1 before TestFlight. Install build 57.
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `eas.json`, `src/features/entitlements/capabilityService.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/setup.ts`, `tests/ui-components.spec.ts`, `tests/waveform-features.spec.ts`</sub>

- [x] Refresh paused audio after 15 minutes away, retry from Reload Audio, and cancel suspended recovery deadlines. Install build 56.
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/hooks/useAudioPlayer.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] Center the full-width Telegram feedback button in Help & Support and remove the About copy. Install build 55.
      <sub>**Key Artifacts:** `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/styles/components/common/telegramFeedbackButton.ts`, `src/styles/components/screens/helpScreen.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>


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

For user-facing app changes, finish with the signed in-place iPhone update and launch check in [the iOS workflow](.kiro/steering/ios-testflight.md), unless the user asks otherwise.

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

### 2026-11-08 — Overview timing and verified V1 candidate in build 59

**Agent:** Codex · **Commit(s):** Build 59 commit containing this entry; public support/privacy pages in `ae29cfb`.
**Kanban moved:** Overview timing/spacing, Pro cancellation, draft-preserving system switching, native/iPad/accessibility checks and metadata preparation → Done. TestFlight distribution acceptance remains In Progress.

**Changed:** Overview elapsed/total time has stable width and 12-point gaps before the strip and its clear/restore action in both orientations. Cancelling Pro unlock stays visually Lite; new installations remain Lite and saved tiers persist. System song changes flush the draft without prompting or overwriting named projects. iPad uses the touch editor with a minimum top inset to keep window controls off Back. The native runner supports isolated focused lists and reports all failures. Public support/privacy pages and the About link are available. Apple beta metadata and the approved Data Not Collected declaration are saved.

**Verified:** TypeScript, version consistency, whitespace and eight browser journeys passed. All ten retained iPhone journeys passed on build 58; affected annotation/project, loop/transport and landscape journeys passed again on build 59. Description/trait accessibility audits passed on iPhone and iPad. iPad simulator import/project restoration, portrait/landscape playback and windowed navigation passed; screenshots were reviewed. Temporary draft checks covered restoration, failed saves and timeout. Corrected test synchronization, button roles and the native fixture's fractional-duration expectation. Temporary audits were removed; ten native journeys remain. Signed Release 59 passed strict signature verification, installed in place, independently reported 1.0.0 (59), and launched on the physical iPhone. The user passed preserved library/projects and custom intervals. No TestFlight upload occurred.

**Not verified / known gaps:** Overnight physical recovery and physical system song switching with unsaved drafts remain open. Accessibility audits cover descriptions and traits only; manual VoiceOver was waived. iPad acceptance used an 11-inch Pro simulator, not physical hardware. EAS distribution credentials were configured and reported by the user; no store archive/upload has tested them yet. All pending candidate changes are included in this commit; the requested push follows verification.

**Next agent should:** Record the two remaining physical acceptance checks, then prepare the first internal TestFlight upload and clean-install/update acceptance.

### 2026-11-07 — Stabilise landscape annotation browser checks

**Agent:** Codex · **Commit(s):** uncommitted
**Kanban moved:** Landscape annotation test investigation → Done

**Changed:** The existing rotation journey reads all overview bounds in one browser frame and
retries the layout assertions until reflow finishes. It explicitly pauses playback, verifies that
the playhead is still at the marker, and confirms the annotation editor opens before checking its
landscape Done action. Preserved the pending overview, tier, native, distribution and documentation
work already present in the tree. No application code or iPhone build changed in this task.

**Verified:** Three serial baseline runs passed. A six-worker, twelve-run baseline reproduced mixed
portrait/landscape bounds (a transient negative gap). After the atomic layout checks, eighteen
six-worker repetitions passed. The final test, including explicit pause/marker/editor preconditions,
passed in the full eight-worker, eight-journey suite. TypeScript and whitespace checks passed.

**Not verified / known gaps:** The exact earlier missing-Done failure appears in the existing build
59 log but did not recur in this session; the captured new failure was in the same journey's reflow
measurements. This addresses the observed test race without claiming a native annotation defect.
These test/handover edits and the pre-existing work remain uncommitted on master.

**Next agent should:** Continue the existing candidate work and preserve these test synchronization changes.

### 2026-11-07 — Lite default and pre-TestFlight review in build 57

**Agent:** Codex · **Commit(s):** uncommitted
**Kanban moved:** Lite default, saved tiers, password unlock and V1 review → Done. V1.7 → In Progress.

**Changed:** New installs and all-data reset default to Lite. Existing explicit saved Lite or Pro
selections still hydrate unchanged; enabling Pro still requires bananas. Configured the user-supplied
App Store Connect ID 6831990297 alongside the linked EAS project. Updated the roadmap to separate
implemented V1 preview behavior from future policy, including CSV/PDF access, cold-launch position,
unavailable purchases, ads and iCloud, and outstanding physical/iPad/distribution acceptance.
Retained browser/native journeys explicitly unlock Pro instead of relying on the previous default.

**Verified:** TypeScript, version consistency, whitespace and all eight browser journeys passed.
Browser journeys prove fresh Lite, password unlock, saved Pro after reload and saved Lite after
reload. Signed Release 57 passed strict signature verification; device services independently
reported 1.0.0 (57) installed in place and launched. The focused native Settings/Files journey passed
after the test explicitly dismissed the password keyboard before confirming; earlier attempts
stopped at that modal. Generated test recordings and the simulator build cache were cleared.

**Not verified / known gaps:** No TestFlight upload. Supplied Apple account/app records have not been
independently authenticated in App Store Connect. Final aggregate native suite, overnight physical
recovery, system buttons, saved-data/tier acceptance, VoiceOver and iPad remain open. Current task
and earlier EAS setup changes remain uncommitted on master.

**Next agent should:** Complete the candidate acceptance checklist in the release roadmap before
distribution signing and the first internal TestFlight upload.

### 2026-11-07 — Link EAS and prepare App Store Connect setup

**Agent:** Codex · **Commit(s):** uncommitted
**Kanban moved:** V1.7 distribution setup → In Progress

**Changed:** Recorded the user's completed Individual enrolment and supplied Apple account/team in
eas.json. Created and linked @grazorite/beatnote-app (a2f1ec5c-a46d-472f-95cf-b90778c343c3).
Corrected the legacy Android buildType value that blocked EAS validation and corrected TestFlight
instructions to use the production store profile. Changed files: AGENTS.md, app.json, eas.json,
.kiro/steering/ios-testflight.md, docs/context/archive/beatnote-project-history.md.

**Verified:** EAS project:info returned the approved owner and matching project ID. TypeScript,
version consistency and whitespace checks passed. No app behavior changed or device build installed.

**Not verified / known gaps:** Apple membership is user-reported; Apple authentication and App Store
Connect record creation remain pending. ascAppId is still a placeholder. No build was uploaded.
Source inspection confirms fresh installs and all-data reset default to Pro; saved debug tier
persists, and bananas only gates Lite → Pro. This behavior was explained, not changed.
The five setup/documentation files remain uncommitted.

**Next agent should:** Obtain the numeric App Store Connect Apple ID after the user creates BeatNote
with bundle ID com.beatnote.app, then configure signing and prepare the TestFlight build.

### 2026-11-07 — Proactive audio refresh and actionable fallback in build 56

**Agent:** Codex · **Commit(s):** Build 56 commit containing this entry.
**Kanban moved:** Proactive stale-audio refresh and physical installation → Done. Overnight device acceptance → In Progress.

**Changed:** Returning after at least 15 minutes away recreates a paused iOS player for the same
song and position, even if the old item reports loaded. Healthy background playback continues.
Session configuration precedes readiness and the first foreground Play. Play during refresh updates
the pending intent. Leaving the foreground cancels unfinished recovery so old deadlines cannot show
an error after suspension. Failed recovery retains the selected position and offers Reload Audio,
which uses the latest player and avoids duplicate prompts. The project and unsaved edits stay loaded.

**Verified:** TypeScript, version consistency, whitespace and all eight browser journeys passed.
A temporary one-second inactivity threshold and injected first-recovery failure exercised proactive
replacement and the Reload Audio retry at the same position. A delayed recovery was backgrounded,
then replaced on return without surfacing its old timeout. Both simulator fault runs passed; all
faults were removed. The first clean run passed playback but exposed an immediate title assertion
in the queue check. The retained test now waits for the destination title and transition completion;
the final clean native background/playback/seek/song-switch journey passed. Release signing and
bundle checks passed. The physical iPhone reported 1.0.0 (56) installed in place and launched.

**Not verified / known gaps:** The screenshot identifies the earlier recovery fallback, not the
underlying native failure. The exact eight-hour physical suspension remains to be confirmed.

**Next agent should:** Record the first Play and position after an overnight absence on build 56.

<!-- end handover log -->
