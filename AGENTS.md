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
**Branch:** `master` (work happens here; no feature branches) · **Release target:** iOS only · current `1.0.0 (29)` Release build re-signed and installed physically; launch awaits renewed developer trust · TestFlight pending
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

1. Re-trust the renewed Personal Team developer profile on the iPhone, confirm Release 29 launches,
   and verify the existing BeatNote library/projects remain present after the in-place install.
2. Reconcile and commit the release-candidate tree, restore the host's CoreSimulator service, and
   rerun all ten retained native journeys from the exact committed tree.
3. Enrol for Apple distribution and pass TestFlight clean-install/update acceptance before starting
   V2 purchase enforcement.

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

- [ ] V1.6 — Reconcile and commit the exact release candidate; rerun TypeScript, 8 browser journeys,
      10 iOS journeys, version consistency, and whitespace checks

- [ ] Restore physical Release 29 launch after the seven-day Personal Team profile expired; renewed
      profile is installed in place and awaits explicit trust on the iPhone

### ⏸ Deferred — V2/V3

- [ ] V2 purchase/restore/entitlement enforcement after the V1 core acceptance and tier matrix are stable
- [ ] V2 advanced tempo intelligence and Apple Music provider spike; Spotify commercial streaming
      remains blocked unless its policy changes or BeatNote receives written approval
- [ ] V3 managed cloud stem-separation beta — provider spike, backend job API, credits, progress/cancel, cache, limited UI
- [ ] Later V3 on-device/hybrid stem separation — CoreML benchmarks, Expo Module, routing, storage management, per-stem waveforms

### ✅ Done

- [x] Physically accept Release 29 repeated Music Library switching and the nested About → Open
      Source Licences slideover animation
      <sub>**Key Artifacts:** `.kiro/steering/ios-testflight.md`, `AGENTS.md`, `docs/context/archive/beatnote-project-history.md`</sub>

- [x] V1.4b/V1.5 closeout — Accept the physical playback/BPM lifecycle matrix, document the native
      0.25× quality limit, add complete runtime/native licence notices, password-gate the debug Pro
      preview, align the nested Licences transition, repair deterministic native test setup, and
      install Release 29
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `package.json`, `scripts/generate-native-licences.js`, `scripts/ios-ui-test.js`, `src/components/ui/controls/DebugTierControl.tsx`, `src/components/ui/modals/ConfirmDialog.tsx`, `src/components/ui/screens/AboutSettingsScreen.tsx`, `src/components/ui/settings/SettingsSubpage.tsx`, `src/data/nativeOpenSourceLicences.generated.ts`, `src/data/openSourceLicences.ts`, `src/styles/components/settings/aboutSettings.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] V1 release blocker — Repair Library row switching and verify long-file recovery in Release 28
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `modules/beatnote-waveform/ios/BeatNoteWaveformModule.swift`, `modules/beatnote-waveform/src/index.ts`, `scripts/ios-ui-test.js`, `src/components/ui/library/MusicLibrarySheet.tsx`, `src/components/ui/modals/SwitchGuardDialog.tsx`, `src/features/library/draftAutosave.ts`, `src/features/library/trackSwitch.ts`, `src/hooks/useAudioPlayer.ts`, `src/hooks/useWaveformData.ts`, `src/services/waveformExtraction.ios.ts`, `src/services/waveformExtraction.types.ts`, `tests/ios/BeatNoteUITests.swift`, `tests/ui-components.spec.ts`</sub>

- [x] V1.4a/export polish — Accept representative-song whole-number BPM accuracy and external
      CSV/PDF sharing, render PDF overview waveforms in solid black, and install Release 27
      <sub>**Key Artifacts:** `.kiro/steering/choreography-features.md`, `.kiro/steering/release-roadmap.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `src/utils/exportEngineCore.ts`, `tests/ui-components.spec.ts`</sub>

- [x] V1 release blocker — Defer waveform decoding until destination playback is ready, correct
      automatic-tempo pulse selection and whole-number output against representative songs, share
      exports as files without URI text, restore printable PDF waveform artwork, and install Release 26
      <sub>**Key Artifacts:** `.kiro/steering/architecture-decisions.md`, `.kiro/steering/choreography-features.md`, `AGENTS.md`, `app.json`, `docs/context/archive/beatnote-project-history.md`, `modules/beatnote-tempo/ios/BeatNoteTempoModule.swift`, `src/components/ui/controls/BpmSuggestionCard.tsx`, `src/hooks/useWaveformData.ts`, `src/services/bpmAnalysis.ios.ts`, `src/utils/exportEngine.ios.ts`, `src/utils/exportEngineCore.ts`, `tests/ui-components.spec.ts`</sub>

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

### 2026-11-05 — Renew expired physical-device signature

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Release 29 physical Library/Licences confirmation → Done; renewed-profile trust → In Progress

