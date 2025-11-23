import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const GuitarIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.59 3L21 4.41L16.17 9.24C16.87 10.39 17.5 11.67 17.5 13.5C17.5 17.09 14.59 20 11 20H9.5C7.01 20 5 17.99 5 15.5V14C5 10.41 7.91 7.5 11.5 7.5C13.33 7.5 14.61 8.13 15.76 8.83L19.59 3ZM11.5 9.5C9.01 9.5 7 11.51 7 14V15.5C7 16.88 8.12 18 9.5 18H11C13.48 18 15.5 15.98 15.5 13.5C15.5 11.02 13.48 9.5 11.5 9.5ZM10 12C10.55 12 11 12.45 11 13S10.55 14 10 14 9 13.55 9 13 9.45 12 10 12ZM13 15C13.55 15 14 15.45 14 16S13.55 17 13 17 12 16.55 12 16 12.45 15 13 15Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

export default GuitarIcon;