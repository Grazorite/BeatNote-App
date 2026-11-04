import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  cancelAnalysis,
  enqueueAnalysis,
  retryAnalysis,
} from '../../../features/analysis/bpmAnalysisService';
import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { bpmSuggestionCardStyles as styles } from '../../../styles/components/controls/bpmSuggestionCard';

const BpmSuggestionCard: React.FC = () => {
  const autoBpmEnabled = useProductCapability('analysis.autoBpm');
  const musicItemId = useStudioStore(state => state.currentMusicItemId);
  const job = useStudioStore(state => musicItemId ? state.analysisByItem[musicItemId] : undefined);
  const gridRestoreSnapshot = useStudioStore(state => state.gridRestoreSnapshot);
  const gridPreview = useStudioStore(state => state.gridPreview);
  const previewSuggestion = useStudioStore(state => state.previewAnalysisSuggestion);
  const applyPreview = useStudioStore(state => state.applyGridPreview);
  const cancelPreview = useStudioStore(state => state.cancelGridPreview);
  const restore = useStudioStore(state => state.restoreGridSnapshot);
  const [dismissedItemId, setDismissedItemId] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    setShowAlternatives(false);
  }, [musicItemId]);

  if (!autoBpmEnabled || !musicItemId) return null;

  if (!job || dismissedItemId === musicItemId) {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title}>Automatic tempo</Text>
        <Text style={styles.detail}>
          Find this song’s BPM on your device. Preview the grid before applying it.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              setDismissedItemId(null);
              enqueueAnalysis(musicItemId, true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Analyze tempo automatically"
            testID="bpm-analysis-start"
          >
            <Text style={[styles.buttonText, styles.primaryText]}>Analyze Tempo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (job.status === 'queued' || job.status === 'running') {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title} accessibilityLiveRegion="polite">Analyzing tempo…</Text>
        <Text style={styles.detail}>{Math.round(job.progress * 100)}% · you can keep playing</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => cancelAnalysis(musicItemId)}
            accessibilityRole="button"
            accessibilityLabel="Cancel tempo analysis"
            testID="bpm-analysis-cancel"
          >
            <Text style={styles.buttonText}>Cancel Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (job.status === 'cancelled') {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title} accessibilityLiveRegion="polite">Tempo analysis cancelled</Text>
        <Text style={styles.detail}>Your BPM and Count 1 are unchanged.</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => retryAnalysis(musicItemId)}
            accessibilityRole="button"
            accessibilityLabel="Retry tempo analysis"
            testID="bpm-analysis-retry"
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (job.status === 'failed') {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title}>Tempo analysis failed</Text>
        <Text style={styles.detail}>Your project BPM is unchanged.</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={() => retryAnalysis(musicItemId)} accessibilityRole="button">
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (job.status === 'unavailable') {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title}>Automatic tempo unavailable</Text>
        <Text style={styles.detail}>Set the project BPM manually.</Text>
      </View>
    );
  }

  if (job.status !== 'success' || job.result === null) return null;
  const result = job.result;
  const detectedBpm = Math.round(result.detectedBpm);
  const hasDownbeatSuggestion = result.suggestedDownbeatMs !== undefined
    && (result.downbeatConfidence ?? 0) >= 0.55;
  const preview = (bpm: number, phraseStartMs?: number) => (
    previewSuggestion(bpm, result.suggestedAnchorMs, phraseStartMs)
  );
  const formatSeconds = (milliseconds: number) => `${(milliseconds / 1000).toFixed(3)}s`;

  return (
    <View style={styles.container} testID="bpm-suggestion-card">
      <Text style={styles.title}>Suggested: {detectedBpm} BPM</Text>
      <Text style={styles.detail}>
        {result.confidenceBand} confidence · {result.tempoModel === 'variable' ? 'tempo may vary' : 'steady tempo'}
      </Text>
      <Text style={styles.detail}>
        {hasDownbeatSuggestion
          ? `Suggested Count 1: ${formatSeconds(result.suggestedDownbeatMs as number)}`
          : 'Count 1 is set to the beat anchor. Adjust it to match the start of your phrase.'}
      </Text>
      <View style={styles.actions}>
        {gridPreview === null ? (
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => preview(detectedBpm)} accessibilityRole="button">
            <Text style={[styles.buttonText, styles.primaryText]}>Preview</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={applyPreview} accessibilityRole="button">
              <Text style={[styles.buttonText, styles.primaryText]}>Apply Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={cancelPreview} accessibilityRole="button">
              <Text style={styles.buttonText}>Cancel Preview</Text>
            </TouchableOpacity>
          </>
        )}
        {result.bpmAlternatives.length > 1 && (
          <TouchableOpacity style={styles.button} onPress={() => setShowAlternatives(value => !value)} accessibilityRole="button">
            <Text style={styles.buttonText}>Alternatives</Text>
          </TouchableOpacity>
        )}
        {hasDownbeatSuggestion && gridPreview === null && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => preview(detectedBpm, result.suggestedDownbeatMs)}
            accessibilityRole="button"
            accessibilityLabel={`Preview suggested count 1 at ${formatSeconds(result.suggestedDownbeatMs as number)}`}
          >
            <Text style={styles.buttonText}>Preview Suggested Count 1</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={() => setDismissedItemId(musicItemId)} accessibilityRole="button">
          <Text style={styles.buttonText}>Keep Current</Text>
        </TouchableOpacity>
        {gridRestoreSnapshot !== null && (
          <TouchableOpacity style={styles.button} onPress={restore} accessibilityRole="button">
            <Text style={styles.buttonText}>Restore Previous</Text>
          </TouchableOpacity>
        )}
      </View>
      {showAlternatives && (
        <View style={styles.actions} testID="bpm-alternatives">
          {result.bpmAlternatives.filter(alternative => alternative.relation !== 'primary').map(alternative => {
            const alternativeBpm = Math.round(alternative.bpm);
            return (
            <TouchableOpacity
              key={`${alternative.relation}-${alternativeBpm}`}
              style={styles.button}
              onPress={() => preview(alternativeBpm)}
              accessibilityRole="button"
              accessibilityLabel={`Use ${alternativeBpm} BPM ${alternative.relation} tempo`}
            >
              <Text style={styles.buttonText}>{alternativeBpm} BPM · {alternative.relation}</Text>
            </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default BpmSuggestionCard;
