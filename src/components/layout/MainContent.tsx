import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Layer } from '../../hooks/useStudioStore';
import AudioControls from '../ui/controls/AudioControls';
import BpmControl from '../ui/controls/BpmControl';
import TimelineScrollbar from '../ui/controls/TimelineScrollbar';
import TapButton from '../ui/controls/TapButton';
import WaveformCanvas from '../ui/waveform/WaveformCanvas';
import ViewModeToggle from './ViewModeToggle';
import StemsView from './StemsView';
import { mainContentStyles as styles } from '../../styles/layout/mainContent';

interface MainContentProps {
  viewMode: 'unified' | 'multitrack';
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
      
      <TimelineScrollbar audioUri={audioUri || undefined} />
      
      <View style={styles.tapButtonContainer}>
        <TapButton onTap={tapToBeat} />
      </View>
      
      <Text style={styles.subtitle}>
        Active: {activeLayer?.name} | Total: {totalMarkers} markers
      </Text>
    </ScrollView>
  );
};



export default MainContent;