import React, { forwardRef, useEffect } from 'react';
import { Pressable, Text } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { loopClearControlStyles as styles } from '../../../styles/components/controls/loopClearControl';
import { isValidLoopRange } from '../../../utils/loopRange';

/** Clear the current loop or restore the most recently cleared loop during its undo window. */
interface LoopClearControlProps {
  onCleared?: () => void;
  onRestoreExpired?: () => void;
}

const LoopClearControl = forwardRef<React.ElementRef<typeof Pressable>, LoopClearControlProps>(({
  onCleared,
  onRestoreExpired,
}, ref) => {
  const loopStartMs = useStudioStore(state => state.loopStartMs);
  const loopEndMs = useStudioStore(state => state.loopEndMs);
  const songDuration = useStudioStore(state => state.songDuration);
  const snapshot = useStudioStore(state => state.loopRestoreSnapshot);
  const clearLoopRange = useStudioStore(state => state.clearLoopRange);
  const restoreLoopRange = useStudioStore(state => state.restoreLoopRange);
  const discardLoopRestore = useStudioStore(state => state.discardLoopRestore);
  const hasRange = isValidLoopRange({ loopStartMs, loopEndMs }, songDuration);

  useEffect(() => {
    if (!snapshot) return undefined;
    const remainingMs = Math.max(0, snapshot.expiresAtMs - Date.now());
    const timer = setTimeout(() => {
      discardLoopRestore();
      onRestoreExpired?.();
    }, remainingMs);
    return () => clearTimeout(timer);
  }, [discardLoopRestore, onRestoreExpired, snapshot]);

  if (!hasRange && !snapshot) return null;
  const restoring = !hasRange && snapshot !== null;
  const label = restoring ? 'Restore' : 'Clear loop';

  return (
    <Pressable
      ref={ref}
      testID="loop-overview-clear"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        if (restoring) {
          restoreLoopRange(Date.now());
        } else {
          clearLoopRange(Date.now());
          onCleared?.();
        }
      }}
      style={styles.button}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
});

LoopClearControl.displayName = 'LoopClearControl';

export default LoopClearControl;
