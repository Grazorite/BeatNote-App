import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const settingsNavigationRowStyles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  disabled: {
    opacity: 0.48,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chevron: {
    color: colors.textSecondary,
  },
});
