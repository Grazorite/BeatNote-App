import React from 'react';
import { View } from 'react-native';
import { Bookmark, Repeat2 } from 'lucide-react-native';

interface LoopMarkerIconProps {
  size?: number;
  color?: string;
}

/** Marker-bounded loop: a bookmark paired with a repeat glyph. */
const LoopMarkerIcon: React.FC<LoopMarkerIconProps> = ({ size = 24, color = '#ffffff' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    <Bookmark size={size} color={color} />
    <Repeat2 size={size * 0.8} color={color} />
  </View>
);

export default LoopMarkerIcon;
