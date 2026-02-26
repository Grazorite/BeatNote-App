---
inclusion: always
---

# BeatNote — Testing Strategy

## Philosophy

Test critical logic, not implementation details. The goal is confidence in correctness, not coverage numbers. Do not write tests for trivial getters, pure UI layout, or things already covered by TypeScript's type system.

## Test layers

### 1. Unit tests (Jest) — critical logic only

Target: `src/utils/` and pure logic in `src/hooks/useStudioStore.ts`.

Run with: `npx jest --testPathPattern=unit`

**Must have unit tests:**

- `magneticSnapping.ts` — `snapToNearestTarget`, `generateSnapTargets`
- `exportEngine.ts` — CSV row formatting, MIDI byte encoding, PDF structure
- `importEngine.ts` — CSV parsing, layer ID mapping, malformed input handling
- `projectManager.ts` — save/load round-trip, version validation, missing field handling
- Store actions in `useStudioStore.ts` — `addMarker`, `removeMarker`, `removeLastMarker`, `redoLastMarker`, `navigateToLeftMarker`, `navigateToRightMarker`, `setStemCount`, viewport constraint logic

**Do not unit test:**

- React component rendering
- Animation values
- Style objects
- Anything that requires a running Expo/RN environment

### 2. E2E tests (Playwright) — user-facing flows on web

Target: `tests/*.spec.ts`

Run with: `npm test`

**Must have E2E coverage:**

- Load song → markers appear on waveform
- Tap-to-beat adds a marker, undo removes it
- View mode toggle (unified ↔ multitrack)
- Stem count switching (2 / 4 / 6)
- Layer selection changes active layer
- Export modal opens and triggers download
- Import CSV populates markers
- Project save and load round-trip
- Keyboard shortcuts (Space, M, Ctrl+Z, arrow keys)

**Do not E2E test:**

- Internal state values (test behaviour, not state)
- Pixel-perfect layout
- Animation timing

## File placement

```css
tests/
  core-functionality.spec.ts   # existing E2E
  ui-components.spec.ts        # existing E2E
  waveform-features.spec.ts    # existing E2E
  quality-assurance.spec.ts    # existing E2E
  unit/
    magneticSnapping.test.ts
    exportEngine.test.ts
    importEngine.test.ts
    projectManager.test.ts
    studioStore.test.ts
```

## Rules

- One `describe` block per module/feature.
- Test names describe behaviour: `'snaps to nearest beat grid line within threshold'`, not `'test 1'`.
- No `test.only` or `test.skip` committed to main.
- Mocks go in `tests/fixtures/` or inline with `jest.fn()` — no global mocks that bleed between tests.
- Each test is independent — no shared mutable state between tests.
- For store tests, create a fresh store instance per test using `create()` directly, not the singleton.

## When to add a test

Add a test when:

- You are implementing a new utility function with non-trivial logic
- You are fixing a bug (write the failing test first)
- A new user-facing flow is added that isn't covered by existing E2E

Do not add a test when:

- The logic is a one-liner with no branching
- It's already covered by TypeScript types
- It would require mocking more than the thing being tested
