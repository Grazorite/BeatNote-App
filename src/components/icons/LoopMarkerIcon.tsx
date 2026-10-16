import React from 'react';
import BeatNoteIcon from './BeatNoteIcon';

interface LoopMarkerIconProps {
  size?: number;
  color?: string;
  testID?: string;
}

/** Marker-bounded loop: a bookmark paired with a repeat glyph. */
const LoopMarkerIcon: React.FC<LoopMarkerIconProps> = ({ size = 24, color = '#ffffff', testID }) => (
  <BeatNoteIcon testID={testID} name="marker-loop" size={size} color={color} />
);

export default LoopMarkerIcon;
