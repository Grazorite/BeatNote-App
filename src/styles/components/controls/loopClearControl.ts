import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopClearControlStyles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 3,
    top: 4,
    width: 30,
    height: 28,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderColor: colors.loopEnabled,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
