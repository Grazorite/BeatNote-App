import React from 'react';
import { Repeat2 } from 'lucide-react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';

interface RepeatControlProps {
  onToast: (message: string) => void;
  compact?: boolean;
}

const RepeatControl: React.FC<RepeatControlProps> = ({ onToast, compact }) => {
  const active = useStudioStore(state => state.isRepeatActive);
  const loaded = useStudioStore(state => state.songLoaded);
  const toggle = useStudioStore(state => state.toggleRepeat);
  return (
    <DockButton
      compact={compact}
      testID="repeat-toggle"
      label="Repeat track"
      state={!loaded ? 'unavailable' : active ? 'active' : 'inactive'}
      checked={active}
      onPress={() => {
        toggle();
        onToast(active ? 'Repeat track off' : 'Repeat track on');
      }}
    >
      <Repeat2 testID="repeat-track-icon" size={22} color={loaded ? colors.text : colors.textSecondary} />
    </DockButton>
  );
};

export default RepeatControl;
