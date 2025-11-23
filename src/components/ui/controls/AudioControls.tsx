import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { audioControlsStyles as styles } from '../../../styles/components/controls/audioControls';

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
      

    </View>
  );
};



export default AudioControls;