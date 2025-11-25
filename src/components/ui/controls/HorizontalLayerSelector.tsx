import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { Mic, Music, Piano, Guitar, Drum, Music2 } from 'lucide-react-native';
import { horizontalLayerSelectorStyles as styles } from '../../../styles/components/controls/horizontalLayerSelector';

const HorizontalLayerSelector: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility } = useStudioStore();

  const getLayerIcon = (layerId: LayerId, color: string) => {
    const iconProps = { size: 24, color };
    switch (layerId) {
      case 'vocals': return <Mic {...iconProps} />;
      case 'drums': return <Drum {...iconProps} />;
      case 'bass': return <Music {...iconProps} />;
      case 'piano': return <Piano {...iconProps} />;
      case 'guitar': return <Guitar {...iconProps} />;
      case 'other': return <Music2 {...iconProps} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.layersRow}>
        {layers.map((layer) => (
          <TouchableOpacity
            key={layer.id}
            style={[
              styles.layerButton,
              {
                borderColor: layer.isVisible ? layer.color : '#444444',
                backgroundColor: activeLayerId === layer.id ? layer.color + '30' : layer.isVisible ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                opacity: layer.isVisible ? 1 : 0.5,
              }
            ]}
            onPress={() => setActiveLayer(layer.id)}
            onLongPress={() => toggleLayerVisibility(layer.id)}
          >
            {getLayerIcon(layer.id, layer.isVisible ? layer.color : '#666666')}
            <Text style={[
              styles.layerText,
              {
                color: layer.isVisible ? layer.color : '#666666',
                fontWeight: activeLayerId === layer.id ? 'bold' : '600',
              }
            ]}>
              {layer.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.helpText}>
        Tap to select • Long press to hide/show
      </Text>
    </View>
  );
};

export default HorizontalLayerSelector;