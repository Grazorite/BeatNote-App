import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { useLayerSelectorAnimation } from '../../../hooks/useLayerSelectorAnimation';
import { Mic, Music, Piano, Guitar, Drum, Radio } from 'lucide-react-native';
import { horizontalLayerSelectorStyles as styles } from '../../../styles/components/controls/horizontalLayerSelector';

const HorizontalLayerSelector: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility, stemCount } = useStudioStore();

  const getLayerIcon = (layerId: LayerId, color: string) => {
    const iconProps = { size: 24, color };
    switch (layerId) {
      case 'vocals': return <Mic {...iconProps} />;
      case 'drums': return <Drum {...iconProps} />;
      case 'bass': return <Radio {...iconProps} />;
      case 'piano': return <Piano {...iconProps} />;
      case 'guitar': return <Guitar {...iconProps} />;
      case 'other': return <Music {...iconProps} />;
      default: return null;
    }
  };

  const LayerButton: React.FC<{ layer: typeof layers[0] }> = ({ layer }) => {
    const { animatedStyle, shouldBeVisible } = useLayerSelectorAnimation(
      layer.id,
      layer.isVisible,
      activeLayerId === layer.id,
      stemCount
    );

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.layerButton,
            {
              borderColor: activeLayerId === layer.id ? layer.color : (layer.isVisible ? layer.color : '#444444'),
              borderWidth: activeLayerId === layer.id ? 3 : 2,
              backgroundColor: activeLayerId === layer.id ? layer.color + '40' : layer.isVisible ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
              opacity: shouldBeVisible ? (layer.isVisible ? 1 : 0.5) : 0.3,
              transform: [{ scale: activeLayerId === layer.id ? 1.05 : 1 }],
            }
          ]}
          onPress={() => shouldBeVisible && setActiveLayer(layer.id)}
          onLongPress={() => shouldBeVisible && toggleLayerVisibility(layer.id)}
          disabled={!shouldBeVisible}
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
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.layersRow}>
        {layers.map((layer) => (
          <LayerButton key={layer.id} layer={layer} />
        ))}
      </View>
      <Text style={styles.helpText}>
        Tap to select • Long press to hide/show
      </Text>
    </View>
  );
};

export default HorizontalLayerSelector;