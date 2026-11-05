import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { bpmControlStyles as styles } from '../../../styles/components/controls/bpmControl';

import { useBpmStatus } from '../../../hooks/useBpmStatus';

const MIN_BPM = 40;
const MAX_BPM = 220;

const BpmControl: React.FC = () => {
  const { bpm, chosen, edited, caption } = useBpmStatus();
  const setBpmManual = useStudioStore(state => state.setBpmManual);
  const [draft, setDraft] = useState(String(bpm));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const input = useRef<TextInput>(null);
  const confirmed = useRef(false);

  useEffect(() => { setDraft(String(bpm)); setError(false); }, [bpm]);

  const commit = (): void => {
    setEditing(false);
    if (!confirmed.current) return;
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

  const stepButton = (delta: number): React.ReactElement => (
    <TouchableOpacity key={delta} style={styles.button} onPress={() => adjustBpm(delta)}
      accessibilityRole="button" accessibilityLabel={`${delta < 0 ? 'Decrease' : 'Increase'} BPM by ${Math.abs(delta)}`}>
      <Text style={styles.buttonText}>{delta < 0 ? '−' : '+'}{Math.abs(delta)}</Text>
    </TouchableOpacity>
  );

  return (
    <View testID="settings-bpm" style={styles.container}>
      <Text style={styles.label}>Project BPM</Text>
      <View style={styles.controls}>
        {[-10, -5, -1].map(stepButton)}
        <TextInput
          ref={input}
          style={[styles.bpmValue, !chosen && styles.defaultValue, error && styles.invalid]}
          value={draft}
          onChangeText={text => { confirmed.current = true; setDraft(text); }}
          onFocus={() => { confirmed.current = false; setEditing(true); }}
          onBlur={commit}
          onSubmitEditing={() => { confirmed.current = true; input.current?.blur(); }}
          keyboardType="decimal-pad"
          returnKeyType="done"
          selectTextOnFocus
          accessibilityLabel="Project BPM"
          accessibilityHint="Enter a tempo from 40 to 220 beats per minute"
          testID="project-bpm-input"
        />
        {[1, 5, 10].map(stepButton)}
      </View>
      {editing && (
        <TouchableOpacity style={styles.button} onPress={() => { confirmed.current = true; input.current?.blur(); }} accessibilityRole="button" testID="project-bpm-done">
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      )}
      {error && <Text style={styles.hint} accessibilityLiveRegion="polite">Enter a number from 40 to 220. Your project BPM is still {bpm}.</Text>}
      <Text style={[styles.hint, edited && styles.edited]} accessibilityLiveRegion="polite">{caption}</Text>
    </View>
  );
};

export default BpmControl;
