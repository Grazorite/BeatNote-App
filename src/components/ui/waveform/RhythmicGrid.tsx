import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Text } from 'react-native-svg';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { rhythmicGridStyles as styles } from '../../../styles/components/waveform/rhythmicGrid';
import { colors, dimensions } from '../../../styles/common';

interface RhythmicGridProps {
  width: number;
  pixelsPerSecond: number;
  overlayHeight?: number;
}

const RhythmicGrid: React.FC<RhythmicGridProps> = ({ width, pixelsPerSecond, overlayHeight = 300 }) => {
  const { bpm, viewportStartTime } = useStudioStore();
  
  const pixelsPerBeat = (pixelsPerSecond * 60) / bpm;
  const startBeat = Math.floor((viewportStartTime / 1000) * (bpm / 60));
  const endBeat = Math.ceil(((viewportStartTime + (width / pixelsPerSecond * 1000)) / 1000) * (bpm / 60));
  
  const rulerHeight = dimensions.ruler.height;
  const rulerLines = [];
  const majorLines = []; // Lines that extend into waveform
  
  for (let beat = startBeat; beat <= endBeat; beat++) {
    const beatTimeMs = (beat / (bpm / 60)) * 1000;
    const x = (beatTimeMs - viewportStartTime) / 1000 * pixelsPerSecond;
    
    if (x >= 0 && x <= width) {
      const isEighthCount = beat % 8 === 0;
      const isFourthCount = beat % 4 === 0 && beat % 8 !== 0;
      const isDownbeat = beat % 4 === 0;
      
      // Ruler lines (all beats)
      rulerLines.push(
        <Line
          key={`ruler-${beat}`}
          x1={x}
          y1={0}
          x2={x}
          y2={isEighthCount ? rulerHeight : (isFourthCount ? rulerHeight * 0.8 : rulerHeight * 0.6)}
          stroke={isEighthCount ? colors.gridMajor : (isFourthCount ? colors.gridMiddle : colors.gridMinor)}
          strokeWidth={isEighthCount ? 2 : (isFourthCount ? 1.5 : 1)}
          opacity={0.8}
        />
      );
      
      // Add measure numbers to ruler for major lines
      if (isEighthCount) {
        const measureNumber = Math.floor(beat / 8) + 1;
        rulerLines.push(
          <Text
            key={`measure-${beat}`}
            x={x + 3}
            y={rulerHeight - 3}
            fill={colors.text}
            fontSize={10}
            opacity={0.8}
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
          >
            {measureNumber}
          </Text>
        );
      }
      
      // Major lines that extend into waveform (every 8 beats)
      if (isEighthCount) {
        majorLines.push({ x, beat });
      }
      
      // Middle lines (every 4 beats, but not major lines)
      if (isFourthCount) {
        majorLines.push({ x, beat, isMiddle: true });
      }
    }
  }
  
  return (
    <View>
      {/* Ruler bar */}
      <Svg width={width} height={rulerHeight} style={styles.ruler}>
        {rulerLines}
      </Svg>
      
      {/* Major lines overlay for waveform */}
      <Svg width={width} height={overlayHeight} style={styles.majorLines}>
        {majorLines.map(({ x, beat, isMiddle }) => (
          <Line
            key={`major-${beat}`}
            x1={x}
            y1={0}
            x2={x}
            y2={overlayHeight}
            stroke={isMiddle ? colors.gridMinor : colors.gridMajor}
            strokeWidth={1}
            opacity={isMiddle ? 0.2 : 0.3}
          />
        ))}
      </Svg>
    </View>
  );
};



export default RhythmicGrid;