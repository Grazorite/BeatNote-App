import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const PianoIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" stroke={color} strokeWidth="1.5" fill="none" />
    <Rect x="6" y="6" width="0.5" height="12" fill={color} />
    <Rect x="9" y="6" width="0.5" height="12" fill={color} />
    <Rect x="12" y="6" width="0.5" height="12" fill={color} />
    <Rect x="15" y="6" width="0.5" height="12" fill={color} />
    <Rect x="18" y="6" width="0.5" height="12" fill={color} />
    <Rect x="7.5" y="6" width="1" height="7" fill={color} />
    <Rect x="10.5" y="6" width="1" height="7" fill={color} />
    <Rect x="13.5" y="6" width="1" height="7" fill={color} />
    <Rect x="16.5" y="6" width="1" height="7" fill={color} />
  </Svg>
);

export default PianoIcon;