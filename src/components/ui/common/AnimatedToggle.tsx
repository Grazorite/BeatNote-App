import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor 
} from 'react-native-reanimated';

interface AnimatedToggleProps {
  isActive: boolean;
  onPress: () => void;
  activeText: string;
  inactiveText: string;
  style?: any;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
}

const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  isActive,
  onPress,
  activeText,
  inactiveText,
  style,
  activeColor = '#ff6600',
  inactiveColor = '#333333',
  textColor = '#ffffff'
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isActive ? activeColor : inactiveColor,
      { duration: 150 }
    ),
    transform: [
      { scale: withSpring(isActive ? 1.02 : 1, { damping: 15 }) }
    ]
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 100 }),
    color: withTiming(textColor, { duration: 100 })
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[style, animatedStyle]}>
        <Animated.Text style={textAnimatedStyle}>
          {isActive ? activeText : inactiveText}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedToggle;