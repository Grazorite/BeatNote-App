import React from 'react';
import Svg, { Ellipse, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const OtherIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Beam note heads */}
    <Ellipse cx="8" cy="16" rx="2.5" ry="1.5" fill={color} transform="rotate(-20 8 16)" />
    <Ellipse cx="16" cy="14" rx="2.5" ry="1.5" fill={color} transform="rotate(-20 16 14)" />
    
    {/* Stems */}
    <Path d="M10.5 15V6" stroke={color} strokeWidth="1.5" />
    <Path d="M18.5 13V4" stroke={color} strokeWidth="1.5" />
    
    {/* Beam connecting the notes */}
    <Path d="M10.5 6L18.5 4L18.5 6L10.5 8Z" fill={color} />
  </Svg>
);

export default OtherIcon;