import { StyleSheet, type ViewStyle } from 'react-native';
import { colors, dimensions } from '../../common';
import {
  HEADER_SIDE_WIDTH,
  NAVIGATION_TITLE_FONT_SIZE,
  NAVIGATION_TITLE_LINE_HEIGHT,
} from './headerBackButton';

export const bottomSheetStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  sheet: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  header: {
    flexShrink: 0,
  },
  grabberTarget: {
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabber: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  titleRow: {
    minHeight: dimensions.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: dimensions.spacing.md,
    paddingRight: dimensions.spacing.sm,
    paddingBottom: dimensions.spacing.sm,
    gap: dimensions.spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: NAVIGATION_TITLE_FONT_SIZE,
    lineHeight: NAVIGATION_TITLE_LINE_HEIGHT,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleSide: {
    width: HEADER_SIDE_WIDTH,
    height: dimensions.touchTarget.minHeight,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});

export const bottomSheetInsetStyle = (
  top: number,
  bottom: number,
  left: number,
  right: number,
): ViewStyle => ({
  paddingTop: top,
  paddingBottom: bottom,
  paddingLeft: left,
  paddingRight: right,
});

export const bottomSheetKeyboardStyle = (bottom: number): ViewStyle => ({ paddingBottom: bottom });
