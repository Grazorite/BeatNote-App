import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, Polygon } from 'react-native-svg';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import StemWaveform from '../ui/waveform/StemWaveform';
import RhythmicGrid from '../ui/waveform/RhythmicGrid';
import LoadingSpinner from '../ui/common/LoadingSpinner';
import { useWaveformData } from '../../hooks/useWaveformData';
import { stemsViewStyles as styles } from '../../styles/layout/stemsView';
import { colors } from '../../styles/common';

interface StemsViewProps {
  layers: Layer[];
  audioUri?: string;
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const STEM_CONFIGS = [
  { name: 'Vocals', id: 'vocals', color: '#ff6666' },
  { name: 'Drums', id: 'drums', color: '#00ccff' },
  { name: 'Bass', id: 'bass', color: '#bb66ff' },
  { name: 'Piano', id: 'piano', color: '#ffcc00' },
  { name: 'Guitar', id: 'guitar', color: '#d2b48c' },
  { name: 'Other', id: 'other', color: '#ff69b4' }
];

const VIEWPORT_WIDTH = 720;
const VIEWPORT_DURATION = 20000;

const StemsView: React.FC<StemsViewProps> = ({
  layers,
  audioUri,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  console.log('StemsView render:', { layers: layers?.length, audioUri: !!audioUri });
  
  const { viewportStartTime, currentTime, ghostPlayheadTime, songDuration, setViewportStartTime, setCurrentTime, setGhostPlayheadTime, isPlaying, songLoaded } = useStudioStore();
  const { waveformData, loading } = useWaveformData(audioUri || null);
  
  const visibleStems = STEM_CONFIGS.filter(stem => 
    layers.some(layer => layer.id === stem.id)
  );
  
  console.log('StemsView visibleStems:', visibleStems.map(s => s.id));
  
  const updateTimeFromPosition = (x: number) => {
    const targetTime = viewportStartTime + (x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setCurrentTime(newCurrentTime);
    
    // Adobe Audition-style viewport scrolling
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
    if (!audioUri) return;
    const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
    const newCurrentTime = Math.max(0, Math.min(targetTime, songDuration));
    setGhostPlayheadTime(newCurrentTime); // Set ghost playhead to clicked position
    onSeek(newCurrentTime);
  });
  
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (!audioUri) return;
      if (isPlaying) {
        onScrubStart();
      }
    })
    .onUpdate((event) => {
      if (!audioUri) return;
      updateTimeFromPosition(event.x);
      // Update ghost playhead during scrubbing
      const targetTime = viewportStartTime + (event.x / VIEWPORT_WIDTH) * VIEWPORT_DURATION;
      const newGhostTime = Math.max(0, Math.min(targetTime, songDuration));
      setGhostPlayheadTime(newGhostTime);
    })
    .onEnd(() => {
      if (!audioUri) return;
      onScrubEnd();
    });
  
  const composedGesture = Gesture.Race(tapGesture, panGesture);
  
  const playheadX = ((currentTime - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH;
  const showPlayhead = currentTime >= viewportStartTime && currentTime <= viewportStartTime + VIEWPORT_DURATION;
  
  // Ghost playhead position
  const ghostPlayheadX = ghostPlayheadTime ? ((ghostPlayheadTime - viewportStartTime) / VIEWPORT_DURATION) * VIEWPORT_WIDTH : 0;
  const showGhostPlayhead = ghostPlayheadTime !== null && 
    ghostPlayheadTime >= viewportStartTime && 
    ghostPlayheadTime <= viewportStartTime + VIEWPORT_DURATION &&
    Math.abs(ghostPlayheadTime - currentTime) > 100; // Only show if different from current playhead
  
  const totalStemHeight = visibleStems.length * 120;

  if (!songLoaded || !audioUri) {
    return (
      <View style={styles.stemsView}>
        <View style={styles.gridContainer}>
          <View style={styles.gridSpacer} />
          <RhythmicGrid width={720} pixelsPerSecond={720 / (20000 / 1000)} overlayHeight={totalStemHeight} />
        </View>
        <View style={styles.stemsStack}>
          {visibleStems.map((stem, index) => {
            const layer = layers.find(l => l.id === stem.id);
            const stemColor = layer?.color || stem.color;
            
            return (
              <View key={stem.id} style={[styles.stemTrack, index < visibleStems.length - 1 && styles.stemTrackBorder]}>
                <View style={styles.stemTrackLabel}>
                  <Text style={[styles.stemLabelText, { color: stemColor }]}>{stem.name}</Text>
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
        <RhythmicGrid width={720} pixelsPerSecond={720 / (20000 / 1000)} overlayHeight={totalStemHeight} />
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
                <View style={{ width: 720, height: 120, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
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
                <Text style={[styles.stemLabelText, { color: stemColor }]}>{stem.name}</Text>
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
          <View style={styles.playheadOverlay}>
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
                    filter="drop-shadow(0 0 2px rgba(0,0,0,0.4))"
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
                    filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
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