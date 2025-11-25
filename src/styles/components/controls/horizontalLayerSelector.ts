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
    gap: 8,
    flexWrap: 'wrap',
  },
  layerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 90,
    maxWidth: 120,
    justifyContent: 'center',
    overflow: 'hidden',
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