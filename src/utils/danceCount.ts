export type DanceCountSize = 4 | 6 | 8;

export interface DanceCountPosition {
  phrase: number;
  count: number;
  absoluteCount: number;
}

export const danceCountAtTime = (
  timeMs: number,
  bpm: number,
  countSize: DanceCountSize,
): DanceCountPosition => {
  const safeTime = Number.isFinite(timeMs) ? Math.max(0, timeMs) : 0;
  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 120;
  const beatIndex = Math.floor(safeTime / (60_000 / safeBpm));

  return {
    phrase: Math.floor(beatIndex / countSize) + 1,
    count: (beatIndex % countSize) + 1,
    absoluteCount: beatIndex + 1,
  };
};

export const formatDanceCount = (
  timeMs: number,
  bpm: number,
  countSize: DanceCountSize,
): string => {
  const position = danceCountAtTime(timeMs, bpm, countSize);
  return `Phrase ${position.phrase} | Count ${position.count}`;
};
