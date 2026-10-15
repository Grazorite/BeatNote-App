export const MIN_LOOP_DURATION_MS = 500;
export const LOOP_BOUNDARY_TOLERANCE_MS = 30;
export const RESTORE_WINDOW_MS = 5000;
export const FALLBACK_KEY_STEP_MS = 250;
export const LARGE_STEP_MULTIPLIER = 10;

export interface LoopRange {
  loopStartMs: number | null;
  loopEndMs: number | null;
}

export interface LoopWrapInput {
  isEnabled: boolean;
  isPlaying: boolean;
  loopStartMs: number | null;
  loopEndMs: number | null;
  previousSampleMs: number;
  currentSampleMs: number;
  toleranceMs: number;
}

export type LoopWrapDecision =
  | { kind: 'wrap'; targetMs: number }
  | { kind: 'noWrap' };

export type LoopGestureMode = 'create' | 'move' | 'resize-start' | 'resize-end';

const NULL_RANGE: LoopRange = { loopStartMs: null, loopEndMs: null };

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const roundedFinite = (value: unknown): number | null =>
  isFiniteNumber(value) ? Math.round(value) : null;

const hasOrderedBounds = (range: LoopRange): range is { loopStartMs: number; loopEndMs: number } => {
  const { loopStartMs, loopEndMs } = range;
  return loopStartMs !== null
    && loopEndMs !== null
    && Number.isInteger(loopStartMs)
    && Number.isInteger(loopEndMs)
    && loopStartMs >= 0
    && loopStartMs < loopEndMs
    && loopEndMs - loopStartMs >= MIN_LOOP_DURATION_MS;
};

const hasPlayableBounds = (range: LoopRange): range is { loopStartMs: number; loopEndMs: number } =>
  range.loopStartMs !== null
  && range.loopEndMs !== null
  && Number.isFinite(range.loopStartMs)
  && Number.isFinite(range.loopEndMs)
  && range.loopStartMs >= 0
  && range.loopStartMs < range.loopEndMs;

/** Resolve the marker-bounded segment containing a playback sample. */
export function markerLoopRangeAtTime(
  markers: number[],
  sampleMs: number,
  songDuration: number,
): LoopRange {
  if (!Number.isFinite(sampleMs) || !Number.isFinite(songDuration) || songDuration <= 0) {
    return NULL_RANGE;
  }
  const duration = Math.round(songDuration);
  const boundaries = Array.from(new Set([
    0,
    ...markers
      .filter(marker => Number.isFinite(marker) && marker > 0 && marker < duration)
      .map(Math.round),
    duration,
  ])).sort((a, b) => a - b);
  const clampedSample = Math.max(0, Math.min(sampleMs, duration));
  const endIndex = boundaries.findIndex(boundary => boundary > clampedSample);
  const resolvedEndIndex = endIndex === -1 ? boundaries.length - 1 : endIndex;
  return {
    loopStartMs: boundaries[Math.max(0, resolvedEndIndex - 1)],
    loopEndMs: boundaries[resolvedEndIndex],
  };
}

/** Return true when a range satisfies every persisted loop-range invariant. */
export function isValidLoopRange(range: LoopRange, songDuration: number): boolean {
  return Number.isFinite(songDuration)
    && songDuration > 0
    && hasOrderedBounds(range)
    && range.loopEndMs <= songDuration;
}

/** Round, order, and clamp loop bounds, retaining a pending range while duration is unavailable. */
export function normalizeLoopRange(
  startMs: number | null,
  endMs: number | null,
  songDuration: number,
): LoopRange {
  const roundedStart = roundedFinite(startMs);
  const roundedEnd = roundedFinite(endMs);
  if (roundedStart === null || roundedEnd === null) {
    return NULL_RANGE;
  }

  const lower = Math.max(0, Math.min(roundedStart, roundedEnd));
  const upper = Math.max(0, Math.max(roundedStart, roundedEnd));

  if (!Number.isFinite(songDuration) || songDuration <= 0) {
    return upper - lower >= MIN_LOOP_DURATION_MS
      ? { loopStartMs: lower, loopEndMs: upper }
      : NULL_RANGE;
  }

  const duration = Math.round(songDuration);
  const loopStartMs = Math.min(lower, duration);
  const loopEndMs = Math.min(upper, duration);
  return loopEndMs - loopStartMs >= MIN_LOOP_DURATION_MS && loopStartMs < duration
    ? { loopStartMs, loopEndMs }
    : NULL_RANGE;
}

