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
  mobileActionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileActionsScroll: {
    flex: 1,
  },
  scrollCue: {
    width: 56,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    borderLeftWidth: 1,
    borderLeftColor: '#555555',
  },
  scrollCueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  mobileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    paddingHorizontal: dimensions.spacing.sm,
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
    flexShrink: 0,
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
