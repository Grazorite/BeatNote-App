import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { beatAnchorControlStyles as styles } from '../../../styles/components/controls/beatAnchorControl';

const formatAnchor = (milliseconds: number): string => {
  const seconds = Math.max(0, milliseconds) / 1000;
  return `${seconds.toFixed(3)}s`;
};

const BeatAnchorControl: React.FC = () => {
  const songLoaded = useStudioStore(state => state.songLoaded);
  const currentTime = useStudioStore(state => state.currentTime);
  const bpm = useStudioStore(state => state.bpm);
  const beatAnchorMs = useStudioStore(state => state.beatAnchorMs);
  const phraseStartMs = useStudioStore(state => state.phraseStartMs);
  const setPhraseStartAtPlayhead = useStudioStore(state => state.setPhraseStartAtPlayhead);
  const nudgeBeatAnchor = useStudioStore(state => state.nudgeBeatAnchor);
  const quarterBeatMs = (60_000 / Math.max(1, bpm)) / 4;

  if (!songLoaded) return null;

  return (
    <View style={styles.container} testID="beat-anchor-control">
      <Text style={styles.label}>Count 1 alignment</Text>
      <Text style={styles.value} accessibilityLiveRegion="polite" testID="beat-anchor-value">
        {formatAnchor(phraseStartMs ?? beatAnchorMs)}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => setPhraseStartAtPlayhead(currentTime)}
        accessibilityRole="button"
        accessibilityLabel={`Set count 1 at ${formatAnchor(currentTime)}`}
        testID="set-count-one-here"
      >
        <Text style={[styles.buttonText, styles.primaryText]}>Set Count 1 Here</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => nudgeBeatAnchor(-5)}
          accessibilityRole="button"
          accessibilityLabel="Move count 1 earlier by 5 milliseconds"
          testID="beat-anchor-earlier-5"
        >
          <Text style={styles.buttonText}>−5 ms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => nudgeBeatAnchor(5)}
          accessibilityRole="button"
          accessibilityLabel="Move count 1 later by 5 milliseconds"
          testID="beat-anchor-later-5"
        >
          <Text style={styles.buttonText}>+5 ms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => nudgeBeatAnchor(-quarterBeatMs)}
          accessibilityRole="button"
          accessibilityLabel="Move count 1 earlier by one quarter beat"
          testID="beat-anchor-earlier-quarter"
        >
          <Text style={styles.buttonText}>−¼ beat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => nudgeBeatAnchor(quarterBeatMs)}
          accessibilityRole="button"
          accessibilityLabel="Move count 1 later by one quarter beat"
          testID="beat-anchor-later-quarter"
        >
          <Text style={styles.buttonText}>+¼ beat</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Fine adjustments move the beat and phrase grid together.</Text>
    </View>
  );
};

export default BeatAnchorControl;
