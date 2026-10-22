import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const musicLibraryRowStyles = StyleSheet.create({
  container: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  current: {
    backgroundColor: colors.surfaceGlass,
  },
  disabled: {
    opacity: 0.5,
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.sm,
    paddingLeft: dimensions.spacing.md,
  },
  mainFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: dimensions.borderRadius,
  },
  stateIcons: {
    minWidth: 24,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  metadata: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  missing: {
    color: colors.iconDestructive,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  status: {
    minWidth: dimensions.touchTarget.minWidth,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retry: {
    minWidth: dimensions.touchTarget.minWidth,
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: dimensions.borderRadius,
  },
  retryText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: colors.iconDestructive,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
