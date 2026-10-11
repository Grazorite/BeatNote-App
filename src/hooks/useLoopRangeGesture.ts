import { useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

import { useStudioStore, type LoopRestoreSnapshot } from './useStudioStore';
import {
  MIN_LOOP_DURATION_MS,
  type LoopGestureMode,
  type LoopRange,
  moveLoopRange,
  normalizeLoopRange,
  overviewXToMs,
  resizeLoopBound,
  resolveGestureMode,
} from '../utils/loopRange';

interface UseLoopRangeGestureResult {
  gesture: ReturnType<typeof Gesture.Pan>;
  provisionalRange: LoopRange | null;
}

interface GestureStartState {
  anchorX: number;
  anchorMs: number;
  range: LoopRange;
  enabled: boolean;
  restoreSnapshot: LoopRestoreSnapshot | null;
  mode: LoopGestureMode | null;
}

/** Build the overview's single range-editing Pan gesture. */
export function useLoopRangeGesture(width: number): UseLoopRangeGestureResult {
  const [provisionalRange, setProvisionalRange] = useState<LoopRange | null>(null);
  const provisionalRef = useRef<LoopRange | null>(null);
  const startRef = useRef<GestureStartState>({
    anchorX: 0,
    anchorMs: 0,
    range: { loopStartMs: null, loopEndMs: null },
    enabled: false,
    restoreSnapshot: null,
    mode: null,
  });

  const restorePreGestureRange = (): void => {
    const start = startRef.current;
    const store = useStudioStore.getState();
    store.setLoopRange(start.range.loopStartMs, start.range.loopEndMs);
    store.setLoopRangeEnabled(start.enabled);
    useStudioStore.setState({ loopRestoreSnapshot: start.restoreSnapshot });
  };

  const updateProvisionalRange = (range: LoopRange | null): void => {
    provisionalRef.current = range;
    setProvisionalRange(range);
  };

  const gesture = useMemo(() => Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .maxPointers(1)
    .onBegin(event => {
      const store = useStudioStore.getState();
      startRef.current = {
        anchorX: event.x,
        anchorMs: overviewXToMs(event.x, store.songDuration, width),
        range: { loopStartMs: store.loopStartMs, loopEndMs: store.loopEndMs },
        enabled: store.isLoopRangeEnabled,
        restoreSnapshot: store.loopRestoreSnapshot,
        mode: null,
      };
      updateProvisionalRange(null);
    })
    .onStart(event => {
      const store = useStudioStore.getState();
      startRef.current.mode = resolveGestureMode(
        startRef.current.anchorX,
        startRef.current.range,
        store.songDuration,
        width,
        Platform.OS === 'web' ? 'web' : 'native',
        event.translationX,
      );
    })
    .onUpdate(event => {
      const store = useStudioStore.getState();
      if (width <= 0 || !Number.isFinite(store.songDuration) || store.songDuration < MIN_LOOP_DURATION_MS) return;
      const start = startRef.current;
      const pointerX = start.anchorX + event.translationX;
      const pointerMs = overviewXToMs(pointerX, store.songDuration, width);
      if (start.mode === 'create') {
        const candidate = normalizeLoopRange(start.anchorMs, pointerMs, store.songDuration);
        if (candidate.loopStartMs === null || candidate.loopEndMs === null) {
          updateProvisionalRange({
            loopStartMs: Math.min(start.anchorMs, pointerMs),
            loopEndMs: Math.max(start.anchorMs, pointerMs),
          });
          restorePreGestureRange();
        } else {
          updateProvisionalRange(null);
          store.setLoopRange(candidate.loopStartMs, candidate.loopEndMs);
        }
        return;
      }
      const deltaMs = overviewXToMs(start.anchorX + event.translationX, store.songDuration, width)
        - start.anchorMs;
      if (start.mode === 'move') {
        const moved = moveLoopRange(start.range, deltaMs, store.songDuration);
        store.setLoopRange(moved.loopStartMs, moved.loopEndMs);
      } else if (start.mode === 'resize-start' || start.mode === 'resize-end') {
        const bound = start.mode === 'resize-start' ? 'start' : 'end';
        const base = bound === 'start' ? start.range.loopStartMs : start.range.loopEndMs;
        if (base === null) return;
        const resized = resizeLoopBound(start.range, bound, base + deltaMs, store.songDuration);
        store.setLoopRange(resized.loopStartMs, resized.loopEndMs);
      }
    })
    .onFinalize(() => {
      if (startRef.current.mode === 'create' && provisionalRef.current !== null) {
        restorePreGestureRange();
      }
      updateProvisionalRange(null);
      startRef.current.mode = null;
    }), [width]);

  return { gesture, provisionalRange };
}
