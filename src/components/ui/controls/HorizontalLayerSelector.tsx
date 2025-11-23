import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { VocalsIcon, DrumsIcon, BassIcon, PianoIcon, GuitarIcon, OtherIcon } from '../../icons';

const HorizontalLayerSelector: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility } = useStudioStore();

  const getLayerIcon = (layerId: LayerId, color: string) => {
    const iconProps = { size: 24, color };
    switch (layerId) {
      case 'vocals': return <VocalsIcon {...iconProps} />;
      case 'drums': return <DrumsIcon {...iconProps} />;
      case 'bass': return <BassIcon {...iconProps} />;
      case 'piano': return <PianoIcon {...iconProps} />;
      case 'guitar': return <GuitarIcon {...iconProps} />;
      case 'other': return <OtherIcon {...iconProps} />;
      default: return null;
    }
  };

  return (
    <View style={{
      alignItems: 'center',
      marginVertical: 16,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}>
        {layers.map((layer) => (
          <TouchableOpacity
            key={layer.id}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: layer.isVisible ? layer.color : '#444444',
              backgroundColor: activeLayerId === layer.id ? layer.color + '30' : layer.isVisible ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              minWidth: 100,
              justifyContent: 'center',
              opacity: layer.isVisible ? 1 : 0.5,
            }}
            onPress={() => setActiveLayer(layer.id)}
            onLongPress={() => toggleLayerVisibility(layer.id)}
          >
            {getLayerIcon(layer.id, layer.isVisible ? layer.color : '#666666')}
            <Text style={{
              color: layer.isVisible ? layer.color : '#666666',
              fontSize: 16,
              fontWeight: activeLayerId === layer.id ? 'bold' : '600',
            }}>
              {layer.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{
        textAlign: 'center',
        color: '#888888',
        fontSize: 12,
        marginTop: 8,
      }}>
        Tap to select • Long press to hide/show
      </Text>
    </View>
  );
};

export default HorizontalLayerSelector;