import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../../styles/common';

interface GlassBackdropProps {
  gradientId: string;
  radius?: number;
  testID?: string;
  variant?: 'surface' | 'toast' | 'callout';
}

/** A quiet, non-interactive glass tint shared by the mobile annotation and dock surfaces. */
const GlassBackdrop: React.FC<GlassBackdropProps> = ({
  gradientId,
  radius = 12,
  testID,
  variant = 'surface',
}) => {
  const isToast = variant === 'toast';
  const isCallout = variant === 'callout';
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) setLayout({ width, height });
  };
  const measured = layout.width > 0 && layout.height > 0;
  return (
    <View testID={testID} pointerEvents="none" style={StyleSheet.absoluteFillObject} onLayout={onLayout}>
      <Svg
        key={`${gradientId}-${layout.width}-${layout.height}`}
        width={measured ? layout.width : '100%'}
        height={measured ? layout.height : '100%'}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.glassTop} stopOpacity={isToast ? 0.46 : isCallout ? 0.68 : 0.72} />
            <Stop offset="0.48" stopColor={colors.glassMiddle} stopOpacity={isToast ? 0.54 : isCallout ? 0.75 : 0.78} />
            <Stop offset="1" stopColor={colors.glassBottom} stopOpacity={isToast ? 0.7 : isCallout ? 0.84 : 0.94} />
          </LinearGradient>
        </Defs>
        <Rect
          width={measured ? layout.width : '100%'}
          height={measured ? layout.height : '100%'}
          rx={radius}
          fill={`url(#${gradientId})`}
        />
        <Rect
          x={0.5}
          y={0.5}
          width={measured ? Math.max(0, layout.width - 1) : '99.7%'}
          height={measured ? Math.max(0, layout.height - 1) : '98.5%'}
          rx={radius}
          fill="none"
          stroke={colors.glassHighlight}
          strokeOpacity={isToast ? 0.1 : 0.12}
        />
      </Svg>
    </View>
  );
};

export default React.memo(GlassBackdrop);
