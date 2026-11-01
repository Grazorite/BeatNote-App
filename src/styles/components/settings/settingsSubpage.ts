import { StyleSheet } from 'react-native';

import { colors } from '../../common';
import {
  HEADER_SIDE_WIDTH,
  NAVIGATION_TITLE_FONT_SIZE,
  NAVIGATION_TITLE_LINE_HEIGHT,
} from '../common/headerBackButton';

export const settingsSubpageStyles = StyleSheet.create({
  page: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: NAVIGATION_TITLE_FONT_SIZE,
    lineHeight: NAVIGATION_TITLE_LINE_HEIGHT,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: HEADER_SIDE_WIDTH,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
});
