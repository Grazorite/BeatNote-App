import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const playPauseControlStyles = StyleSheet.create({
  button: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text,
    backgroundColor: colors.accent,
  },
  compactButton: {
    borderRadius: 7,
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.45,
  },
});
