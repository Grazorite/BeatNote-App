import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const danceCountVisibilityControlStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  enabled: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 8,
  },
});
