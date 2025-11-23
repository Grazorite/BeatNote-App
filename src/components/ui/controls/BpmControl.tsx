import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';

const BpmControl: React.FC = () => {
  const { bpm, setBpm } = useStudioStore();

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(60, Math.min(200, bpm + delta));
    setBpm(newBpm);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>BPM</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 4,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bpmValue: {
    color: '#ff6600',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
});

export default BpmControl;