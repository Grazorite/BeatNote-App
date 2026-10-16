import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { useLayerSelectorAnimation } from '../../../hooks/useLayerSelectorAnimation';
import { BeatNoteIcon, BeatNoteIconName } from '../../icons';
import { horizontalLayerSelectorStyles as styles } from '../../../styles/components/controls/horizontalLayerSelector';

const HorizontalLayerSelector: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility, stemCount } = useStudioStore();

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
    return name ? <BeatNoteIcon name={name} size={24} color={color} /> : null;
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
          testID={`layer-${layer.id}`}
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
      <Text style={styles.heading}>Annotation layers</Text>
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
