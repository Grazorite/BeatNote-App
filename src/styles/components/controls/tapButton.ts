import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const tapButtonStyles = StyleSheet.create({
  tapButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  tapButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});