import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const BassIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Bass guitar body */}
    <Path
      d="M8 6C6.9 6 6 6.9 6 8V16C6 17.1 6.9 18 8 18H10V6H8Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    {/* Neck */}
    <Path d="M10 6H18V18H10" stroke={color} strokeWidth="1.5" fill="none" />
    {/* Strings */}
    <Path d="M10 9H18M10 11H18M10 13H18M10 15H18" stroke={color} strokeWidth="1" />
    {/* Tuning pegs */}
    <Circle cx="19" cy="9" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="19" cy="11" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="19" cy="13" r="1" stroke={color} strokeWidth="1" fill="none" />
    <Circle cx="19" cy="15" r="1" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

export default BassIcon;