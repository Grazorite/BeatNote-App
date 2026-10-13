import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopRangeLayerStyles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    borderWidth: 1,
  },
  fillEnabled: {
    backgroundColor: 'rgba(0, 212, 199, 0.24)',
    borderColor: colors.loopEnabled,
  },
  fillDisabled: {
    backgroundColor: 'rgba(71, 122, 118, 0.08)',
    borderColor: colors.loopDisabled,
    borderStyle: 'dashed',
  },
  outside: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.loopOutside,
    opacity: 0.62,
  },
  handle: {
    position: 'absolute',
    top: -4,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  handleFocused: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  handleVisual: {
    width: 8,
    height: 36,
    borderRadius: 3,
    backgroundColor: colors.loopHandle,
    borderColor: colors.loopEnabled,
    borderWidth: 1,
  },
  handleVisualDisabled: {
    backgroundColor: colors.loopDisabled,
    borderColor: colors.loopDisabled,
  },
});
