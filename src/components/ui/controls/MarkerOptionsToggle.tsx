import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import AnimatedToggle from '../common/AnimatedToggle';
import { markerOptionsToggleStyles as styles } from '../../../styles/components/controls/markerOptionsToggle';

const MarkerOptionsToggle: React.FC = () => {
  const { layerSpecificNavigation, setLayerSpecificNavigation, showAnnotations, setShowAnnotations } = useStudioStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Marker Options
      </Text>
      <AnimatedToggle
        label="Active Layer Only"
        value={layerSpecificNavigation}
        onToggle={() => setLayerSpecificNavigation(!layerSpecificNavigation)}
        marginBottom={8}
      />
      <AnimatedToggle
        label="Show Annotations"
        value={showAnnotations}
        onToggle={() => setShowAnnotations(!showAnnotations)}
      />
    </View>
  );
};

export default MarkerOptionsToggle;