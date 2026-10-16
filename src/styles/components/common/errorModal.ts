import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const errorModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
    margin: dimensions.spacing.lg,
    minWidth: 280,
    maxWidth: 400,
    overflow: 'hidden',
  },
  title: {
    color: colors.iconDestructive,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: dimensions.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    alignSelf: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
