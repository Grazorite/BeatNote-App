import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const layerNameSettingsStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 2,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 8,
    height: 24,
    borderRadius: 4,
  },
  defaultName: {
    color: colors.textSecondary,
    fontSize: 12,
    width: 48,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.surfaceGlass,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  resetButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});
