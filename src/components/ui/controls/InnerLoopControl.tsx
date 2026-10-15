import React from 'react';
import { Brackets } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { LoopMarkerIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { deriveInnerLoopState } from '../../../utils/innerLoop';
import { isValidLoopRange } from '../../../utils/loopRange';
import DockButton from './DockButton';

interface InnerLoopControlProps {
  onToast: (message: string) => void;
  compact?: boolean;
}

const InnerLoopControl: React.FC<InnerLoopControlProps> = ({ onToast, compact }) => {
  const state = useStudioStore(useShallow(store => ({
    marker: store.isLoopMarkerActive,
    range: store.isLoopRangeEnabled,
    loaded: store.songLoaded,
    duration: store.songDuration,
    start: store.loopStartMs,
    end: store.loopEndMs,
    cycle: store.cycleInnerLoop,
  })));
  const current = deriveInnerLoopState(state.marker, state.range);
  const active = current !== 'off';

  const cycle = () => {
    const hadValidRange = isValidLoopRange(
      { loopStartMs: state.start, loopEndMs: state.end },
      state.duration,
    );
    const next = state.cycle();
    if (next === current) {
      onToast('No range available');
    } else if (next === 'off') {
      onToast('Looping off');
    } else if (next === 'markers') {
      onToast('Loop between markers');
    } else {
      onToast(hadValidRange ? 'Loop selected range' : 'Whole song selected as loop range');
    }
  };

  const icon = current === 'range'
    ? <Brackets testID="loop-range-icon" size={22} color={colors.text} />
    : <LoopMarkerIcon
        testID="inner-loop-marker-icon"
        size={20}
        color={state.loaded ? colors.text : colors.textSecondary}
      />;

  return (
    <DockButton
      compact={compact}
      testID="inner-loop-cycle"
      label={`Inner loop: ${current}`}
      hint={state.loaded ? `Current state ${current}. Activates the next loop mode.` : 'Load a song to use inner looping'}
      state={!state.loaded ? 'unavailable' : active ? 'active' : 'inactive'}
      checked={active}
      valueText={current}
      onPress={cycle}
    >
      {icon}
    </DockButton>
  );
};

export default InnerLoopControl;
