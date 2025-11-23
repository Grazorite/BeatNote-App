import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../common';

export const stemsViewStyles = StyleSheet.create({
  stemsView: {
    marginBottom: dimensions.spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridSpacer: {
    width: 80,
  },
  stemsStack: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  stemTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stemTrackLabel: {
    width: 80,
    height: dimensions.waveform.stemHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  stemLabelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stemTrackBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playheadOverlay: {
    position: 'absolute',
    top: 0,
    left: 80,
    width: dimensions.waveform.stemWidth,
    height: '100%',
    pointerEvents: 'box-none',
  },
  playheadSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});