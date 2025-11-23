import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../../../styles/common';

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
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.accent : colors.surface, { duration: 200 }),
    borderColor: withTiming(value ? colors.accent : colors.border, { duration: 200 }),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(value ? colors.background : colors.text, { duration: 200 }),
  }));

  return (
    <Animated.View style={[backgroundStyle, {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom,
    }]}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
        onPress={onToggle}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.textSecondary,
            backgroundColor: value ? colors.background : 'transparent',
            marginRight: 8,
          }}
        />
        <Animated.Text style={[textStyle, { fontSize: 12 }]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedToggle;