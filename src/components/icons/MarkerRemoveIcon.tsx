import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BeatNoteIcon name="marker-remove" size={size} color={color} />
);

export default MarkerRemoveIcon;
