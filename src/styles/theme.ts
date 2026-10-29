export type ThemeScheme = 'dark' | 'light';

/**
 * Semantic colour contract shared by every BeatNote theme.
 *
 * New palettes must supply every role so components never need palette-specific
 * fallbacks or raw colour literals.
 */
export interface ThemeColors {
  readonly scheme: ThemeScheme;
  readonly background: string;
  readonly surface: string;
  readonly surfaceRaised: string;
  readonly surfaceGlass: string;
  readonly surfaceGlassStrong: string;
  readonly border: string;
  readonly borderSubtle: string;
  readonly borderEmphasis: string;
  readonly borderQuiet: string;
  readonly overlay: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly accent: string;
  readonly onAccent: string;
  readonly controlActive: string;
  readonly marker: string;
  readonly success: string;
  readonly iconPositive: string;
  readonly iconDestructive: string;
  readonly loopTrack: string;
  readonly loopEnabled: string;
  readonly loopDisabled: string;
  readonly loopHandle: string;
  readonly loopOutside: string;
  readonly loopPlayhead: string;
  readonly loopFill: string;
  readonly loopFillDisabled: string;
  readonly loopBorder: string;
  readonly glassTop: string;
  readonly glassMiddle: string;
  readonly glassBottom: string;
  readonly glassHighlight: string;
  readonly vocals: string;
  readonly drums: string;
  readonly bass: string;
  readonly piano: string;
  readonly other: string;
  readonly gridMajor: string;
  readonly gridMiddle: string;
  readonly gridMinor: string;
  readonly gridBackground: string;
}

export const darkTheme: Readonly<ThemeColors> = Object.freeze({
  scheme: 'dark',
  background: '#000000',
  surface: '#111111',
  surfaceRaised: '#1b1b20',
  surfaceGlass: 'rgba(35, 35, 42, 0.72)',
  surfaceGlassStrong: 'rgba(20, 20, 25, 0.9)',
  border: '#333333',
  borderSubtle: 'rgba(255, 255, 255, 0.11)',
  borderEmphasis: 'rgba(255, 255, 255, 0.18)',
  borderQuiet: 'rgba(255, 255, 255, 0.07)',
  overlay: 'rgba(0, 0, 0, 0.72)',
  text: '#ffffff',
  textSecondary: '#999999',
  accent: '#ff6600',
  onAccent: '#000000',
  controlActive: '#ad563f',
  marker: '#c084fc',
  success: '#00ff00',
  iconPositive: '#3a8f5b',
  iconDestructive: '#b54a45',
  loopTrack: '#222222',
  // Teal stays the only cool hue so loop state reads at a glance, but it is muted to sit calmly
  // beside the orange playhead and violet markers.
  loopEnabled: '#2bbdb2',
  loopDisabled: '#477a76',
  loopHandle: '#dcf3f0',
  loopOutside: '#000000',
  loopPlayhead: '#ff8c00',
  loopFill: 'rgba(43, 189, 178, 0.18)',
  loopFillDisabled: 'rgba(71, 122, 118, 0.08)',
  loopBorder: 'rgba(43, 189, 178, 0.6)',
  glassTop: '#464650',
  glassMiddle: '#202027',
  glassBottom: '#0b0b0f',
  glassHighlight: '#ffffff',

  // Annotation-layer identity colours are part of the theme contract so every
  // future palette can preserve contrast without changing layer meaning.
  vocals: '#ff6666',
  drums: '#00ccff',
  bass: '#bb66ff',
  piano: '#ffcc00',
  other: '#ff69b4',

  gridMajor: '#ffffff',
  gridMiddle: '#cccccc',
  gridMinor: '#666666',
  gridBackground: '#1a1a1a',
});

export const themes = Object.freeze({
  dark: darkTheme,
} satisfies Record<string, Readonly<ThemeColors>>);

export type ThemeName = keyof typeof themes;

export const DEFAULT_THEME_NAME: ThemeName = 'dark';

export const getThemeColors = (
  themeName: ThemeName = DEFAULT_THEME_NAME,
): Readonly<ThemeColors> => themes[themeName];
