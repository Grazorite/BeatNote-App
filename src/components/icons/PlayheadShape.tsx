import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface PlayheadShapeProps {
  size?: number;
  color?: string;
  direction?: 'up' | 'down';
  strokeColor?: string;
  strokeWidth?: number;
}

const PlayheadShape: React.FC<PlayheadShapeProps> = ({ 
  size = 20, 
  color = '#ffffff',
  direction = 'up',
  strokeColor = '#000000',
  strokeWidth = 1
}) => {
  // Different point sets for up/down directions
  const upPoints = "4,2 20,2 20,17 12,22 4,17";
  const downPoints = "4,22 20,22 20,7 12,2 4,7";
  
  const points = direction === 'down' ? downPoints : upPoints;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points={points}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default PlayheadShape;