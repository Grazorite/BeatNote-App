import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const helpButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.surfaceGlass,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
