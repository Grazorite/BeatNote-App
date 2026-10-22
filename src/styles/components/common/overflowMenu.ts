import { StyleSheet, type ViewStyle } from 'react-native';
import { colors, dimensions } from '../../common';

export const overflowMenuStyles = StyleSheet.create({
  trigger: {
    width: dimensions.touchTarget.minWidth,
    height: dimensions.touchTarget.minHeight,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  triggerDisabled: {
    opacity: 0.45,
  },
  overlay: {
    flex: 1,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  menu: {
    position: 'absolute',
    minWidth: 212,
    maxWidth: 280,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
  },
  action: {
    minHeight: dimensions.touchTarget.minHeight,
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  finalAction: {
    borderBottomWidth: 0,
  },
  actionFocused: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  destructiveText: {
    color: colors.iconDestructive,
  },
});

export const overflowMenuPositionStyle = (
  top: number,
  right: number,
  maxHeight: number,
): ViewStyle => ({ top, right, maxHeight });
