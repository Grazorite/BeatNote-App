import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../common';

export const sidebarStyles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  sidebarTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 24,
  },
});