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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 20,
  },
  option: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  optionSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
