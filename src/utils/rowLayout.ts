export interface WrappedRow {
  index: number;
  startMs: number;
  endMs: number;
  phraseNumber?: number;
  countLabel?: string;
}

export type RowDensityMode = 'phrase' | 'duration';

export interface RowDensity {
  mode: RowDensityMode;
  phrasesPerRow?: number;
  rowDurationMs?: number;
}

export interface RowLayoutConfig {
  songDuration: number;
  bpm: number;
  countSize: 4 | 6 | 8;
  density: RowDensity;
  bpmUsable: boolean;
}

export function phraseRowDurationMs(
  bpm: number,
  countSize: 4 | 6 | 8,
  phrasesPerRow: number,
): number {
  return (60000 / bpm) * countSize * phrasesPerRow;
}

export function computeRows(config: RowLayoutConfig): WrappedRow[] {
  if (!Number.isFinite(config.songDuration) || config.songDuration <= 0) return [];

  const duration = Math.round(config.songDuration);
  if (duration <= 0) return [];

  const phraseAware = config.bpmUsable && config.density.mode === 'phrase'
    && Number.isFinite(config.bpm) && config.bpm > 0;
  const requestedPhrases = config.density.phrasesPerRow;
  const phrasesPerRow = requestedPhrases != null && Number.isFinite(requestedPhrases)
    ? Math.max(1, Math.round(requestedPhrases))
    : 1;
  const requestedDuration = config.density.rowDurationMs;
  const fallbackDuration = requestedDuration != null && Number.isFinite(requestedDuration)
    ? Math.max(2000, requestedDuration)
    : 5000;
  const rowDurationMs = phraseAware
    ? Math.max(1, phraseRowDurationMs(config.bpm, config.countSize, phrasesPerRow))
    : fallbackDuration;

  const rows: WrappedRow[] = [];
  let startMs = 0;
  while (startMs < duration) {
    // Snap the ideal boundary once, then reuse it so adjacent rows never diverge.
    const idealEnd = Math.round((rows.length + 1) * rowDurationMs);
    const endMs = Math.min(duration, Math.max(startMs + 1, idealEnd));
    const row: WrappedRow = { index: rows.length, startMs, endMs };
    if (phraseAware) {
      row.phraseNumber = row.index * phrasesPerRow + 1;
      row.countLabel = String((row.phraseNumber - 1) * config.countSize + 1);
    }
    rows.push(row);
    startMs = endMs;
  }
  return rows;
}
