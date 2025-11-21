import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';

export default function StudioScreen() {
  const offset = useSharedValue(0);
  const [pathData, setPathData] = useState('');

  const createWaveformPath = (offsetX: number) => {
    let path = 'M 0 100';
    for (let x = 0; x < 400; x += 4) {
      const y = 100 + Math.sin((x + offsetX) * 0.02) * 30;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  useFrameCallback(() => {
    offset.value += 2;
    if (offset.value > 400) {
      offset.value = 0;
    }
    setPathData(createWaveformPath(offset.value));
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeatNote Studio</Text>
      <Svg width={400} height={200} style={styles.canvas}>
        <Path
          d={pathData}
          stroke="#00ff00"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
      <Text style={styles.subtitle}>Animated SVG waveform visualization</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  canvas: {
    width: 400,
    height: 200,
    marginBottom: 20,
  },
  subtitle: {
    color: '#999999',
    fontSize: 14,
  },
});