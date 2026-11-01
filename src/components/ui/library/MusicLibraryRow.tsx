import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  PanResponder,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { musicLibraryRowStyles as styles } from '../../../styles/components/library/musicLibraryRow';
import { colors } from '../../../styles/common';
import type { MusicItem } from '../../../types/library';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { middleTruncate } from '../../../utils/displayText';
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
  onDelete: (returnFocusRef?: React.RefObject<unknown>) => void;
  onRelink?: (returnFocusRef?: React.RefObject<unknown>) => void;
  customOrderIndex?: number;
  customOrderCount?: number;
  onReorderBy?: (offset: number) => void;
  onReorderStart?: () => void;
  onReorderEnd?: () => void;
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
  customOrderIndex,
  customOrderCount,
  onReorderBy,
  onReorderStart,
  onReorderEnd,
}) => {
  const { fontScale } = useWindowDimensions();
  const mainRef = useRef<View>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragTranslateY = useRef(new Animated.Value(0)).current;
  const dragScale = useRef(new Animated.Value(1)).current;
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
        onPress: returnFocusRef => onDelete(returnFocusRef ?? mainRef),
        destructive: true,
      },
    ];
    if (missing && onRelink) {
      next.push({
        name: 'relink',
        label: 'Relink',
        onPress: returnFocusRef => onRelink(returnFocusRef ?? mainRef),
      });
    }
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
  const canReorder = customOrderIndex !== undefined
    && customOrderCount !== undefined
    && onReorderBy !== undefined;
  const dragResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gestureState) => Math.abs(gestureState.dy) > 4,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      setDragging(true);
      onReorderStart?.();
      Animated.spring(dragScale, {
        toValue: 1.025,
        damping: 18,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_event, gestureState) => {
      dragTranslateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_event, gestureState) => {
      const offset = Math.round(gestureState.dy / 64);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dragTranslateY.setValue(0);
      Animated.spring(dragScale, {
        toValue: 1,
        damping: 18,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
      setDragging(false);
      if (offset !== 0) onReorderBy?.(offset);
      onReorderEnd?.();
    },
    onPanResponderTerminate: () => {
      dragTranslateY.setValue(0);
      dragScale.setValue(1);
      setDragging(false);
      onReorderEnd?.();
    },
  }), [dragScale, dragTranslateY, onReorderBy, onReorderEnd, onReorderStart]);

  return (
    <Animated.View
      style={[
        styles.container,
        current && styles.current,
        unavailable && styles.disabled,
        dragging && styles.dragging,
        { transform: [{ translateY: dragTranslateY }, { scale: dragScale }] },
      ]}
      testID={`music-library-row-${item.id}`}
    >
      <TouchableOpacity
        ref={mainRef}
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
            {middleTruncate(item.displayTitle)}
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
      {canReorder && (
        <View
          {...dragResponder.panHandlers}
          style={styles.reorderHandle}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={`Reorder ${item.displayTitle}`}
          accessibilityHint="Drag up or down. VoiceOver users can swipe up or down."
          accessibilityValue={{
            min: 1,
            max: customOrderCount,
            now: customOrderIndex + 1,
            text: `${customOrderIndex + 1} of ${customOrderCount}`,
          }}
          accessibilityActions={[
            { name: 'decrement', label: 'Move up' },
            { name: 'increment', label: 'Move down' },
          ]}
          onAccessibilityAction={event => {
            if (event.nativeEvent.actionName === 'decrement') onReorderBy(-1);
            if (event.nativeEvent.actionName === 'increment') onReorderBy(1);
          }}
          testID={`music-library-row-reorder-${item.id}`}
        >
          <BeatNoteIcon name="reorder" size={22} color={colors.textSecondary} />
        </View>
      )}
      <OverflowMenu
        actions={actions}
        accessibilityLabel={`More actions for ${item.displayTitle}`}
        disabled={unavailable}
        testID={`music-library-row-overflow-${item.id}`}
      />
    </Animated.View>
  );
};

export default React.memo(MusicLibraryRow);
