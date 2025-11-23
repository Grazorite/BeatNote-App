import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  pressScale?: number;
  springConfig?: { damping: number; stiffness: number };
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  style,
  pressScale = 0.95,
  springConfig = { damping: 12, stiffness: 400 }
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(pressScale, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig, () => {
      runOnJS(onPress)();
    });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton;