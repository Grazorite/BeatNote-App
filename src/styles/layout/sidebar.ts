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
    paddingTop: 50,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: dimensions.spacing.md,
    flexGrow: 1,
  },
  sidebarTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.md,
    textAlign: 'center',
  },
  sidebarSection: {
    marginBottom: dimensions.spacing.lg,
  },
});