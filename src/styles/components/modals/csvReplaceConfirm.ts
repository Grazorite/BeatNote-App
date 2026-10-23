import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const csvReplaceConfirmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.spacing.md,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  content: {
    padding: dimensions.spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: dimensions.spacing.md,
  },
  counts: {
    gap: dimensions.spacing.sm,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  warningText: {
    color: colors.iconDestructive,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: dimensions.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensions.spacing.sm,
    marginTop: dimensions.spacing.lg,
  },
  button: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: dimensions.touchTarget.minWidth,
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: 11,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
  },
  replaceButton: {
    backgroundColor: colors.accent,
    borderColor: colors.borderEmphasis,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  replaceButtonText: {
    color: colors.onAccent,
  },
});
