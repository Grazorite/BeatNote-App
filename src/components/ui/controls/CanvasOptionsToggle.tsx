import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useAnimatedCollapse } from '../../../hooks/useAnimatedCollapse';
import ModernToggle from '../common/ModernToggle';
import { BeatNoteIcon } from '../../icons';
import { canvasOptionsToggleStyles as styles } from '../../../styles/components/controls/canvasOptionsToggle';

const CanvasOptionsToggle: React.FC = () => {
  const { showGhostInTimeline, setShowGhostInTimeline, showTimeline, setShowTimeline, showGridLines, setShowGridLines, magneticSnapping, setMagneticSnapping, showAnnotations, setShowAnnotations } = useStudioStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const { animatedStyle } = useAnimatedCollapse(isExpanded);

  return (
    <View style={[styles.container, { marginBottom: isExpanded ? 12 : 8 }]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.label}>
          Canvas Options
        </Text>
        {isExpanded ? (
          <BeatNoteIcon name="chevron-up" size={20} />
        ) : (
          <BeatNoteIcon name="chevron-down" size={20} />
        )}
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View style={[styles.content, animatedStyle]}>
          <ModernToggle
            label="Ghost Playhead in Timeline"
            value={showGhostInTimeline}
            onToggle={() => setShowGhostInTimeline(!showGhostInTimeline)}
            marginBottom={8}
          />
          <ModernToggle
            label="Show Loop Overview"
            value={showTimeline}
            onToggle={() => setShowTimeline(!showTimeline)}
            marginBottom={8}
          />
          <ModernToggle
            label="Show Grid Lines"
            value={showGridLines}
            onToggle={() => setShowGridLines(!showGridLines)}
            marginBottom={8}
          />
          <ModernToggle
            label="Magnetic Snapping"
            value={magneticSnapping}
            onToggle={() => setMagneticSnapping(!magneticSnapping)}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default CanvasOptionsToggle;
