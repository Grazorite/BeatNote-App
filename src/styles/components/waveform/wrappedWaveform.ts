import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const wrappedWaveformStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginBottom: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  viewport: {
    width: '100%',
    backgroundColor: colors.background,
  },
  scrollContent: {
    width: '100%',
  },
  loadingText: {
    position: 'absolute',
    top: dimensions.spacing.xs,
    right: dimensions.spacing.sm,
    zIndex: 2,
    color: colors.textSecondary,
    fontSize: 11,
  },
  placeholder: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.background,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
