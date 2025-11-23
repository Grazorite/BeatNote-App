import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import AnimatedToggle from '../common/AnimatedToggle';

const CanvasToggle: React.FC = () => {
  const { showGhostInTimeline, setShowGhostInTimeline, showTimeline, setShowTimeline, showGridLines, setShowGridLines } = useStudioStore();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
        Canvas
      </Text>
      <AnimatedToggle
        label="Ghost Playhead in Timeline"
        value={showGhostInTimeline}
        onToggle={() => setShowGhostInTimeline(!showGhostInTimeline)}
        marginBottom={8}
      />
      <AnimatedToggle
        label="Show Timeline"
        value={showTimeline}
        onToggle={() => setShowTimeline(!showTimeline)}
        marginBottom={8}
      />
      <AnimatedToggle
        label="Show Grid Lines"
        value={showGridLines}
        onToggle={() => setShowGridLines(!showGridLines)}
      />
    </View>
  );
};

export default CanvasToggle;