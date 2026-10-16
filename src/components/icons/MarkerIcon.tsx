import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <BeatNoteIcon name="marker" size={size} color={color} />
);

export default MarkerIcon;
