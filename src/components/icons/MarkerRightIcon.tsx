import React from 'react';
import { View } from 'react-native';
import { Bookmark, ArrowRight } from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRightIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <Bookmark size={size} color={color} />
    <ArrowRight size={size * 0.8} color={color} />
  </View>
);

export default MarkerRightIcon;