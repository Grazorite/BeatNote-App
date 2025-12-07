import React, { useRef, useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Svg, { Line, Circle, Polygon, Path } from 'react-native-svg';
import { Layer, useStudioStore } from '../../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../../hooks/useWaveformData';
import { useZoomGesture } from '../../../hooks/useZoomGesture';
import { useScrollZoom } from '../../../hooks/useScrollZoom';
import LoadingSpinner from '../common/LoadingSpinner';
import RhythmicGrid from './RhythmicGrid';
import { waveformCanvasStyles as styles } from '../../../styles/components/waveform/waveformCanvas';
import { colors } from '../../../styles/common';
import { snapToNearestTarget, generateSnapTargets } from '../../../utils/magneticSnapping';

interface WaveformCanvasProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  // Responsive viewport width
  const isMobile = screenData.width < 768;
  const VIEWPORT_WIDTH = isMobile 
    ? screenData.width - 32 // Mobile: full width minus padding
    : Math.max(800, screenData.width - 350); // Desktop: account for sidebar
  
  // Optimized Zustand selectors - only subscribe to what we need
  const viewportStartTime = useStudioStore(state => state.viewportStartTime);
  const viewportDuration = useStudioStore(state => state.viewportDuration);
  const pixelsPerSecond = useStudioStore(state => state.pixelsPerSecond);
  const currentTime = useStudioStore(state => state.currentTime);
  const ghostPlayheadTime = useStudioStore(state => state.ghostPlayheadTime);
  const songDuration = useStudioStore(state => state.songDuration);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const isPlaying = useStudioStore(state => state.isPlaying);
  const showGridLines = useStudioStore(state => state.showGridLines);
  const bpm = useStudioStore(state => state.bpm);
  const magneticSnapping = useStudioStore(state => state.magneticSnapping);
  const allLayersData = useStudioStore(state => state.allLayersData);
  const setViewportStartTime = useStudioStore(state => state.setViewportStartTime);
  const setCurrentTime = useStudioStore(state => state.setCurrentTime);
  const setGhostPlayheadTime = useStudioStore(state => state.setGhostPlayheadTime);
  const { waveformData, loading } = useWaveformData(audioUri || null);
  const pinchGesture = useZoomGesture();
  const waveformRef = useRef<View>(null);
  const { handleWheelZoom } = useScrollZoom(waveformRef);
  
  // Re-initialize scroll zoom when song loads
  React.useEffect(() => {
    if (songLoaded && waveformRef.current) {
      const element = waveformRef.current;
      if (element) {
        element.focus?.();
      }
    }
  }, [songLoaded]);
  
  const updateTimeFromPosition = (x: number, disableAutoScroll = false) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * viewportDuration;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
    
    // Skip auto-scroll during active dragging to prevent interference
    if (disableAutoScroll) return;
    
    // Gradual auto-scroll only when very close to edge (Adobe Audition style)
    const relativePosition = (newCurrentTime - viewportStartTime) / viewportDuration;
    
    if (relativePosition < 0.1) {
      const scrollSpeed = Math.max(0.1, (0.1 - relativePosition) * 20);
      const scrollAmount = viewportDuration * 0.1 * scrollSpeed;
      const newViewportStart = Math.max(0, viewportStartTime - scrollAmount);
      setViewportStartTime(newViewportStart);
    } else if (relativePosition > 0.9) {
      const scrollSpeed = Math.max(0.1, (relativePosition - 0.9) * 20);
      const scrollAmount = viewportDuration * 0.1 * scrollSpeed;
      const newViewportStart = Math.min(songDuration - viewportDuration, viewportStartTime + scrollAmount);
      setViewportStartTime(newViewportStart);
    }
  };
  
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart((event) => {
      if (!songLoaded) return;
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
      if (!songLoaded) return;
      let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      
      if (magneticSnapping) {
        const allMarkers = allLayersData.flatMap(layer => layer.markers);
        const snapTargets = generateSnapTargets(bpm, songDuration, allMarkers, viewportStartTime, viewportDuration);
        const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
        targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
      }
      
      const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
      onSeek(newCurrentTime);
    });
  
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      if (!songLoaded) return;
      if (isPlaying) {
        onScrubStart(); // Pause during scrub
      }
    })
    .onUpdate((event) => {
      if (!songLoaded) return;
      
      let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      
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
      if (!songLoaded) return;
      onScrubEnd(); // Resume playing from final position if was playing
    });
  
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(tapGesture, panGesture),
    pinchGesture
  );
  
  const renderLayerMarkers = React.useCallback((layer: Layer) => {
    if (!layer.isVisible) return null;

    return layer.markers
      .filter(marker => 
        marker >= viewportStartTime && 
        marker <= viewportStartTime + viewportDuration
      )
      .map((marker, index) => {
        const x = ((marker - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;

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
              strokeWidth={4}
              filter="drop-shadow(0 0 6px rgba(0,0,0,0.9))"
              strokeOpacity={0.9}
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
              strokeWidth={5}
              filter="drop-shadow(0 0 6px rgba(0,0,0,0.9))"
              strokeOpacity={0.9}
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
              strokeWidth={4}
              filter="drop-shadow(0 0 6px rgba(0,0,0,0.9))"
              strokeOpacity={0.9}
            />
          );
        case 'piano':
          return (
            <Circle
              key={`${layer.id}-${marker}-${index}`}
              cx={x}
              cy={150}
              r={8}
              fill={layer.color}
              stroke="#000000"
              strokeWidth={2}
              filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
              fillOpacity={0.9}
            />
          );
        case 'guitar':
          return (
            <Circle
              key={`${layer.id}-${marker}-${index}`}
              cx={x}
              cy={220}
              r={7}
              fill={layer.color}
              stroke="#000000"
              strokeWidth={2}
              filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
              fillOpacity={0.9}
            />
          );
        case 'other':
          return (
            <Circle
              key={`${layer.id}-${marker}-${index}`}
              cx={x}
              cy={30}
              r={7}
              fill={layer.color}
              stroke="#000000"
              strokeWidth={2}
              filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
              fillOpacity={0.9}
            />
          );
        default:
          return null;
      }
    });
  }, [viewportStartTime, viewportDuration, VIEWPORT_WIDTH]);
  
  const renderGridLines = React.useCallback(() => {
    if (!showGridLines) return null;
    
    const lines = [];
    const pixelsPerBeat = (pixelsPerSecond * 60) / bpm;
    const startBeat = Math.floor((viewportStartTime / 1000) * (bpm / 60));
    const endBeat = Math.ceil(((viewportStartTime + viewportDuration) / 1000) * (bpm / 60));
    
    for (let beat = startBeat; beat <= endBeat; beat++) {
      const beatTimeMs = (beat / (bpm / 60)) * 1000;
      const x = ((beatTimeMs - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;
      
      if (x >= 0 && x <= VIEWPORT_WIDTH && beat % 8 === 0) {
        lines.push(
          <Line
            key={`grid-${beat}`}
            x1={x}
            y1={0}
            x2={x}
            y2={300}
            stroke="#666666"
            strokeWidth={2}
            opacity={0.5}
          />
        );
      }
    }
    return lines;
  }, [showGridLines, pixelsPerSecond, bpm, viewportStartTime, viewportDuration, VIEWPORT_WIDTH]);

  // Current playhead position in viewport
  const playheadX = ((currentTime - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;
  const showPlayhead = currentTime >= viewportStartTime && currentTime <= viewportStartTime + viewportDuration;
  
  // Ghost playhead position in viewport
  const ghostPlayheadX = ghostPlayheadTime ? ((ghostPlayheadTime - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH : 0;
  const showGhostPlayhead = ghostPlayheadTime !== null && 
    ghostPlayheadTime >= viewportStartTime && 
    ghostPlayheadTime <= viewportStartTime + viewportDuration &&
    Math.abs(ghostPlayheadTime - currentTime) > 100; // Only show if different from current playhead

  if (!songLoaded || !audioUri) {
    return (
      <View style={styles.containerRelative}>
        <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={pixelsPerSecond} overlayHeight={0} />
        <View style={[styles.waveformContainer, styles.responsiveWidth, { width: VIEWPORT_WIDTH }]}>
          <View style={[styles.waveform, { width: VIEWPORT_WIDTH }]} />
          <View style={[styles.overlayContainer, styles.overlayZIndex, { width: VIEWPORT_WIDTH }]} pointerEvents="none">
            {showGridLines && (
              <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={pixelsPerSecond} overlayHeight={300} showRuler={false} />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerRelative}>
      <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={pixelsPerSecond} overlayHeight={0} />
      
      <View style={[styles.waveformContainer, styles.containerRelative]} testID="waveform-container">
        <View style={styles.waveform}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
            </View>
          ) : (
            <Svg width={VIEWPORT_WIDTH} height={isMobile ? 200 : 300} style={styles.waveformSvg}>
              {waveformData ? (
                <Path
                  d={generateWaveformPath(
                    waveformData.peaks, 
                    VIEWPORT_WIDTH, 
                    300, 
                    viewportStartTime, 
                    viewportDuration, 
                    waveformData.duration
                  )}
                  stroke={colors.success}
                  strokeWidth={1}
                  fill="none"
                  strokeOpacity={0.6}
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
                  stroke={colors.success}
                  strokeWidth={1}
                  fill="none"
                  strokeOpacity={0.4}
                />
              )}
            </Svg>
          )}
        </View>
        
        {/* Transparent overlay for gesture detection */}
        <GestureDetector gesture={composedGesture}>
          <View ref={waveformRef} style={[styles.gestureOverlay, { width: VIEWPORT_WIDTH }]} />
        </GestureDetector>
        
        {/* Visual overlay for markers and playhead */}
        <View style={[styles.overlayContainer, styles.overlayZIndex]} pointerEvents="none">
          <Svg width={VIEWPORT_WIDTH} height={300} style={styles.overlay}>
            {renderGridLines()}
            {layers.map(layer => renderLayerMarkers(layer))}
            
            {/* Ghost playhead */}
            {showGhostPlayhead && (
              <>
                <Line
                  x1={ghostPlayheadX}
                  y1={0}
                  x2={ghostPlayheadX}
                  y2={300}
                  stroke={colors.accent}
                  strokeWidth={2}
                  strokeOpacity={0.5}
                  strokeDasharray="8,4"
                  filter="drop-shadow(0 0 2px rgba(0,0,0,0.4))"
                />
                <Polygon
                  points={`${ghostPlayheadX-6},300 ${ghostPlayheadX+6},300 ${ghostPlayheadX+6},288 ${ghostPlayheadX},284 ${ghostPlayheadX-6},288`}
                  fill={colors.accent}
                  fillOpacity={0.5}
                  stroke="#000000"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
              </>
            )}
            
            {/* Current playhead */}
            {showPlayhead && (
              <>
                <Line
                  x1={playheadX}
                  y1={0}
                  x2={playheadX}
                  y2={300}
                  stroke={colors.accent}
                  strokeWidth={4}
                  filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
                />
                <Polygon
                  points={`${playheadX-8},300 ${playheadX+8},300 ${playheadX+8},285 ${playheadX},280 ${playheadX-8},285`}
                  fill={colors.accent}
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



// Memoize WaveformCanvas to prevent re-renders when only playhead position changes
export default React.memo(WaveformCanvas, (prevProps, nextProps) => {
  // Only re-render if props that affect waveform structure change
  return (
    prevProps.audioUri === nextProps.audioUri &&
    prevProps.layers === nextProps.layers &&
    prevProps.onSeek === nextProps.onSeek &&
    prevProps.onScrubStart === nextProps.onScrubStart &&
    prevProps.onScrubEnd === nextProps.onScrubEnd
  );
});