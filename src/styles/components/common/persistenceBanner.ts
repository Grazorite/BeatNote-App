import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const persistenceBannerStyles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  issue: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    paddingLeft: dimensions.spacing.md,
    paddingRight: dimensions.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  finalIssue: {
    borderBottomWidth: 0,
  },
  copy: {
    flex: 1,
    paddingVertical: dimensions.spacing.sm,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  retry: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.sm,
  },
  retryText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  retryDisabled: {
    opacity: 0.55,
  },
  retryFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 6,
  },
});
