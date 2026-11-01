import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const aboutSettingsStyles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: 18,
  },
  appName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  version: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
  action: {
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  actionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  privacyCard: {
    padding: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  privacyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  privacyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
