import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const projectRowStyles = StyleSheet.create({
  container: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  disabled: {
    opacity: 0.5,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.sm,
    paddingLeft: dimensions.spacing.md,
    paddingRight: dimensions.spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  displayTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
  },
  metadata: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  states: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    marginTop: dimensions.spacing.xs,
  },
  state: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.xs,
  },
  missing: {
    color: colors.iconDestructive,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  readOnly: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
