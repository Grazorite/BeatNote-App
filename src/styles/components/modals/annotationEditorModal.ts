import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const annotationEditorModalStyles = StyleSheet.create({
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
    maxWidth: 460,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  input: {
    minHeight: 120,
    maxHeight: 220,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: colors.surfaceGlassStrong,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
    fontSize: 16,
    lineHeight: 22,
  },
  count: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  button: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.borderRadius,
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
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
