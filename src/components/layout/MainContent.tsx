import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Layer } from '../../hooks/useStudioStore';
import AudioControls from '../ui/controls/AudioControls';

import TimelineScrollbar from '../ui/controls/TimelineScrollbar';
import TapButton from '../ui/controls/MarkerButton';
import WaveformCanvas from '../ui/waveform/WaveformCanvas';

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
      
      <View style={styles.markerButtonContainer}>
        <TapButton onTap={tapToBeat} />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.activeLayerText}>
          Active Layer: <Text style={[styles.activeLayerName, { color: activeLayer?.color || '#ffffff' }]}>{activeLayer?.name}</Text>
        </Text>
        <Text style={styles.totalMarkersText}>
          Total: {totalMarkers} markers
        </Text>
      </View>
    </ScrollView>
  );
};



export default MainContent;