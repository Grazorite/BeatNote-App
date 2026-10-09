import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import ProjectControls from '../ui/controls/ProjectControls';

import TimelineScrollbar from '../ui/controls/TimelineScrollbar';
import TapButton from '../ui/controls/MarkerButton';
import AudioControls from '../ui/controls/AudioControls';
import HorizontalLayerSelector from '../ui/controls/HorizontalLayerSelector';
import AnnotationField, { AnnotationFieldRef } from '../ui/controls/AnnotationField';
import WaveformWorkspace from '../ui/waveform/WaveformWorkspace';

import StemsView from './StemsView';
import { STEM_SEPARATION_UI_ENABLED } from '../../features/stemSeparation/featureFlags';
import { mainContentStyles as styles } from '../../styles/layout/mainContent';

interface MainContentProps {
  viewMode: 'unified' | 'multitrack';
  layers: Layer[];
  activeLayer?: Layer;
  activeLayerMarkers: number;
  totalMarkers: number;
  layerSpecificNavigation: boolean;
  audioUri: string | null;
  audioFilename: string | null;
  loadProjectAudio: (uri: string, filename: string) => void;
  sound: any;
  loadSong: () => void;
  togglePlayback: () => void;
  tapToBeat: () => void;
  seekToPosition: (position: number) => void;
  startWaveformScrub: () => void;
  endWaveformScrub: () => void;
  onFocusTextInput: (fn: () => void) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  viewMode,
  layers,
  activeLayer,
  activeLayerMarkers,
  totalMarkers,
  layerSpecificNavigation,
  audioUri,
  audioFilename,
  loadProjectAudio,
  sound,
  loadSong,
  togglePlayback,
  tapToBeat,
  seekToPosition,
  startWaveformScrub,
  endWaveformScrub,
  onFocusTextInput,
}) => {
  const opacity = useSharedValue(1);
  const screenData = useWindowDimensions();
  const annotationFieldRef = useRef<AnnotationFieldRef>(null);
  
  // Pass focus function to parent
  useEffect(() => {
    onFocusTextInput(() => {
      annotationFieldRef.current?.focus();
    });
  }, [onFocusTextInput]);
  
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [viewMode]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  
  // Responsive container width
  const isMobile = Platform.OS === 'web'
    ? screenData.width < 768
    : Math.min(screenData.width, screenData.height) < 768;
  const isLandscapePhone = isMobile && screenData.width > screenData.height;
  const projectControls = (
    <ProjectControls
      onLoadSong={loadSong}
      onTogglePlayback={() => {}}
      hasSound={!!sound}
      audioUri={audioUri}
      audioFilename={audioFilename}
      onLoadProjectAudio={loadProjectAudio}
      isMobile={isMobile}
    />
  );
  const waveform = (
    <Animated.View style={[animatedStyle, isMobile && styles.mobileWaveform]}>
      {!STEM_SEPARATION_UI_ENABLED || viewMode === 'unified' ? (
        <WaveformWorkspace
          audioUri={audioUri}
          layers={layers}
          onSeek={seekToPosition}
          onScrubStart={startWaveformScrub}
          onScrubEnd={endWaveformScrub}
          isMobile={isMobile}
          isLandscape={screenData.width > screenData.height}
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
  );
  const timeline = <TimelineScrollbar audioUri={audioUri || undefined} onSeek={seekToPosition} compact={isMobile} />;
  const audioControls = (
    <AudioControls
      onTogglePlayback={togglePlayback}
      onSkipBack={() => seekToPosition(0)}
      onSkipForward={() => {
        const duration = useStudioStore.getState().songDuration;
        seekToPosition(duration);
      }}
      isMobile={isMobile}
      compact={isMobile}
    />
  );
  const markerControls = <TapButton onTap={tapToBeat} onSeek={seekToPosition} isMobile={isMobile} compact={isMobile} />;
  const layerSelector = <HorizontalLayerSelector />;
  const status = (
    <View style={styles.statusContainer}>
      <Text style={styles.activeLayerText}>
        Active Layer: <Text style={[styles.activeLayerName, { color: activeLayer?.color || '#ffffff' }]}>{activeLayer?.name}</Text>
      </Text>
      {layerSpecificNavigation && (
        <Text style={styles.totalMarkersText}>
          Total: {activeLayerMarkers} markers
        </Text>
      )}
      <Text style={styles.totalMarkersText} testID="grand-total-markers">
        Grand Total: {totalMarkers} markers
      </Text>
    </View>
  );

  if (isMobile) {
    const mobileCanvas = (
      <View
        style={[styles.mobileCanvas, isLandscapePhone && styles.landscapeCanvas]}
        testID="mobile-workspace-scroll"
      >
        {waveform}
        {timeline}
        <Text style={styles.mobileMarkerStatus} testID="grand-total-markers">
          Grand Total: {totalMarkers} markers
        </Text>
      </View>
    );
    const controlDock = (
      <View style={[styles.mobileControlDock, isLandscapePhone && styles.landscapeControlRail]} testID={isLandscapePhone ? 'landscape-control-rail' : 'portrait-control-dock'}>
        <View style={styles.mobileTransportRow}>{audioControls}</View>
        <View style={isLandscapePhone ? styles.landscapeMarkerActions : styles.mobileMarkerActions}>
          {markerControls}
        </View>
        <AnnotationField ref={annotationFieldRef} isMobile />
      </View>
    );
    return (
      <View style={styles.mobileWorkspace}>
        {projectControls}
        {isLandscapePhone ? (
          <View style={styles.landscapeBody}>{mobileCanvas}{controlDock}</View>
        ) : (
          <>{mobileCanvas}{controlDock}</>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      stickyHeaderIndices={[0]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      contentContainerStyle={styles.container}
    >
      {projectControls}
      {waveform}
      {timeline}
      <View style={styles.controlsRow}>
        {audioControls}
        <AnnotationField ref={annotationFieldRef} />
        <View style={styles.markerButtonContainer}>{markerControls}</View>
      </View>
      {layerSelector}
      {status}
    </ScrollView>
  );
};



export default MainContent;
