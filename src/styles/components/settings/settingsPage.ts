import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const settingsPageStyles = StyleSheet.create({
  section: {
    marginBottom: 24,
    gap: 10,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  infoRow: {
    minHeight: 58,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  rowLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  rowDetail: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.55,
  },
  options: {
    gap: 8,
  },
  option: {
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  check: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    minHeight: 52,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  destructiveAction: {
    borderColor: colors.iconDestructive,
  },
  actionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  destructiveText: {
    color: colors.iconDestructive,
  },
  price: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
});
