import React from 'react';
import { Bookmark } from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Bookmark size={size} color={color} />
);

export default MarkerIcon;