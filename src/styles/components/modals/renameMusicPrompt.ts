import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const renameMusicPromptStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.spacing.lg,
    backgroundColor: colors.overlay,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
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
    marginBottom: dimensions.spacing.md,
  },
  input: {
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlassStrong,
    color: colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.iconDestructive,
  },
  focused: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  error: {
    color: colors.iconDestructive,
    fontSize: 14,
    lineHeight: 19,
    marginTop: dimensions.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginTop: dimensions.spacing.lg,
  },
  button: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.sm,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cancel: {
    backgroundColor: colors.surfaceGlass,
  },
  save: {
    backgroundColor: colors.accent,
    borderColor: colors.borderEmphasis,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: colors.onAccent,
  },
});
