import { incrementPerfCounter, type PerfCounterName } from '../utils/perfCounters';

/** Count component render attempts in internal profiling bundles. */
export function useRenderCounter(name: Extract<PerfCounterName, `render.${string}`>): void {
  incrementPerfCounter(name);
}
