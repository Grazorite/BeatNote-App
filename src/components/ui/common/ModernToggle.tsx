import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useModernToggleAnimation } from '../../../hooks/useModernToggleAnimation';
import { modernToggleStyles as styles } from '../../../styles/components/common/modernToggle';

interface ModernToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  marginBottom?: number;
}

const ModernToggle: React.FC<ModernToggleProps> = ({ 
  label, 
  value, 
  onToggle, 
  marginBottom = 0 
}) => {
  const { trackStyle, thumbStyle, labelStyle } = useModernToggleAnimation(value);

  return (
    <View style={[styles.container, { marginBottom }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default ModernToggle;