/** Clamp an existing range to a newly measured duration or clear it when it no longer fits. */
export function reclampLoopRangeToDuration(range: LoopRange, songDuration: number): LoopRange {
  if (!Number.isFinite(songDuration) || songDuration <= 0) {
    return NULL_RANGE;
  }

  const duration = Math.round(songDuration);
  const start = roundedFinite(range.loopStartMs);
  const end = roundedFinite(range.loopEndMs);
  if (start === null || end === null || start >= end) {
    return NULL_RANGE;
  }

  const loopStartMs = Math.max(0, Math.min(start, duration));
  const loopEndMs = Math.max(0, Math.min(end, duration));
  return loopEndMs - loopStartMs >= MIN_LOOP_DURATION_MS && loopStartMs < duration
    ? { loopStartMs, loopEndMs }
    : NULL_RANGE;
}

/** Move a valid range without changing its duration, clamping at the song edges. */
export function moveLoopRange(range: LoopRange, deltaMs: number, songDuration: number): LoopRange {
  if (!isValidLoopRange(range, songDuration) || !Number.isFinite(deltaMs)) {
    return range;
  }

  const start = range.loopStartMs as number;
  const end = range.loopEndMs as number;
  const rangeDuration = end - start;
  const candidateStart = start + Math.round(deltaMs);
  const loopStartMs = Math.max(0, Math.min(candidateStart, songDuration - rangeDuration));
  return { loopStartMs, loopEndMs: loopStartMs + rangeDuration };
}

/** Resize one bound of a valid range while preserving the other and the minimum gap. */
export function resizeLoopBound(
  range: LoopRange,
  bound: 'start' | 'end',
  candidateMs: number,
  songDuration: number,
): LoopRange {
  if (!isValidLoopRange(range, songDuration) || !Number.isFinite(candidateMs)) {
    return range;
  }

  const start = range.loopStartMs as number;
  const end = range.loopEndMs as number;
  const candidate = Math.round(candidateMs);
  if (bound === 'start') {
    return {
      loopStartMs: Math.max(0, Math.min(candidate, end - MIN_LOOP_DURATION_MS)),
      loopEndMs: end,
    };
  }

  return {
    loopStartMs: start,
    loopEndMs: Math.min(songDuration, Math.max(candidate, start + MIN_LOOP_DURATION_MS)),
  };
}

/** Return the rounded duration of one beat, falling back when BPM is unavailable. */
export function beatStepMs(bpm: number): number {
  return Number.isFinite(bpm) && bpm > 0
    ? Math.round(60000 / bpm)
    : FALLBACK_KEY_STEP_MS;
}

/** Map a song timestamp to an overview x-coordinate. */
export function msToOverviewX(ms: number, songDuration: number, width: number): number {
  if (![ms, songDuration, width].every(Number.isFinite) || songDuration <= 0 || width <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(ms, songDuration)) / songDuration * width;
}

/** Keep the playhead visible at both song endpoints without changing track-scale mapping. */
export function overviewPlayheadX(
  currentTimeMs: number,
  songDuration: number,
  width: number,
  inset = 2,
): number {
  if (!Number.isFinite(width) || width <= inset * 2) return Math.max(0, width) / 2;
  return Math.max(inset, Math.min(width - inset, msToOverviewX(currentTimeMs, songDuration, width)));
}

/** Map an overview x-coordinate to a clamped integer song timestamp. */
export function overviewXToMs(x: number, songDuration: number, width: number): number {
  if (![x, songDuration, width].every(Number.isFinite) || songDuration <= 0 || width <= 0) {
    return 0;
  }
  return Math.round(Math.max(0, Math.min(x / width, 1)) * songDuration);
}

