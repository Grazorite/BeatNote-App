export type PerfIntervalName =
  | 'annotation.open'
  | 'annotation.save'
  | 'bpm.analysis'
  | 'draft.write'
  | 'marker.add'
  | 'marker.remove'
  | 'playback.toggle'
  | 'seek.scrub'
  | 'seek.tap'
  | 'track.switch'
  | 'waveform.decode';

export interface PerfInterval {
  id: string;
  name: PerfIntervalName;
  startedAtMs: number;
  endedAtMs: number;
  durationMs: number;
}

interface ActiveInterval {
  name: PerfIntervalName;
  startedAtMs: number;
}

export interface PerfMarkSink {
  begin(name: PerfIntervalName, id: string): void;
  end(name: PerfIntervalName, id: string): void;
}

const RING_BUFFER_CAPACITY = 500;
const activeIntervals = new Map<string, ActiveInterval>();
const completedIntervals: PerfInterval[] = [];
let nextId = 0;
let markSink: PerfMarkSink | null = null;

const configuredFlag = process.env.EXPO_PUBLIC_BEATNOTE_PERF;

/** Whether lightweight internal performance instrumentation is active in this bundle. */
export const perfMarksEnabled = configuredFlag === '1'
  || (configuredFlag === undefined && __DEV__);

const monotonicNow = (): number => performance.now();

/** Begin one named interval and return the stable identifier used to end it. */
export function perfBegin(name: PerfIntervalName, id?: string): string {
  if (!perfMarksEnabled) return id ?? 'disabled';
  const intervalId = id ?? `${name}:${nextId += 1}`;
  activeIntervals.set(intervalId, { name, startedAtMs: monotonicNow() });
  markSink?.begin(name, intervalId);
  return intervalId;
}

/** Complete an interval. Unknown identifiers are ignored to keep instrumentation non-disruptive. */
export function perfEnd(id: string): PerfInterval | null {
  if (!perfMarksEnabled) return null;
  const active = activeIntervals.get(id);
  if (active === undefined) return null;
  activeIntervals.delete(id);
  const endedAtMs = monotonicNow();
  const interval: PerfInterval = {
    id,
    name: active.name,
    startedAtMs: active.startedAtMs,
    endedAtMs,
    durationMs: endedAtMs - active.startedAtMs,
  };
  completedIntervals.push(interval);
  if (completedIntervals.length > RING_BUFFER_CAPACITY) completedIntervals.shift();
  markSink?.end(active.name, id);
  return interval;
}

/** End an interaction after React Native has had one frame to publish its visual state. */
export function perfEndAfterFrame(id: string): void {
  if (!perfMarksEnabled) return;
  requestAnimationFrame(() => { perfEnd(id); });
}

/** Register the optional native Points of Interest bridge used by internal iOS builds. */
export function setPerfMarkSink(sink: PerfMarkSink | null): void {
  markSink = sink;
}

/** Return a snapshot of completed intervals without exposing the mutable ring buffer. */
export function getPerfIntervals(): readonly PerfInterval[] {
  return completedIntervals.map(interval => ({ ...interval }));
}

/** Clear temporary measurement state between scripted scenarios. */
export function clearPerfIntervals(): void {
  activeIntervals.clear();
  completedIntervals.splice(0, completedIntervals.length);
}
