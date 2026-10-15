import { MIN_LOOP_DURATION_MS } from './loopRange';

export type InnerLoopState = 'off' | 'markers' | 'range';

export const deriveInnerLoopState = (
  isLoopMarkerActive: boolean,
  isLoopRangeEnabled: boolean,
): InnerLoopState => {
  // Range wins for defensive compatibility with the playback engine's precedence.
  if (isLoopRangeEnabled) return 'range';
  if (isLoopMarkerActive) return 'markers';
  return 'off';
};

export const nextInnerLoopState = (current: InnerLoopState): InnerLoopState => {
  if (current === 'off') return 'markers';
  if (current === 'markers') return 'range';
  return 'off';
};

export const canEnterRangeState = (songDuration: number, hasValidRange: boolean): boolean => (
  hasValidRange || (Number.isFinite(songDuration) && songDuration >= MIN_LOOP_DURATION_MS)
);

export const formatSpeedLabel = (value: number): string => `${value}×`;
