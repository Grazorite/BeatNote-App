import React from 'react';
import { View, ScrollView } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useCustomAudioPlayer } from '../../hooks/useAudioPlayer';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import { ErrorModal } from '../../components/ui/common';
import { studioScreenStyles as styles } from '../../styles/features/studioScreen';

export default function StudioScreen() {
  const { layers, activeLayerId, viewMode, layerSpecificNavigation } = useStudioStore();
  const { sound, loadSong, togglePlayback, tapToBeat, seekToPosition, startWaveformScrub, endWaveformScrub, audioUri, error, hideError } = useCustomAudioPlayer();

  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const activeLayerMarkers = activeLayer?.markers.length || 0;
  const totalMarkers = layers.reduce((sum, layer) => sum + layer.markers.length, 0);

  const { isSidebarCollapsed } = useStudioStore();
  const sidebarWidth = isSidebarCollapsed ? 60 : 280;

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={{ 
          flex: 1, 
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s ease'
        }}
        contentContainerStyle={{ 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          paddingBottom: 50,
          paddingTop: 20
        }}
        showsVerticalScrollIndicator={true}
      >
        <MainContent
        viewMode={viewMode}
        layers={layers}
        activeLayer={activeLayer}
        activeLayerMarkers={activeLayerMarkers}
        totalMarkers={totalMarkers}
        layerSpecificNavigation={layerSpecificNavigation}
        audioUri={audioUri}
        sound={sound}
        loadSong={loadSong}
        togglePlayback={togglePlayback}
        tapToBeat={tapToBeat}
        seekToPosition={seekToPosition}
        startWaveformScrub={startWaveformScrub}
        endWaveformScrub={endWaveformScrub}
        />
      </ScrollView>
      <Sidebar />
      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        onClose={hideError}
      />
    </View>
  );
}

