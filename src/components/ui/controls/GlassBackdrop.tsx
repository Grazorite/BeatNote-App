import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface GlassBackdropProps {
  gradientId: string;
  radius?: number;
  testID?: string;
}

/** A quiet, non-interactive glass tint shared by the mobile annotation and dock surfaces. */
const GlassBackdrop: React.FC<GlassBackdropProps> = ({ gradientId, radius = 12, testID }) => (
  <View testID={testID} pointerEvents="none" style={StyleSheet.absoluteFillObject}>
    <Svg width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#383842" stopOpacity={0.72} />
          <Stop offset="0.48" stopColor="#202027" stopOpacity={0.78} />
          <Stop offset="1" stopColor="#0b0b0f" stopOpacity={0.94} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" rx={radius} fill={`url(#${gradientId})`} />
      <Rect
        x={0.5}
        y={0.5}
        width="99.7%"
        height="98.5%"
        rx={radius}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.12}
      />
    </Svg>
  </View>
);

export default React.memo(GlassBackdrop);
