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
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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
});