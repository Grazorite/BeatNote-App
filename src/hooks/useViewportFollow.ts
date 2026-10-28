import { useEffect } from 'react';

import { useStudioStore } from './useStudioStore';

/** Keep the detail viewport aligned with playback independently of overview visibility. */
export function useViewportFollow(): void {
  useEffect(() => useStudioStore.subscribe((state, previous) => {
    if (state.currentTime === previous.currentTime || !state.isPlaying
      || !Number.isFinite(state.currentTime)) return;

    const constrainedDuration = Math.max(
      0,
      Math.min(state.viewportDuration, state.songDuration),
    );
    const constrainedStart = Math.max(
      0,
      Math.min(
        state.viewportStartTime,
        Math.max(0, state.songDuration - constrainedDuration),
      ),
    );
    const viewportEnd = constrainedStart + constrainedDuration;
    const playheadInside = state.currentTime >= constrainedStart
      && state.currentTime <= viewportEnd;

    if (!state.isViewportLocked) {
      if (playheadInside) state.setViewportLocked(true);
      return;
    }

    if (!playheadInside) {
      state.setViewportStartTime(Math.max(
        0,
        Math.min(
          state.currentTime,
          Math.max(0, state.songDuration - constrainedDuration),
        ),
      ));
    }
  }), []);
}
