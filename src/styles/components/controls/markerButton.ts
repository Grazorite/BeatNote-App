import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const markerButtonStyles = StyleSheet.create({
  markerButtonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  markerButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerButtonMain: {
    backgroundColor: '#ff8c00', // Prominent orange for main marker button
  },
  markerButtonSecondary: {
    backgroundColor: '#ff6600', // Original orange for secondary buttons
  },
  markerButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  markerButtonDisabled: {
    backgroundColor: '#444444',
    opacity: 0.5,
  },
  markerButtonActive: {
    backgroundColor: '#ff6600', // Normal orange when active
  },
  markerButtonInactive: {
    backgroundColor: '#666666', // Gray when inactive
  },
});