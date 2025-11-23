import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const layerControlsStyles = StyleSheet.create({
  container: {
    marginBottom: dimensions.spacing.lg,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.sm,
  },
  layerButtons: {
    flexDirection: 'column',
    gap: dimensions.spacing.sm,
    width: '100%',
  },
  layerButton: {
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    borderWidth: 2,
    borderRadius: dimensions.borderRadius,
    backgroundColor: '#222222',
    alignItems: 'center',
    width: '100%',
  },
  activeLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 3,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  hiddenLayer: {
    opacity: 0.3,
    backgroundColor: colors.surface,
  },
  layerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimensions.spacing.sm,
  },
  layerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeLayerText: {
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  markerCount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  instruction: {
    color: colors.gridMinor,
    fontSize: 10,
    marginTop: dimensions.spacing.sm,
  },
});