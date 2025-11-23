import React from 'react';
import Svg, { Polygon, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const MarkerRightIcon: React.FC<IconProps> = ({ size = 20, color = '#ffffff' }) => (
  <Svg width={size * 2} height={size} viewBox="0 0 48 24" fill="none">
    <Line
      x1="6"
      y1="12"
      x2="18"
      y2="12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="7.5"
      x2="18"
      y2="12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="16.5"
      x2="18"
      y2="12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Polygon
      points="28,2 44,2 44,17 36,22 28,17"
      fill={color}
    />
  </Svg>
);

export default MarkerRightIcon;