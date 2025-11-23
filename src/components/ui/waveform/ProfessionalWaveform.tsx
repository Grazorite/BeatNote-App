import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Waveform } from '@simform_solutions/react-native-audio-waveform';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import RhythmicGrid from './RhythmicGrid';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';

interface ProfessionalWaveformProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  waveformColor?: string;
  height?: number;
}

const VIEWPORT_WIDTH = 800;
const VIEWPORT_DURATION = 20000; // 20 seconds
const PIXELS_PER_SECOND = VIEWPORT_WIDTH / (VIEWPORT_DURATION / 1000);

const ProfessionalWaveform: React.FC<ProfessionalWaveformProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  waveformColor = '#00ff00',
  height = 300,
}) => {
  const { viewportStartTime, currentTime, songDuration, songLoaded } = useStudioStore();

  const renderLayerMarkers = (layer: Layer) => {
    if (!layer.isVisible) return null;

    return layer.markers
      .filter(marker => 
        marker >= viewportStartTime && 
        marker <= viewportStartTime + VIEWPORT_DURATION
      )
      .map((marker, index) => {
        const x = ((marker - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH;

        switch (layer.id) {
          case 'vocals':
            return (
              <Line
                key={`${layer.id}-${marker}-${index}`}
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                stroke={layer.color}
                strokeWidth={3}
              />
            );
          case 'drums':
            return (
              <Line
                key={`${layer.id}-${marker}-${index}`}
                x1={x}
                y1={0}
                x2={x}
                y2={height * 0.33}
                stroke={layer.color}
                strokeWidth={4}
              />
            );
          case 'bass':
            return (
              <Line
                key={`${layer.id}-${marker}-${index}`}
                x1={x}
                y1={height * 0.67}
                x2={x}
                y2={height}
                stroke={layer.color}
                strokeWidth={3}
              />
            );
          case 'piano':
            return (
              <Circle
                key={`${layer.id}-${marker}-${index}`}
                cx={x}
                cy={height * 0.5}
                r={5}
                fill={layer.color}
                stroke={layer.color}
                strokeWidth={2}
              />
            );
          case 'other':
            return (
              <Circle
                key={`${layer.id}-${marker}-${index}`}
                cx={x}
                cy={height * 0.93}
                r={4}
                fill={layer.color}
                stroke={layer.color}
                strokeWidth={2}
              />
            );
          default:
            return null;
        }
      });
  };

  const playheadX = ((currentTime - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH;
  const showPlayhead = currentTime >= viewportStartTime && currentTime <= viewportStartTime + VIEWPORT_DURATION;

  if (!songLoaded || !audioUri) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={[styles.placeholder, { height }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.waveform, { height }]}>
        <Waveform
          mode="static"
          path={audioUri}
          waveColor={waveformColor}
          scrubColor="#ff6600"
          candleSpace={2}
          candleWidth={4}
        />
      </View>
      
      <RhythmicGrid 
        width={VIEWPORT_WIDTH} 
        pixelsPerSecond={PIXELS_PER_SECOND}
      />
      
      <Svg width={VIEWPORT_WIDTH} height={height} style={styles.overlay}>
        {layers.map(layer => renderLayerMarkers(layer))}
        
        {showPlayhead && (
          <>
            <Line
              x1={playheadX}
              y1={0}
              x2={playheadX}
              y2={height}
              stroke="#ff6600"
              strokeWidth={3}
            />
            <Polygon
              points={`${playheadX-8},${height} ${playheadX+8},${height} ${playheadX+8},${height-15} ${playheadX},${height-20} ${playheadX-8},${height-15}`}
              fill="#ff6600"
              stroke="#ff6600"
            />
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VIEWPORT_WIDTH,
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  waveform: {
    width: VIEWPORT_WIDTH,
  },
  placeholder: {
    backgroundColor: '#111111',
    width: VIEWPORT_WIDTH,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});

export default ProfessionalWaveform;