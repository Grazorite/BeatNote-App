import { StyleSheet } from 'react-native';

export const horizontalLayerSelectorStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  heading: {
    alignSelf: 'flex-start',
    color: '#bbbbbb',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  layersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  layerItem: {
    alignItems: 'center',
    gap: 4,
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
  layerNameInput: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 56,
    maxWidth: 88,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
  },
  renameButton: {
    minHeight: 24,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  renameButtonText: {
    color: '#aaaaaa',
    fontSize: 11,
    fontWeight: '600',
  },
  helpText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
  },
});
