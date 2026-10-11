import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { useLoopRangeGesture } from '../../../hooks/useLoopRangeGesture';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { loopRangeOverviewStyles as styles } from '../../../styles/components/controls/loopRangeOverview';
import { isValidLoopRange, loopSummaryLabel } from '../../../utils/loopRange';
import LoopClearControl from './LoopClearControl';
import LoopOverviewTrack from './LoopOverviewTrack';
import LoopRangeLayer from './LoopRangeLayer';

interface LoopRangeOverviewProps {
  audioUri: string | null;
}

const webTouchStyle = { touchAction: 'none' } as ViewStyle;

/** Compose the full-song loop editor without seeking or viewport side effects. */
const LoopRangeOverview: React.FC<LoopRangeOverviewProps> = ({ audioUri }) => {
  const [width, setWidth] = useState(0);
  const summaryRef = useRef<View>(null);
  const clearRef = useRef<React.ElementRef<typeof Pressable>>(null);
  const previousSummaryRef = useRef<string | null>(null);
  const showTimeline = useStudioStore(state => state.showTimeline);
  const loopStartMs = useStudioStore(state => state.loopStartMs);
  const loopEndMs = useStudioStore(state => state.loopEndMs);
  const songDuration = useStudioStore(state => state.songDuration);
  const isLoopRangeEnabled = useStudioStore(state => state.isLoopRangeEnabled);
  const currentTime = useStudioStore(state => state.currentTime);
  const setLoopStartAtPlayhead = useStudioStore(state => state.setLoopStartAtPlayhead);
  const setLoopEndAtPlayhead = useStudioStore(state => state.setLoopEndAtPlayhead);
  const clearLoopRange = useStudioStore(state => state.clearLoopRange);
  const { gesture, provisionalRange } = useLoopRangeGesture(width);

  const validRange = isValidLoopRange({ loopStartMs, loopEndMs }, songDuration);
  const summary = loopSummaryLabel({ loopStartMs, loopEndMs });
  const accessibilityActions = useMemo(() => [
    { name: 'setLoopStart', label: 'Set loop start at playhead' },
    { name: 'setLoopEnd', label: 'Set loop end at playhead' },
    ...(validRange ? [{ name: 'clearLoop', label: 'Clear loop' }] : []),
  ], [validRange]);

  const focusNode = useCallback((node: View | React.ElementRef<typeof Pressable> | null) => {
    if (!node) return;
    if (Platform.OS === 'web') {
      (node as unknown as { focus?: () => void }).focus?.();
      return;
    }
    const handle = findNodeHandle(node);
    if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  }, []);

  useEffect(() => {
    if (previousSummaryRef.current !== null && previousSummaryRef.current !== summary) {
      AccessibilityInfo.announceForAccessibility(summary);
    }
    previousSummaryRef.current = summary;
  }, [summary]);

  if (!showTimeline) return null;
  const displayedRange = provisionalRange ?? { loopStartMs, loopEndMs };

  return (
    <View
      testID="loop-overview"
      accessibilityLabel="Loop range overview"
      accessibilityHint="Set loop start at playhead, set loop end at playhead, or clear the selected loop"
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'setLoopStart') setLoopStartAtPlayhead(currentTime);
        if (event.nativeEvent.actionName === 'setLoopEnd') setLoopEndAtPlayhead(currentTime);
        if (event.nativeEvent.actionName === 'clearLoop' && validRange) clearLoopRange(Date.now());
      }}
      style={[styles.root, Platform.OS === 'web' && webTouchStyle]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <GestureDetector gesture={gesture}>
        <View style={styles.gestureSurface}>
          <LoopOverviewTrack audioUri={audioUri} width={width} />
          <LoopRangeLayer
            loopStartMs={displayedRange.loopStartMs}
            loopEndMs={displayedRange.loopEndMs}
            songDuration={songDuration}
            width={width}
            isEnabled={isLoopRangeEnabled}
            provisional={provisionalRange !== null}
          />
        </View>
      </GestureDetector>
      <View
        ref={summaryRef}
        accessible
        accessibilityLabel={summary}
        accessibilityLiveRegion="polite"
        tabIndex={-1}
        testID="loop-overview-summary"
        style={styles.accessibleSummary}
      />
      {Platform.OS === 'web' && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set loop start at playhead"
            onPress={() => setLoopStartAtPlayhead(currentTime)}
            tabIndex={-1}
            testID="loop-overview-action-start"
            style={styles.accessibleAction}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set loop end at playhead"
            onPress={() => setLoopEndAtPlayhead(currentTime)}
            tabIndex={-1}
            testID="loop-overview-action-end"
            style={styles.accessibleAction}
          />
        </>
      )}
      <LoopClearControl
        ref={clearRef}
        onCleared={() => setTimeout(() => focusNode(clearRef.current), 0)}
        onRestoreExpired={() => focusNode(summaryRef.current)}
      />
    </View>
  );
};

export default LoopRangeOverview;
