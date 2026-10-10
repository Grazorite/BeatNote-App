import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const wrappedWaveformStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginBottom: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  containerMobile: {
    flex: 1,
    minHeight: 0,
    marginBottom: 0,
  },
  viewport: {
    width: '100%',
    backgroundColor: colors.background,
  },
  viewportMobile: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  followToolbar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.sm,
    gap: dimensions.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  followToggle: {
    minHeight: 28,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.background,
  },
  followToggleActive: {
    borderColor: colors.accent,
    backgroundColor: '#2a1608',
  },
  followTogglePressed: {
    opacity: 0.75,
  },
  followToggleText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    width: '100%',
  },
  loadingText: {
    position: 'absolute',
    top: dimensions.spacing.xs,
    right: dimensions.spacing.sm,
    zIndex: 2,
    color: colors.textSecondary,
    fontSize: 11,
  },
  placeholder: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dimensions.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius,
    backgroundColor: colors.background,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
