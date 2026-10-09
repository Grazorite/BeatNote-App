import React, { useEffect } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useCustomAudioPlayer } from '../../hooks/useAudioPlayer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import HelpScreen from '../../components/ui/screens/HelpScreen';
import { ErrorModal } from '../../components/ui/common';
import { studioScreenStyles as styles } from '../../styles/features/studioScreen';

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isMobile = Platform.OS === 'web'
    ? width < 768
    : Math.min(width, height) < 768;
  const { layers, activeLayerId, setActiveLayer, viewMode, layerSpecificNavigation, showHelpScreen, setShowHelpScreen } = useStudioStore();
  const { sound, loadSong, loadProjectAudio, audioFilename, togglePlayback, tapToBeat, seekToPosition, startWaveformScrub, endWaveformScrub, audioUri, error, hideError } = useCustomAudioPlayer();
  
  let focusTextInput = () => {};
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlayback: togglePlayback,
    onAddMarker: tapToBeat,
    onFocusTextInput: () => focusTextInput(),
    hasSound: !!sound,
  });

  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const activeLayerMarkers = activeLayer?.markers.length || 0;
  const totalMarkers = layers.reduce((sum, layer) => sum + layer.markers.length, 0);

  useEffect(() => {
    if (isMobile && activeLayerId !== 'vocals') setActiveLayer('vocals');
  }, [activeLayerId, isMobile, setActiveLayer]);

  const { isSidebarCollapsed } = useStudioStore();



  return (
    <View style={styles.mainContainer}>
      <View
        style={[
          styles.scrollView,
          {
            marginLeft: isMobile ? 0 : isSidebarCollapsed ? 60 : 280,
            paddingTop: (isMobile ? 0 : 20) + insets.top,
            paddingBottom: (isMobile ? 0 : 50) + insets.bottom,
            paddingLeft: isMobile ? insets.left : 0,
            paddingRight: isMobile ? insets.right : 0,
          },
        ]}
      >
        <MainContent
        viewMode={viewMode}
        layers={layers}
        activeLayer={activeLayer}
        activeLayerMarkers={activeLayerMarkers}
        totalMarkers={totalMarkers}
        layerSpecificNavigation={layerSpecificNavigation}
        audioUri={audioUri}
        audioFilename={audioFilename}
        loadProjectAudio={loadProjectAudio}
        sound={sound}
        loadSong={loadSong}
        togglePlayback={togglePlayback}
        tapToBeat={tapToBeat}
        seekToPosition={seekToPosition}
        startWaveformScrub={startWaveformScrub}
        endWaveformScrub={endWaveformScrub}
        onFocusTextInput={(fn) => { focusTextInput = fn; }}
        />
      </View>
      <Sidebar />
      <HelpScreen 
        visible={showHelpScreen}
        onClose={() => setShowHelpScreen(false)} 
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
