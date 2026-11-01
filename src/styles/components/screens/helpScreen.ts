import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';
import {
  HEADER_SIDE_WIDTH,
  NAVIGATION_TITLE_FONT_SIZE,
  NAVIGATION_TITLE_LINE_HEIGHT,
} from '../common/headerBackButton';

export const helpScreenStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileOverlay: {
    padding: 0,
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  modal: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 16,
    maxWidth: 800,
    maxHeight: '90%',
    width: '90%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  mobileModal: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  mobileHeader: {
    minHeight: 64,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: NAVIGATION_TITLE_FONT_SIZE,
    lineHeight: NAVIGATION_TITLE_LINE_HEIGHT,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSide: {
    width: HEADER_SIDE_WIDTH,
  },
  closeButton: {
    width: HEADER_SIDE_WIDTH,
    backgroundColor: colors.surfaceGlass,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    maxHeight: 600,
  },
  mobileScrollContainer: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shortcutGroup: {
    marginBottom: 16,
  },
  shortcutGroupTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shortcutKeys: {
    color: colors.text,
    backgroundColor: colors.surfaceGlassStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  shortcutDescription: {
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
  },
});
