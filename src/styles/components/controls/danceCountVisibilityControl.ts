import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const danceCountVisibilityControlStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
