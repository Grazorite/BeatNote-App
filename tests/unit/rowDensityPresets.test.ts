import { densityForPreset } from '../../src/utils/rowDensityPresets';

describe('densityForPreset', () => {
  it.each([
    ['spacious', 1],
    ['default', 2],
    ['compact', 3],
  ] as const)('maps %s to its phrase density', (preset, phrasesPerRow) => {
    expect(densityForPreset(preset, 'phrase')).toEqual({ mode: 'phrase', phrasesPerRow });
  });

  it.each([
    ['spacious', 5000],
    ['default', 10000],
    ['compact', 15000],
  ] as const)('maps %s to its duration density', (preset, rowDurationMs) => {
    expect(densityForPreset(preset, 'duration')).toEqual({ mode: 'duration', rowDurationMs });
  });
});
