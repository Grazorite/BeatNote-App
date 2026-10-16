import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { bpmControlStyles as styles } from '../../../styles/components/controls/bpmControl';

const BpmControl: React.FC = () => {
  const { bpm, setBpm } = useStudioStore();

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(60, Math.min(200, bpm + delta));
    setBpm(newBpm);
  };

  return (
    <View testID="settings-bpm" style={styles.container}>
      <Text style={styles.label}>Project BPM</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(-5)}>
          <Text style={styles.buttonText}>-5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(-1)}>
          <Text style={styles.buttonText}>-1</Text>
        </TouchableOpacity>
        <Text style={styles.bpmValue}>{bpm}</Text>
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(1)}>
          <Text style={styles.buttonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(5)}>
          <Text style={styles.buttonText}>+5</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Used for musical timing and beat-sized loop adjustments</Text>
    </View>
  );
};

export default BpmControl;
