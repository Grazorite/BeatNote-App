import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const rowDensityControlStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.xs,
    gap: dimensions.spacing.xs,
  },
  heading: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.xs,
  },
  control: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xs,
    paddingHorizontal: dimensions.spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: dimensions.borderRadius,
    minHeight: dimensions.touchTarget.minHeight,
  },
  controlSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
