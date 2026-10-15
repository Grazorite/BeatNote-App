import React, { forwardRef, useEffect } from 'react';
import { Pressable } from 'react-native';
import { RotateCcw, Trash2 } from 'lucide-react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { loopClearControlStyles as styles } from '../../../styles/components/controls/loopClearControl';
import { isValidLoopRange } from '../../../utils/loopRange';

/** Clear the current loop or restore the most recently cleared loop during its undo window. */
interface LoopClearControlProps {
  onCleared?: () => void;
  onRestoreExpired?: () => void;
  onToast?: (message: string) => void;
}

const LoopClearControl = forwardRef<React.ElementRef<typeof Pressable>, LoopClearControlProps>(({
  onCleared,
  onRestoreExpired,
  onToast,
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

  const restoring = !hasRange && snapshot !== null;
  const inactive = !hasRange && snapshot === null;
  const label = inactive ? 'Clear loop unavailable' : restoring ? 'Restore' : 'Clear loop';

  return (
    <Pressable
      ref={ref}
      testID="loop-overview-clear"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive }}
      aria-disabled={inactive}
      disabled={inactive}
      hitSlop={4}
      onPress={() => {
        if (inactive) return;
        if (restoring) {
          restoreLoopRange(Date.now());
          onToast?.('Loop range restored');
        } else {
          clearLoopRange(Date.now());
          onToast?.('Loop range cleared');
          onCleared?.();
        }
      }}
      style={[styles.button, inactive && styles.buttonDisabled]}
    >
      {restoring
        ? <RotateCcw size={15} color="#ffffff" />
        : <Trash2 size={15} color={inactive ? colors.textSecondary : colors.text} />}
    </Pressable>
  );
});

LoopClearControl.displayName = 'LoopClearControl';

export default LoopClearControl;
