import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Rect, Line, Path, Circle, Polygon } from 'react-native-svg';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../../hooks/useWaveformData';
import { useScrollZoom } from '../../../hooks/useScrollZoom';

const TIMELINE_WIDTH = 800;
const TIMELINE_HEIGHT = 80;

interface TimelineScrollbarProps {
  audioUri?: string;
}

const TimelineScrollbar: React.FC<TimelineScrollbarProps> = ({ audioUri }) => {
  const { 
    currentTime, 
    ghostPlayheadTime,
    showGhostInTimeline,
    viewportStartTime,
    viewportDuration,
    songDuration, 
    setViewportStartTime,
    setViewportDuration,
    layers,
    isPlaying,
    setCurrentTime,
    songLoaded,
    setViewportLocked
  } = useStudioStore();
  
  const { waveformData } = useWaveformData(audioUri || null);
  const timelineRef = useRef<View>(null);
  const { handleWheelZoom } = useScrollZoom(timelineRef);
  
  // Re-initialize scroll zoom when song loads
  React.useEffect(() => {
    if (songLoaded && timelineRef.current) {
      const element = timelineRef.current;
      if (element) {
        element.focus?.();
      }
    }
  }, [songLoaded]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);

  // Auto-scroll viewport to follow playhead when playing and locked
  useEffect(() => {
    if (isPlaying && currentTime > 0 && !isDragging) {
      const { isViewportLocked, setViewportLocked } = useStudioStore.getState();
      
      if (!isViewportLocked && currentTime >= viewportStartTime && currentTime <= viewportStartTime + viewportDuration) {
        setViewportLocked(true);
      }
      
      if (isViewportLocked && (currentTime < viewportStartTime || currentTime > viewportStartTime + viewportDuration)) {
        const newStartTime = Math.max(0, Math.min(currentTime, songDuration - viewportDuration));
        setViewportStartTime(newStartTime);
      }
    }
  }, [currentTime, isPlaying, viewportStartTime, viewportDuration, songDuration, setViewportStartTime, isDragging]);

  const viewportWidth = (viewportDuration / songDuration) * TIMELINE_WIDTH;
  const viewportX = (viewportStartTime / songDuration) * TIMELINE_WIDTH;
  const playheadPositionOnTimeline = (currentTime / songDuration) * TIMELINE_WIDTH;
  const ghostPlayheadPositionOnTimeline = ghostPlayheadTime ? (ghostPlayheadTime / songDuration) * TIMELINE_WIDTH : 0;
  
  const timelineWaveformPath = React.useMemo(() => {
    if (!waveformData) {
      let path = 'M 0 30';
      for (let x = 0; x < TIMELINE_WIDTH; x += 2) {
        const y = 30 + Math.sin(x * 0.01) * 6;
        path += ` L ${x} ${y}`;
      }
      return path;
    }
    
    return generateWaveformPath(
      waveformData.peaks,
      TIMELINE_WIDTH,
      40,
      0,
      waveformData.duration,
      waveformData.duration
    );
  }, [waveformData]);

  const dragState = useRef({
    initialViewportStart: 0,
    initialViewportDuration: 0
  });
  
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const touchX = event.x;
    const newStartTime = Math.max(0, 
      Math.min((touchX / TIMELINE_WIDTH) * songDuration - (viewportDuration / 2), 
      songDuration - viewportDuration)
    );
    setViewportStartTime(newStartTime);
  });
  
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      const touchX = event.x;
      setViewportLocked(false);
      
      const leftHandleX = viewportX - 3;
      const rightHandleX = viewportX + viewportWidth - 3;
      
      if (touchX >= leftHandleX && touchX <= leftHandleX + 6) {
        setIsResizing('left');
        dragState.current.initialViewportStart = viewportStartTime;
        dragState.current.initialViewportDuration = viewportDuration;
      } else if (touchX >= rightHandleX && touchX <= rightHandleX + 6) {
        setIsResizing('right');
        dragState.current.initialViewportStart = viewportStartTime;
        dragState.current.initialViewportDuration = viewportDuration;
      } else {
        setIsDragging(true);
        
        if (!(touchX >= viewportX && touchX <= viewportX + viewportWidth)) {
          const newStartTime = Math.max(0, 
            Math.min((touchX / TIMELINE_WIDTH) * songDuration - (viewportDuration / 2), 
            songDuration - viewportDuration)
          );
          setViewportStartTime(newStartTime);
          dragState.current.initialViewportStart = newStartTime;
        } else {
          dragState.current.initialViewportStart = viewportStartTime;
        }
      }
    })
    .onUpdate((event) => {
      if (isResizing === 'left') {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const newStartTime = Math.max(0, dragState.current.initialViewportStart + dragDistance);
        const newDuration = Math.max(1000, dragState.current.initialViewportDuration - dragDistance);
        setViewportStartTime(newStartTime);
        setViewportDuration(newDuration);
      } else if (isResizing === 'right') {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const newDuration = Math.max(1000, Math.min(songDuration - viewportStartTime, dragState.current.initialViewportDuration + dragDistance));
        setViewportDuration(newDuration);
      } else if (isDragging) {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const newStartTime = Math.max(0, 
          Math.min(dragState.current.initialViewportStart + dragDistance, songDuration - viewportDuration)
        );
        setViewportStartTime(newStartTime);
      }
    })
    .onEnd(() => {
      setIsDragging(false);
      setIsResizing(null);
    });
  
  const composedGesture = React.useMemo(() => 
    Gesture.Simultaneous(tapGesture, panGesture), 
    [tapGesture, panGesture]
  );

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
        <View ref={timelineRef}>
          <Svg width={TIMELINE_WIDTH} height={TIMELINE_HEIGHT} style={styles.timeline}>
            <Rect x={0} y={20} width={TIMELINE_WIDTH} height={40} fill="#222222" stroke="#444444" />
            
            <Path
              d={timelineWaveformPath}
              stroke="#00ff00"
              strokeWidth={1}
              fill="none"
              strokeOpacity={0.6}
              transform="translate(0, 20)"
            />
            
            {layers.flatMap(layer => 
              layer.isVisible ? layer.markers.map((marker, index) => {
                const x = (marker / songDuration) * TIMELINE_WIDTH;
                const key = `${layer.id}-${marker}-${index}`;
                
                return (layer.id === 'piano' || layer.id === 'other') ? (
                  <Circle
                    key={key}
                    cx={x}
                    cy={40}
                    r={3}
                    fill={layer.color}
                    stroke="#000000"
                    strokeWidth={1}
                  />
                ) : (
                  <Line
                    key={key}
                    x1={x}
                    y1={25}
                    x2={x}
                    y2={55}
                    stroke={layer.color}
                    strokeWidth={2}
                  />
                );
              }) : []
            )}
            
            {showGhostInTimeline && ghostPlayheadTime !== null && Math.abs(ghostPlayheadTime - currentTime) > 100 && (
              <>
                <Line
                  x1={ghostPlayheadPositionOnTimeline}
                  y1={18}
                  x2={ghostPlayheadPositionOnTimeline}
                  y2={62}
                  stroke="#ff6600"
                  strokeWidth={2}
                  strokeOpacity={0.5}
                  strokeDasharray="6,3"
                />
                <Polygon
                  points={`${ghostPlayheadPositionOnTimeline - 3},62 ${ghostPlayheadPositionOnTimeline + 3},62 ${ghostPlayheadPositionOnTimeline + 3},56 ${ghostPlayheadPositionOnTimeline},53 ${ghostPlayheadPositionOnTimeline - 3},56`}
                  fill="#ff6600"
                  fillOpacity={0.5}
                  stroke="#000000"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
              </>
            )}
            
            <Line
              x1={playheadPositionOnTimeline}
              y1={18}
              x2={playheadPositionOnTimeline}
              y2={62}
              stroke="#ff6600"
              strokeWidth={3}
            />
            <Polygon
              points={`${playheadPositionOnTimeline - 4},62 ${playheadPositionOnTimeline + 4},62 ${playheadPositionOnTimeline + 4},55 ${playheadPositionOnTimeline},52 ${playheadPositionOnTimeline - 4},55`}
              fill="#ff6600"
              stroke="#000000"
              strokeWidth={1}
            />
            
            <Rect 
              x={viewportX}
              y={18} 
              width={viewportWidth}
              height={44} 
              fill="rgba(255, 255, 255, 0.2)" 
              stroke="#ffffff" 
              strokeWidth={2}
              rx={2}
            />
            
            <Rect 
              x={viewportX - 3}
              y={18} 
              width={6}
              height={44} 
              fill="#ffffff" 
              stroke="#999999"
              strokeWidth={1}
              rx={1}
            />
            <Line x1={viewportX - 1} y1={22} x2={viewportX - 1} y2={58} stroke="#666666" strokeWidth={1} />
            <Line x1={viewportX + 1} y1={22} x2={viewportX + 1} y2={58} stroke="#666666" strokeWidth={1} />
            
            <Rect 
              x={viewportX + viewportWidth - 3}
              y={18} 
              width={6}
              height={44} 
              fill="#ffffff" 
              stroke="#999999"
              strokeWidth={1}
              rx={1}
            />
            <Line x1={viewportX + viewportWidth - 1} y1={22} x2={viewportX + viewportWidth - 1} y2={58} stroke="#666666" strokeWidth={1} />
            <Line x1={viewportX + viewportWidth + 1} y1={22} x2={viewportX + viewportWidth + 1} y2={58} stroke="#666666" strokeWidth={1} />
          </Svg>
        </View>
      </GestureDetector>
      
      <View style={styles.timeLabels}>
        <Text style={styles.timeText}>{formatTime(viewportStartTime)}</Text>
        <Text style={styles.timeText}>Current: {formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(Math.min(viewportStartTime + viewportDuration, songDuration))}</Text>
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