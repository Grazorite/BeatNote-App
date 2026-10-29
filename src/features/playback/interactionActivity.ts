let loopRangeGestureActive = false;

/** Keep high-frequency playback visuals from competing with loop-handle gestures on the JS thread. */
export const setLoopRangeGestureActive = (active: boolean): void => {
  loopRangeGestureActive = active;
};

export const isLoopRangeGestureActive = (): boolean => loopRangeGestureActive;
