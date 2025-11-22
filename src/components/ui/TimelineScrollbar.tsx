import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Rect, Line, Path, Circle, Polygon } from 'react-native-svg';
import { useStudioStore } from '../../hooks/useStudioStore';

const TIMELINE_WIDTH = 800;
const TIMELINE_HEIGHT = 60;
const VIEWPORT_DURATION = 20000; // 20 seconds visible in workspace

const TimelineScrollbar: React.FC = () => {
  const { 
    currentTime, 
    viewportStartTime, 
    songDuration, 
    setViewportStartTime,
    layers,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    songLoaded
  } = useStudioStore();
  

  
  const [wasPausedForScrubbing, setWasPausedForScrubbing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-scroll viewport to follow playhead when playing (Adobe Audition style)
  useEffect(() => {
    if (isPlaying && currentTime > 0 && !isDragging) {
      // Check if playhead is outside viewport bounds
      if (currentTime < viewportStartTime || currentTime > viewportStartTime + VIEWPORT_DURATION) {
        // Position viewport so playhead starts at the beginning of new viewport
        const newStartTime = Math.max(0, 
          Math.min(currentTime, songDuration - VIEWPORT_DURATION)
        );
        setViewportStartTime(newStartTime);
      }
    }
  }, [currentTime, isPlaying, viewportStartTime, songDuration, setViewportStartTime, isDragging]);

  const viewportWidth = (VIEWPORT_DURATION / songDuration) * TIMELINE_WIDTH;
  const viewportX = (viewportStartTime / songDuration) * TIMELINE_WIDTH;
  const playheadPositionOnTimeline = (currentTime / songDuration) * TIMELINE_WIDTH;
  
  const timelineWaveformPath = (() => {
    let path = 'M 0 30';
    for (let x = 0; x < TIMELINE_WIDTH; x += 2) {
      const y = 30 + Math.sin(x * 0.01) * 6; // Constrain within timeline rectangle (20-40)
      path += ` L ${x} ${y}`;
    }
    return path;
  })();

  const dragState = useRef({
    initialViewportStart: 0
  });
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const touchX = event.x;
    const newStartTime = Math.max(0, 
      Math.min((touchX / TIMELINE_WIDTH) * songDuration - (VIEWPORT_DURATION / 2), 
      songDuration - VIEWPORT_DURATION)
    );
    setViewportStartTime(newStartTime);
  });
  
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      const touchX = event.x;
      setIsDragging(true);
      
      if (!(touchX >= viewportX && touchX <= viewportX + viewportWidth)) {
        const newStartTime = Math.max(0, 
          Math.min((touchX / TIMELINE_WIDTH) * songDuration - (VIEWPORT_DURATION / 2), 
          songDuration - VIEWPORT_DURATION)
        );
        setViewportStartTime(newStartTime);
        dragState.current.initialViewportStart = newStartTime;
      } else {
        dragState.current.initialViewportStart = viewportStartTime;
      }
      
      if (isPlaying) {
        setWasPausedForScrubbing(true);
        setIsPlaying(false);
      }
    })
    .onUpdate((event) => {
      if (isDragging) {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const newStartTime = Math.max(0, 
          Math.min(dragState.current.initialViewportStart + dragDistance, songDuration - VIEWPORT_DURATION)
        );
        setViewportStartTime(newStartTime);
      }
    })
    .onEnd(() => {
      setIsDragging(false);
      if (wasPausedForScrubbing) {
        setIsPlaying(true);
        setWasPausedForScrubbing(false);
      }
    });
  
  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!songLoaded) {
    return (
      <View style={styles.container}>
        <Svg width={TIMELINE_WIDTH} height={TIMELINE_HEIGHT} style={styles.timeline}>
          <Rect x={0} y={20} width={TIMELINE_WIDTH} height={20} fill="#222222" stroke="#444444" />
        </Svg>
        <View style={styles.timeLabels}>
          <Text style={styles.timeText}>--:--</Text>
          <Text style={styles.timeText}>Current: --:--</Text>
          <Text style={styles.timeText}>--:--</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View>
        <Svg width={TIMELINE_WIDTH} height={TIMELINE_HEIGHT} style={styles.timeline}>
          {/* Background track */}
          <Rect x={0} y={20} width={TIMELINE_WIDTH} height={20} fill="#222222" stroke="#444444" />
          
          {/* Timeline waveform - inside rectangle */}
          <Path
            d={timelineWaveformPath}
            stroke="#00ff00"
            strokeWidth={1}
            fill="none"
            opacity={0.4}
          />
          
          {/* All markers across entire song */}
          {layers.map(layer => 
            layer.isVisible && layer.markers.map((marker, index) => {
              const x = (marker / songDuration) * TIMELINE_WIDTH;
              
              // Draw circles for piano and other, lines for vocals/drums/bass
              if (layer.id === 'piano' || layer.id === 'other') {
                return (
                  <Circle
                    key={`${layer.id}-${marker}-${index}`}
                    cx={x}
                    cy={30}
                    r={3}
                    fill={layer.color}
                    stroke={layer.color}
                  />
                );
              } else {
                return (
                  <Line
                    key={`${layer.id}-${marker}-${index}`}
                    x1={x}
                    y1={15}
                    x2={x}
                    y2={45}
                    stroke={layer.color}
                    strokeWidth={1.5}
                  />
                );
              }
            })
          )}
          
          {/* Orange playhead - drawn first so it doesn't block touches */}
          <Line
            x1={playheadPositionOnTimeline}
            y1={18}
            x2={playheadPositionOnTimeline}
            y2={42}
            stroke="#ff6600"
            strokeWidth={2}
            pointerEvents="none"
          />
          {/* Playhead label marker */}
          <Polygon
            points={`${playheadPositionOnTimeline - 4},42 ${playheadPositionOnTimeline + 4},42 ${playheadPositionOnTimeline + 4},35 ${playheadPositionOnTimeline},32 ${playheadPositionOnTimeline - 4},35`}
            fill="#ff6600"
            stroke="#ff6600"
            pointerEvents="none"
          />
          
          {/* Draggable viewport window - drawn last for touch priority */}
          <Rect 
            x={viewportX}
            y={18} 
            width={viewportWidth}
            height={24} 
            fill="rgba(255, 255, 255, 0.2)" 
            stroke="#ffffff" 
            strokeWidth={2}
            rx={2}
          />
        </Svg>
        </View>
      </GestureDetector>
      
      {/* Time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeText}>{formatTime(viewportStartTime)}</Text>
        <Text style={styles.timeText}>Current: {formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(Math.min(viewportStartTime + VIEWPORT_DURATION, songDuration))}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TIMELINE_WIDTH,
    marginTop: 15,
    alignItems: 'center',
  },

  timeline: {
    backgroundColor: '#111111',
    borderRadius: 4,
  },

  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: TIMELINE_WIDTH - 20,
    marginTop: 8,
  },
  timeText: {
    color: '#999999',
    fontSize: 10,
  },
});

export default TimelineScrollbar;