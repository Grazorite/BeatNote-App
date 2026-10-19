import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Layer, SelectedMarker, useStudioStore } from '../../hooks/useStudioStore';
import { useDockToast } from '../../hooks/useDockToast';
import {
  findMarkerNearTime,
  findTimedAnnotationMarker,
  getMarkerAnnotation,
} from '../../utils/markerSelection';
import ProjectControls from '../ui/controls/ProjectControls';

import LoopRangeOverview from '../ui/controls/LoopRangeOverview';
import TapButton from '../ui/controls/MarkerButton';
import AudioControls from '../ui/controls/AudioControls';
import ControlDock from '../ui/controls/ControlDock';
import AnnotationCallout from '../ui/controls/AnnotationCallout';
import DockToast from '../ui/controls/DockToast';
import GlassBackdrop from '../ui/controls/GlassBackdrop';
import HorizontalLayerSelector from '../ui/controls/HorizontalLayerSelector';
import AnnotationField, { AnnotationFieldRef } from '../ui/controls/AnnotationField';
import AnnotationEditorModal from '../ui/modals/AnnotationEditorModal';
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
  const [editingMarker, setEditingMarker] = useState<SelectedMarker | null>(null);
  const toast = useDockToast();
  const libraryNotice = useStudioStore(state => state.libraryNotice);
  const lastForwardedNoticeId = useRef(0);
  const currentTime = useStudioStore(state => state.currentTime);
  const playbackSpeed = useStudioStore(state => state.playbackSpeed);
  const setPlaybackSpeed = useStudioStore(state => state.setPlaybackSpeed);
  const activeLayerId = useStudioStore(state => state.activeLayerId);
  const allLayersData = useStudioStore(state => state.allLayersData);
  const setSelectedMarker = useStudioStore(state => state.setSelectedMarker);
  const updateMarkerAnnotation = useStudioStore(state => state.updateMarkerAnnotation);
  const currentMarker = findMarkerNearTime(allLayersData, currentTime, activeLayerId);
  const currentAnnotation = getMarkerAnnotation(allLayersData, currentMarker);
  const timedAnnotationMarker = findTimedAnnotationMarker(allLayersData, currentTime, activeLayerId);
  const displayedAnnotation = getMarkerAnnotation(allLayersData, timedAnnotationMarker);
  const editingAnnotation = getMarkerAnnotation(allLayersData, editingMarker);

  const openAnnotationEditor = (marker: SelectedMarker | null = currentMarker) => {
    if (!marker) return;
    setSelectedMarker(marker);
    setEditingMarker(marker);
  };
  const closeAnnotationEditor = () => setEditingMarker(null);
  const saveAnnotation = (text: string) => {
    if (!editingMarker) return;
    updateMarkerAnnotation(editingMarker.layerId, editingMarker.timestamp, text);
    setEditingMarker(null);
    toast.show(text.trim() ? 'Annotation saved' : 'Annotation removed');
  };
  
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

  useEffect(() => {
    if (libraryNotice === null || libraryNotice.id === lastForwardedNoticeId.current) return;
    lastForwardedNoticeId.current = libraryNotice.id;
    toast.show(libraryNotice.message, libraryNotice.action ?? null);
  }, [libraryNotice, toast.show]);
  
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
        <DockToast key={toast.nonce} message={toast.message} action={toast.action} />
        {timedAnnotationMarker && displayedAnnotation.trim() && (
          <AnnotationCallout
            key={`${timedAnnotationMarker.layerId}-${timedAnnotationMarker.timestamp}`}
            text={displayedAnnotation}
            onPress={() => openAnnotationEditor(timedAnnotationMarker)}
          />
        )}
        <LoopRangeOverview audioUri={audioUri} onToast={toast.show} />
      </View>
    );
    const mobileCanvas = (
      <View
        style={[styles.mobileCanvas, isLandscapePhone && styles.landscapeCanvas]}
        testID="mobile-workspace-scroll"
      >
        {waveform}
        {mobileTimeline}
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
          canAnnotate={currentMarker !== null}
          hasAnnotation={Boolean(currentAnnotation.trim())}
          onAnnotate={() => openAnnotationEditor()}
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
        <AnnotationEditorModal
          visible={editingMarker !== null}
          marker={editingMarker}
          initialText={editingAnnotation}
          onCancel={closeAnnotationEditor}
          onSave={saveAnnotation}
        />
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
      <View>
        {projectControls}
        <DockToast key={toast.nonce} message={toast.message} action={toast.action} />
      </View>
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
