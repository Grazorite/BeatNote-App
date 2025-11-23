import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon
      points="4,2 20,2 20,17 12,22 4,17"
      fill={color}
    />
  </Svg>
);

export default MarkerIcon;