import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { BeatNoteIcon, BeatNoteIconName } from '../../icons';
import { layerControlsStyles as styles } from '../../../styles/components/controls/layerControls';
import { getLayerDisplayName } from '../../../utils/layers';

const LayerControls: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility } = useStudioStore();

  const getTotalMarkers = (layerId: LayerId) => {
    const layer = layers.find(l => l.id === layerId);
    return layer ? layer.markers.length : 0;
  };

  const getLayerIcon = (layerId: LayerId, color: string) => {
    let name: BeatNoteIconName | null = null;
    switch (layerId) {
      case 'vocals': name = 'vocals'; break;
      case 'drums': name = 'drums'; break;
      case 'bass': name = 'bass'; break;
      case 'piano': name = 'piano'; break;
      case 'guitar': name = 'guitar'; break;
      case 'other': name = 'other'; break;
    }
    return name ? <BeatNoteIcon name={name} size={18} color={color} /> : null;
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
            <View style={styles.layerContent}>
              {getLayerIcon(layer.id, layer.color)}
              <Text style={[
                styles.layerText, 
                { color: layer.color },
                activeLayerId === layer.id && styles.activeLayerText
              ]}>
                {getLayerDisplayName(layer)}
              </Text>
            </View>
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



export default LayerControls;
