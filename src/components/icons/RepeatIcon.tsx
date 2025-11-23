import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface RepeatIconProps {
  size?: number;
  color?: string;
}

const RepeatIcon: React.FC<RepeatIconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 7h10v3l4-4-4-4v3H5v6h2V7zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
        fill={color}
      />
    </Svg>
  );
};

export default RepeatIcon;