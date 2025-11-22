import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';

interface AudioControlsProps {
  onLoadSong: () => void;
  onTogglePlayback: () => void;
  hasSound: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  onLoadSong,
  onTogglePlayback,
  hasSound,
}) => {
  const { isPlaying, songLoaded } = useStudioStore();

  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={[styles.button, songLoaded && styles.buttonLoaded]} 
        onPress={onLoadSong}
      >
        <Text style={styles.buttonText}>
          {songLoaded ? '♪ Song Loaded' : 'Load Song'}
        </Text>
      </TouchableOpacity>
      
      {hasSound && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onTogglePlayback}
        >
          <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#111111',
  },
  buttonLoaded: {
    backgroundColor: '#006600',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default AudioControls;