import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const projectControlsStyles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.lg,
  },
  controlsMobile: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sidebarToggleMobile: {
    minWidth: 48,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonMobile: {
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: colors.border,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.surface,
  },
  buttonLoaded: {
    backgroundColor: '#006600',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
  },
  buttonTextMobile: {
    fontSize: 14,
  },
});
