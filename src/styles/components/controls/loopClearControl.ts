import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopClearControlStyles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderColor: colors.loopEnabled,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
