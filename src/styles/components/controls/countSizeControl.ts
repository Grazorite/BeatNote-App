import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const countSizeControlStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlass,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.controlActive,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.text,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },
});
