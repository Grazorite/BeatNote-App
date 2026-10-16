import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const audioControlsStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  containerMobile: {
    gap: 6,
  },
  button: {
    borderRadius: 12,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonMobile: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  buttonCompact: {
    width: 44,
    height: 44,
  },
  audioControlsEnabled: {
    backgroundColor: colors.controlActive,
  },
  skipButtonEnabled: {
    backgroundColor: colors.controlActive,
  },
  buttonDisabled: {
    backgroundColor: '#444444',
    opacity: 0.5,
  },
  repeatButtonActive: {
    backgroundColor: colors.controlActive,
  },
  repeatButtonInactive: {
    backgroundColor: '#666666', // Gray when inactive
  },
  currentTime: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: 'hidden',
  },
});
