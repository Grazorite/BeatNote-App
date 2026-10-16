import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const playbackSpeedControlStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  label: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  chooser: {
    position: 'absolute',
    bottom: 48,
    left: -12,
    minWidth: 76,
    padding: 4,
    gap: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 20,
  },
  option: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  optionSelected: {
    backgroundColor: colors.controlActive,
  },
  optionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
