import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Circle, Polygon } from 'react-native-svg';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';

interface WaveformCanvasProps {
  pathData: string;
  layers: Layer[];
}

const VIEWPORT_WIDTH = 800;
const VIEWPORT_DURATION = 20000; // 20 seconds visible

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  pathData,
  layers,
}) => {
  const { viewportStartTime, currentTime, songDuration, setViewportStartTime, setCurrentTime, songLoaded } = useStudioStore();
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
  });
  
  const panGesture = Gesture.Pan().onUpdate((event) => {
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
    
    // Gradual auto-scroll only when very close to edge (Adobe Audition style)
    const relativePosition = (newCurrentTime - viewportStartTime) / VIEWPORT_DURATION;
    
    if (relativePosition < 0.1) {
      // Gradual scroll speed based on how close to left edge (0.1x to 1x speed)
      const scrollSpeed = Math.max(0.1, (0.1 - relativePosition) * 20);
      const scrollAmount = VIEWPORT_DURATION * 0.1 * scrollSpeed;
      const newViewportStart = Math.max(0, viewportStartTime - scrollAmount);
      setViewportStartTime(newViewportStart);
    } else if (relativePosition > 0.9) {
      // Gradual scroll speed based on how close to right edge (0.1x to 1x speed)
      const scrollSpeed = Math.max(0.1, (relativePosition - 0.9) * 20);
      const scrollAmount = VIEWPORT_DURATION * 0.1 * scrollSpeed;
      const newViewportStart = Math.min(songDuration - VIEWPORT_DURATION, viewportStartTime + scrollAmount);
      setViewportStartTime(newViewportStart);
    }
  });
  
  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);
  
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

  // Current playhead position in viewport
  const playheadX = ((currentTime - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH;
  const showPlayhead = currentTime >= viewportStartTime && currentTime <= viewportStartTime + VIEWPORT_DURATION;

  if (!songLoaded) {
    return (
      <View>
        <Svg width={VIEWPORT_WIDTH} height={300} style={styles.canvas}>
        </Svg>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View>
          <Svg width={VIEWPORT_WIDTH} height={300} style={styles.canvas}>
      <Path
        d={pathData}
        stroke="#00ff00"
        strokeWidth={3}
        fill="none"
      />
      {layers.map(layer => renderLayerMarkers(layer))}
      
      {/* Current playhead */}
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
          {/* Playhead label marker at bottom */}
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