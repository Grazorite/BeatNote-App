import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const playbackSpeedPresetEditorStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: dimensions.spacing.lg,
    backgroundColor: colors.overlay,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    borderRadius: 16,
    padding: dimensions.spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.md,
  },
  input: {
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.md,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlassStrong,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.iconDestructive,
  },
  error: {
    color: colors.iconDestructive,
    fontSize: 12,
    lineHeight: 17,
    marginTop: dimensions.spacing.sm,
  },
  defaultAction: {
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dimensions.spacing.md,
  },
  defaultActionText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginTop: dimensions.spacing.md,
  },
  button: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.surfaceRaised,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonText: {
    color: colors.onAccent,
  },
  disabled: {
    opacity: 0.45,
  },
});
