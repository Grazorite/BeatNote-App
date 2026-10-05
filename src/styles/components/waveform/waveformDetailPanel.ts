import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const waveformDetailPanelStyles = StyleSheet.create({
  panel: {
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
  header: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: dimensions.spacing.md,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    minHeight: dimensions.touchTarget.minHeight,
    minWidth: dimensions.touchTarget.minWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: dimensions.spacing.sm,
  },
  closeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  closePressed: {
    opacity: 0.6,
  },
});
