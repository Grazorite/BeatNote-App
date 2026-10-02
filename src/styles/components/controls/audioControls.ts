import { StyleSheet } from 'react-native';

export const audioControlsStyles = StyleSheet.create({
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
    backgroundColor: '#ff8c00', // Prominent orange for main play/pause
  },
  skipButtonEnabled: {
    backgroundColor: '#ff6600', // Original orange for skip buttons
  },
  buttonDisabled: {
    backgroundColor: '#444444',
    opacity: 0.5,
  },
  repeatButtonActive: {
    backgroundColor: '#ff6600', // Normal orange when active
  },
  repeatButtonInactive: {
    backgroundColor: '#666666', // Gray when inactive
  },
});
