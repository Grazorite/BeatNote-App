---
inclusion: always
---

# BeatNote — Coding Standards

## TypeScript

- Strict mode is enabled. No `any` unless absolutely unavoidable — use `unknown` and narrow.
- Prefer `interface` for object shapes, `type` for unions and aliases.
- All function parameters and return types must be explicitly typed.
- No implicit `any` from untyped third-party libs — add a local `.d.ts` or cast with a comment.
- Use `const` by default. `let` only when reassignment is necessary.

## React / React Native

- Functional components only. No class components.
- Keep components focused — if a component exceeds ~150 lines, consider splitting.
- Memoise with `React.memo` only when there is a measurable render performance reason (document why).
- Use `useCallback` and `useMemo` only for referential stability (e.g. passed to memoised children or deps arrays) — not as a default.
- Avoid inline styles in JSX. All styles live in `src/styles/` mirroring the component path.
- Platform-specific code uses `Platform.OS` checks or `.ios.ts` / `.android.ts` / `.web.ts` file extensions.
- Custom popups and full-page overlays use `AppModal`, never React Native's `Modal` directly. The
  shared host opts into portrait and both landscape directions so a presented surface cannot rotate
  the app back to portrait; layouts inside it must still respond to `useWindowDimensions` and safe areas.

## State (Zustand)

- All global state lives in `src/hooks/useStudioStore.ts`. Do not create additional stores.
- Use granular selectors in components (`useStudioStore(state => state.foo)`) to avoid unnecessary re-renders.
- Actions that derive new state from existing state must use the `set((state) => ...)` form.
- Do not call `useStudioStore.getState()` inside render — only inside event handlers and effects.

## Hooks

- Custom hooks live in `src/hooks/`. Prefix with `use`.
- A hook should do one thing. Split if it grows beyond ~100 lines of logic.
- Side effects (intervals, event listeners) must clean up in the `useEffect` return.

## Utilities

- Pure functions only in `src/utils/`. No React imports, no side effects.
- Utilities are the primary target for unit tests.
- Export as named exports from a class or as standalone functions — be consistent within a file.

## Styling

- Style files mirror the component path: `src/components/ui/controls/AudioControls.tsx` → `src/styles/components/controls/audioControls.ts`.
- Every palette implements the typed `ThemeColors` contract in `src/styles/theme.ts` and is registered
  in `themes`. Use semantic roles rather than palette-specific names so a new palette cannot omit a
  required UI, timeline, loop, annotation-layer, or grid colour.
- Use the shared colour tokens exported from `src/styles/common.ts`. Do not hardcode hex or RGBA
  values in components or component style files; add or reuse a semantic theme role instead.
- `colors` is the compatibility alias for the registered default dark palette. It keeps existing
  static `StyleSheet` modules stable while themes are introduced incrementally; do not treat it as a
  runtime theme API.
- Dark is the only shipped palette. A future palette must preserve the meaning of semantic state and
  annotation-layer colours, meet contrast requirements in its own surfaces, and be added to the
  registry with tests before it can be selected.
- Runtime theme switching requires theme-aware style factories or hooks. Add the provider and user
  preference only when a second complete palette exists; never mutate `colors` or claim live theme
  support while module-level `StyleSheet.create` calls still capture the default palette.
- All colours must have sufficient contrast for extended use in dim environments. Do not encode an
  operation or state through colour alone.
- Transient custom popups use the shared restrained liquid-glass backdrop: translucent dark gradient,
  fine low-contrast white highlight, rounded corners, and no saturated outline. Native system alerts,
  pickers, and share sheets retain platform styling.
- Custom menus, drawers, modal panels, and nested menu cards reuse that liquid-glass surface language;
  primary actions use the app accent, neutral actions use quiet glass, and destructive actions retain
  their semantic colour. Text on an accent-filled action uses `colors.onAccent`; never reuse muted
  secondary text on the bright accent. Avoid isolated opaque greys or unrelated blue/green action fills.
