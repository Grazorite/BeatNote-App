import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const projectControlsStyles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm,
    marginBottom: dimensions.spacing.lg,
  },
  controlsMobile: {
    width: '100%',
    paddingVertical: 4,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    zIndex: 20,
    elevation: 8,
  },
  mobileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 6,
  },
  sidebarToggleMobile: {
    minWidth: 0,
  },
  buttonMobile: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  buttonTextHidden: {
    display: 'none',
  },
});
