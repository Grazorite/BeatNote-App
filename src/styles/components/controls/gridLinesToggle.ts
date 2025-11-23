import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const gridLinesToggleStyles = StyleSheet.create({
  container: {
    // No specific container styles needed
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
  },
  toggleButtonInactive: {
    backgroundColor: colors.surface,
  },
  toggleTextActive: {
    color: colors.background,
    fontSize: 14,
  },
  toggleTextInactive: {
    color: colors.text,
    fontSize: 14,
  },
});