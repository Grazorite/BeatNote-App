import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Svg, { Line, Circle, Polygon, Path } from 'react-native-svg';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../hooks/useWaveformData';
import LoadingSpinner from './LoadingSpinner';
import RhythmicGrid from './RhythmicGrid';

interface WaveformCanvasProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const VIEWPORT_WIDTH = 800;
const VIEWPORT_DURATION = 20000; // 20 seconds visible

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  const { viewportStartTime, currentTime, songDuration, setViewportStartTime, setCurrentTime, songLoaded, isPlaying } = useStudioStore();
  const { waveformData, loading } = useWaveformData(audioUri || null);
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
    
    // Gradual auto-scroll only when very close to edge (Adobe Audition style)
    const relativePosition = (newCurrentTime - viewportStartTime) / VIEWPORT_DURATION;
    
    if (relativePosition < 0.1) {
      const scrollSpeed = Math.max(0.1, (0.1 - relativePosition) * 20);
      const scrollAmount = VIEWPORT_DURATION * 0.1 * scrollSpeed;
      const newViewportStart = Math.max(0, viewportStartTime - scrollAmount);
      setViewportStartTime(newViewportStart);
    } else if (relativePosition > 0.9) {
      const scrollSpeed = Math.max(0.1, (relativePosition - 0.9) * 20);
      const scrollAmount = VIEWPORT_DURATION * 0.1 * scrollSpeed;
      const newViewportStart = Math.min(songDuration - VIEWPORT_DURATION, viewportStartTime + scrollAmount);
      setViewportStartTime(newViewportStart);
    }
  };
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (!songLoaded) return;
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    updateTimeFromPosition(event.x);
    onSeek(newCurrentTime);
  });
  
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (!songLoaded) return;
      if (isPlaying) {
        onScrubStart(); // Pause during scrub
      }
    })
    .onUpdate((event) => {
      if (!songLoaded) return;
      updateTimeFromPosition(event.x);
    })
    .onEnd(() => {
      if (!songLoaded) return;
      onScrubEnd(); // Resume playing from final position if was playing
    });
  
  const composedGesture = Gesture.Race(tapGesture, panGesture);
  
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
              filter="drop-shadow(0 0 3px rgba(0,0,0,0.8))"
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
              filter="drop-shadow(0 0 3px rgba(0,0,0,0.8))"
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
              filter="drop-shadow(0 0 3px rgba(0,0,0,0.8))"
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
              stroke="#000000"
              strokeWidth={1}
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
              stroke="#000000"
              strokeWidth={1}
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

  if (!songLoaded || !audioUri) {
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
      
      <View style={styles.waveformContainer} testID="waveform-container">
        <View style={styles.waveform}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
            </View>
          ) : (
            <Svg width={VIEWPORT_WIDTH} height={300} style={styles.waveformSvg}>
              {waveformData ? (
                <Path
                  d={generateWaveformPath(
                    waveformData.peaks, 
                    VIEWPORT_WIDTH, 
                    300, 
                    viewportStartTime, 
                    VIEWPORT_DURATION, 
                    waveformData.duration
                  )}
                  stroke="#00ff00"
                  strokeWidth={1}
                  fill="none"
                />
              ) : (
                <Path
                  d={(() => {
                    let path = 'M 0 150';
                    for (let x = 0; x < VIEWPORT_WIDTH; x += 4) {
                      const y = 150 + Math.sin(x * 0.01) * 50 + Math.sin(x * 0.03) * 20;
                      path += ` L ${x} ${y}`;
                    }
                    return path;
                  })()}
                  stroke="#00ff00"
                  strokeWidth={1}
                  fill="none"
                  opacity={0.5}
                />
              )}
            </Svg>
          )}
        </View>
        
        {/* Transparent overlay for gesture detection */}
        <GestureDetector gesture={composedGesture}>
          <View style={styles.gestureOverlay} />
        </GestureDetector>
        
        {/* Visual overlay for markers and playhead */}
        <View style={styles.overlayContainer} pointerEvents="none">
          <Svg width={VIEWPORT_WIDTH} height={300} style={styles.overlay}>
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
                  strokeWidth={4}
                  filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
                />
                <Polygon
                  points={`${playheadX-8},300 ${playheadX+8},300 ${playheadX+8},285 ${playheadX},280 ${playheadX-8},285`}
                  fill="#ff6600"
                  stroke="#000000"
                  strokeWidth={1}
                />
              </>
            )}
          </Svg>
        </View>
      </View>
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
    position: 'relative',
    width: 800,
    height: 300,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  waveform: {
    width: 800,
    height: 300,
    backgroundColor: '#111111',
  },
  waveformSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 800,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  gestureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 800,
    height: 300,
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 800,
    height: 300,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default WaveformCanvas;