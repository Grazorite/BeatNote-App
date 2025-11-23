import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Circle, Polygon } from 'react-native-svg';
import { Layer, useStudioStore } from '../../../hooks/useStudioStore';
import RhythmicGrid from './RhythmicGrid';

interface SimpleWaveformProps {
  layers: Layer[];
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  waveformColor?: string;
}

const VIEWPORT_WIDTH = 800;
const VIEWPORT_DURATION = 20000;

const SimpleWaveform: React.FC<SimpleWaveformProps> = ({
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  waveformColor = '#00ff00',
}) => {
  const { viewportStartTime, currentTime, songDuration, setViewportStartTime, setCurrentTime, songLoaded, isPlaying } = useStudioStore();
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
  };
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    updateTimeFromPosition(event.x);
    if (isPlaying) {
      onSeek(newCurrentTime);
    }
  });
  
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (isPlaying) {
        onScrubStart();
      }
    })
    .onUpdate((event) => {
      updateTimeFromPosition(event.x);
    })
    .onEnd(() => {
      if (isPlaying) {
        onScrubEnd();
      }
    });
  
  const composedGesture = Gesture.Race(tapGesture, panGesture);
  
  // Simple sine wave path for fallback
  const pathData = (() => {
    let path = 'M 0 150';
    for (let x = 0; x < VIEWPORT_WIDTH; x += 2) {
      const y = 150 + Math.sin(x * 0.02) * 50;
      path += ` L ${x} ${y}`;
    }
    return path;
  })();
  
  const renderLayerMarkers = (layer: Layer) => {
    if (!layer.isVisible) return null;

    return layer.markers
      .filter((marker: number) => 
        marker >= viewportStartTime && 
        marker <= viewportStartTime + VIEWPORT_DURATION
      )
      .map((marker: number, index: number) => {
        const x = ((marker - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH;

        switch (layer.id) {
          case 'vocals':
            return (
              <Line
                key={`${layer.id}-${marker}-${index}`}
                x1={x}
                y1={0}
                x2={x}
                y2={300}
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
                y2={100}
                stroke={layer.color}
                strokeWidth={4}
              />
            );
          case 'bass':
            return (
              <Line
                key={`${layer.id}-${marker}-${index}`}
                x1={x}
                y1={200}
                x2={x}
                y2={300}
                stroke={layer.color}
                strokeWidth={3}
              />
            );
          case 'piano':
            return (
              <Circle
                key={`${layer.id}-${marker}-${index}`}
                cx={x}
                cy={150}
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
                cy={280}
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

  if (!songLoaded) {
    return (
      <View>
        <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={VIEWPORT_WIDTH / (VIEWPORT_DURATION / 1000)} />
        <View style={[styles.canvas, { backgroundColor: '#111111' }]} />
      </View>
    );
  }

  return (
    <View>
      <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={VIEWPORT_WIDTH / (VIEWPORT_DURATION / 1000)} />
      
      <GestureDetector gesture={composedGesture}>
        <View style={styles.waveformContainer}>
          <Svg width={VIEWPORT_WIDTH} height={300} style={styles.canvas}>
            <Path
              d={pathData}
              stroke={waveformColor}
              strokeWidth={3}
              fill="none"
            />
            {layers.map(layer => renderLayerMarkers(layer))}
            
            {showPlayhead && (
              <>
                <Line
                  x1={playheadX}
                  y1={0}
                  x2={playheadX}
                  y2={300}
                  stroke="#ff6600"
                  strokeWidth={3}
                />
                <Polygon
                  points={`${playheadX-8},300 ${playheadX+8},300 ${playheadX+8},285 ${playheadX},280 ${playheadX-8},285`}
                  fill="#ff6600"
                  stroke="#ff6600"
                />
              </>
            )}
          </Svg>
        </View>
      </GestureDetector>
    </View>
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
  waveformContainer: {
    width: 800,
    height: 300,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
});

export default SimpleWaveform;