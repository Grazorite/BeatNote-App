import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Circle, Polygon } from 'react-native-svg';
import { Layer, useStudioStore } from '../../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../../hooks/useWaveformData';

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

const VIEWPORT_WIDTH = 720;

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
  console.log('StemWaveform render:', { stemId, audioUri: !!audioUri, layersCount: layers?.length });
  const { viewportStartTime, viewportDuration, currentTime, songDuration, setCurrentTime, setGhostPlayheadTime, songLoaded, isPlaying } = useStudioStore();
  const { waveformData } = useWaveformData(audioUri || null);
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * viewportDuration;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
  };
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setGhostPlayheadTime(newCurrentTime); // Set ghost playhead to clicked position
    updateTimeFromPosition(event.x);
    onSeek(newCurrentTime);
  });
  
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (isPlaying) {
        onScrubStart();
      }
    })
    .onUpdate((event) => {
      updateTimeFromPosition(event.x);
      // Update ghost playhead during scrubbing
      const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      const newGhostTime = Math.max(0, Math.min(targetTime, songDuration));
      setGhostPlayheadTime(newGhostTime);
    })
    .onEnd(() => {
      onScrubEnd();
    });
  
  const composedGesture = Gesture.Race(tapGesture, panGesture);
  
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
  }, [waveformData, viewportStartTime]);
  
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
    <GestureDetector gesture={composedGesture}>
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
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: 720,
    height: 120,
  },
  waveformContainer: {
    width: 720,
    height: 120,
  },
});

export default StemWaveform;