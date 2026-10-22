import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { importProgressRowStyles as styles } from '../../../styles/components/library/importProgressRow';
import { colors } from '../../../styles/common';
import type { ImportJobView } from '../../../types/library';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';

export interface ImportProgressRowProps {
  job: ImportJobView;
  onCancel: (id: string) => void;
  onRetry: (job: ImportJobView) => void;
  onDismiss: (id: string) => void;
}

const statusLabel = (job: ImportJobView): string => {
  if (job.status === 'failed') return 'Import failed';
  const label = job.status.charAt(0).toUpperCase() + job.status.slice(1);
  return job.progress === null ? label : `${label} ${Math.round(job.progress * 100)}%`;
};

const ImportProgressRow: React.FC<ImportProgressRowProps> = ({
  job,
  onCancel,
  onRetry,
  onDismiss,
}) => {
  const [cancelRequested, setCancelRequested] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  useEffect(() => setCancelRequested(false), [job.id, job.status]);

  const failed = job.status === 'failed';
  const canCancel = !failed && job.status !== 'committing' && job.cancellable;
  const progressValue = job.progress === null
    ? undefined
    : { min: 0, max: 100, now: Math.round(job.progress * 100) };
  const requestCancel = () => {
    if (cancelRequested) return;
    setCancelRequested(true);
    onCancel(job.id);
  };

  return (
    <View style={styles.container} testID={`import-job-${job.id}`}>
      {!failed && (
        <View
          style={styles.indicator}
          accessibilityRole="progressbar"
          accessibilityLabel={`Importing ${job.originalFilename}`}
          accessibilityValue={progressValue}
          testID={`import-progress-${job.id}`}
        >
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
      <View style={styles.copy}>
        <Text
          style={styles.filename}
          numberOfLines={2}
          ellipsizeMode="middle"
          maxFontSizeMultiplier={MAX_TEXT_SCALE}
        >
          {job.originalFilename}
        </Text>
        <Text style={failed ? styles.error : styles.status} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
          {failed ? (job.error ?? 'Import failed') : statusLabel(job)}
        </Text>
      </View>
      <View style={styles.actions}>
        {canCancel && (
          <TouchableOpacity
            style={[
              styles.action,
              focused === 'cancel' && styles.actionFocused,
              cancelRequested && styles.actionDisabled,
            ]}
            onPress={requestCancel}
            onFocus={() => setFocused('cancel')}
            onBlur={() => setFocused(value => value === 'cancel' ? null : value)}
            disabled={cancelRequested}
            accessibilityRole="button"
            accessibilityLabel="Cancel import"
            accessibilityHint={`Cancels importing ${job.originalFilename}`}
            accessibilityState={{ disabled: cancelRequested }}
            testID={`import-cancel-${job.id}`}
          >
            <Text style={styles.actionText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
              {cancelRequested ? 'Cancelling…' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        )}
        {failed && (
          <>
            <TouchableOpacity
              style={[styles.action, focused === 'retry' && styles.actionFocused]}
              onPress={() => onRetry(job)}
              onFocus={() => setFocused('retry')}
              onBlur={() => setFocused(value => value === 'retry' ? null : value)}
              accessibilityRole="button"
              accessibilityLabel={`Retry importing ${job.originalFilename}`}
              testID={`import-retry-${job.id}`}
            >
              <Text style={styles.actionText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.action, focused === 'dismiss' && styles.actionFocused]}
              onPress={() => onDismiss(job.id)}
              onFocus={() => setFocused('dismiss')}
              onBlur={() => setFocused(value => value === 'dismiss' ? null : value)}
              accessibilityRole="button"
              accessibilityLabel={`Dismiss failed import ${job.originalFilename}`}
              testID={`import-dismiss-${job.id}`}
            >
              <Text
                style={[styles.actionText, styles.dismissText]}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default React.memo(ImportProgressRow);