- On phones, top-level utility destinations such as Settings and Help are full-screen pages rather
  than partial drawers or centered desktop dialogs. They must fill both portrait and landscape,
  respect every safe-area edge, retain an obvious 44-point Close action, and put touch guidance
  before desktop keyboard shortcuts. Nested utility navigation swaps content inside the existing
  full-screen surface instead of stacking another native modal; use Back only for that nested return,
  and do not add a directional arrow to a true Close action.
- Place mobile Settings at the trailing/rightmost end of a horizontal global toolbar. Full-screen
  utility pages enter from the trailing edge, and deeper pages use the same horizontal push/reveal
  direction; do not use the platform modal's bottom-up sheet transition for this navigation stack.
  Present the stack over a transparent full-screen host so the live app remains visible behind the
  moving page—never expose the platform modal's default white background during the transition.
- Annotation indicators use the shared violet marker colour without a dark outline. On phones,
  annotation editing is an explicit marker-gated modal draft with Save/Cancel; the selected marker's
  read-only callout is bounded to two lines and truncates at the tail above the overview.

## Icon design

- Button icons come from the shared `BeatNoteIcon` family in `src/components/icons`; feature
  components must not introduce one-off library glyphs when the family already covers the concept.
- Follow iOS system-icon principles without copying individual platform glyphs: optical balance,
  simple monoline geometry, generous negative space, and instantly readable silhouettes.
- Use a `24×24` view box, a `1.75`-point rounded stroke, and an optical live area of approximately
  `4…20`; default glyphs are unfilled, while primary transport shapes may use a simple solid fill.
- Keep each icon to one recognizable silhouette plus at most one semantic modifier. Prefer removing
  detail to adding decoration; labels and accessibility carry precision that a small icon cannot.
- Project/data icons use quiet object silhouettes, transport icons use basic kinetic geometry, and
  choreography actions reuse one single-border shield marker. Marker navigation places the arrow on
  the opposite side of its travel direction so the marker remains the visual destination.
- Add/remove marker operations use the shared shield with subdued green/red fills; destructive
  previous-marker removal uses the same red shield and a directional arrow. The control's visible
  context and accessible label carry the exact operation without cramped interior marks.
- Repeat and inner-loop glyphs share one thin, rounded two-arrow chassis. Marker looping places the
  shield inside it; range looping places a minimal bounded-range cue inside it. Keep the centre
  deliberately open and use the standard thin stroke—never add weight to solve a legibility issue.
- Neutral marker shields are solid white (or the disabled colour); add/remove retain their semantic
  green/red fills. Composite navigation/delete glyphs use a wider view box so the shield remains the
  exact same optical size as the standalone marker.
- Filled active controls use the muted `colors.controlActive` orange. Keep the brighter accent token
  for timeline/playhead emphasis and brand/action contexts rather than toggle-state backgrounds.
- Icons must remain distinguishable at `18px` without colour. Numeric controls such as BPM and
  playback speed stay typographic when the value communicates more clearly than a pictogram.
- Icon changes never replace accessibility: preserve the control's accessible name, role, state,
  hint/value where applicable, stable test ID, and at least a `44×44` effective touch target.

## Imports

- Absolute imports from `src/` are preferred over deep relative paths.
- Group imports: React → React Native / Expo → third-party → internal (types, hooks, utils, styles).
- No barrel re-exports that create circular dependencies.

## Error handling

- User-facing errors go through the `ErrorModal` component via the `error` state in `useCustomAudioPlayer`.
- Never swallow errors silently. At minimum `console.error` with context.
- Async functions in utilities must throw typed errors with descriptive messages.

## No duplication

- Before adding a new utility function, check `src/utils/` for an existing one.
- Before adding a new UI primitive, check `src/components/ui/common/`.
- Shared logic between hooks belongs in a utility, not copy-pasted.

## Comments

- Comment the *why*, not the *what*.
- JSDoc on all exported functions and hooks with at least a one-line description.
- Mark platform-specific workarounds with `// [PLATFORM: ios]` or `// [PLATFORM: web]` so they're easy to find.
