import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import AnimatedSegmentedControl from '../ui/common/AnimatedSegmentedControl';

const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStudioStore();
  
  const options = ['Unified', 'Multitrack'];
  const selectedIndex = viewMode === 'unified' ? 0 : 1;
  
  const handleSelectionChange = (index: number) => {
    setViewMode(index === 0 ? 'unified' : 'multitrack');
  };

  return (
    <View style={{ marginBottom: 15, width: '100%' }}>
      <Text style={{
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
      }}>
        View Mode
      </Text>
      <AnimatedSegmentedControl
        options={options}
        selectedIndex={selectedIndex}
        onSelectionChange={handleSelectionChange}
      />
    </View>
  );
};



export default ViewModeToggle;