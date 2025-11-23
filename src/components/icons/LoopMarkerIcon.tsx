import React from 'react';
import Svg, { Polygon, Path } from 'react-native-svg';

interface LoopMarkerIconProps {
  size?: number;
  color?: string;
}

const LoopMarkerIcon: React.FC<LoopMarkerIconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <Svg width={size * 2} height={size} viewBox="0 0 48 24" fill="none">
      <Polygon
        points="4,2 20,2 20,17 12,22 4,17"
        fill={color}
      />
      <Path
        d="M31 5h10v3l4-4-4-4v3H29v6h2V5zM41 19H31v-3l-4 4 4 4v-3h12v-6h-2v4z"
        fill={color}
      />
    </Svg>
  );
};

export default LoopMarkerIcon;