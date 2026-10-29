import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  LayoutChangeEvent,
  View,
  Text,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Layer, LayerId, SelectedMarker, useStudioStore } from '../../hooks/useStudioStore';
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
import DanceCountDisplay from '../ui/controls/DanceCountDisplay';
import AnnotationEditorModal from '../ui/modals/AnnotationEditorModal';
import WaveformWorkspace from '../ui/waveform/WaveformWorkspace';

import StemsView from './StemsView';
import { STEM_SEPARATION_UI_ENABLED } from '../../features/stemSeparation/featureFlags';
import { mainContentStyles as styles } from '../../styles/layout/mainContent';
import { capabilitiesForLoadedItem } from '../../features/library/sourceResolver';
import { getLayerDisplayName } from '../../utils/layers';

interface MainContentProps {
  viewMode: 'unified' | 'multitrack';
  layers: Layer[];
  activeLayer?: Layer;
  activeLayerMarkers: number;
  totalMarkers: number;
  layerSpecificNavigation: boolean;
  audioUri: string | null;
  audioFilename: string | null;
  togglePlayback: () => void;
  tapToBeat: () => void;
  seekToPosition: (position: number) => void;
  startWaveformScrub: () => void;
  endWaveformScrub: () => void;
  onFocusTextInput: (fn: () => void) => void;
  safeAreaBottom: number;
}

const markerKey = (marker: SelectedMarker | null): string => (
  marker === null ? '' : `${marker.layerId}:${marker.timestamp}`
);

const LANDSCAPE_TOOLBAR_FALLBACK_HEIGHT = 55;

const markerFromKey = (key: string): SelectedMarker | null => {
  if (key === '') return null;
  const separator = key.lastIndexOf(':');
  if (separator < 1) return null;
  const timestamp = Number(key.slice(separator + 1));
  if (!Number.isFinite(timestamp)) return null;
  return {
    layerId: key.slice(0, separator) as LayerId,
    timestamp,
  };
};

