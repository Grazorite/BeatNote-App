import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useWaveformAnimation } from '../../hooks/useWaveformAnimation';
import AudioControls from '../../components/ui/AudioControls';
import WaveformCanvas from '../../components/ui/WaveformCanvas';
import TapButton from '../../components/ui/TapButton';

export default function StudioScreen() {
  const { markers } = useStudioStore();
  const { sound, loadSong, togglePlayback, tapToBeat } = useAudioPlayer();
  const { pathData } = useWaveformAnimation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeatNote Studio</Text>
      
      <AudioControls
        onLoadSong={loadSong}
        onTogglePlayback={togglePlayback}
        hasSound={!!sound}
      />

      <WaveformCanvas pathData={pathData} markers={markers} />
      
      <TapButton onTap={tapToBeat} />
      
      <Text style={styles.subtitle}>
        Markers: {markers.length} | Tap to add/remove beats
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
  subtitle: {
    color: '#999999',
    fontSize: 14,
  },
});