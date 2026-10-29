import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopRangeLayerStyles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    borderWidth: 1,
    borderRadius: 5,
  },
  fillEnabled: {
    backgroundColor: colors.loopFill,
    borderColor: colors.loopBorder,
  },
  fillDisabled: {
    backgroundColor: colors.loopFillDisabled,
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
  // Slim capsule echoing the rounded bars of the app icon. Its width must equal
  // LOOP_HANDLE_VISUAL_WIDTH in LoopRangeLayer.tsx, which insets the grip at the track edges.
  handleVisual: {
    width: 6,
    height: 30,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.loopHandle,
  },
  handleVisualDisabled: {
    backgroundColor: colors.loopDisabled,
  },
  handleGrip: {
    width: 2,
    height: 10,
    borderRadius: 1,
    backgroundColor: colors.loopEnabled,
  },
  handleGripDisabled: {
    backgroundColor: colors.loopOutside,
    opacity: 0.45,
  },
});
