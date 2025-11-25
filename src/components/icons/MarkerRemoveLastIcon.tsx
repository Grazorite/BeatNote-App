import React from 'react';
import { View } from 'react-native';
import { BookmarkX, ArrowLeft } from 'lucide-react-native';

interface MarkerRemoveLastIconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveLastIcon: React.FC<MarkerRemoveLastIconProps> = ({ 
  size = 20, 
  color = '#ffffff' 
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, opacity: 0.6 }}>
      <ArrowLeft size={size * 0.8} color={color} />
      <BookmarkX size={size} color={color} />
    </View>
  );
};

export default MarkerRemoveLastIcon;