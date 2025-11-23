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
    paddingBottom: 100,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: dimensions.spacing.lg,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  markerButtonContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: dimensions.spacing.sm,
  },
  activeLayerText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeLayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalMarkersText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});