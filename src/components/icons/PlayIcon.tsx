import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PlayIconProps {
  size?: number;
  color?: string;
}

const PlayIcon: React.FC<PlayIconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5v14l11-7z"
        fill={color}
      />
    </Svg>
  );
};

export default PlayIcon;