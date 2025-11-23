import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import AnimatedToggle from '../common/AnimatedToggle';
import { layerNavigationToggleStyles as styles } from '../../../styles/components/controls/layerNavigationToggle';

const LayerNavigationToggle: React.FC = () => {
  const { layerSpecificNavigation, setLayerSpecificNavigation } = useStudioStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
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