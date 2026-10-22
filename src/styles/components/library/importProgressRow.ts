import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const importProgressRowStyles = StyleSheet.create({
  container: {
    minWidth: 0,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    paddingLeft: dimensions.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  indicator: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingVertical: dimensions.spacing.sm,
  },
  filename: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  status: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  error: {
    color: colors.iconDestructive,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    minWidth: dimensions.touchTarget.minWidth,
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: dimensions.borderRadius,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  dismissText: {
    color: colors.textSecondary,
  },
});
