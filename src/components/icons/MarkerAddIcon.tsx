import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerAddIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BeatNoteIcon name="marker-add" size={size} color={color} />
);

export default MarkerAddIcon;
