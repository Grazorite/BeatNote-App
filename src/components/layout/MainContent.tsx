import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import AudioControls from '../ui/controls/AudioControls';

import TimelineScrollbar from '../ui/controls/TimelineScrollbar';
import TapButton from '../ui/controls/MarkerButton';
import PlayPauseButton from '../ui/controls/PlayPauseButton';
import WaveformCanvas from '../ui/waveform/WaveformCanvas';

import StemsView from './StemsView';
import { mainContentStyles as styles } from '../../styles/layout/mainContent';

interface MainContentProps {
  viewMode: 'unified' | 'multitrack';
  layers: Layer[];
  activeLayer?: Layer;
  activeLayerMarkers: number;
  totalMarkers: number;
  layerSpecificNavigation: boolean;
  audioUri: string | null;
  sound: any;
  loadSong: () => void;
  togglePlayback: () => void;
  tapToBeat: () => void;
  seekToPosition: (position: number) => void;
  startWaveformScrub: () => void;
  endWaveformScrub: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  viewMode,
  layers,
  activeLayer,
  activeLayerMarkers,
  totalMarkers,
  layerSpecificNavigation,
  audioUri,
  sound,
  loadSong,
  togglePlayback,
  tapToBeat,
  seekToPosition,
  startWaveformScrub,
  endWaveformScrub,
}) => {
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [viewMode]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>BeatNote Studio</Text>
      
      <AudioControls
        onLoadSong={loadSong}
        onTogglePlayback={() => {}}
        hasSound={!!sound}
      />
      
      <Animated.View style={animatedStyle}>
        {viewMode === 'unified' ? (
          <WaveformCanvas
            audioUri={audioUri || undefined}
            layers={layers}
            onSeek={seekToPosition}
            onScrubStart={startWaveformScrub}
            onScrubEnd={endWaveformScrub}
          />
        ) : (
          <StemsView
            layers={layers}
            audioUri={audioUri || undefined}
            onSeek={seekToPosition}
            onScrubStart={startWaveformScrub}
            onScrubEnd={endWaveformScrub}
          />
        )}
      </Animated.View>
      
      <TimelineScrollbar audioUri={audioUri || undefined} />
      
      <View style={styles.controlsRow}>
        <PlayPauseButton 
          onTogglePlayback={togglePlayback}
          onSkipBack={() => seekToPosition(0)}
          onSkipForward={() => {
            const state = useStudioStore.getState();
            const newTime = state.songDuration - 100;
            seekToPosition(newTime);
            // Force marker button re-render by updating current time in store
            state.setCurrentTime(newTime);
          }}
        />
        <View style={styles.markerButtonContainer}>
          <TapButton onTap={tapToBeat} onSeek={seekToPosition} />
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.activeLayerText}>
          Active Layer: <Text style={[styles.activeLayerName, { color: activeLayer?.color || '#ffffff' }]}>{activeLayer?.name}</Text>
        </Text>
        {layerSpecificNavigation && (
          <Text style={styles.totalMarkersText}>
            Total: {activeLayerMarkers} markers
          </Text>
        )}
        <Text style={styles.totalMarkersText}>
          Grand Total: {totalMarkers} markers
        </Text>
      </View>
    </ScrollView>
  );
};



export default MainContent;