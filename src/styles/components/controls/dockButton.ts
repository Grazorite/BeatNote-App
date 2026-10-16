import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const dockButtonStyles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 0,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  compactButton: {
    minHeight: 0,
    borderRadius: 7,
  },
  active: {
    backgroundColor: colors.controlActive,
    borderColor: colors.text,
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  unavailable: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.45,
  },
  reserved: {
    backgroundColor: colors.surface,
    borderColor: colors.textSecondary,
    borderStyle: 'dashed',
    opacity: 0.72,
  },
  reservedDot: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
});
