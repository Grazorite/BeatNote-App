import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface MarkerRemoveLastIconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveLastIcon: React.FC<MarkerRemoveLastIconProps> = ({ 
  size = 20, 
  color = '#ffffff' 
}) => {
  return <BeatNoteIcon name="marker-remove-previous" size={size} color={color} />;
};

export default MarkerRemoveLastIcon;