**Changed:**

- Recorded the user's physical passes for repeated Music Library switching and the nested About →
  Open Source Licences slideover.
- Diagnosed the sudden launch loss as expiry of Xcode's seven-day free Personal Team provisioning
  profile, not an app crash. Renewed the profile, re-signed the same Release 29 bundle, and installed
  it over the existing bundle without uninstalling.
- Documented the weekly Personal Team renewal/trust lifecycle and TestFlight as the durable path.

**Verified:**

- The phone remained paired and independently reported BeatNote `1.0.0 (29)` installed. Its first
  launch request was denied specifically for an invalid/untrusted profile.
- The original embedded profile expired on 2026-11-04 at 12:49 pm Singapore time. Xcode generated
  profile `124dfec1-cb14-4aeb-bac5-e70ef1687bb7`, valid through 2026-11-12 at 4:55 am Singapore
  time; signed Release build and validation succeeded, and in-place installation succeeded.

**Not verified / known gaps:**

- iOS still denies launch until the user explicitly trusts the renewed developer profile in Settings.
  Confirming launch and preservation of the existing library/projects remains pending that action.
- The shared release-candidate tree remains intentionally uncommitted; the simulator gate remains open.

**Next agent should:**

- After the user trusts the developer profile, launch Release 29 via `devicectl`, confirm existing
  local content is present, then continue V1.6 reconciliation.

### 2026-11-04 — Close V1 polish and install Release 29

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** V1.4b/V1.5 release closeout → Done; V1.6 release-candidate reconciliation remains To Do

**Changed:**

- Added complete direct and CocoaPods-generated open-source acknowledgements, made About → Open
  Source Licences use the same horizontal Settings transition, and password-gated the debug Lite →
  Pro switch with `bananas`; Pro → Lite remains immediate.
- Confirmed iOS already uses AVPlayer's highest-quality spectral pitch correction. The remaining
  0.25× smear is an accepted native extreme-stretch limitation; a different audio engine is V2 work.
- Repaired deterministic native test setup: post-import journeys use a seeded managed library, and
  BPM stress fixtures now carry the content fingerprint required for decoded analysis eligibility.
- Preserved the shared Release 28 Music Library fixes, bumped to 29, then signed, installed, verified,
  and launched the combined Release build on physical iPhone `gæl (3)`.

**Verified:**

- TypeScript, version consistency, whitespace, licence generation, the empty permanent-unit suite,
  and all eight retained browser journeys passed. Browser coverage includes the wrong/correct Pro
  password paths and the licence content/navigation flow.
- The current native run passed its first four journeys, including annotation restore, automatic BPM,
  and cancellation/retry. A focused annotation rerun passed after removing Files-provider flakiness.
  The long-track failure was traced to a null fingerprint in test seed data and corrected.
- Xcode's signed Release build and validation passed. Bundle and installed-device metadata independently
  report `1.0.0 (29)`; device installation and automatic launch succeeded.

**Not verified / known gaps:**

- Xcode 27.2's CoreSimulator/simdiskimaged service crashed repeatedly, including after a full service
  restart. The remaining six native journeys and the corrected long-track fixture therefore could
  not be rerun on the exact final tree; all ten remain retained and had passed in earlier focused runs.
- Physical confirmation remains for repeated switching of the user's affected song and the new
  About → Open Source Licences animation. The shared tree is intentionally still uncommitted.

**Next agent should:**

- Record those two Release 29 physical checks, restore CoreSimulator, then reconcile/commit V1.6 and
  rerun its exact-tree gate before TestFlight.

### 2026-11-04 — Release 28 Music Library row switching

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Library switching implementation → Done. Physical confirmation → In Progress.

**Changed:**

- Library selections resolve the save guard inside the sheet, then dismiss it before entering the
  Studio switch transition. A failure reopens the affected row with Retry. Removed the parallel
  local row lock and the second success dismissal.
- Read live readiness from the destination player, serialize manual and automatic requests, and
  prevent late queue/bookkeeping results from replacing the active selection. Switches use the
  reconciled project summaries and read the destination draft strictly. Already-durable drafts can
  skip the write queue. Dirty edits must still flush successfully.
- Cancel unused native waveform requests during a switch and bound peak transfer and retention
  for long songs. Added an existing-library simulator fixture and a browser failure/retry check.

**Verified:**

- TypeScript, version consistency, whitespace and all eight browser journeys passed. The injected
  draft-read failure left the source selected and Retry restored the destination with its marker.
- Focused iPhone 17 Pro simulator XCTest passed after replacing flaky Files-picker setup with a
  prepopulated three-song library. It covers background/foreground, seek, two hold-to-switch
  actions, repeated actual row taps with an 11-minute 58 MB WAV, and advancing destination playback.
