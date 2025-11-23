import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { layerControlsStyles as styles } from '../../../styles/components/controls/layerControls';
import { VocalsIcon, DrumsIcon, BassIcon, PianoIcon, OtherIcon } from '../../icons';

const LayerControls: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility } = useStudioStore();

  const getTotalMarkers = (layerId: LayerId) => {
    const layer = layers.find(l => l.id === layerId);
    return layer ? layer.markers.length : 0;
  };

  const getLayerIcon = (layerId: LayerId, color: string) => {
    const iconProps = { size: 18, color };
    switch (layerId) {
      case 'vocals': return <VocalsIcon {...iconProps} />;
      case 'drums': return <DrumsIcon {...iconProps} />;
      case 'bass': return <BassIcon {...iconProps} />;
      case 'piano': return <PianoIcon {...iconProps} />;
      case 'other': return <OtherIcon {...iconProps} />;
      default: return null;
    }
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
                {layer.name}
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