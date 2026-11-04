import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

const REORDER_ROW_HEIGHT = 64;
const REORDER_HYSTERESIS = 6;

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
  reorderShift?: number;
  reorderActive?: boolean;
  onReorderBy?: (offset: number) => void;
  onReorderPreview?: (offset: number) => void;
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
  reorderShift = 0,
  reorderActive = false,
  onReorderBy,
  onReorderPreview,
  onReorderStart,
  onReorderEnd,
}) => {
  const { fontScale } = useWindowDimensions();
  const mainRef = useRef<View>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragTranslateY = useRef(new Animated.Value(0)).current;
  const reorderTranslateY = useRef(new Animated.Value(0)).current;
  const dragScale = useRef(new Animated.Value(1)).current;
  const dragOriginIndexRef = useRef(0);
  const appliedDragOffsetRef = useRef(0);
  const customOrderIndexRef = useRef(customOrderIndex);
  const customOrderCountRef = useRef(customOrderCount);
  const onReorderByRef = useRef(onReorderBy);
  const onReorderPreviewRef = useRef(onReorderPreview);
  const onReorderStartRef = useRef(onReorderStart);
  const onReorderEndRef = useRef(onReorderEnd);
  customOrderIndexRef.current = customOrderIndex;
  customOrderCountRef.current = customOrderCount;
  onReorderByRef.current = onReorderBy;
  onReorderPreviewRef.current = onReorderPreview;
  onReorderStartRef.current = onReorderStart;
  onReorderEndRef.current = onReorderEnd;
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

  useLayoutEffect(() => {
    if (!reorderActive) {
      reorderTranslateY.stopAnimation();
      reorderTranslateY.setValue(0);
      return;
    }
    Animated.timing(reorderTranslateY, {
      toValue: reorderShift * REORDER_ROW_HEIGHT,
      duration: 170,
      useNativeDriver: true,
    }).start();
  }, [reorderActive, reorderShift, reorderTranslateY]);

  const dragResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gestureState) => Math.abs(gestureState.dy) > 4,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      dragOriginIndexRef.current = customOrderIndexRef.current ?? 0;
      appliedDragOffsetRef.current = 0;
      setDragging(true);
      onReorderStartRef.current?.();
      Animated.spring(dragScale, {
        toValue: 1.025,
        damping: 18,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_event, gestureState) => {
      const originIndex = dragOriginIndexRef.current;
      const minOffset = -originIndex;
      const maxOffset = Math.max(0, (customOrderCountRef.current ?? 1) - originIndex - 1);
      let desiredOffset = appliedDragOffsetRef.current;
      while (
        desiredOffset < maxOffset
        && gestureState.dy > (desiredOffset + 0.5) * REORDER_ROW_HEIGHT + REORDER_HYSTERESIS
      ) desiredOffset += 1;
      while (
        desiredOffset > minOffset
        && gestureState.dy < (desiredOffset - 0.5) * REORDER_ROW_HEIGHT - REORDER_HYSTERESIS
      ) desiredOffset -= 1;
      if (desiredOffset !== appliedDragOffsetRef.current) {
        appliedDragOffsetRef.current = desiredOffset;
        onReorderPreviewRef.current?.(desiredOffset);
      }
      dragTranslateY.setValue(Math.max(
        minOffset * REORDER_ROW_HEIGHT,
        Math.min(maxOffset * REORDER_ROW_HEIGHT, gestureState.dy),
      ));
    },
    onPanResponderRelease: () => {
      const finalOffset = appliedDragOffsetRef.current;
      Animated.parallel([
        Animated.spring(dragTranslateY, {
          toValue: finalOffset * REORDER_ROW_HEIGHT,
          damping: 22,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.spring(dragScale, {
          toValue: 1,
          damping: 18,
          stiffness: 240,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        // Clear the lifted row's transform before publishing the new list order. Zustand updates
        // subscribers synchronously; committing first briefly applies the old drag translation at
        // the row's new index and makes it appear to jump into a second row.
        dragTranslateY.setValue(0);
        appliedDragOffsetRef.current = 0;
        setDragging(false);
        onReorderEndRef.current?.();
        if (finished && finalOffset !== 0) onReorderByRef.current?.(finalOffset);
      });
    },
    onPanResponderTerminate: () => {
      dragTranslateY.setValue(0);
      dragScale.setValue(1);
      appliedDragOffsetRef.current = 0;
      setDragging(false);
      onReorderPreviewRef.current?.(0);
      onReorderEndRef.current?.();
    },
  }), [dragScale, dragTranslateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        current && styles.current,
        unavailable && styles.disabled,
        dragging && styles.dragging,
        {
          transform: [
            { translateY: reorderTranslateY },
            { translateY: dragTranslateY },
            { scale: dragScale },
          ],
        },
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
