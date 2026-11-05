import { showPrompt } from '../common/AppPrompt';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsPreferences } from '../../../features/settings/preferences';
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
  onSeek: (position: number) => void;
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
  const actions: Parameters<typeof showPrompt>[2] = [];
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
  showPrompt(failure.title, failure.message, actions);
};

const reportResult = (result: QueueControlResult): void => {
  if (result.kind === 'failed') reportFailure(result.reason);
};

const QueueTrackButton: React.FC<QueueTrackButtonProps> = ({ action, compact = false, onSeek }) => {
  const preferences = useSettingsPreferences();
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
    currentTime,
    songDuration,
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
    currentTime: state.currentTime,
    songDuration: state.songDuration,
    firstTrack: state.firstTrack,
    previousTrack: state.previousTrack,
    nextTrack: state.nextTrack,
    toggleShuffle: state.toggleShuffle,
  })));

  const currentItem = currentMusicItemId === null ? null : libraryItems[currentMusicItemId] ?? null;
  const capabilities = capabilitiesFor(currentItem);
  const capabilityAvailable = currentItem === null || (action === 'shuffle'
    ? capabilities.shuffle
    : capabilities.queueControl);
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
  const configurableSeekButton = action === 'previous' || action === 'next';
  const seekDirection = action === 'previous' ? -1 : 1;
  const seekTarget = Math.max(
    0,
    Math.min(songDuration, currentTime + seekDirection * preferences.seekDurationSeconds * 1000),
  );
  const trackAvailable = disabledReason === null && capabilityAvailable;
  const seekAvailable = configurableSeekButton
    && songLoaded
    && capabilities.exactSeeking
    && seekTarget !== currentTime;
  const unavailable = locked || (configurableSeekButton
    ? !trackAvailable && !seekAvailable
    : disabledReason !== null || !capabilityAvailable);
  const checked = action === 'shuffle' ? queue?.shuffle === true : undefined;
  const config = metadata[action];

  const changeTrack = useCallback(() => {
    if (action === 'shuffle') {
      toggleShuffle();
      return;
    }
    if (!trackAvailable) return;
    const invoke = action === 'first'
      ? firstTrack
      : action === 'previous' ? previousTrack : nextTrack;
    void invoke().then(reportResult);
  }, [action, firstTrack, nextTrack, previousTrack, toggleShuffle, trackAvailable]);

  const seek = useCallback(() => {
    if (seekAvailable) onSeek(seekTarget);
  }, [onSeek, seekAvailable, seekTarget]);

  const tapSeeks = configurableSeekButton
    && preferences.seekButtonBehaviour === 'tapSeekHoldTrack';
  const press = tapSeeks ? seek : changeTrack;
  const longPress = configurableSeekButton ? (tapSeeks ? changeTrack : seek) : undefined;
  const seekLabel = `${action === 'previous' ? 'backward' : 'forward'} ${preferences.seekDurationSeconds} seconds`;
  const accessibleLabel = configurableSeekButton
    ? tapSeeks
      ? `Seek ${seekLabel}, hold for ${config.label.toLowerCase()}`
      : `${config.label}, hold to seek ${seekLabel}`
    : config.label;

  const hint = disabledReason
    ?? (!capabilityAvailable
      ? `${action === 'shuffle' ? 'Shuffle' : 'Queue control'} is unavailable for this audio source`
      : locked ? 'Finish the current save or song switch first' : undefined);

  return (
    <DockButton
      compact={compact}
      testID={config.testID}
      label={accessibleLabel}
      state={unavailable ? 'unavailable' : checked ? 'active' : 'inactive'}
      checked={checked}
      hint={hint}
      description={configurableSeekButton && tapSeeks
        ? `${action === 'previous' ? '−' : '+'}${preferences.seekDurationSeconds}s`
        : !capabilityAvailable
          ? `This audio doesn’t support ${action === 'shuffle' ? 'shuffle' : 'queue controls'}.`
          : undefined}
      onPress={press}
      onLongPress={longPress}
      valueText={configurableSeekButton ? `${preferences.seekDurationSeconds} second seek` : undefined}
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
