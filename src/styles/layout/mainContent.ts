import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../common';

export const mainContentStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    alignItems: 'center',
    padding: dimensions.spacing.sm,
    minHeight: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.sm,
  },
  tapButtonContainer: {
    marginTop: dimensions.spacing.sm,
    alignItems: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});