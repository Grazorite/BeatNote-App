import React from 'react';
import { View, Text } from 'react-native';
import { Layers, BarChart3 } from 'lucide-react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import VerticalSegmentedControl from '../ui/common/VerticalSegmentedControl';

const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStudioStore();
  
  const options = [
    { label: 'Unified', description: 'Single waveform view' },
    { label: 'Multitrack', description: 'Separate stem tracks' }
  ];
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
      <VerticalSegmentedControl
        options={options}
        selectedIndex={selectedIndex}
        onSelectionChange={handleSelectionChange}
        showIcons={true}
        iconType="viewMode"
      />
    </View>
  );
};



export default ViewModeToggle;