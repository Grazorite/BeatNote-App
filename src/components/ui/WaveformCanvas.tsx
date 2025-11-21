import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

interface WaveformCanvasProps {
  pathData: string;
  markers: number[];
}

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  pathData,
  markers,
}) => {
  return (
    <Svg width={800} height={300} style={styles.canvas}>
      <Path
        d={pathData}
        stroke="#00ff00"
        strokeWidth={3}
        fill="none"
      />
      {markers.map((marker, index) => {
        const xPosition = (marker / 1000) * 100;
        return (
          <Line
            key={`${marker}-${index}`}
            x1={xPosition % 800}
            y1={0}
            x2={xPosition % 800}
            y2={300}
            stroke="#ff0000"
            strokeWidth={3}
          />
        );
      })}
    </Svg>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: 800,
    height: 300,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
});

export default WaveformCanvas;