import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { gridLinesToggleStyles as styles } from '../../../styles/components/controls/gridLinesToggle';
import AnimatedToggle from '../common/AnimatedToggle';

const GridLinesToggle: React.FC = () => {
  const { showGridLines, setShowGridLines } = useStudioStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Grid Lines</Text>
      <AnimatedToggle
        isActive={showGridLines}
        onPress={() => setShowGridLines(!showGridLines)}
        activeText="On"
        inactiveText="Off"
        style={styles.toggleButton}
        activeColor="#ff6600"
        inactiveColor="#333333"
        textColor={showGridLines ? '#000000' : '#ffffff'}
      />
    </View>
  );
};

export default GridLinesToggle;