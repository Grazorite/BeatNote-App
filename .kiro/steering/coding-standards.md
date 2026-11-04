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

## Product copy and motion

- Use the words on the controls when giving instructions. Describe the action and its effect in
  plain language. Show import progress as “Checking for duplicates” or “Reading audio”.
  Destructive prompts must name what is deleted, what can be recovered, and what happens to the
  original audio. Preserve typed confirmations, licence notices and data-format identifiers.
- Use the shared page transition for Settings navigation and sheet settling (280 ms, ease out).
  Related controls use a 160 ms response and brief feedback fades use 180 ms. Keep direct gestures
  under the finger and keep the annotation reading time and 650 ms exit. Use the shared system
  motion preference for core animations, native modal transitions and illustrative demos.

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
- The Music import/library surface is a dismissible bottom sheet. Its grabber, downward swipe, and
  outside tap are the close affordances; do not add a redundant breadcrumb Back button to its header.
- The phone media-control dock is deliberately transparent in both orientations. Do not place a shared
  liquid-glass gradient behind its controls; the individual controls and surrounding layout provide the
  required grouping and contrast.
- On phones, top-level utility destinations such as Settings and Help are full-screen pages rather
  than partial drawers or centered desktop dialogs. They must fill both portrait and landscape,
  respect every safe-area edge, retain an obvious 44-point breadcrumb Back action, and put touch
  guidance before desktop keyboard shortcuts. Nested utility navigation swaps content inside the
  existing full-screen surface instead of stacking another native modal.
- Page and menu headers keep their title optically centred with equal-width leading/trailing action
  slots and use the shared 20-point navigation-title token. Every menu/submenu return control is an
  iOS-style breadcrumb Back control in the leading/left slot; do not use a right-side Close action
  for navigation. The Settings root keeps Back on the left, uses a compact accent-filled Pro action
  on the right, and exposes Help & Support as an ordinary navigation row. Keep the Settings root
  flat without category headers; deeper Settings pages may retain headings that explain their local
  controls. Waveform visibility and the annotation-lane label belong in Display & Annotations, not
  inline on the root. A dedicated 28-point leading-edge responder captures Back swipes above nested
  scroll/content responders: it returns one level in submenus and closes the Settings root back to
  the editor. Do not place decorative icons beside page titles.
- Settings subpages keep standalone toggles and informational rows directly on the page instead of
  boxing every setting. Reserve bordered cards for meaningful groups, selected options, and actions.
- Settings describe what an available feature does without repeating Lite or Pro labels. When a
  Pro capability is unavailable in Lite, retain its position, grey it out, and show the short note
  `Pro only`; do not mix tier-comparison copy into ordinary setting descriptions.
- Keep the Settings Pro action visually smaller than its balanced header slot. A pair of tiny,
  low-amplitude sparkles may loop around it, but the animation must not obscure the label or compete
  with navigation.
- Native toggle feedback starts on the UI thread before capability or store work returns to
  JavaScript, and callbacks receive the intended next boolean instead of deriving it from a captured
  render. This keeps rapid taps deterministic and prevents heavy waveform/library renders from
  leaving the thumb between states. In the single annotation-lane Settings view, use the shared
  marker colour for the swatch because that lane's visible identity is its marker, not the hidden
  legacy stem-layer palette. Its enabled Reset action uses the shared destructive red; disabled
  state still relies on opacity and accessibility state rather than colour alone.
- Place mobile Settings at the trailing/rightmost end of a horizontal global toolbar. Full-screen
  utility pages enter from the trailing edge, and deeper pages use the same horizontal push/reveal
  direction; do not use the platform modal's bottom-up sheet transition for this navigation stack.
  Present the stack over a transparent full-screen host so the live app remains visible behind the
  moving page—never expose the platform modal's default white background during the transition.
- Annotation indicators use the shared violet marker colour without a dark outline. On phones,
  annotation editing is an explicit marker-gated modal draft with Save/Cancel; the selected marker's
  read-only callout is bounded to two lines and truncates at the tail above the overview. Landscape
  annotation editing keeps its title and actions visible above the keyboard, scrolls the editor body,
  and exposes an explicit keyboard-dismiss action.
- Waveform markers are a 2-point rounded violet line topped by the in-app marker shield (the same
  silhouette as the toolbar marker icon). A solid shield means annotated and an outlined shield means
  plain, so the distinction never rests on colour alone; the selected marker gets a soft glow, and
  clustered annotations collapse into a quiet glass pill containing a small shield and a count. Keep
  the `wrapped-row-marker-*` and `wrapped-row-annotation-*` test IDs; heads use `wrapped-row-head-*`.
  The overview strip preserves the same filled annotated / outlined plain shield distinction on its
  hairlines. Shield geometry is shared via
  `src/utils/markerShape.ts`. In the strip, layer order is fixed: base peaks, played waveform,
  markers, playhead, so the played-waveform tint never recolours markers.
