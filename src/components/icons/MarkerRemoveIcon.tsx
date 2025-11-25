import React from 'react';
import { BookmarkMinus } from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BookmarkMinus size={size} color={color} />
);

export default MarkerRemoveIcon;