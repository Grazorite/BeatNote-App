export const MIN_PLAYBACK_SPEED = 0.25;
export const MAX_PLAYBACK_SPEED = 2;
export const PLAYBACK_SPEED_STEP = 0.05;
export const DEFAULT_PLAYBACK_SPEED = 1;

export type PlaybackSpeedRange = 'focused' | 'extended';
export type PlaybackSpeedPresetCount = 4 | 8 | 12;

export interface PlaybackSpeedBounds {
  min: number;
  max: number;
}

// Keep the legacy range key in persisted settings, but expose one truthful iOS range.
export const DEFAULT_PLAYBACK_SPEED_RANGE: PlaybackSpeedRange = 'extended';
export const DEFAULT_PLAYBACK_SPEED_PRESET_COUNT: PlaybackSpeedPresetCount = 8;

const RANGE_BOUNDS: Readonly<Record<PlaybackSpeedRange, PlaybackSpeedBounds>> = Object.freeze({
  focused: Object.freeze({ min: 0.25, max: 2 }),
  extended: Object.freeze({ min: 0.25, max: 2 }),
});

const DEFAULT_PRESETS: Readonly<Record<PlaybackSpeedRange, Readonly<Record<PlaybackSpeedPresetCount, readonly number[]>>>> = Object.freeze({
  focused: Object.freeze({
    4: Object.freeze([0.5, 0.75, 1, 2]),
    8: Object.freeze([0.5, 0.75, 0.8, 0.9, 1, 1.25, 1.5, 2]),
    12: Object.freeze([0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2]),
  }),
  extended: Object.freeze({
    4: Object.freeze([0.25, 0.5, 1, 2]),
    8: Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]),
    12: Object.freeze([0.25, 0.4, 0.5, 0.65, 0.75, 0.85, 1, 1.15, 1.3, 1.5, 1.75, 2]),
  }),
});

export const PLAYBACK_SPEED_PRESETS = DEFAULT_PRESETS.extended[8];

export const playbackSpeedBounds = (range: PlaybackSpeedRange): PlaybackSpeedBounds => (
  RANGE_BOUNDS[range]
);

export const normalizePlaybackSpeed = (
  value: number,
  bounds: PlaybackSpeedBounds = RANGE_BOUNDS.extended,
): number => {
  const finiteValue = Number.isFinite(value) ? value : DEFAULT_PLAYBACK_SPEED;
  const clamped = Math.max(bounds.min, Math.min(bounds.max, finiteValue));
  const stepped = Math.round(clamped / PLAYBACK_SPEED_STEP) * PLAYBACK_SPEED_STEP;
  return Number(stepped.toFixed(2));
};

export const formatSpeedLabel = (value: number): string => `${normalizePlaybackSpeed(value)}×`;

export const playbackSpeedPresetOverrideKey = (
  range: PlaybackSpeedRange,
  count: PlaybackSpeedPresetCount,
  index: number,
): string => `${range}:${count}:${index}`;

/** Returns preset-count defaults with persisted per-slot custom values applied. */
export const configuredPlaybackSpeedPresets = (
  range: PlaybackSpeedRange,
  count: PlaybackSpeedPresetCount,
  overrides: Readonly<Record<string, number>>,
): readonly number[] => {
  const bounds = playbackSpeedBounds(range);
  return DEFAULT_PRESETS[range][count].map((defaultValue, index) => {
    const override = overrides[playbackSpeedPresetOverrideKey(range, count, index)];
    return override === undefined ? defaultValue : normalizePlaybackSpeed(override, bounds);
  });
};

export const defaultPlaybackSpeedPreset = (
  range: PlaybackSpeedRange,
  count: PlaybackSpeedPresetCount,
  index: number,
): number => DEFAULT_PRESETS[range][count][index] ?? DEFAULT_PLAYBACK_SPEED;
