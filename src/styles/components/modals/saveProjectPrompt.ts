import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const saveProjectPromptStyles = StyleSheet.create({
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
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 44,
    backgroundColor: colors.surfaceGlassStrong,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    fontSize: 16,
  },
  textInputError: {
    borderColor: colors.iconDestructive,
  },
  errorText: {
    color: colors.iconDestructive,
    fontSize: 14,
    marginTop: 8,
  },
  duplicateNotice: {
    marginTop: 4,
  },
  suggestionButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  suggestionText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: dimensions.borderRadius,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
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
  saveButtonText: {
    color: colors.onAccent,
  },
});
