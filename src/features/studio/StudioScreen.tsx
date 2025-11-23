import React from 'react';
import { View } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useCustomAudioPlayer } from '../../hooks/useAudioPlayer';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import { ErrorModal } from '../../components/ui/common';
import { studioScreenStyles as styles } from '../../styles/features/studioScreen';

export default function StudioScreen() {
  const { layers, activeLayerId, viewMode } = useStudioStore();
  const { sound, loadSong, togglePlayback, tapToBeat, seekToPosition, startWaveformScrub, endWaveformScrub, audioUri, error, hideError } = useCustomAudioPlayer();

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
      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        onClose={hideError}
      />
    </View>
  );
}

