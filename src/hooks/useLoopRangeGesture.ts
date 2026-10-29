import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

import { setLoopRangeGestureActive } from '../features/playback/interactionActivity';
import { useStudioStore } from './useStudioStore';
import {
  isValidLoopRange,
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
  mode: LoopGestureMode | null;
}

/** Build the overview's single range-editing Pan gesture. */
export function useLoopRangeGesture(width: number): UseLoopRangeGestureResult {
  const [provisionalRange, setProvisionalRange] = useState<LoopRange | null>(null);
  const provisionalRef = useRef<LoopRange | null>(null);
  const provisionalFrameRef = useRef<number | null>(null);
  const startRef = useRef<GestureStartState>({
    anchorX: 0,
    anchorMs: 0,
    range: { loopStartMs: null, loopEndMs: null },
    mode: null,
  });

  const clearProvisionalRange = (): void => {
    if (provisionalFrameRef.current !== null) {
      cancelAnimationFrame(provisionalFrameRef.current);
      provisionalFrameRef.current = null;
    }
    provisionalRef.current = null;
    setProvisionalRange(null);
  };

  const updateProvisionalRange = (range: LoopRange | null): void => {
    provisionalRef.current = range;
    if (provisionalFrameRef.current !== null) return;
    provisionalFrameRef.current = requestAnimationFrame(() => {
      provisionalFrameRef.current = null;
      setProvisionalRange(provisionalRef.current);
    });
  };

  useEffect(() => () => {
    setLoopRangeGestureActive(false);
    if (provisionalFrameRef.current !== null) {
      cancelAnimationFrame(provisionalFrameRef.current);
    }
  }, []);

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
        mode: null,
      };
      clearProvisionalRange();
    })
    .onStart(event => {
      setLoopRangeGestureActive(true);
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
        updateProvisionalRange(
          candidate.loopStartMs === null || candidate.loopEndMs === null
            ? {
                loopStartMs: Math.min(start.anchorMs, pointerMs),
                loopEndMs: Math.max(start.anchorMs, pointerMs),
              }
            : candidate,
        );
        return;
      }
      const deltaMs = overviewXToMs(start.anchorX + event.translationX, store.songDuration, width)
        - start.anchorMs;
      if (start.mode === 'move') {
        updateProvisionalRange(moveLoopRange(start.range, deltaMs, store.songDuration));
      } else if (start.mode === 'resize-start' || start.mode === 'resize-end') {
        const bound = start.mode === 'resize-start' ? 'start' : 'end';
        const base = bound === 'start' ? start.range.loopStartMs : start.range.loopEndMs;
        if (base === null) return;
        updateProvisionalRange(
          resizeLoopBound(start.range, bound, base + deltaMs, store.songDuration),
        );
      }
    })
    .onFinalize((_event, success) => {
      const candidate = provisionalRef.current;
      if (success && candidate !== null) {
        const store = useStudioStore.getState();
        if (isValidLoopRange(candidate, store.songDuration)) {
          store.setLoopRange(candidate.loopStartMs, candidate.loopEndMs);
        }
      }
      clearProvisionalRange();
      setLoopRangeGestureActive(false);
      startRef.current.mode = null;
    }), [width]);

  return { gesture, provisionalRange };
}
