import React, { useRef, useState, useEffect } from 'react';
import { Platform, View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, Polygon } from 'react-native-svg';
import { Layer, useStudioStore, LayerId } from '../../hooks/useStudioStore';
import { BeatNoteIcon, BeatNoteIconName } from '../icons';
import StemWaveform from '../ui/waveform/StemWaveform';
import RhythmicGrid from '../ui/waveform/RhythmicGrid';
import LoadingSpinner from '../ui/common/LoadingSpinner';
import { useWaveformData } from '../../hooks/useWaveformData';
import { useZoomGesture } from '../../hooks/useZoomGesture';
import { useScrollZoom } from '../../hooks/useScrollZoom';
import { snapToNearestTarget, generateSnapTargets } from '../../utils/magneticSnapping';
import { stemsViewStyles as styles } from '../../styles/layout/stemsView';
import { colors } from '../../styles/common';
import { getLayerDisplayName } from '../../utils/layers';
import { useProductCapability } from '../../features/entitlements/useProductCapability';

interface StemsViewProps {
  layers: Layer[];
  audioUri?: string;
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const getStemIcon = (stemId: LayerId, color: string) => {
  let name: BeatNoteIconName | null = null;
  switch (stemId) {
    case 'vocals': name = 'vocals'; break;
    case 'drums': name = 'drums'; break;
    case 'bass': name = 'bass'; break;
    case 'piano': name = 'piano'; break;
    case 'guitar': name = 'guitar'; break;
    case 'other': name = 'other'; break;
  }
  return name ? <BeatNoteIcon name={name} size={20} color={color} /> : null;
};

const StemsView: React.FC<StemsViewProps> = ({
  layers,
  audioUri,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  const scrubStartedRef = useRef(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  const isMobile = Platform.OS === 'web'
    ? screenData.width < 768
    : Math.min(screenData.width, screenData.height) < 768;
  const VIEWPORT_WIDTH = isMobile
    ? screenData.width - 32
    : Math.max(720, screenData.width - 350); // 350px for sidebar + margins
  
  
  const { viewportStartTime, viewportDuration, pixelsPerSecond, currentTime, ghostPlayheadTime, songDuration, setViewportStartTime, setCurrentTime, setGhostPlayheadTime, isPlaying, songLoaded, magneticSnapping, bpm, countSize, beatAnchorMs, phraseStartMs, allLayersData } = useStudioStore();
  const showWaveform = useStudioStore(state => state.showWaveform);
  const waveformAvailable = useProductCapability('waveform.display');
  const { waveformData, loading } = useWaveformData(showWaveform && waveformAvailable ? audioUri || null : null);
  const pinchGesture = useZoomGesture();
  const stemsRef = useRef<View>(null);
  const { handleWheelZoom } = useScrollZoom(stemsRef);
  
  const visibleStems = layers.map(layer => ({
    id: layer.id,
    name: getLayerDisplayName(layer),
    color: layer.color,
  }));
  
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * viewportDuration;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
    
    // Adobe Audition-style viewport scrolling
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
  
  const tapGesture = Gesture.Tap().runOnJS(true).onEnd((event) => {
    if (!audioUri) return;
    let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
    
    if (magneticSnapping) {
      const allMarkers = allLayersData.flatMap(layer => layer.markers);
      const snapTargets = generateSnapTargets(bpm, countSize, songDuration, allMarkers, viewportStartTime, viewportDuration, beatAnchorMs, phraseStartMs);
      const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
      targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
    }
    
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setGhostPlayheadTime(newCurrentTime); // Set ghost playhead to clicked position
    onSeek(newCurrentTime);
  });
  
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .onStart(() => {
      if (!audioUri) return;
      scrubStartedRef.current = true;
      if (isPlaying) {
        onScrubStart();
      }
    })
    .onUpdate((event) => {
      if (!audioUri) return;
      
      let targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * viewportDuration;
      
      if (magneticSnapping) {
        const allMarkers = allLayersData.flatMap(layer => layer.markers);
        const snapTargets = generateSnapTargets(bpm, countSize, songDuration, allMarkers, viewportStartTime, viewportDuration, beatAnchorMs, phraseStartMs);
        const pixelsPerMs = VIEWPORT_WIDTH / viewportDuration;
        targetTime = snapToNearestTarget(targetTime, snapTargets, pixelsPerMs);
      }
      
      const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
      setCurrentTime(newCurrentTime);
      setGhostPlayheadTime(newCurrentTime);
    })
    .onFinalize(() => {
      if (!audioUri || !scrubStartedRef.current) return;
      scrubStartedRef.current = false;
      onScrubEnd();
    });
  
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(tapGesture, panGesture),
    pinchGesture
  );
  
  const playheadX = ((currentTime - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH;
  const showPlayhead = currentTime >= viewportStartTime && currentTime <= viewportStartTime + viewportDuration;
  
  // Ghost playhead position
  const ghostPlayheadX = ghostPlayheadTime ? ((ghostPlayheadTime - viewportStartTime) / viewportDuration) * VIEWPORT_WIDTH : 0;
  const showGhostPlayhead = ghostPlayheadTime !== null && 
    ghostPlayheadTime >= viewportStartTime && 
    ghostPlayheadTime <= viewportStartTime + viewportDuration &&
    Math.abs(ghostPlayheadTime - currentTime) > 100; // Only show if different from current playhead
  
  const totalStemHeight = visibleStems.length * 120;

  if (!songLoaded || !audioUri) {
    return (
      <View style={styles.stemsView}>
        <View style={styles.gridContainer}>
          <View style={styles.gridSpacer} />
          <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={pixelsPerSecond} overlayHeight={totalStemHeight} showRuler={true} />
        </View>
        <View style={styles.stemsStack}>
          {visibleStems.map((stem, index) => {
            const layer = layers.find(l => l.id === stem.id);
            const stemColor = layer?.color || stem.color;
            
            return (
              <View key={stem.id} style={[styles.stemTrack, index < visibleStems.length - 1 && styles.stemTrackBorder]}>
                <View style={styles.stemTrackLabel}>
                  <View style={styles.stemLabelContent}>
                    {getStemIcon(stem.id as LayerId, stemColor)}
                    <Text style={[styles.stemLabelText, { color: stemColor }]}>{stem.name}</Text>
                  </View>
                </View>
                <StemWaveform
                  layers={layers}
                  audioUri={undefined}
                  stemId={stem.id}
                  onSeek={onSeek}
                  onScrubStart={onScrubStart}
                  onScrubEnd={onScrubEnd}
                  waveformColor={stemColor}
                  showPlayhead={false}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stemsView}>
      <View style={styles.gridContainer}>
        <View style={styles.gridSpacer} />
        <RhythmicGrid width={VIEWPORT_WIDTH} pixelsPerSecond={pixelsPerSecond} overlayHeight={totalStemHeight} showRuler={true} />
      </View>
      {loading ? (
        <View style={styles.stemsStack}>
          {visibleStems.map((stem, index) => {
            const layer = layers.find(l => l.id === stem.id);
            const stemColor = layer?.color || stem.color;
            
            return (
              <View key={stem.id} style={[styles.stemTrack, index < visibleStems.length - 1 && styles.stemTrackBorder]}>
                <View style={styles.stemTrackLabel}>
                  <Text style={[styles.stemLabelText, { color: stemColor }]}>{stem.name}</Text>
                </View>
                <View style={styles.loadingWaveform}>
                  {index === Math.floor(visibleStems.length / 2) && <LoadingSpinner />}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.stemsStack}>
        {visibleStems.map((stem, index) => {
          const layer = layers.find(l => l.id === stem.id);
          const stemColor = layer?.color || stem.color;
          
          return (
            <View key={stem.id} style={[styles.stemTrack, index < visibleStems.length - 1 && styles.stemTrackBorder]}>
              <View style={styles.stemTrackLabel}>
                <View style={styles.stemLabelContent}>
                  {getStemIcon(stem.id as LayerId, stemColor)}
                  <Text style={[styles.stemLabelText, { color: stemColor }]}>{stem.name}</Text>
                </View>
              </View>
              <StemWaveform
                layers={layers}
                audioUri={audioUri}
                stemId={stem.id}
                onSeek={onSeek}
                onScrubStart={onScrubStart}
                onScrubEnd={onScrubEnd}
                waveformColor={stemColor}
                showPlayhead={false}
              />
            </View>
          );
        })}
        
        {/* Unified playhead overlay */}
        <GestureDetector gesture={composedGesture}>
          <View ref={stemsRef} style={[styles.playheadOverlay, { width: VIEWPORT_WIDTH }]}>
            <Svg width={VIEWPORT_WIDTH} height={totalStemHeight} style={styles.playheadSvg}>
              {/* Ghost playhead */}
              {showGhostPlayhead && audioUri && (
                <>
                  <Line
                    x1={ghostPlayheadX}
                    y1={0}
                    x2={ghostPlayheadX}
                    y2={totalStemHeight}
                    stroke={colors.accent}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                    strokeDasharray="8,4"
                    filter={Platform.OS === 'web' ? 'drop-shadow(0 0 2px rgba(0,0,0,0.4))' : undefined}
                  />
                  <Polygon
                    points={`${ghostPlayheadX-6},${totalStemHeight} ${ghostPlayheadX+6},${totalStemHeight} ${ghostPlayheadX+6},${totalStemHeight-12} ${ghostPlayheadX},${totalStemHeight-16} ${ghostPlayheadX-6},${totalStemHeight-12}`}
                    fill={colors.accent}
                    fillOpacity={0.5}
                    stroke="#000000"
                    strokeWidth={1}
                    strokeOpacity={0.3}
                  />
                </>
              )}
              
              {/* Current playhead */}
              {showPlayhead && audioUri && (
                <>
                  <Line
                    x1={playheadX}
                    y1={0}
                    x2={playheadX}
                    y2={totalStemHeight}
                    stroke={colors.accent}
                    strokeWidth={4}
                    filter={Platform.OS === 'web' ? 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' : undefined}
                  />
                  <Polygon
                    points={`${playheadX-8},${totalStemHeight} ${playheadX+8},${totalStemHeight} ${playheadX+8},${totalStemHeight-15} ${playheadX},${totalStemHeight-20} ${playheadX-8},${totalStemHeight-15}`}
                    fill={colors.accent}
                    stroke="#000000"
                    strokeWidth={1}
                  />
                </>
              )}
            </Svg>
          </View>
        </GestureDetector>
        </View>
      )}
    </View>
  );
};



export default StemsView;
