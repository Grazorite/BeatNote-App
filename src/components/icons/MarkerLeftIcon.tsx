import React from 'react';
import { View } from 'react-native';
import { ArrowLeft, Bookmark } from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <ArrowLeft size={size * 0.8} color={color} />
    <Bookmark size={size} color={color} />
  </View>
);

export default MarkerLeftIcon;