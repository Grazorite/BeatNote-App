import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const liteAdPlaceholderStyles = StyleSheet.create({
  slot: {
    flexShrink: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  safeAreaSpacer: {
    flexShrink: 0,
    width: '100%',
    backgroundColor: colors.background,
  },
  creative: {
    width: '100%',
    maxWidth: 414,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
