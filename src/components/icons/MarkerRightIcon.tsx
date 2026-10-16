import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRightIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BeatNoteIcon name="marker-next" size={size} color={color} />
);

export default MarkerRightIcon;
