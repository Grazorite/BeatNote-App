import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';

const LayerNavigationToggle: React.FC = () => {
  const { layerSpecificNavigation, setLayerSpecificNavigation } = useStudioStore();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
        Marker Navigation
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: layerSpecificNavigation ? colors.accent : colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: layerSpecificNavigation ? colors.accent : colors.border,
        }}
        onPress={() => setLayerSpecificNavigation(!layerSpecificNavigation)}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: layerSpecificNavigation ? colors.background : 'transparent',
            borderWidth: 2,
            borderColor: layerSpecificNavigation ? colors.background : colors.textSecondary,
            marginRight: 8,
          }}
        />
        <Text style={{ color: layerSpecificNavigation ? colors.background : colors.text, fontSize: 12 }}>
          Active Layer Only
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LayerNavigationToggle;