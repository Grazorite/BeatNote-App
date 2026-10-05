import type { RowDensity, RowDensityMode } from './rowLayout';

export type RowDensityPresetName = 'spacious' | 'default' | 'compact';

export function densityForPreset(
  name: RowDensityPresetName,
  mode: RowDensityMode,
): RowDensity {
  const values = {
    spacious: { phrasesPerRow: 1, rowDurationMs: 5000 },
    default: { phrasesPerRow: 2, rowDurationMs: 10000 },
    compact: { phrasesPerRow: 3, rowDurationMs: 15000 },
  } as const;
  const value = values[name];
  return mode === 'phrase'
    ? { mode, phrasesPerRow: value.phrasesPerRow }
    : { mode, rowDurationMs: value.rowDurationMs };
}
