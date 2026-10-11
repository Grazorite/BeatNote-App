import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { loopRangeLayerStyles as styles } from '../../../styles/components/controls/loopRangeLayer';
import {
  LARGE_STEP_MULTIPLIER,
  MIN_LOOP_DURATION_MS,
  formatLoopTime,
  isValidLoopRange,
  msToOverviewX,
} from '../../../utils/loopRange';

interface LoopRangeLayerProps {
  loopStartMs: number | null;
  loopEndMs: number | null;
  songDuration: number;
  width: number;
  isEnabled: boolean;
  provisional?: boolean;
}

interface WebKeyEvent {
  key?: string;
  shiftKey?: boolean;
  preventDefault?: () => void;
  nativeEvent?: { key?: string; shiftKey?: boolean };
}

const handleCursorStyle = Platform.OS === 'web'
  ? ({ cursor: 'ew-resize' } as unknown as ViewStyle)
  : undefined;
const rangeCursorStyle = Platform.OS === 'web'
  ? ({ cursor: 'grab' } as unknown as ViewStyle)
  : undefined;

/** Draw the selected range, outside dimming, and keyboard-accessible handles. */
const LoopRangeLayer: React.FC<LoopRangeLayerProps> = ({
  loopStartMs,
  loopEndMs,
  songDuration,
  width,
  isEnabled,
  provisional = false,
}) => {
  const [focusedBound, setFocusedBound] = useState<'start' | 'end' | null>(null);
  const nudgeLoopBound = useStudioStore(state => state.nudgeLoopBound);
  const setLoopRange = useStudioStore(state => state.setLoopRange);
  const range = { loopStartMs, loopEndMs };
  const validRange = isValidLoopRange(range, songDuration);
  const validProvisional = provisional
    && loopStartMs !== null
    && loopEndMs !== null
    && loopStartMs < loopEndMs
    && loopStartMs >= 0
    && loopEndMs <= songDuration;
  if ((!validRange && !validProvisional) || width <= 0) return null;
  const startX = msToOverviewX(loopStartMs as number, songDuration, width);
  const endX = msToOverviewX(loopEndMs as number, songDuration, width);
  const computedWidth = endX - startX;
  const bodyWidth = Math.max(2, computedWidth);
  const bodyLeft = computedWidth < 2 ? Math.max(0, (startX + endX) / 2 - 1) : startX;
  const hitWidth = Platform.OS === 'web' ? 16 : 44;
  const handleLeft = (center: number): number => Math.max(0, Math.min(center - hitWidth / 2, width - hitWidth));
  const valueText = isEnabled ? 'enabled' : 'disabled';

  if (provisional) {
    return (
      <View
        pointerEvents="none"
        style={[styles.fill, styles.fillDisabled, { left: bodyLeft, width: bodyWidth }]}
      />
    );
  }

  const moveBoundToEdge = (bound: 'start' | 'end', edge: 'home' | 'end'): void => {
    const start = loopStartMs as number;
    const end = loopEndMs as number;
    if (bound === 'start') {
      setLoopRange(edge === 'home' ? 0 : end - MIN_LOOP_DURATION_MS, end);
    } else {
      setLoopRange(start, edge === 'home' ? start + MIN_LOOP_DURATION_MS : songDuration);
    }
  };

  const handleKeyDown = (bound: 'start' | 'end', event: WebKeyEvent): void => {
    const key = event.key ?? event.nativeEvent?.key;
    const shifted = event.shiftKey ?? event.nativeEvent?.shiftKey ?? false;
    if (!key) return;
    if (key === 'Home' || key === 'End') {
      event.preventDefault?.();
      moveBoundToEdge(bound, key === 'Home' ? 'home' : 'end');
      return;
    }
    const direction = key === 'ArrowLeft' || key === 'ArrowDown'
      ? -1
      : key === 'ArrowRight' || key === 'ArrowUp'
        ? 1
        : 0;
    if (direction === 0 && key !== 'PageUp' && key !== 'PageDown') return;
    event.preventDefault?.();
    const pageDirection = key === 'PageDown' ? -1 : key === 'PageUp' ? 1 : direction;
    const multiplier = shifted || key.startsWith('Page') ? LARGE_STEP_MULTIPLIER : 1;
    nudgeLoopBound(bound, pageDirection * multiplier);
  };

  const renderHandle = (bound: 'start' | 'end', center: number, value: number) => {
    const label = `Loop ${bound} ${formatLoopTime(value)}`;
    return (
      <Pressable
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: songDuration, now: value, text: label }}
        accessibilityActions={[
          { name: 'increment', label: `Increase loop ${bound}` },
          { name: 'decrement', label: `Decrease loop ${bound}` },
        ]}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'increment') nudgeLoopBound(bound, 1);
          if (event.nativeEvent.actionName === 'decrement') nudgeLoopBound(bound, -1);
        }}
        aria-valuemin={0}
        aria-valuemax={songDuration}
        aria-valuenow={value}
        aria-valuetext={label}
        onFocus={() => setFocusedBound(bound)}
        onBlur={() => setFocusedBound(current => current === bound ? null : current)}
        {...(Platform.OS === 'web' ? { onKeyDown: (event: WebKeyEvent) => handleKeyDown(bound, event) } : {})}
        testID={`loop-overview-handle-${bound}`}
        style={[
          styles.handle,
          { left: handleLeft(center), width: hitWidth },
          handleCursorStyle,
          focusedBound === bound && styles.handleFocused,
        ]}
      >
        <View style={styles.handleVisual} />
      </Pressable>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={[styles.outside, { left: 0, width: Math.max(0, startX) }]} />
      <View style={[styles.outside, { left: endX, width: Math.max(0, width - endX) }]} />
      <View
        testID="loop-overview-range"
        accessibilityLabel={`Loop range ${valueText}`}
        accessibilityValue={{ text: valueText }}
        style={[
          styles.fill,
          isEnabled ? styles.fillEnabled : styles.fillDisabled,
          rangeCursorStyle,
          { left: bodyLeft, width: bodyWidth },
        ]}
      />
      {renderHandle('start', startX, loopStartMs as number)}
      {renderHandle('end', endX, loopEndMs as number)}
    </View>
  );
};

export default LoopRangeLayer;
