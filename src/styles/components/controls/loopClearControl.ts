import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopClearControlStyles = StyleSheet.create({
  button: {
    width: 40,
    height: 36,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderColor: colors.loopEnabled,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: colors.border,
    opacity: 0.45,
  },
});
