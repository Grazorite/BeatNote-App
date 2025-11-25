import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Layers, BarChart3, Layers2, Layers3, Grid2X2 } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
  useDerivedValue
} from 'react-native-reanimated';

interface VerticalSegmentedControlProps {
  options: { label: string; description: string }[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  activeColor?: string;
  backgroundColor?: string;
  showIcons?: boolean;
  iconType?: 'viewMode' | 'stems';
}

const getViewModeIcon = (label: string, color: string) => {
  const iconProps = { size: 18, color };
  switch (label.toLowerCase()) {
    case 'unified': return <Layers {...iconProps} />;
    case 'multitrack': return <BarChart3 {...iconProps} />;
    default: return null;
  }
};

const getStemIcon = (label: string, color: string) => {
  const iconProps = { size: 18, color };
  switch (label) {
    case '2 Stems': return <Layers2 {...iconProps} />;
    case '4 Stems': return <Grid2X2 {...iconProps} />;
    case '6 Stems': return <Layers3 {...iconProps} />;
    default: return null;
  }
};

const VerticalSegmentedControl: React.FC<VerticalSegmentedControlProps> = ({
  options,
  selectedIndex,
  onSelectionChange,
  activeColor = '#ff6600',
  backgroundColor = '#222222',
  showIcons = false,
  iconType = 'viewMode'
}) => {
  const segmentHeight = useSharedValue(0);
  const translateY = useDerivedValue(() => {
    return withTiming((segmentHeight.value * selectedIndex), { duration: 200 });
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: segmentHeight.value,
    backgroundColor: `${activeColor}20`,
    borderColor: activeColor,
  }));

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    const totalPadding = 8; // 4px top + 4px bottom padding
    segmentHeight.value = (height - totalPadding) / options.length;
  };

  return (
    <View style={{
      flexDirection: 'column',
      backgroundColor,
      borderRadius: 8,
      padding: 4,
      position: 'relative'
    }} onLayout={onLayout}>
      <Animated.View style={[{
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        borderRadius: 6,
        borderWidth: 2,
      }, animatedIndicatorStyle]} />
      
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
            zIndex: 1,
          }}
          onPress={() => onSelectionChange(index)}
        >
          <View style={{ alignItems: 'center', gap: 4 }}>
            {showIcons && iconType === 'viewMode' && getViewModeIcon(option.label, selectedIndex === index ? activeColor : '#cccccc')}
            {showIcons && iconType === 'stems' && getStemIcon(option.label, selectedIndex === index ? activeColor : '#cccccc')}
            <Text style={{
              color: selectedIndex === index ? activeColor : '#cccccc',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              {option.label}
            </Text>
            <Text style={{
              color: '#888888',
              fontSize: 9,
              textAlign: 'center',
            }}>
              {option.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default VerticalSegmentedControl;