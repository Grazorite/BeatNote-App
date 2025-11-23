import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const OtherIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* First note (higher) */}
    <Circle cx="7" cy="8" r="2" fill={color} />
    <Path d="M9 8V3" stroke={color} strokeWidth="1.5" />
    
    {/* Second note (lower) */}
    <Circle cx="16" cy="16" r="2" fill={color} />
    <Path d="M18 16V11" stroke={color} strokeWidth="1.5" />
    
    {/* Third note (top right) */}
    <Circle cx="18" cy="6" r="2" fill={color} />
    <Path d="M20 6V2" stroke={color} strokeWidth="1.5" />
  </Svg>
);

export default OtherIcon;