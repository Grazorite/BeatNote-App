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
  settingWithCaption: {
    gap: 0,
    marginBottom: 4,
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
  proOnlyNote: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
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
  optionWithDetail: {
    minHeight: 64,
    paddingVertical: 9,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  optionDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  seekStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: 52,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
    overflow: 'hidden',
  },
  seekStepperButton: {
    width: 58,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekStepperButtonText: {
    color: colors.accent,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  seekStepperValue: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderSubtle,
  },
  seekStepperValueInput: {
    minWidth: 42,
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: 2,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  seekStepperValueSuffix: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  segmentedOptions: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  segmentedOption: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentedOptionSelected: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.accent,
    borderRadius: 8,
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
