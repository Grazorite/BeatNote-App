import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useAnimatedCollapse } from '../../../hooks/useAnimatedCollapse';
import ModernToggle from '../common/ModernToggle';
import { BeatNoteIcon } from '../../icons';
import { markerOptionsToggleStyles as styles } from '../../../styles/components/controls/markerOptionsToggle';

const MarkerOptionsToggle: React.FC = () => {
  const { layerSpecificNavigation, setLayerSpecificNavigation, showAnnotations, setShowAnnotations } = useStudioStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const { animatedStyle } = useAnimatedCollapse(isExpanded);

  return (
    <View style={[styles.container, { marginBottom: isExpanded ? 12 : 8 }]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.label}>
          Marker Options
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
            label="Active Layer Only"
            value={layerSpecificNavigation}
            onToggle={() => setLayerSpecificNavigation(!layerSpecificNavigation)}
            marginBottom={8}
          />
          <ModernToggle
            label="Show Annotations"
            value={showAnnotations}
            onToggle={() => setShowAnnotations(!showAnnotations)}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default MarkerOptionsToggle;
