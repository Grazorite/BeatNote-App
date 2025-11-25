import React from 'react';
import { View, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import AnimatedToggle from '../common/AnimatedToggle';
import { canvasOptionsToggleStyles as styles } from '../../../styles/components/controls/canvasOptionsToggle';

const CanvasOptionsToggle: React.FC = () => {
  const { showGhostInTimeline, setShowGhostInTimeline, showTimeline, setShowTimeline, showGridLines, setShowGridLines, magneticSnapping, setMagneticSnapping, showAnnotations, setShowAnnotations } = useStudioStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Canvas Options
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
        marginBottom={8}
      />
      <AnimatedToggle
        label="Magnetic Snapping"
        value={magneticSnapping}
        onToggle={() => setMagneticSnapping(!magneticSnapping)}
      />
    </View>
  );
};

export default CanvasOptionsToggle;