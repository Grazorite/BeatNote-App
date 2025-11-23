import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const waveformCanvasStyles = StyleSheet.create({
  canvas: {
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
    marginBottom: dimensions.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waveformContainer: {
    position: 'relative',
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: dimensions.spacing.lg,
  },
  waveform: {
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
    backgroundColor: '#000000',
  },
  waveformSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  gestureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: dimensions.waveform.width,
    height: dimensions.waveform.height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});