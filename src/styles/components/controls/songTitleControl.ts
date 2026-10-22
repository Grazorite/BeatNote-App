import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const songTitleControlStyles = StyleSheet.create({
  control: {
    flex: 1,
    minWidth: 0,
    minHeight: dimensions.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlass,
    gap: dimensions.spacing.xs,
  },
  controlMobile: {
    paddingLeft: dimensions.spacing.sm,
    paddingRight: dimensions.spacing.xs,
  },
  controlDesktop: {
    paddingLeft: dimensions.spacing.md,
    paddingRight: dimensions.spacing.sm,
  },
  controlFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  missing: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  missingText: {
    color: colors.iconDestructive,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  chevron: {
    flexShrink: 0,
    width: 22,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
