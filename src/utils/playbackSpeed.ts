export const MIN_PLAYBACK_SPEED = 0.5;
export const MAX_PLAYBACK_SPEED = 2;
export const PLAYBACK_SPEED_STEP = 0.05;
export const DEFAULT_PLAYBACK_SPEED = 1;

export const PLAYBACK_SPEED_PRESETS = Object.freeze([
  0.5,
  0.75,
  0.8,
  0.9,
  1,
  1.25,
  1.5,
  2,
]);

export const normalizePlaybackSpeed = (value: number): number => {
  const finiteValue = Number.isFinite(value) ? value : DEFAULT_PLAYBACK_SPEED;
  const clamped = Math.max(MIN_PLAYBACK_SPEED, Math.min(MAX_PLAYBACK_SPEED, finiteValue));
  const stepped = Math.round(clamped / PLAYBACK_SPEED_STEP) * PLAYBACK_SPEED_STEP;
  return Number(stepped.toFixed(2));
};

export const formatSpeedLabel = (value: number): string => `${normalizePlaybackSpeed(value)}×`;
