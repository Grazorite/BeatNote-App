---
inclusion: always
---

# BeatNote — Testing Strategy

## Philosophy

Keep the permanent suite deliberately small. A committed test must protect a release-blocking V1
journey or a native integration that cannot be trusted through static checks. Confidence comes from
a few complete user workflows, TypeScript, and focused device acceptance—not from test counts.

Do not retain tests for visual measurements, implementation details, isolated state transitions,
trivial utilities, or behavior already exercised by a broader critical workflow.

## Permanent gates

### 1. TypeScript

Run `npx tsc --noEmit` for every implementation change. This is the first gate for contracts,
component props, and refactors.

### 2. Playwright — critical web/mobile workflows

Run `npm test`. The permanent browser suite is limited to these cohesive journeys:

- Open mobile Settings and Help in portrait and landscape, with V1-only content.
- Load audio, use the responsive control dock, and preserve the loaded edit through rotation.
- Import durable web audio, reload it from IndexedDB, open the Music Library with keyboard focus,
  trap focus inside it, and restore focus to the Song Title control on close.
- Save and copy projects, restore the newest project or per-song draft, replace/undo CSV content,
  relink legacy missing audio, and keep library/project actions out of the toolbar.
- Navigate the Music Item queue with First, Previous, Next, and Shuffle, including rapid coalesced
  Next requests and the accessible end-of-queue state.
- Create a marker only through marker controls, add/reopen its annotation, and keep gestures isolated.
- Exercise the loop-range workflow from creation through edit, mode change, clear, and restore.
- Open the custom project/import/export surfaces and verify their primary actions remain readable.

Prefer extending one of these workflows over adding a new test. A regression assertion belongs in
the nearest existing journey when it protects that journey's outcome.

### 3. iOS XCTest — critical native integrations

Run focused cases with `IOS_TEST_ONLY=<case> npm run test:ios:ui`, and use the aggregate command only
for release acceptance. The aggregate runner builds once, then reinstalls and restages before each
case to isolate Files-provider and app-container state. Retain native coverage where the simulator
or device is part of the behavior:

- Files picker and V1 Settings launch path.
- Audio playback, annotation input, durable managed-audio restoration after a cache purge, and
  per-song draft/project restoration.
- Loop transport and compact controls.
- Confirmed CSV replacement from Project Manager and iOS share-sheet export.
- Background audio continuity.
- Landscape gestures, safe geometry, and portrait restoration.
- Open In URL delivery, loading, and retention in the local Music Library.

Physical-device checks remain necessary for touch comfort, VoiceOver, audio interruptions, and
external sharing. Simulator success does not replace those checks.

## Temporary unit tests

Jest remains installed as an implementation tool, but unit tests are not part of the permanent
suite. A developer may write a focused unit test first to reproduce or validate non-trivial logic.
After the implementation is verified through TypeScript and the relevant retained critical journey,
remove that temporary test before completion. `npm run test:unit` intentionally succeeds when no
temporary tests are present.

Do not create permanent unit-test coverage targets or backlogs. If logic is too risky to remove its
unit test after verification, first decide whether it represents a release-critical invariant; if it
does, document the exception here and keep the smallest possible test.

## Rules

- No `test.only` or `test.skip` in committed code.
- Tests describe user-visible outcomes, not internal state or styling implementation.
- Do not add standalone smoke tests when an existing end-to-end journey proves the same surface.
- Avoid pixel-perfect assertions; retain only geometry checks that prevent controls from becoming
  clipped, unsafe, or unusable.
- Tests are independent and must not depend on execution order.
- Delete superseded and temporary tests instead of preserving them for historical counts.
- A bug fix may begin with a failing temporary test, but completion includes removing that test once
  the corresponding critical workflow proves the fix.
