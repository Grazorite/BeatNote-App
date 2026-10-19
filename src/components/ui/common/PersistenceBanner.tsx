import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { persistenceBannerStyles as styles } from '../../../styles/components/common/persistenceBanner';
import type { PersistenceIssue } from '../../../features/library/persistencePipeline';
import { BeatNoteIcon } from '../../icons';
import GlassBackdrop from '../controls/GlassBackdrop';

const issueKey = (issue: PersistenceIssue): string => `${issue.kind}:${issue.label}`;

/** Persistent, shared surface for storage reads and writes that need user attention. */
const PersistenceBanner: React.FC = () => {
  const issues = useStudioStore(state => state.persistenceIssues);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  if (issues.length === 0) return null;

  const retry = async (issue: PersistenceIssue): Promise<void> => {
    const key = issueKey(issue);
    setRetrying(key);
    try {
      await issue.retry();
      useStudioStore.setState(state => ({
        persistenceIssues: state.persistenceIssues.filter(existing => existing !== issue),
      }));
    } catch {
      // The persistence service retains or replaces the issue with the latest failure details.
    } finally {
      setRetrying(current => current === key ? null : current);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      testID="persistence-banner"
    >
      <GlassBackdrop gradientId="persistence-banner-glass" radius={12} />
      {issues.map((issue, index) => {
        const key = issueKey(issue);
        const isRetrying = retrying === key;
        return (
          <View
            key={key}
            style={[styles.issue, index === issues.length - 1 && styles.finalIssue]}
            testID={`persistence-issue-${index}`}
          >
            <BeatNoteIcon name="warning" size={20} color={colors.iconDestructive} />
            <View style={styles.copy}>
              <Text style={styles.message}>{issue.message}</Text>
              {issue.detail && <Text style={styles.detail}>{issue.detail}</Text>}
            </View>
            <TouchableOpacity
              style={[
                styles.retry,
                focused === key && styles.retryFocused,
                isRetrying && styles.retryDisabled,
              ]}
              onPress={() => { void retry(issue); }}
              onFocus={() => setFocused(key)}
              onBlur={() => setFocused(current => current === key ? null : current)}
              disabled={isRetrying}
              accessibilityRole="button"
              accessibilityLabel={`Retry ${issue.label}`}
              testID={`persistence-retry-${index}`}
            >
              <Text style={styles.retryText}>{isRetrying ? 'Retrying…' : 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default PersistenceBanner;
