import React from 'react';
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
    <AnimatedSegmentedControl
      options={options}
      selectedIndex={selectedIndex}
      onSelectionChange={handleSelectionChange}
      style={{ marginBottom: 10 }}
    />
  );
};



export default ViewModeToggle;