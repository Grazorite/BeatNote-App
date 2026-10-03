import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const rowGutterStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  time: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  phrase: {
    marginTop: dimensions.spacing.xs,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  count: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
});
