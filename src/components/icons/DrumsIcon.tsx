import React from 'react';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const DrumsIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Drum body */}
    <Ellipse cx="12" cy="8" rx="6" ry="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M6 8V16C6 17.1 8.7 18 12 18C15.3 18 18 17.1 18 16V8" stroke={color} strokeWidth="1.5" fill="none" />
    <Ellipse cx="12" cy="16" rx="6" ry="2" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Drumsticks */}
    <Path d="M4 4L8 8" stroke={color} strokeWidth="1.5" />
    <Path d="M20 4L16 8" stroke={color} strokeWidth="1.5" />
    <Circle cx="4" cy="4" r="1" fill={color} />
    <Circle cx="20" cy="4" r="1" fill={color} />
  </Svg>
);

export default DrumsIcon;