import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import AnimatedToggle from '../common/AnimatedToggle';

const GridLinesToggle: React.FC = () => {
  const { showGridLines, setShowGridLines } = useStudioStore();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
        Grid Lines
      </Text>
      <AnimatedToggle
        label="Show Grid Lines"
        value={showGridLines}
        onToggle={() => setShowGridLines(!showGridLines)}
      />
    </View>
  );
};

export default GridLinesToggle;