import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStudioStore, LayerId } from '../../hooks/useStudioStore';

const LayerControls: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility } = useStudioStore();

  const getTotalMarkers = (layerId: LayerId) => {
    const layer = layers.find(l => l.id === layerId);
    return layer ? layer.markers.length : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.layerButtons}>
        {layers.map((layer) => (
          <TouchableOpacity
            key={layer.id}
            style={[
              styles.layerButton,
              { borderColor: layer.color },
              activeLayerId === layer.id && styles.activeLayer,
              !layer.isVisible && styles.hiddenLayer,
            ]}
            onPress={() => setActiveLayer(layer.id)}
            onLongPress={() => toggleLayerVisibility(layer.id)}
          >
            <Text style={[styles.layerText, { color: layer.color }]}>
              {layer.name}
            </Text>
            <Text style={styles.markerCount}>
              {getTotalMarkers(layer.id)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.instruction}>
        Tap to select • Long press to hide/show
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  layerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  layerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
    minWidth: 70,
  },
  activeLayer: {
    backgroundColor: '#444444',
  },
  hiddenLayer: {
    opacity: 0.3,
  },
  layerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  markerCount: {
    color: '#999999',
    fontSize: 12,
    marginTop: 2,
  },
  instruction: {
    color: '#666666',
    fontSize: 10,
    marginTop: 8,
  },
});

export default LayerControls;