- Transient toast and annotation-callout replacements crossfade without exit-time layout motion:
  the mobile feedback stack retains fixed toast and annotation slots, and fades content fully at
  its anchored position before unmounting it. The annotation callout owns a retained native opacity
  animation on a plain `Animated.View`, with a separate `Pressable` for its action. Never wrap
  `TouchableOpacity` in another animated component controlling opacity: its internal opacity
  animation overrides the same native view and restarts when disabled during fade-out. Timed
  annotations are one-shot marker-crossing events whose dwell is owned by a timer, never a playback
  clock window; native clock jitter must not retrigger the same callout. A genuine backward seek or
  loop may re-arm the marker through an explicit transport traversal event. Keep the crossing
  cursor monotonic within each traversal; never infer a seek from a backward clock sample or
  remember only the last marker as the deduplication boundary. When the
  annotation slot is empty, lower dock toasts into that space instead of reserving an unexplained
  blank row above them.
  Playback choosers likewise fade in place and must
  never translate toward the overview strip while dismissing. Rapid successive feedback must not
  snap, stack-jump, or compete with playback.
- Previous/Next track controls combine queue navigation with configurable seeking. Their small
  signed seconds label (`−5s` / `+5s`) appears only in the default Tap Seeks mode and communicates
  direction and persisted distance. Settings lists Tap Seeks first, offers Tap Changes Track as the
  alternative, and adjusts distance from 0.5 through 30 seconds in exact 0.5-second steps. The
  number is directly editable; holding either step button repeats at an exponentially increasing
  rate. Preserve
  both tap/hold operations in accessible labels, clamp seeking to track bounds, and keep the control
  usable when either operation remains available.
- Playback speed uses one supported `0.25×–2.00×` range in every tier; do not expose a range
  selector or presets above the installed iOS player's 2× ceiling. Advanced configuration is
  Pro-only and offers 4, 8, or 12 useful preset buttons within that range.
  The chosen preset count and the active speed preset get an accent border without an accent fill,
  and Settings exposes only choices that change behavior; do not add static rows describing
  built-in presets or fine controls.
  Long-pressing a preset opens its numeric editor; saving persists that slot for the selected
  count, while Use Default clears the override. Holding the fine `−/+` controls accelerates
  their 0.05× repeats. Lite keeps the standard built-in presets and hides fine controls.
- Playback settings group each toggle with its own caption without section-sized whitespace. Pause
  on Headset Disconnect defaults on and persists independently of tier; an iOS output-route loss
  pauses active playback, while opting out explicitly resumes after expo-audio's system pause.
- The playhead is a round-capped orange line with a small rounded head (never a shield, so it cannot
  be mistaken for a marker) over a soft dark shadow. The loop range uses rounded corners, the muted
  teal roles `loopFill`, `loopBorder`, and `loopEnabled`, and slim capsule handles with a grip notch.
  Teal stays the single cool hue so loop state reads at a glance. The disabled loop keeps its dashed
  border. Handle touch targets stay at least 44 points; only the visual capsule is slim, and its
  width must match `LOOP_HANDLE_VISUAL_WIDTH` in `LoopRangeLayer.tsx`.
- Decoded waveform work must never look like an unexplained frozen editor. While extraction or the
  first peak render is pending, the wrapped waveform shows a centered, high-contrast progress card
  with an activity indicator, `Preparing waveform`, and the long-song expectation. Keep it a
  non-intercepting overlay, announce it as progress, and retain it through the first peak-render
  frame so bridge transfer/path construction cannot make the message disappear prematurely.
- Wrapped-waveform scrubbing activates after a small deliberate horizontal movement (about 3
  points), tolerates ordinary vertical finger drift, and continues outside the initial row bounds.
  Preserve vertical-first scrolling, but never require a long hold or repeated drag attempts to
  capture the playhead.
- Live Custom Order previews move neighbouring rows while the held row remains under the finger.
  On release, clear the held row's native drag transform before publishing its persisted list index;
  otherwise the old transform is applied at the new index and the row visibly jumps a second time.
- Data Management offers separate typed-confirmation actions for deleting all saved projects, all
  imported audio, and all BeatNote data. Bulk imported-audio deletion sits immediately above full
  data deletion in Destructive Actions, uses the shared red outlined treatment, preserves projects
  and drafts for relinking, and never deletes original source files. Project deletion preserves
  imported audio and detaches song drafts as unsaved work. Full deletion removes every app-owned
  record, managed copy, preference, and cache, but never deletes the user's original source files
  outside BeatNote.
- "Loop between markers" is drawn in the marker violet, never teal, so it stays distinct from the
  range loop (the two are mutually exclusive, so only one is ever visible). Rows show a very faint
  violet wash plus a slim underline across the looped segment; the overview strip shows only the
  underline, with no fill and no outside dimming. The segment comes from `useMarkerLoopSegment`,
  which mirrors the playback engine and changes only when the playhead crosses a marker.
- The already-played waveform stroke is muted with `PLAYED_WAVEFORM_OPACITY` from
  `src/styles/common.ts` so the layer colour does not compete with markers or the playhead. Adjust
  that one constant rather than recolouring the layer.

## Icon design

- Button icons come from the shared `BeatNoteIcon` family in `src/components/icons`; feature
  components must not introduce one-off library glyphs when the family already covers the concept.
- Follow iOS system-icon principles without copying individual platform glyphs: optical balance,
  simple monoline geometry, generous negative space, and instantly readable silhouettes.
- Use a `24×24` view box, a `1.75`-point rounded stroke, and an optical live area of approximately
  `4…20`; default glyphs are unfilled, while primary transport shapes may use a simple solid fill.
- Keep each icon to one recognizable silhouette plus at most one semantic modifier. Prefer removing
  detail to adding decoration; labels and accessibility carry precision that a small icon cannot.
- The annotation action uses a filled rounded speech bubble with a short list cut out of its body,
  retaining the supplied reference's broad silhouette while remaining legible at dock size.
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
