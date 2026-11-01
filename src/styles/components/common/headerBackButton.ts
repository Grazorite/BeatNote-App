import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const HEADER_SIDE_WIDTH = 92;
export const NAVIGATION_TITLE_FONT_SIZE = 20;
export const NAVIGATION_TITLE_LINE_HEIGHT = 25;

export const headerBackButtonStyles = StyleSheet.create({
  button: {
    width: HEADER_SIDE_WIDTH,
    minHeight: dimensions.touchTarget.minHeight,
    paddingHorizontal: dimensions.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.xs,
    borderRadius: dimensions.borderRadius,
  },
  label: {
    flexShrink: 1,
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
