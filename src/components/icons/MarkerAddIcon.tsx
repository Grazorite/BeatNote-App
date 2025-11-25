import React from 'react';
import { BookmarkPlus } from 'lucide-react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerAddIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BookmarkPlus size={size} color={color} />
);

export default MarkerAddIcon;