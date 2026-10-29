import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cancelAnalysis, retryAnalysis } from '../../../features/analysis/bpmAnalysisService';
import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { bpmSuggestionCardStyles as styles } from '../../../styles/components/controls/bpmSuggestionCard';

const BpmSuggestionCard: React.FC = () => {
  const autoBpmEnabled = useProductCapability('analysis.autoBpm');
  const musicItemId = useStudioStore(state => state.currentMusicItemId);
  const job = useStudioStore(state => musicItemId ? state.analysisByItem[musicItemId] : undefined);
  const manuallyOverriddenBpm = useStudioStore(state => state.manuallyOverriddenBpm);
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

  if (!autoBpmEnabled || !musicItemId || dismissedItemId === musicItemId || !job || manuallyOverriddenBpm) return null;

  if (job.status === 'queued' || job.status === 'running') {
    return (
      <View style={styles.container} testID="bpm-suggestion-card">
        <Text style={styles.title} accessibilityLiveRegion="polite">Analyzing tempo…</Text>
        <Text style={styles.detail}>{Math.round(job.progress * 100)}% · playback stays available</Text>
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
        <Text style={styles.detail}>No BPM or beat anchor changes were applied.</Text>
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
        <Text style={styles.detail}>Your current project BPM was not changed.</Text>
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
  const hasDownbeatSuggestion = result.suggestedDownbeatMs !== undefined
    && (result.downbeatConfidence ?? 0) >= 0.55;
  const preview = (bpm: number, phraseStartMs?: number) => (
    previewSuggestion(bpm, result.suggestedAnchorMs, phraseStartMs)
  );
  const formatSeconds = (milliseconds: number) => `${(milliseconds / 1000).toFixed(3)}s`;

  return (
    <View style={styles.container} testID="bpm-suggestion-card">
      <Text style={styles.title}>Suggested: {result.detectedBpm} BPM</Text>
      <Text style={styles.detail}>
        {result.confidenceBand} confidence · {result.tempoModel === 'variable' ? 'tempo may vary' : 'steady tempo'}
      </Text>
      <Text style={styles.detail}>
        {hasDownbeatSuggestion
          ? `Suggested Count 1: ${formatSeconds(result.suggestedDownbeatMs as number)}`
          : 'Phrase start unconfirmed — the beat anchor is used as Count 1.'}
      </Text>
      <View style={styles.actions}>
        {gridPreview === null ? (
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => preview(result.detectedBpm)} accessibilityRole="button">
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
            onPress={() => preview(result.detectedBpm, result.suggestedDownbeatMs)}
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
          {result.bpmAlternatives.filter(alternative => alternative.relation !== 'primary').map(alternative => (
            <TouchableOpacity
              key={`${alternative.relation}-${alternative.bpm}`}
              style={styles.button}
              onPress={() => preview(alternative.bpm)}
              accessibilityRole="button"
              accessibilityLabel={`Use ${alternative.bpm} BPM ${alternative.relation} tempo`}
            >
              <Text style={styles.buttonText}>{alternative.bpm} BPM · {alternative.relation}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default BpmSuggestionCard;
