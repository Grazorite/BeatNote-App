import React, { useCallback } from 'react';
import { Alert, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore, type QueueControlResult } from '../../../hooks/useStudioStore';
import { capabilitiesFor } from '../../../features/library/sourceResolver';
import type { SwitchFailure } from '../../../features/library/trackSwitch';
import { queueTarget, type QueueAction } from '../../../utils/queueOrder';
import { colors } from '../../../styles/common';
import { queueTrackButtonStyles as styles } from '../../../styles/components/controls/queueTrackButton';
import { BeatNoteIcon } from '../../icons';
import DockButton from './DockButton';

type QueueButtonAction = QueueAction | 'shuffle';

interface QueueTrackButtonProps {
  action: QueueButtonAction;
  compact?: boolean;
}

const metadata: Record<QueueButtonAction, {
  label: string;
  testID: string;
  icon: 'first' | 'previous' | 'next' | 'shuffle';
}> = {
  first: { label: 'First track', testID: 'first-track-control', icon: 'first' },
  previous: { label: 'Previous track', testID: 'previous-track-control', icon: 'previous' },
  next: { label: 'Next track', testID: 'next-track-control', icon: 'next' },
  shuffle: { label: 'Shuffle', testID: 'shuffle-control', icon: 'shuffle' },
};

const reportFailure = (failure: SwitchFailure): void => {
  const actions: Parameters<typeof Alert.alert>[2] = [];
  if (failure.canRelink) {
    actions.push({
      text: 'Relink',
      onPress: () => useStudioStore.getState().openLibrarySheet(),
    });
  }
  if (failure.skip) {
    actions.push({
      text: 'Skip',
      onPress: () => { void failure.skip?.().then(reportResult); },
    });
  }
  actions.push({ text: 'Close', style: 'cancel' });
  Alert.alert(failure.title, failure.message, actions);
};

const reportResult = (result: QueueControlResult): void => {
  if (result.kind === 'failed') reportFailure(result.reason);
};

const QueueTrackButton: React.FC<QueueTrackButtonProps> = ({ action, compact = false }) => {
  const previousPastThreshold = useStudioStore(state => state.currentTime > 3_000);
  const {
    queue,
    currentMusicItemId,
    songLoaded,
    switchPhase,
    switchGuard,
    saveInProgress,
    pendingSwitchTargetId,
    loadingMusicItemId,
    libraryItems,
    firstTrack,
    previousTrack,
    nextTrack,
    toggleShuffle,
  } = useStudioStore(useShallow(state => ({
    queue: state.queue,
    currentMusicItemId: state.currentMusicItemId,
    songLoaded: state.songLoaded,
    switchPhase: state.switchPhase,
    switchGuard: state.switchGuard,
    saveInProgress: state.saveInProgress,
    pendingSwitchTargetId: state.pendingSwitchTargetId,
    loadingMusicItemId: state.loadingMusicItemId,
    libraryItems: state.libraryItems,
    firstTrack: state.firstTrack,
    previousTrack: state.previousTrack,
    nextTrack: state.nextTrack,
    toggleShuffle: state.toggleShuffle,
  })));

  const currentItem = currentMusicItemId === null ? null : libraryItems[currentMusicItemId] ?? null;
  const capabilities = capabilitiesFor(currentItem);
  const capabilityAvailable = action === 'shuffle'
    ? capabilities.shuffle
    : capabilities.queueControl;
  const locked = switchPhase === 'guard' || switchGuard !== null || saveInProgress;
  const targetId = pendingSwitchTargetId ?? loadingMusicItemId;
  const targetIndex = targetId === null || queue === null ? -1 : queue.order.indexOf(targetId);
  const baseIndex = targetIndex >= 0 ? targetIndex : queue?.currentIndex ?? null;
  const hasQueue = songLoaded && currentMusicItemId !== null && queue !== null && baseIndex !== null;
  const workingQueue = queue === null ? null : { ...queue, currentIndex: baseIndex };
  const target = action === 'shuffle' || workingQueue === null
    ? null
    : queueTarget(
      workingQueue,
      action,
      action === 'previous' && previousPastThreshold ? 3_001 : 0,
      hasQueue,
    );
  const disabledReason = !hasQueue
    ? 'Choose music to start a queue'
    : target?.kind === 'disabled' ? target.reason : null;
  const unavailable = locked || disabledReason !== null || !capabilityAvailable;
  const checked = action === 'shuffle' ? queue?.shuffle === true : undefined;
  const config = metadata[action];

  const press = useCallback(() => {
    if (action === 'shuffle') {
      toggleShuffle();
      return;
    }
    const invoke = action === 'first'
      ? firstTrack
      : action === 'previous' ? previousTrack : nextTrack;
    void invoke().then(reportResult);
  }, [action, firstTrack, nextTrack, previousTrack, toggleShuffle]);

  const hint = !capabilityAvailable
    ? `${action === 'shuffle' ? 'Shuffle' : 'Queue control'} is unavailable for this audio source`
    : locked ? 'Finish the current save or song switch first' : disabledReason ?? undefined;

  return (
    <DockButton
      compact={compact}
      testID={config.testID}
      label={config.label}
      state={unavailable ? 'unavailable' : checked ? 'active' : 'inactive'}
      checked={checked}
      hint={hint}
      onPress={press}
    >
      <View style={styles.icon}>
        <BeatNoteIcon
          testID={action === 'previous'
            ? 'previous-track-icon'
            : action === 'next' ? 'next-track-icon' : undefined}
          name={config.icon}
          size={20}
          color={unavailable ? colors.textSecondary : colors.text}
        />
      </View>
    </DockButton>
  );
};

export default React.memo(QueueTrackButton);
