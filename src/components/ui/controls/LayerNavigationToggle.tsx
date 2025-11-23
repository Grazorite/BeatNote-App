import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import AnimatedToggle from '../common/AnimatedToggle';

const LayerNavigationToggle: React.FC = () => {
  const { layerSpecificNavigation, setLayerSpecificNavigation } = useStudioStore();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
        Marker Selection
      </Text>
      <AnimatedToggle
        label="Active Layer Only"
        value={layerSpecificNavigation}
        onToggle={() => setLayerSpecificNavigation(!layerSpecificNavigation)}
      />
    </View>
  );
};

export default LayerNavigationToggle;