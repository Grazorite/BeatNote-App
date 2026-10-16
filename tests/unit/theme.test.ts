import {
  darkTheme,
  DEFAULT_THEME_NAME,
  getThemeColors,
  themes,
} from '../../src/styles/theme';

describe('colour theme foundation', () => {
  it('registers and returns the dark default palette', () => {
    expect(DEFAULT_THEME_NAME).toBe('dark');
    expect(themes.dark).toBe(darkTheme);
    expect(getThemeColors()).toBe(darkTheme);
    expect(getThemeColors('dark')).toBe(darkTheme);
  });

  it('keeps the registered palette immutable', () => {
    expect(getThemeColors(DEFAULT_THEME_NAME)).toBe(darkTheme);
    expect(Object.isFrozen(darkTheme)).toBe(true);
  });

  it('exposes semantic state colours independently from the brand accent', () => {
    expect(darkTheme.controlActive).not.toBe(darkTheme.accent);
    expect(darkTheme.iconPositive).not.toBe(darkTheme.success);
    expect(darkTheme.iconDestructive).not.toBe(darkTheme.controlActive);
  });
});
