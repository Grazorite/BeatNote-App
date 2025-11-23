import { StyleSheet } from 'react-native';

export const playPauseButtonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  button: {
    borderRadius: 12,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonEnabled: {
    backgroundColor: '#ff8c00', // Prominent orange for main play/pause
  },
  skipButtonEnabled: {
    backgroundColor: '#ff6600', // Original orange for skip buttons
  },
  buttonDisabled: {
    backgroundColor: '#444444',
    opacity: 0.5,
  },
});