import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SkipBackIconProps {
  size?: number;
  color?: string;
}

const SkipBackIcon: React.FC<SkipBackIconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6h2v12H6zm3.5 6l8.5 6V6z"
        fill={color}
      />
    </Svg>
  );
};

export default SkipBackIcon;