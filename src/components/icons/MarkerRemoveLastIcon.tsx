import React from 'react';
import Svg, { Polygon, Line } from 'react-native-svg';

interface MarkerRemoveLastIconProps {
  size?: number;
  color?: string;
}

const MarkerRemoveLastIcon: React.FC<MarkerRemoveLastIconProps> = ({ 
  size = 20, 
  color = '#ffffff' 
}) => {
  return (
    <Svg width={size * 2} height={size} viewBox="0 0 48 24" fill="none">
      {/* Marker polygon */}
      <Polygon
        points="4,2 20,2 20,17 12,22 4,17"
        fill={color}
      />
      {/* Dotted left arrow */}
      <Line
        x1="42"
        y1="12"
        x2="30"
        y2="12"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="3,2"
      />
      <Line
        x1="36"
        y1="7.5"
        x2="30"
        y2="12"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="3,2"
      />
      <Line
        x1="36"
        y1="16.5"
        x2="30"
        y2="12"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="3,2"
      />
      {/* Slash through arrow */}
      <Line
        x1="28"
        y1="6"
        x2="44"
        y2="18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default MarkerRemoveLastIcon;