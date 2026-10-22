import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { musicLibraryRowStyles as styles } from '../../../styles/components/library/musicLibraryRow';
import { colors } from '../../../styles/common';
import type { MusicItem } from '../../../types/library';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { BeatNoteIcon } from '../../icons';
import {
  handleOverflowAccessibilityAction,
  OverflowMenu,
  overflowAccessibilityActions,
  type OverflowMenuAction,
} from '../common';

export interface MusicLibraryRowProps {
  item: MusicItem;
  projectCount: number;
  current: boolean;
  disabled?: boolean;
  loading?: boolean;
  failure?: string | null;
  onPress: () => void;
  onRetry?: () => void;
  onRename: () => void;
  onShowProjects: () => void;
  onDelete: () => void;
  onRelink?: () => void;
}

const formatDuration = (durationMs: number | null): string => {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs < 0) return '--:--';
  const totalSeconds = Math.floor(durationMs / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
};

const projectLabel = (count: number): string => `${count} ${count === 1 ? 'project' : 'projects'}`;

const MusicLibraryRow: React.FC<MusicLibraryRowProps> = ({
  item,
  projectCount,
  current,
  disabled = false,
  loading = false,
  failure = null,
  onPress,
  onRetry,
  onRename,
  onShowProjects,
  onDelete,
  onRelink,
}) => {
  const { fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState<string | null>(null);
  const missing = item.availability === 'missing';
  const unavailable = disabled || loading;
  const duration = formatDuration(item.durationMs);
  const projects = projectLabel(projectCount);
  const actions = useMemo<OverflowMenuAction[]>(() => {
    const next: OverflowMenuAction[] = [
      { name: 'rename', label: 'Rename', onPress: onRename },
      { name: 'show-projects', label: 'Show Projects', onPress: onShowProjects },
      {
        name: 'delete',
        label: 'Delete from BeatNote',
        onPress: onDelete,
        destructive: true,
      },
    ];
    if (missing && onRelink) next.push({ name: 'relink', label: 'Relink', onPress: onRelink });
    return next.map(action => ({
      ...action,
      disabled: unavailable,
      testID: `music-library-row-${action.name}-${item.id}`,
    }));
  }, [item.id, missing, onDelete, onRelink, onRename, onShowProjects, unavailable]);
  const label = [
    item.displayTitle,
    duration,
    projects,
    current ? 'Current song' : null,
    missing ? 'Audio missing' : null,
    failure,
  ].filter(Boolean).join(', ');

  return (
    <View
      style={[styles.container, current && styles.current, unavailable && styles.disabled]}
      testID={`music-library-row-${item.id}`}
    >
      <TouchableOpacity
        style={[styles.main, focused === 'main' && styles.mainFocused]}
        onPress={onPress}
        onFocus={() => setFocused('main')}
        onBlur={() => setFocused(value => value === 'main' ? null : value)}
        disabled={unavailable}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={current ? 'Closes the music library' : 'Loads this song'}
        accessibilityState={{ disabled: unavailable, selected: current }}
        accessibilityActions={unavailable ? undefined : overflowAccessibilityActions(actions)}
        onAccessibilityAction={event => handleOverflowAccessibilityAction(event, actions)}
        testID={`music-library-row-main-${item.id}`}
      >
        <View style={styles.stateIcons} accessible={false}>
          {current && <BeatNoteIcon name="current" size={22} color={colors.accent} />}
          {missing && <BeatNoteIcon name="missing-audio" size={22} color={colors.iconDestructive} />}
        </View>
        <View style={styles.copy}>
          <Text
            style={styles.title}
            numberOfLines={fontScale > 1 ? 2 : 1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
          >
            {item.displayTitle}
          </Text>
          <Text style={styles.metadata} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
            {duration} · {projects}
          </Text>
          {missing && (
            <Text style={styles.missing} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Audio missing</Text>
          )}
          {failure && (
            <Text style={styles.error} maxFontSizeMultiplier={MAX_TEXT_SCALE}>{failure}</Text>
          )}
        </View>
        {loading && (
          <View style={styles.status} accessibilityLabel={`Loading ${item.displayTitle}`}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      </TouchableOpacity>
      {failure && onRetry && (
        <TouchableOpacity
          style={[styles.retry, focused === 'retry' && styles.retryFocused]}
          onPress={onRetry}
          onFocus={() => setFocused('retry')}
          onBlur={() => setFocused(value => value === 'retry' ? null : value)}
          accessibilityRole="button"
          accessibilityLabel={`Retry loading ${item.displayTitle}`}
          testID={`music-library-row-retry-${item.id}`}
        >
          <Text style={styles.retryText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Retry</Text>
        </TouchableOpacity>
      )}
      <OverflowMenu
        actions={actions}
        accessibilityLabel={`More actions for ${item.displayTitle}`}
        disabled={unavailable}
        testID={`music-library-row-overflow-${item.id}`}
      />
    </View>
  );
};

export default React.memo(MusicLibraryRow);
