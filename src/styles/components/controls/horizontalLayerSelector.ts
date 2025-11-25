import { StyleSheet } from 'react-native';

export const horizontalLayerSelectorStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  layersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  layerButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 100,
    justifyContent: 'center',
  },
  layerText: {
    fontSize: 16,
  },
  helpText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
  },
});