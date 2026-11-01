import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';
import {
  HEADER_SIDE_WIDTH,
  NAVIGATION_TITLE_FONT_SIZE,
  NAVIGATION_TITLE_LINE_HEIGHT,
} from '../common/headerBackButton';

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
    flexDirection: 'row',
    paddingHorizontal: dimensions.spacing.md,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: NAVIGATION_TITLE_FONT_SIZE,
    lineHeight: NAVIGATION_TITLE_LINE_HEIGHT,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSide: {
    width: HEADER_SIDE_WIDTH,
  },
});
