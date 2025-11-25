import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const projectControlsStyles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.lg,
  },
  button: {
    backgroundColor: colors.border,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.surface,
  },
  buttonLoaded: {
    backgroundColor: '#006600',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
  },
});