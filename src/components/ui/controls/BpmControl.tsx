import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { bpmControlStyles as styles } from '../../../styles/components/controls/bpmControl';

const MIN_BPM = 40;
const MAX_BPM = 220;

const BpmControl: React.FC = () => {
  const bpm = useStudioStore(state => state.bpm);
  const setBpmManual = useStudioStore(state => state.setBpmManual);
  const [draft, setDraft] = useState(String(bpm));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const input = useRef<TextInput>(null);

  useEffect(() => { setDraft(String(bpm)); setError(false); }, [bpm]);

  const commit = (): void => {
    setEditing(false);
    const value = Number(draft.trim().replace(',', '.'));
    if (!draft.trim() || !Number.isFinite(value) || value < MIN_BPM || value > MAX_BPM) {
      setError(true);
      return;
    }
    const rounded = Math.round(value * 100) / 100;
    setBpmManual(rounded);
    setDraft(String(rounded));
    setError(false);
  };

  const adjustBpm = (delta: number): void => {
    const value = Math.round(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta)) * 100) / 100;
    setBpmManual(value);
    setDraft(String(value));
    setError(false);
  };

  return (
    <View testID="settings-bpm" style={styles.container}>
      <Text style={styles.label}>Project BPM</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(-1)} accessibilityRole="button" accessibilityLabel="Decrease BPM by 1">
          <Text style={styles.buttonText}>−1</Text>
        </TouchableOpacity>
        <TextInput
          ref={input}
          style={styles.bpmValue}
          value={draft}
          onChangeText={setDraft}
          onFocus={() => setEditing(true)}
          onBlur={commit}
          onSubmitEditing={() => input.current?.blur()}
          keyboardType="decimal-pad"
          returnKeyType="done"
          selectTextOnFocus
          accessibilityLabel="Project BPM"
          accessibilityHint="Enter a tempo from 40 to 220 beats per minute"
          testID="project-bpm-input"
        />
        <TouchableOpacity style={styles.button} onPress={() => adjustBpm(1)} accessibilityRole="button" accessibilityLabel="Increase BPM by 1">
          <Text style={styles.buttonText}>+1</Text>
        </TouchableOpacity>
      </View>
      {editing && (
        <TouchableOpacity style={styles.button} onPress={() => input.current?.blur()} accessibilityRole="button" testID="project-bpm-done">
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      )}
      {error && <Text style={styles.hint} accessibilityLiveRegion="polite">Enter a number from 40 to 220. Your project BPM is still {bpm}.</Text>}
      <Text style={styles.hint}>Tap the number to edit · 40–220 beats per minute.</Text>
      <Text style={styles.hint}>Sets the beat grid and dance-count timing. To change how fast the song plays, use playback speed.</Text>
    </View>
  );
};

export default BpmControl;
