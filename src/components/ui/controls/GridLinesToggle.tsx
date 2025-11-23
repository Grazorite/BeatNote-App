import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';

const GridLinesToggle: React.FC = () => {
  const { showGridLines, setShowGridLines } = useStudioStore();

  return (
    <View>
      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>Grid Lines</Text>
      <TouchableOpacity
        onPress={() => setShowGridLines(!showGridLines)}
        style={{
          backgroundColor: showGridLines ? colors.accent : colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: showGridLines ? colors.background : colors.text, fontSize: 14 }}>
          {showGridLines ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GridLinesToggle;