/** Resolve which handle contains a pointer, using movement direction for an exact overlap tie. */
export function resolveHandleHit(
  pointerX: number,
  range: LoopRange,
  songDuration: number,
  width: number,
  platform: 'web' | 'native',
  movementDeltaX = 0,
): 'start' | 'end' | null {
  if (!isValidLoopRange(range, songDuration) || !Number.isFinite(pointerX) || !Number.isFinite(width) || width <= 0) {
    return null;
  }

  const startX = msToOverviewX(range.loopStartMs as number, songDuration, width);
  const endX = msToOverviewX(range.loopEndMs as number, songDuration, width);
  const hitRadius = (platform === 'native' ? 44 : 16) / 2;
  const startDistance = Math.abs(pointerX - startX);
  const endDistance = Math.abs(pointerX - endX);
  const hitsStart = startDistance <= hitRadius;
  const hitsEnd = endDistance <= hitRadius;

  if (!hitsStart && !hitsEnd) return null;
  if (hitsStart && !hitsEnd) return 'start';
  if (hitsEnd && !hitsStart) return 'end';
  if (startDistance < endDistance) return 'start';
  if (endDistance < startDistance) return 'end';
  return movementDeltaX < 0 ? 'start' : 'end';
}

/** Classify a range gesture from its touch-down position and activating movement direction. */
export function resolveGestureMode(
  pointerX: number,
  range: LoopRange,
  songDuration: number,
  width: number,
  platform: 'web' | 'native',
  movementDeltaX = 0,
): LoopGestureMode {
  const handle = resolveHandleHit(
    pointerX,
    range,
    songDuration,
    width,
    platform,
    movementDeltaX,
  );
  if (handle) return handle === 'start' ? 'resize-start' : 'resize-end';
  if (!isValidLoopRange(range, songDuration)) return 'create';

  const startX = msToOverviewX(range.loopStartMs as number, songDuration, width);
  const endX = msToOverviewX(range.loopEndMs as number, songDuration, width);
  return pointerX > startX && pointerX < endX ? 'move' : 'create';
}

/** Return the portions of a half-open row that lie outside a loop range. */
export function outsideLoopSegmentsForRow(
  rowStartMs: number,
  rowEndMs: number,
  range: LoopRange,
): Array<{ fromMs: number; toMs: number }> {
  if (![rowStartMs, rowEndMs].every(Number.isFinite) || rowStartMs >= rowEndMs || !hasOrderedBounds(range)) {
    return [];
  }

  const start = range.loopStartMs;
  const end = range.loopEndMs;
  if (end <= rowStartMs || start >= rowEndMs) {
    return [{ fromMs: rowStartMs, toMs: rowEndMs }];
  }

  const segments: Array<{ fromMs: number; toMs: number }> = [];
  if (start > rowStartMs) segments.push({ fromMs: rowStartMs, toMs: Math.min(start, rowEndMs) });
  if (end < rowEndMs) segments.push({ fromMs: Math.max(end, rowStartMs), toMs: rowEndMs });
  return segments.filter(segment => segment.fromMs < segment.toMs);
}

/** Decide whether the current playback sample crosses an armed loop boundary. */
export function decideLoopWrap(input: LoopWrapInput): LoopWrapDecision {
  const {
    isEnabled,
    isPlaying,
    loopStartMs,
    loopEndMs,
    previousSampleMs,
    currentSampleMs,
    toleranceMs,
  } = input;
  const range = { loopStartMs, loopEndMs };
  if (
    !isEnabled
    || !isPlaying
    || !hasPlayableBounds(range)
    || !Number.isFinite(previousSampleMs)
    || !Number.isFinite(currentSampleMs)
    || !Number.isFinite(toleranceMs)
    || toleranceMs < 0
  ) {
    return { kind: 'noWrap' };
  }

  const start = range.loopStartMs;
  const end = range.loopEndMs;
  const armed = previousSampleMs >= start && previousSampleMs < end;
  return armed && currentSampleMs >= end - toleranceMs
    ? { kind: 'wrap', targetMs: start }
    : { kind: 'noWrap' };
}

/** Format milliseconds as an unpadded minute and lower-tenth second timestamp. */
export function formatLoopTime(ms: number): string {
  const tenths = Number.isFinite(ms) ? Math.floor(Math.max(0, ms) / 100) : 0;
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths % 10}`;
}

/** Build the accessible summary for a selected loop range. */
export function loopSummaryLabel(range: LoopRange): string {
  if (!hasOrderedBounds(range)) return 'No loop selected';
  const durationSeconds = Math.round((range.loopEndMs - range.loopStartMs) / 100) / 10;
  return `Loop ${formatLoopTime(range.loopStartMs)} to ${formatLoopTime(range.loopEndMs)}, ${durationSeconds.toFixed(1)} seconds`;
}
