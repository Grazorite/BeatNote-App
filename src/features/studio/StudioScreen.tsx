import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useCustomAudioPlayer } from '../../hooks/useAudioPlayer';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';

export default function StudioScreen() {
  const { layers, activeLayerId, viewMode } = useStudioStore();
  const { sound, loadSong, togglePlayback, tapToBeat, seekToPosition, startWaveformScrub, endWaveformScrub, audioUri } = useCustomAudioPlayer();

  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const totalMarkers = layers.reduce((sum, layer) => sum + layer.markers.length, 0);

  return (
    <View style={styles.mainContainer}>
      <Sidebar />
      <MainContent
        viewMode={viewMode}
        layers={layers}
        activeLayer={activeLayer}
        totalMarkers={totalMarkers}
        audioUri={audioUri}
        sound={sound}
        loadSong={loadSong}
        togglePlayback={togglePlayback}
        tapToBeat={tapToBeat}
        seekToPosition={seekToPosition}
        startWaveformScrub={startWaveformScrub}
        endWaveformScrub={endWaveformScrub}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
});