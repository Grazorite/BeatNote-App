import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const danceCountDisplayStyles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlass,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
