import { useCallback, useEffect, useRef } from 'react';

const HOLD_DELAY_MS = 420;
const INITIAL_REPEAT_MS = 260;
const MIN_REPEAT_MS = 45;
const ACCELERATION_MS = 1_250;

interface AcceleratingPressHandlers {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
}

/** Repeats an action at an exponentially increasing rate while a control remains pressed. */
export const useAcceleratingPress = (
  action: () => void,
  disabled = false,
): AcceleratingPressHandlers => {
  const actionRef = useRef(action);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartedAtRef = useRef(0);
  const repeatedRef = useRef(false);
  actionRef.current = action;

  const cancel = useCallback((): void => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleRepeat = useCallback((): void => {
    const elapsed = Date.now() - holdStartedAtRef.current;
    const delay = Math.max(
      MIN_REPEAT_MS,
      INITIAL_REPEAT_MS * Math.exp(-elapsed / ACCELERATION_MS),
    );
    timerRef.current = setTimeout(() => {
      repeatedRef.current = true;
      actionRef.current();
      scheduleRepeat();
    }, delay);
  }, []);

  const onPressIn = useCallback((): void => {
    if (disabled) return;
    cancel();
    repeatedRef.current = false;
    holdStartedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      actionRef.current();
      repeatedRef.current = true;
      scheduleRepeat();
    }, HOLD_DELAY_MS);
  }, [cancel, disabled, scheduleRepeat]);

  const onPressOut = useCallback((): void => {
    cancel();
  }, [cancel]);

  const onPress = useCallback((): void => {
    if (!disabled && !repeatedRef.current) actionRef.current();
    repeatedRef.current = false;
  }, [disabled]);

  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    if (disabled) cancel();
  }, [cancel, disabled]);

  return { onPress, onPressIn, onPressOut };
};
