import React from 'react';
import Svg, { Polygon, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Svg width={size * 2} height={size} viewBox="0 0 48 24" fill="none">
    <Polygon
      points="4,2 20,2 20,17 12,22 4,17"
      fill={color}
    />
    <Line
      x1="30"
      y1="12"
      x2="42"
      y2="12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);

export default MarkerRemoveIcon;