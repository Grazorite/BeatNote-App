import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DoubleTriangleIconProps {
  direction: 'left' | 'right';
  size?: number;
  color?: string;
  testID?: string;
}

const DoubleTriangleIcon: React.FC<DoubleTriangleIconProps> = ({
  direction,
  size = 20,
  color = '#ffffff',
  testID,
}) => {
  const paths = direction === 'left'
    ? ['M11 5L4 12L11 19Z', 'M20 5L13 12L20 19Z']
    : ['M4 5L11 12L4 19Z', 'M13 5L20 12L13 19Z'];

  return (
    <Svg testID={testID} width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map(path => (
        <Path
          key={path}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
};

export default React.memo(DoubleTriangleIcon);
