import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useWaveformAnimation } from '../../hooks/useWaveformAnimation';
import AudioControls from '../../components/ui/AudioControls';
import LayerControls from '../../components/ui/LayerControls';
import StemSelector from '../../components/ui/StemSelector';
import TimelineScrollbar from '../../components/ui/TimelineScrollbar';
import WaveformCanvas from '../../components/ui/WaveformCanvas';
import TapButton from '../../components/ui/TapButton';

export default function StudioScreen() {
  const { layers, activeLayerId, stemCount } = useStudioStore();
  const { sound, loadSong, togglePlayback, tapToBeat } = useAudioPlayer();
  const { pathData } = useWaveformAnimation();

  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const totalMarkers = layers.reduce((sum, layer) => sum + layer.markers.length, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeatNote Studio</Text>
      
      <AudioControls
        onLoadSong={loadSong}
        onTogglePlayback={togglePlayback}
        hasSound={!!sound}
      />

      <StemSelector />
      <LayerControls />
      
      <WaveformCanvas pathData={pathData} layers={layers} />
      
      <TimelineScrollbar />
      
      <View style={styles.tapButtonContainer}>
        <TapButton onTap={tapToBeat} />
      </View>
      
      <Text style={styles.subtitle}>
        Active: {activeLayer?.name} | Total: {totalMarkers} markers
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tapButtonContainer: {
    marginTop: 30,
  },
  subtitle: {
    color: '#999999',
    fontSize: 14,
  },
});