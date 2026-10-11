import { useEffect } from 'react';

import { useStudioStore } from './useStudioStore';

/** Keep the detail viewport aligned with playback independently of overview visibility. */
export function useViewportFollow(): void {
  const isViewportLocked = useStudioStore(state => state.isViewportLocked);
  const isPlaying = useStudioStore(state => state.isPlaying);
  const currentTime = useStudioStore(state => state.currentTime);
  const songDuration = useStudioStore(state => state.songDuration);
  const viewportStartTime = useStudioStore(state => state.viewportStartTime);
  const viewportDuration = useStudioStore(state => state.viewportDuration);
  const setViewportLocked = useStudioStore(state => state.setViewportLocked);
  const setViewportStartTime = useStudioStore(state => state.setViewportStartTime);

  useEffect(() => {
    if (!isPlaying || !Number.isFinite(currentTime)) return;

    const constrainedDuration = Math.max(0, Math.min(viewportDuration, songDuration));
    const constrainedStart = Math.max(
      0,
      Math.min(viewportStartTime, Math.max(0, songDuration - constrainedDuration)),
    );
    const viewportEnd = constrainedStart + constrainedDuration;
    const playheadInside = currentTime >= constrainedStart && currentTime <= viewportEnd;

    if (!isViewportLocked) {
      if (playheadInside) setViewportLocked(true);
      return;
    }

    if (!playheadInside) {
      setViewportStartTime(Math.max(
        0,
        Math.min(currentTime, Math.max(0, songDuration - constrainedDuration)),
      ));
    }
  }, [
    currentTime,
    isPlaying,
    isViewportLocked,
    setViewportLocked,
    setViewportStartTime,
    songDuration,
    viewportDuration,
    viewportStartTime,
  ]);
}
