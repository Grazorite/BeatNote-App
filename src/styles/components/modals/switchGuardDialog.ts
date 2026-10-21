import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const switchGuardDialogStyles = StyleSheet.create({
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
    overflow: 'hidden',
    borderRadius: 16,
    padding: 24,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  keepButton: {
    backgroundColor: colors.surfaceGlassStrong,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButtonText: {
    color: colors.onAccent,
  },
});
