import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Layer } from '../../hooks/useStudioStore';
import AudioControls from '../ui/AudioControls';
import BpmControl from '../ui/BpmControl';
import TimelineScrollbar from '../ui/TimelineScrollbar';
import TapButton from '../ui/TapButton';
import WaveformCanvas from '../ui/WaveformCanvas';
import ViewModeToggle from './ViewModeToggle';
import StemsView from './StemsView';

interface MainContentProps {
  viewMode: 'single' | 'stems';
  layers: Layer[];
  activeLayer?: Layer;
  totalMarkers: number;
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
  totalMarkers,
  audioUri,
  sound,
  loadSong,
  togglePlayback,
  tapToBeat,
  seekToPosition,
  startWaveformScrub,
  endWaveformScrub,
}) => {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>BeatNote Studio</Text>
      
      <AudioControls
        onLoadSong={loadSong}
        onTogglePlayback={togglePlayback}
        hasSound={!!sound}
      />
      
      <BpmControl />
      
      <ViewModeToggle />

      {viewMode === 'single' ? (
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
      
      <TimelineScrollbar audioUri={audioUri} />
      
      <View style={styles.tapButtonContainer}>
        <TapButton onTap={tapToBeat} />
      </View>
      
      <Text style={styles.subtitle}>
        Active: {activeLayer?.name} | Total: {totalMarkers} markers
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    alignItems: 'center',
    padding: 10,
    minHeight: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tapButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  subtitle: {
    color: '#999999',
    fontSize: 14,
  },
});

export default MainContent;