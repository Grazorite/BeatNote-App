import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
  useDerivedValue
} from 'react-native-reanimated';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  style?: any;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
}

const AnimatedSegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onSelectionChange,
  style,
  activeColor = '#ff6600',
  inactiveColor = 'transparent',
  backgroundColor = '#222222'
}) => {
  const segmentWidth = useSharedValue(0);
  const translateX = useDerivedValue(() => {
    return withTiming((segmentWidth.value * selectedIndex), { duration: 250 });
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth.value,
    backgroundColor: activeColor,
  }));

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    segmentWidth.value = width / options.length;
  };

  return (
    <View style={[{
      flexDirection: 'row',
      backgroundColor,
      borderRadius: 8,
      padding: 4,
      position: 'relative'
    }, style]} onLayout={onLayout}>
      <Animated.View style={[{
        position: 'absolute',
        top: 4,
        left: 4,
        bottom: 4,
        borderRadius: 6,
      }, animatedIndicatorStyle]} />
      
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
            zIndex: 1,
          }}
          onPress={() => onSelectionChange(index)}
        >
          <Text style={{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AnimatedSegmentedControl;