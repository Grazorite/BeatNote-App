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
- Use the shared colour tokens from `src/styles/common.ts`. Do not hardcode hex values in component style files.
- Dark theme only. All colours must have sufficient contrast for extended use in dim environments.

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
