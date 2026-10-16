import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BeatNoteIcon name="marker-previous" size={size} color={color} />
);

export default MarkerLeftIcon;
