import { StyleSheet } from 'react-native';
import { darkTheme } from './theme';

export {
  DEFAULT_THEME_NAME,
  darkTheme,
  getThemeColors,
  themes,
} from './theme';
export type { ThemeColors, ThemeName, ThemeScheme } from './theme';

/** Current static palette. Runtime switching will replace this compatibility
 * export after styles have been converted to theme-aware factories. */
export const colors = darkTheme;

/** Stroke opacity for the already-played part of a waveform. Mutes the layer colour so it sits
 * calmly beside the violet markers and the orange playhead instead of competing with them. */
export const PLAYED_WAVEFORM_OPACITY = 0.7;

// Responsive breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// Common dimensions
export const dimensions = {
  borderRadius: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  waveform: {
    height: 300,
    width: 800,
    stemHeight: 120,
    stemWidth: 720,
    // Mobile responsive
    mobile: {
      height: 200,
      width: '100%',
      stemHeight: 80,
    },
  },
  sidebar: {
    expanded: 280,
    collapsed: 60,
    // Mobile: full overlay
    mobile: {
      expanded: '100%',
      collapsed: 0,
    },
  },
  ruler: {
    height: 30,
  },
  // Touch targets for mobile
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 14,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  button: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: dimensions.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
