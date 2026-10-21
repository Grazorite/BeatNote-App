import React from 'react';
import { BeatNoteIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';
import { capabilitiesForLoadedItem } from '../../../features/library/sourceResolver';

interface RepeatControlProps {
  onToast: (message: string) => void;
  compact?: boolean;
}

const RepeatControl: React.FC<RepeatControlProps> = ({ onToast, compact }) => {
  const active = useStudioStore(state => state.isRepeatActive);
  const loaded = useStudioStore(state => state.songLoaded);
  const toggle = useStudioStore(state => state.toggleRepeat);
  const repeatAvailable = useStudioStore(state => capabilitiesForLoadedItem(
    state.currentMusicItemId === null ? null : state.libraryItems[state.currentMusicItemId] ?? null,
    state.songLoaded && state.currentAudioUri !== null,
  ).repeat);
  const capabilityGated = loaded && !repeatAvailable;
  const unavailable = !loaded || !repeatAvailable;
  return (
    <DockButton
      compact={compact}
      testID="repeat-toggle"
      label="Repeat track"
      state={unavailable ? 'unavailable' : active ? 'active' : 'inactive'}
      checked={active}
      hint={capabilityGated ? 'Repeat is unavailable for this audio source' : undefined}
      description={capabilityGated ? 'Not available for this source: repeat' : undefined}
      onPress={() => {
        toggle();
        onToast(active ? 'Repeat track off' : 'Repeat track on');
      }}
    >
      <BeatNoteIcon testID="repeat-track-icon" name="repeat" size={22} color={!unavailable ? colors.text : colors.textSecondary} />
    </DockButton>
  );
};

export default RepeatControl;
