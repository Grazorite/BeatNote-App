import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const confirmDialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    maxHeight: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationGroup: {
    gap: 8,
    marginBottom: 20,
  },
  confirmationPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmationPhrase: {
    color: colors.text,
    fontWeight: '700',
  },
  confirmationInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.surfaceGlass,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.accent,
    justifyContent: 'center',
  },
  destructiveButton: {
    backgroundColor: colors.iconDestructive,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
  },
  buttonText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.onAccent,
  },
  destructiveButtonText: {
    color: colors.text,
  },
  disabledButton: {
    opacity: 0.4,
  },
});
