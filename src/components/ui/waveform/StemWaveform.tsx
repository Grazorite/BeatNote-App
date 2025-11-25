import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Circle, Polygon } from 'react-native-svg';
import { Layer, useStudioStore } from '../../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../../hooks/useWaveformData';
import { useZoomGesture } from '../../../hooks/useZoomGesture';
import { useScrollZoom } from '../../../hooks/useScrollZoom';
import { snapToNearestTarget, generateSnapTargets } from '../../../utils/magneticSnapping';

interface StemWaveformProps {
  layers: Layer[];
  audioUri?: string;
  stemId: string;
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  waveformColor?: string;
  showPlayhead?: boolean;
}

const StemWaveform: React.FC<StemWaveformProps> = ({
  layers,
  audioUri,
  stemId,
  onSeek,
  onScrubStart,
  onScrubEnd,
  waveformColor = '#00ff00',
  showPlayhead = true,
}) => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  const VIEWPORT_WIDTH = Math.max(720, screenData.width - 350); // 350px for sidebar + margins
  
  console.log('StemWaveform render:', { stemId, audioUri: !!audioUri, layersCount: layers?.length });
  const { viewportStartTime, viewportDuration, currentTime, songDuration, setCurrentTime, setGhostPlayheadTime, songLoaded, isPlaying, magneticSnapping, bpm, allLayersData } = useStudioStore();
  const { waveformData } = useWaveformData(audioUri || null);
  const pinchGesture = useZoomGesture();
  const stemRef = useRef<View>(null);
  const { handleWheelZoom } = useScrollZoom(stemRef);
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * viewportDuration;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
  };
  
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart((event) => {
      let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      
      if (magneticSnapping) {
        const allMarkers = allLayersData.flatMap(layer => layer.markers);
        const snapTargets = generateSnapTargets(bpm, songDuration, allMarkers, viewportStartTime, viewportDuration);
        const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
        targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
      }
      
      const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
      setGhostPlayheadTime(newCurrentTime); // Immediate visual feedback
    })
    .onEnd((event) => {
      let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      
      if (magneticSnapping) {
        const allMarkers = allLayersData.flatMap(layer => layer.markers);
        const snapTargets = generateSnapTargets(bpm, songDuration, allMarkers, viewportStartTime, viewportDuration);
        const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
        targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
      }
      
      const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
      updateTimeFromPosition(event.x);
      onSeek(newCurrentTime);
    });
  
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      if (isPlaying) {
        onScrubStart();
      }
    })
    .onUpdate((event) => {
      // Use absolute position within viewport bounds for consistent tracking
      const clampedX = Math.max(0, Math.min(event.x, VIEWPORT_WIDTH));
      let targetTime = viewportStartTime + (clampedX / VIEWPORT_WIDTH) * viewportDuration;
      
      if (magneticSnapping) {
        const allMarkers = allLayersData.flatMap(layer => layer.markers);
        const snapTargets = generateSnapTargets(bpm, songDuration, allMarkers, viewportStartTime, viewportDuration);
        const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
        targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
      }
      
      const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
      setCurrentTime(newCurrentTime);
      setGhostPlayheadTime(newCurrentTime);
    })
    .onEnd(() => {
      onScrubEnd();
    });
  
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(tapGesture, panGesture),
    pinchGesture
  );
  
  const pathData = React.useMemo(() => {
    if (!waveformData) {
      let path = 'M 0 60';
      for (let x = 0; x < VIEWPORT_WIDTH; x += 4) {
        const y = 60 + Math.sin(x * 0.02) * 20;
        path += ` L ${x} ${y}`;
      }
      return path;
    }
    
    return generateWaveformPath(
      waveformData.peaks,
      VIEWPORT_WIDTH,
      120,
      viewportStartTime,
      viewportDuration,
      waveformData.duration
    );
  }, [waveformData, viewportStartTime, viewportDuration, VIEWPORT_WIDTH]);
  
  const renderStemMarkers = () => {
    const layer = layers.find(l => l.id === stemId);
    if (!layer || !layer.isVisible || !layer.markers) return null;

    return layer.markers
      .filter(marker => 
        marker >= viewportStartTime && 
        marker <= viewportStartTime + viewportDuration
      )
      .map((marker, index) => {
        const x = ((marker - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;
        return (
          <Line
            key={`${stemId}-${marker}-${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={120}
            stroke={layer.color}
            strokeWidth={3}
            filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
            strokeOpacity={0.9}
          />
        );
      });
  };

  const playheadX = ((currentTime - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;
  const isPlayheadVisible = currentTime >= viewportStartTime && currentTime <= viewportStartTime + viewportDuration;

  if (!songLoaded || !audioUri) {
    return (
      <View style={styles.waveformContainer}>
        <View style={[styles.canvas, { backgroundColor: '#000000' }]} />
      </View>
    );
  }

  return (
    <View style={styles.waveformContainer}>
      <Svg width={VIEWPORT_WIDTH} height={120} style={styles.canvas}>
          <Path
            d={pathData}
            stroke="#00ff00"
            strokeWidth={2}
            fill="none"
            strokeOpacity={0.6}
          />
          {renderStemMarkers()}
          
          {/* Current playhead */}
          {showPlayhead && isPlayheadVisible && (
            <>
              <Line
                x1={playheadX}
                y1={0}
                x2={playheadX}
                y2={120}
                stroke="#ff6600"
                strokeWidth={3}
                filter="drop-shadow(0 0 3px rgba(0,0,0,0.8))"
              />
              <Polygon
                points={`${playheadX-4},120 ${playheadX+4},120 ${playheadX+4},110 ${playheadX},105 ${playheadX-4},110`}
                fill="#ff6600"
                stroke="#000000"
                strokeWidth={1}
              />
            </>
          )}
        </Svg>
      
      {/* Transparent overlay for gesture detection */}
      <GestureDetector gesture={composedGesture}>
        <View ref={stemRef} style={[styles.gestureOverlay, { width: VIEWPORT_WIDTH }]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 120,
  },
  waveformContainer: {
    height: 120,
    position: 'relative',
  },
  gestureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default StemWaveform;