const MainContent: React.FC<MainContentProps> = ({
  viewMode,
  layers,
  activeLayer,
  activeLayerMarkers,
  totalMarkers,
  layerSpecificNavigation,
  audioUri,
  audioFilename,
  togglePlayback,
  tapToBeat,
  seekToPosition,
  startWaveformScrub,
  endWaveformScrub,
  onFocusTextInput,
  safeAreaBottom,
}) => {
  const opacity = useSharedValue(1);
  const switchContentOpacity = useSharedValue(1);
  const switchOverlayOpacity = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const screenData = useWindowDimensions();
  const annotationFieldRef = useRef<AnnotationFieldRef>(null);
  const pendingAnnotationSaveRef = useRef<{ marker: SelectedMarker; text: string } | null>(null);
  const [editingMarker, setEditingMarker] = useState<SelectedMarker | null>(null);
  const [landscapeRailHeight, setLandscapeRailHeight] = useState(0);
  const [switchTransitionVisible, setSwitchTransitionVisible] = useState(false);
  const [switchTransitionTitle, setSwitchTransitionTitle] = useState('song');
  const toast = useDockToast();
  const libraryNotice = useStudioStore(state => state.libraryNotice);
  const hasLoadedSong = useStudioStore(state => state.songLoaded);
  const capabilities = useStudioStore(state => capabilitiesForLoadedItem(
    state.currentMusicItemId === null ? null : state.libraryItems[state.currentMusicItemId] ?? null,
    state.songLoaded && state.currentAudioUri !== null,
  ));
  const lastForwardedNoticeId = useRef(0);
  const playbackSpeed = useStudioStore(state => state.playbackSpeed);
  const setPlaybackSpeed = useStudioStore(state => state.setPlaybackSpeed);
  const switchPhase = useStudioStore(state => state.switchPhase);
  const switchTargetTitle = useStudioStore(state => {
    const targetId = state.pendingSwitchTargetId ?? state.loadingMusicItemId;
    return targetId === null ? null : state.libraryItems[targetId]?.displayTitle ?? null;
  });
  const switchBusy = switchPhase !== 'idle' && switchPhase !== 'guard';
  const activeLayerId = useStudioStore(state => state.activeLayerId);
  const allLayersData = useStudioStore(state => state.allLayersData);
  const currentMarkerKey = useStudioStore(state => markerKey(
    findMarkerNearTime(state.allLayersData, state.currentTime, state.activeLayerId),
  ));
  const timedAnnotationMarkerKey = useStudioStore(state => markerKey(
    findTimedAnnotationMarker(state.allLayersData, state.currentTime, state.activeLayerId),
  ));
  const setSelectedMarker = useStudioStore(state => state.setSelectedMarker);
  const updateMarkerAnnotation = useStudioStore(state => state.updateMarkerAnnotation);
  const currentMarker = useMemo(() => markerFromKey(currentMarkerKey), [currentMarkerKey]);
  const currentAnnotation = getMarkerAnnotation(allLayersData, currentMarker);
  const timedAnnotationMarker = useMemo(
    () => markerFromKey(timedAnnotationMarkerKey),
    [timedAnnotationMarkerKey],
  );
  const displayedAnnotation = getMarkerAnnotation(allLayersData, timedAnnotationMarker);
  const editingAnnotation = getMarkerAnnotation(allLayersData, editingMarker);

  const openAnnotationEditor = (marker: SelectedMarker | null = currentMarker) => {
    if (!marker) return;
    setSelectedMarker(marker);
    setEditingMarker(marker);
  };
  const closeAnnotationEditor = () => setEditingMarker(null);
  const commitPendingAnnotationSave = useCallback(() => {
    const pending = pendingAnnotationSaveRef.current;
    if (pending === null) return;
    pendingAnnotationSaveRef.current = null;
    updateMarkerAnnotation(pending.marker.layerId, pending.marker.timestamp, pending.text);
    toast.show(pending.text.trim() ? 'Annotation saved' : 'Annotation removed');
  }, [toast.show, updateMarkerAnnotation]);
  const saveAnnotation = (text: string) => {
    if (!editingMarker) return;
    pendingAnnotationSaveRef.current = { marker: editingMarker, text };
    Keyboard.dismiss();
    setEditingMarker(null);
    if (Platform.OS !== 'ios') {
      InteractionManager.runAfterInteractions(commitPendingAnnotationSave);
    }
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

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    if (switchBusy) {
      if (switchTargetTitle !== null) setSwitchTransitionTitle(switchTargetTitle);
      setSwitchTransitionVisible(true);
      if (reduceMotion) {
        switchContentOpacity.value = 0.55;
        switchOverlayOpacity.value = 1;
      } else {
        switchContentOpacity.value = withTiming(0.55, { duration: 90 });
        switchOverlayOpacity.value = withTiming(1, { duration: 90 });
      }
    } else if (switchTransitionVisible) {
      if (reduceMotion) {
        switchContentOpacity.value = 1;
        switchOverlayOpacity.value = 0;
        setSwitchTransitionVisible(false);
      } else {
        switchContentOpacity.value = withTiming(1, { duration: 160 });
        switchOverlayOpacity.value = withTiming(0, { duration: 160 });
        hideTimer = setTimeout(() => setSwitchTransitionVisible(false), 180);
      }
    }
    return () => {
      if (hideTimer !== null) clearTimeout(hideTimer);
    };
  }, [
    reduceMotion,
    switchBusy,
    switchContentOpacity,
    switchOverlayOpacity,
    switchTargetTitle,
    switchTransitionVisible,
  ]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  const switchContentStyle = useAnimatedStyle(() => ({
    opacity: switchContentOpacity.value,
  }));
  const switchOverlayStyle = useAnimatedStyle(() => ({
    opacity: switchOverlayOpacity.value,
  }));
  
  // Responsive container width
  const isMobile = Platform.OS === 'web'
    ? screenData.width < 768
    : Math.min(screenData.width, screenData.height) < 768;
  const isLandscapePhone = isMobile && screenData.width > screenData.height;
  const projectControls = (
    <ProjectControls
      audioFilename={audioFilename}
      isMobile={isMobile}
      isLandscape={isLandscapePhone}
    />
  );
  const waveformCapabilityMessage = hasLoadedSong && !capabilities.waveformAccess
    ? 'Not available for this source: waveform access'
    : hasLoadedSong && !capabilities.exactSeeking
      ? 'Not available for this source: exact seeking'
      : null;
  const waveformCapabilityNotice = waveformCapabilityMessage === null ? null : (
    <View
      style={styles.capabilityNotice}
      accessible
      accessibilityLabel="Waveform controls unavailable"
      accessibilityHint={waveformCapabilityMessage}
      accessibilityState={{ disabled: true }}
    >
      <Text style={styles.capabilityDescription}>{waveformCapabilityMessage}</Text>
    </View>
  );
  const waveform = !hasLoadedSong || capabilities.waveformAccess ? (
    <>
      <Animated.View
        pointerEvents={!hasLoadedSong || capabilities.exactSeeking ? 'auto' : 'none'}
        style={[animatedStyle, isMobile && styles.mobileWaveform]}
      >
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
      {waveformCapabilityNotice}
    </>
  ) : (
    waveformCapabilityNotice
  );
  const timeline = !hasLoadedSong || (capabilities.waveformAccess && capabilities.exactSeeking)
    ? <LoopRangeOverview audioUri={audioUri} />
    : null;
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
        Active Layer: <Text style={[styles.activeLayerName, { color: activeLayer?.color || '#ffffff' }]}>{activeLayer === undefined ? '' : getLayerDisplayName(activeLayer)}</Text>
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
        <DanceCountDisplay />
        {timedAnnotationMarker && displayedAnnotation.trim() && (
          <AnnotationCallout
            key={`${timedAnnotationMarker.layerId}-${timedAnnotationMarker.timestamp}`}
            text={displayedAnnotation}
            onPress={() => openAnnotationEditor(timedAnnotationMarker)}
          />
        )}
        {(!hasLoadedSong || (capabilities.waveformAccess && capabilities.exactSeeking)) && (
          <LoopRangeOverview audioUri={audioUri} onToast={toast.show} />
        )}
      </View>
    );
    const mobileCanvas = (
      <View
        style={[
          styles.mobileCanvas,
          isLandscapePhone && styles.landscapeCanvas,
          isLandscapePhone && { paddingBottom: Math.max(safeAreaBottom + 6, 18) },
        ]}
        testID="mobile-workspace-scroll"
      >
        <Animated.View
          style={[styles.mobileCanvasContent, switchContentStyle]}
          pointerEvents={switchBusy ? 'none' : 'auto'}
        >
          {waveform}
          {mobileTimeline}
        </Animated.View>
        {switchTransitionVisible && (
          <Animated.View
            testID="track-switch-transition"
            style={[styles.trackSwitchTransition, switchOverlayStyle]}
            pointerEvents={switchBusy ? 'auto' : 'none'}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Loading ${switchTransitionTitle}`}
            accessibilityLiveRegion="polite"
          >
            <View style={styles.trackSwitchTransitionCard}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.trackSwitchTransitionText} numberOfLines={1}>
                Loading {switchTransitionTitle}…
              </Text>
            </View>
          </Animated.View>
        )}
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
        pointerEvents={switchBusy ? 'none' : 'auto'}
        onLayout={isLandscapePhone ? (event: LayoutChangeEvent) => {
          const nextHeight = event.nativeEvent.layout.height;
          setLandscapeRailHeight(current => (
            Math.abs(current - nextHeight) > 1 ? nextHeight : current
          ));
        } : undefined}
      >
        <GlassBackdrop
          testID="control-dock-glass"
          gradientId={isLandscapePhone ? 'control-dock-glass-landscape' : 'control-dock-glass-portrait'}
          radius={isLandscapePhone ? 0 : 14}
        />
        <ControlDock
          isLandscape={isLandscapePhone}
          landscapeHeight={isLandscapePhone ? Math.max(
            0,
            (landscapeRailHeight || screenData.height - LANDSCAPE_TOOLBAR_FALLBACK_HEIGHT) - 12,
          ) : undefined}
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
        <View style={[styles.mobileBody, isLandscapePhone && styles.landscapeBody]}>
          {mobileCanvas}
          {controlDock}
        </View>
        <AnnotationEditorModal
          visible={editingMarker !== null}
          marker={editingMarker}
          initialText={editingAnnotation}
          onCancel={closeAnnotationEditor}
          onSave={saveAnnotation}
          onDismiss={commitPendingAnnotationSave}
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
      <DanceCountDisplay />
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



export default React.memo(MainContent);
