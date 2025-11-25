import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useAnimatedCollapse } from '../../../hooks/useAnimatedCollapse';
import ModernToggle from '../common/ModernToggle';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
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
          <ChevronUp size={20} color="#ffffff" />
        ) : (
          <ChevronDown size={20} color="#ffffff" />
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