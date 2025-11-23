import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore, LayerId } from '../../../hooks/useStudioStore';
import { VocalsIcon, DrumsIcon, BassIcon, PianoIcon, GuitarIcon, OtherIcon } from '../../icons';

const HorizontalLayerSelector: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer } = useStudioStore();

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
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginVertical: 16,
    }}>
      {layers.map((layer) => (
        <TouchableOpacity
          key={layer.id}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: layer.color,
            backgroundColor: activeLayerId === layer.id ? layer.color + '30' : 'rgba(255,255,255,0.05)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            minWidth: 100,
            justifyContent: 'center',
          }}
          onPress={() => setActiveLayer(layer.id)}
        >
          {getLayerIcon(layer.id, layer.color)}
          <Text style={{
            color: layer.color,
            fontSize: 16,
            fontWeight: activeLayerId === layer.id ? 'bold' : '600',
          }}>
            {layer.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HorizontalLayerSelector;