import { perfMarksEnabled } from './perfMarks';

export type PerfCounterName =
  | 'draft.write'
  | 'gesture.loopRange'
  | 'gesture.wrappedRow'
  | 'gesture.zoom'
  | 'path.loopOverview'
  | 'path.waveformDetail'
  | 'path.wrappedRow'
  | 'playback.sampleTick'
  | 'render.MainContent'
  | 'render.StudioScreen';

const counters = new Map<PerfCounterName, number>();

/** Increment one temporary performance counter when the internal instrumentation flag is active. */
export function incrementPerfCounter(name: PerfCounterName): void {
  if (!perfMarksEnabled) return;
  counters.set(name, (counters.get(name) ?? 0) + 1);
}

/** Return an immutable snapshot for a profiling run. */
export function getPerfCounterSnapshot(): Readonly<Record<string, number>> {
  return Object.freeze(Object.fromEntries(counters));
}

/** Reset temporary counters between scripted scenarios. */
export function clearPerfCounters(): void {
  counters.clear();
}

/** Count a synchronous construction without changing its call-site behavior. */
export function countPerfConstruction<T>(name: PerfCounterName, construct: () => T): T {
  incrementPerfCounter(name);
  return construct();
}
