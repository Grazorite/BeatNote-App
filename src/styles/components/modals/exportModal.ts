import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const exportModalStyles = StyleSheet.create({
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
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  exportButton: {
    padding: 16,
    borderRadius: dimensions.borderRadius,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  midiButton: {
    backgroundColor: colors.accent,
  },
  csvButton: {
    backgroundColor: colors.accent,
  },
  importButton: {
    backgroundColor: colors.accent,
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
  buttonSubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
    padding: 12,
    borderRadius: dimensions.borderRadius,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