- Signed Release bundle and device metadata both report 1.0.0 (28). Install and launch succeeded
  on the paired physical iPhone. Concurrent release-closeout edits and older uncommitted work remain.

**Not verified / known gaps:**

- Reproduction with the user's affected physical file and the broader physical lifecycle matrix
  remain open. The signed build contains the shared working tree at bundle time.

**Next agent should:**

- Record the user's Release 28 Library row-tap result with the previously affected file.

### 2026-11-04 — Accept BPM/export and strengthen PDF waveform contrast

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** V1.4 accuracy/export polish → Done; V1.4b lifecycle/audio-session stress → In Progress

**Changed:**

- Recorded the user's physical acceptance that automatic BPM is generally correct, CSV/PDF sharing
  opens correctly, and the exported overview waveform is visible. Split remaining BPM lifecycle
  stress from the now-accepted real-song accuracy gate in the durable V1 checklist.
- Changed printable SVG waveform bars from muted gray at 72% opacity to solid black at full opacity
  so coloured choreography markers retain clear contrast. Added an exact generated-HTML assertion.
- Incremented, signed, installed, device-verified, and launched Release 27 on physical iPhone
  `gæl (3)`. Earlier uncommitted work remains preserved; no commit or remote operation occurred.

**Verified:**

- TypeScript, version consistency, whitespace, and all eight retained browser journeys passed; the
  PDF journey asserts explicit SVG geometry, full opacity, and `#000` waveform fill.
- Xcode's signed Release build and validation passed. The first package correctly exposed that the
  generated native config was still build 26; it was not installed. After prebuild and incremental
  rebuild, bundle metadata and the phone independently report `1.0.0 (27)`.
- Release 27 installation and automatic launch succeeded.

**Not verified / known gaps:**

- The solid-black waveform's physical PDF contrast still needs the user's visual confirmation.
- Automatic-BPM lifecycle stress and the broader physical audio-session matrix remain open:
  cancellation/retry, long-run heat/memory, backgrounding, interruption recovery, and output routes.
- Xcode 27.2 reports that the host's CoreSimulator service is stale; physical-device Release build,
  signing, validation, installation, and launch still succeeded.

**Next agent should:**

- Record the Release 27 PDF contrast result, then run V1.4b's combined BPM/audio lifecycle matrix.

### 2026-11-03 — Correct real-song tempo, switch contention, and exported files

**Agent:** orchestrator (Codex) · **Commit(s):** `uncommitted`
**Kanban moved:** Music Library/BPM/export release blocker → Done; V1.4 physical BPM acceptance remains In Progress

**Changed:**

- Traced the BIRDS OF A FEATHER switch failure to waveform decoding starting as soon as the
  destination URI was published, while the audio player was still opening that same file. Waveform
  work now waits until the track-switch transaction reaches idle/player-ready state.
- Replaced single-peak tempo selection with pulse-family ranking, explicit 3:2 alias handling,
  interpolation, whole-number output, and a new analysis-cache version. The UI also rounds and
  deduplicates alternatives defensively.
- Shared iOS exports as file URLs only, preventing target apps from choosing a text message that
  contained the sandbox URI. Replaced percentage-height PDF waveform spans with explicit inline SVG
  rectangles so iOS Quartz has printable waveform geometry.
- Inspected the user's attached PDF and confirmed the overview background/markers rendered while
  waveform artwork was absent. Built, installed, device-verified, and launched Release 26 on the
  connected physical iPhone. Earlier uncommitted release work remains preserved.

**Verified:**

- TypeScript, version consistency, whitespace, the focused BPM/export browser journey, and the full
  retained Playwright suite passed; the full browser result was 8/8.
- Focused native background/consecutive-switch acceptance passed. A native synthetic-tempo journey
  passed, and real-file simulator iterations confirmed Marilag at 78 BPM and moved BIRDS OF A
  FEATHER from the old 70-BPM alias to 104 before the final pulse rounding adjustment to 105.
- Xcode's signed Release build and validation succeeded. Bundle and installed-device metadata both
  report `1.0.0 (26)`; installation and automatic launch succeeded.

**Not verified / known gaps:**

- The final real-file simulator rerun was interrupted by a corrupt/incomplete xcresult after the
  last 104→105 rounding adjustment. Exact 105 display, the user's intermittent waveform-enabled
  Library tap sequence, direct file opening in a third-party app, and rendered physical PDF waveform
  remain hands-on Release 26 acceptance items.
- Standalone `codesign --verify --deep --strict` was not rerun; prior releases report
  `CSSMERR_TP_NOT_TRUSTED` for the local Apple Development chain while Xcode validation and physical
  installation succeed.

**Next agent should:**

- Record the Release 26 physical checks for waveform-enabled BIRDS switching, 78/105 BPM results,
  direct file sharing, and visible PDF overview waveform, then close or constrain V1.4.

<!-- end handover log -->
