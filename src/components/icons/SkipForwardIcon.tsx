import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SkipForwardIconProps {
  size?: number;
  color?: string;
}

const SkipForwardIcon: React.FC<SkipForwardIconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
        fill={color}
      />
    </Svg>
  );
};

export default SkipForwardIcon;