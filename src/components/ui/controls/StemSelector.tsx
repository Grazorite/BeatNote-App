import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import VerticalSegmentedControl from '../common/VerticalSegmentedControl';

const StemSelector: React.FC = () => {
  const { stemCount, setStemCount } = useStudioStore();

  const stemOptions = [
    { label: '2 Stems', description: 'Vocals, Other' },
    { label: '4 Stems', description: 'Vocals, Drums, Bass, Other' },
    { label: '6 Stems', description: 'Vocals, Drums, Bass, Piano, Guitar, Other' },
  ];

  const selectedIndex = stemCount === 2 ? 0 : stemCount === 4 ? 1 : 2;

  const handleSelectionChange = (index: number) => {
    const counts = [2, 4, 6] as const;
    setStemCount(counts[index]);
  };

  return (
    <View style={{ marginBottom: 15, width: '100%' }}>
      <Text style={{
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
      }}>
        Stem Separation
      </Text>
      <VerticalSegmentedControl
        options={stemOptions}
        selectedIndex={selectedIndex}
        onSelectionChange={handleSelectionChange}
        showIcons={true}
        iconType="stems"
      />
    </View>
  );
};



export default StemSelector;