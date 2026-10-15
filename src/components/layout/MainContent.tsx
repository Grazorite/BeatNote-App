import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import { useDockToast } from '../../hooks/useDockToast';
import ProjectControls from '../ui/controls/ProjectControls';

import LoopRangeOverview from '../ui/controls/LoopRangeOverview';
import TapButton from '../ui/controls/MarkerButton';
import AudioControls from '../ui/controls/AudioControls';
import ControlDock from '../ui/controls/ControlDock';
import DockToast from '../ui/controls/DockToast';
import GlassBackdrop from '../ui/controls/GlassBackdrop';
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
  safeAreaBottom: number;
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
  safeAreaBottom,
}) => {
  const opacity = useSharedValue(1);
  const screenData = useWindowDimensions();
  const annotationFieldRef = useRef<AnnotationFieldRef>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const toast = useDockToast();
  
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
  const timeline = <LoopRangeOverview audioUri={audioUri} />;
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
      <Text style={styles.assistiveStatus} testID="grand-total-markers">
        Grand Total: {totalMarkers} markers
      </Text>
    </View>
  );

  if (isMobile) {
    const mobileTimeline = (
      <View style={styles.mobileTimeline}>
        <DockToast message={toast.message} />
        <LoopRangeOverview audioUri={audioUri} onToast={toast.show} />
      </View>
    );
    const mobileAnnotation = (
      <View style={[styles.mobileAnnotation, isLandscapePhone && styles.landscapeAnnotation]}>
        <GlassBackdrop
          testID="annotation-glass"
          gradientId={isLandscapePhone ? 'annotation-glass-landscape' : 'annotation-glass-portrait'}
          radius={14}
        />
        <AnnotationField ref={annotationFieldRef} isMobile compact={isLandscapePhone} />
      </View>
    );
    const mobileCanvas = (
      <View
        style={[styles.mobileCanvas, isLandscapePhone && styles.landscapeCanvas]}
        testID="mobile-workspace-scroll"
      >
        {waveform}
        {mobileTimeline}
        {mobileAnnotation}
        <Text style={styles.assistiveStatus} testID="grand-total-markers">
          Grand Total: {totalMarkers} markers
        </Text>
      </View>
    );
    const controlDock = (
      <View
        style={[
          styles.mobileControlDock,
          { paddingBottom: isLandscapePhone ? 0 : Math.max(safeAreaBottom, 34) },
          isLandscapePhone && styles.landscapeControlRail,
        ]}
        testID={isLandscapePhone ? 'landscape-control-rail' : 'portrait-control-dock'}
      >
        <GlassBackdrop
          testID="control-dock-glass"
          gradientId={isLandscapePhone ? 'control-dock-glass-landscape' : 'control-dock-glass-portrait'}
          radius={isLandscapePhone ? 0 : 14}
        />
        <ControlDock
          isLandscape={isLandscapePhone}
          onTogglePlayback={togglePlayback}
          onSeek={seekToPosition}
          onAddMarker={tapToBeat}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={setPlaybackSpeed}
          onToast={toast.show}
        />
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
