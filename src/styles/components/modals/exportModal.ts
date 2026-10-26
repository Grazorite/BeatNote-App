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
    padding: 0,
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  content: {
    padding: 24,
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
  pdfButton: {
    backgroundColor: colors.accent,
  },
  pdfOptions: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
    marginBottom: 12,
    padding: 12,
  },
  optionsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  optionRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  optionLabel: {
    color: colors.text,
    fontSize: 13,
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
  primaryButtonText: {
    color: colors.onAccent,
    fontWeight: '700',
  },
  primaryButtonSubtext: {
    color: colors.onAccent,
    fontWeight: '600',
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
