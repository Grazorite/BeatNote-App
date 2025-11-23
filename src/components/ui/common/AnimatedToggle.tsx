import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors } from '../../../styles/common';
import { useAnimatedToggleStyles } from '../../../animations/components/animatedToggle';
import { animatedToggleStyles as styles } from '../../../styles/components/common/animatedToggle';

interface AnimatedToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  marginBottom?: number;
}

const AnimatedToggle: React.FC<AnimatedToggleProps> = ({ 
  label, 
  value, 
  onToggle, 
  marginBottom = 0 
}) => {
  const { backgroundStyle, textStyle } = useAnimatedToggleStyles(value);

  return (
    <Animated.View style={[backgroundStyle, styles.container, { marginBottom }]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onToggle}
      >
        <View
          style={[
            styles.circle,
            { backgroundColor: value ? colors.background : 'transparent' }
          ]}
        />
        <Animated.Text style={[textStyle, styles.text]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedToggle;