import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Rect, Line, Path, Circle, Polygon } from 'react-native-svg';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useWaveformData, generateWaveformPath } from '../../../hooks/useWaveformData';
import { useScrollZoom } from '../../../hooks/useScrollZoom';
import { timelineScrollbarStyles as styles } from '../../../styles/components/controls/timelineScrollbar';

const TIMELINE_HEIGHT = 80;

interface TimelineScrollbarProps {
  audioUri?: string;
}

const TimelineScrollbar: React.FC<TimelineScrollbarProps> = ({ audioUri }) => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  const TIMELINE_WIDTH = Math.max(800, screenData.width - 350); // 350px for sidebar + margins
  const { 
    currentTime, 
    ghostPlayheadTime,
    showGhostInTimeline,
    showTimeline,
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
      
      if (isViewportLocked && (currentTime < constrainedViewportStartTime || currentTime > constrainedViewportStartTime + constrainedViewportDuration)) {
        const newStartTime = Math.max(0, Math.min(currentTime, songDuration - constrainedViewportDuration));
        setViewportStartTime(newStartTime);
      }
    }
  }, [currentTime, isPlaying, viewportStartTime, viewportDuration, songDuration, setViewportStartTime, isDragging]);

  // Ensure viewport stays within bounds
  const constrainedViewportDuration = Math.min(viewportDuration, songDuration);
  const constrainedViewportStartTime = Math.max(0, Math.min(viewportStartTime, songDuration - constrainedViewportDuration));
  
  const viewportWidth = Math.min((constrainedViewportDuration / songDuration) * TIMELINE_WIDTH, TIMELINE_WIDTH);
  const viewportX = (constrainedViewportStartTime / songDuration) * TIMELINE_WIDTH;
  
  // Inner bounds for content (excluding resize handles)
  const innerX = Math.max(6, viewportX);
  const innerWidth = Math.max(0, Math.min(viewportWidth, TIMELINE_WIDTH - innerX - 6));
  const contentStartTime = (innerX / TIMELINE_WIDTH) * songDuration;
  const contentDuration = (innerWidth / TIMELINE_WIDTH) * songDuration;
  // Always show playhead in timeline, constrained to timeline bounds
  const playheadPositionOnTimeline = Math.max(0, Math.min(TIMELINE_WIDTH, (currentTime / songDuration) * TIMELINE_WIDTH));
    
  const ghostPlayheadPositionOnTimeline = ghostPlayheadTime !== null
    ? Math.max(0, Math.min(TIMELINE_WIDTH, (ghostPlayheadTime / songDuration) * TIMELINE_WIDTH))
    : -100; // Position off-screen if no ghost playhead
  
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
      songDuration,
      waveformData.duration
    );
  }, [waveformData, TIMELINE_WIDTH, songDuration]);

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
      
      const leftHandleX = Math.max(0, viewportX - 6);
      const rightHandleX = Math.min(TIMELINE_WIDTH - 12, viewportX + viewportWidth - 6);
      
      if (touchX >= leftHandleX && touchX <= leftHandleX + 12) {
        setIsResizing('left');
        dragState.current.initialViewportStart = viewportStartTime;
        dragState.current.initialViewportDuration = viewportDuration;
      } else if (touchX >= rightHandleX && touchX <= rightHandleX + 12) {
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
        const maxDuration = songDuration - newStartTime;
        const newDuration = Math.max(1000, Math.min(maxDuration, dragState.current.initialViewportDuration - dragDistance));
        setViewportStartTime(newStartTime);
        setViewportDuration(newDuration);
      } else if (isResizing === 'right') {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const maxDuration = songDuration - viewportStartTime;
        const newDuration = Math.max(1000, Math.min(maxDuration, dragState.current.initialViewportDuration + dragDistance));
        setViewportDuration(newDuration);
      } else if (isDragging) {
        const dragDistance = (event.translationX / TIMELINE_WIDTH) * songDuration;
        const newStartTime = Math.max(0, 
          Math.min(dragState.current.initialViewportStart + dragDistance, songDuration - constrainedViewportDuration)
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

  if (!showTimeline) {
    return null;
  }

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
        <View 
          ref={timelineRef}
          style={styles.cursorAuto}
        >
          <View 
            style={[styles.cursorResize, { position: 'absolute', left: Math.max(0, viewportX - 6), top: 18, width: 12, height: 44, zIndex: 10 }]}
          />
          <View 
            style={[styles.cursorResize, { position: 'absolute', left: Math.min(TIMELINE_WIDTH - 12, viewportX + viewportWidth - 6), top: 18, width: 12, height: 44, zIndex: 10 }]}
          />
          <Svg width={TIMELINE_WIDTH} height={TIMELINE_HEIGHT} style={styles.timeline}>
            <defs>
              <clipPath id="timelineClip">
                <rect x={innerX} y={0} width={innerWidth} height={40} />
              </clipPath>
            </defs>
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
              layer.isVisible ? layer.markers
                .filter(marker => {
                  const x = (marker / songDuration) * TIMELINE_WIDTH;
                  return x >= innerX && x <= innerX + innerWidth;
                })
                .map((marker, index) => {
                  const x = (marker / songDuration) * TIMELINE_WIDTH;
                  const key = `${layer.id}-${marker}-${index}`;
                  
                  return (layer.id === 'piano' || layer.id === 'other') ? (
                    <Circle
                      key={key}
                      cx={x}
                      cy={40}
                      r={5}
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
            
            {showGhostInTimeline && ghostPlayheadTime !== null && Math.abs(ghostPlayheadTime - currentTime) > 100 && 
             ghostPlayheadPositionOnTimeline >= 0 && (
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
            
            {playheadPositionOnTimeline >= 0 && (
              <>
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
              </>
            )}
            
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
              x={Math.max(0, viewportX - 6)}
              y={18} 
              width={12}
              height={44} 
              fill="#ffffff" 
              stroke="#999999"
              strokeWidth={1}
              rx={2}
            />
            <Line x1={Math.max(2, viewportX - 2)} y1={22} x2={Math.max(2, viewportX - 2)} y2={58} stroke="#666666" strokeWidth={1} />
            <Line x1={Math.max(6, viewportX + 2)} y1={22} x2={Math.max(6, viewportX + 2)} y2={58} stroke="#666666" strokeWidth={1} />
            
            <Rect 
              x={Math.min(TIMELINE_WIDTH - 12, viewportX + viewportWidth - 6)}
              y={18} 
              width={12}
              height={44} 
              fill="#ffffff" 
              stroke="#999999"
              strokeWidth={1}
              rx={2}
            />
            <Line x1={Math.min(TIMELINE_WIDTH - 2, viewportX + viewportWidth - 2)} y1={22} x2={Math.min(TIMELINE_WIDTH - 2, viewportX + viewportWidth - 2)} y2={58} stroke="#666666" strokeWidth={1} />
            <Line x1={Math.min(TIMELINE_WIDTH - 6, viewportX + viewportWidth + 2)} y1={22} x2={Math.min(TIMELINE_WIDTH - 6, viewportX + viewportWidth + 2)} y2={58} stroke="#666666" strokeWidth={1} />
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



export default TimelineScrollbar;