import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Layer, useStudioStore } from '../../hooks/useStudioStore';
import ProjectControls from '../ui/controls/ProjectControls';

import TimelineScrollbar from '../ui/controls/TimelineScrollbar';
import TapButton from '../ui/controls/MarkerButton';
import AudioControls from '../ui/controls/AudioControls';
import HorizontalLayerSelector from '../ui/controls/HorizontalLayerSelector';
import AnnotationField, { AnnotationFieldRef } from '../ui/controls/AnnotationField';
import WaveformCanvas from '../ui/waveform/WaveformCanvas';

import StemsView from './StemsView';
import { mainContentStyles as styles } from '../../styles/layout/mainContent';

interface MainContentProps {
  viewMode: 'unified' | 'multitrack';
  layers: Layer[];
  activeLayer?: Layer;
  activeLayerMarkers: number;
  totalMarkers: number;
  layerSpecificNavigation: boolean;
  audioUri: string | null;
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
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const annotationFieldRef = useRef<AnnotationFieldRef>(null);
  
  // Pass focus function to parent
  useEffect(() => {
    onFocusTextInput(() => {
      annotationFieldRef.current?.focus();
    });
  }, [onFocusTextInput]);
  
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 200 });
  }, [viewMode]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  
  // Responsive container width
  const isMobile = screenData.width < 768;
  const containerWidth = isMobile 
    ? screenData.width - 32 // Mobile: full width minus padding
    : Math.max(900, screenData.width - 320); // Desktop: account for sidebar
  
  return (
    <ScrollView 
      style={styles.scrollContainer} 
      contentContainerStyle={[
        styles.container, 
        { 
          minWidth: isMobile ? '100%' : containerWidth,
          maxWidth: isMobile ? '100%' : undefined,
        }
      ]}
    >
      
      <ProjectControls
        onLoadSong={loadSong}
        onTogglePlayback={() => {}}
        hasSound={!!sound}
        audioUri={audioUri}
        audioFilename={audioUri ? audioUri.split('/').pop() || 'unknown' : null}
      />
      
      <Animated.View style={animatedStyle}>
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
      </Animated.View>
      
      <TimelineScrollbar audioUri={audioUri || undefined} />
      
      <View style={isMobile ? styles.controlsRowMobile : styles.controlsRow}>
        {isMobile ? (
          // Mobile: Stack vertically
          <>
            <View style={styles.controlsRowTop}>
              <AudioControls 
                onTogglePlayback={togglePlayback}
                onSkipBack={() => seekToPosition(0)}
                onSkipForward={() => {
                  const state = useStudioStore.getState();
                  seekToPosition(state.songDuration);
                  state.setCurrentTime(state.songDuration);
                }}
              />
              <View style={styles.markerButtonContainer}>
                <TapButton onTap={tapToBeat} onSeek={seekToPosition} />
              </View>
            </View>
            <AnnotationField ref={annotationFieldRef} />
          </>
        ) : (
          // Desktop: Horizontal layout
          <>
            <AudioControls 
              onTogglePlayback={togglePlayback}
              onSkipBack={() => seekToPosition(0)}
              onSkipForward={() => {
                const state = useStudioStore.getState();
                seekToPosition(state.songDuration);
                state.setCurrentTime(state.songDuration);
              }}
            />
            <AnnotationField ref={annotationFieldRef} />
            <View style={styles.markerButtonContainer}>
              <TapButton onTap={tapToBeat} onSeek={seekToPosition} />
            </View>
          </>
        )}
      </View>
      
      <HorizontalLayerSelector />
      
      <View style={styles.statusContainer}>
        <Text style={styles.activeLayerText}>
          Active Layer: <Text style={[styles.activeLayerName, { color: activeLayer?.color || '#ffffff' }]}>{activeLayer?.name}</Text>
        </Text>
        {layerSpecificNavigation && (
          <Text style={styles.totalMarkersText}>
            Total: {activeLayerMarkers} markers
          </Text>
        )}
        <Text style={styles.totalMarkersText}>
          Grand Total: {totalMarkers} markers
        </Text>
      </View>
    </ScrollView>
  );
};



export default MainContent;