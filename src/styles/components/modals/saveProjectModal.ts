import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const saveProjectModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.surfaceGlassStrong,
    color: colors.text,
    padding: 12,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: dimensions.borderRadius,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderColor: colors.borderEmphasis,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
