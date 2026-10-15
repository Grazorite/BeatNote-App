import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatSpeedLabel } from '../../../utils/innerLoop';
import DockButton from './DockButton';
import { playbackSpeedControlStyles as styles } from '../../../styles/components/controls/playbackSpeedControl';

interface PlaybackSpeedControlProps {
  value?: number;
  options?: number[];
  onSelect?: (value: number) => void;
  onToast: (message: string) => void;
  compact?: boolean;
}

const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({
  value: controlledValue,
  options = [0.75, 0.8, 1, 1.25, 2],
  onSelect,
  onToast,
  compact,
}) => {
  const [localValue, setLocalValue] = useState(1);
  const [open, setOpen] = useState(false);
  const value = controlledValue ?? localValue;

  const select = (next: number) => {
    if (controlledValue === undefined) setLocalValue(next);
    onSelect?.(next);
    setOpen(false);
    onToast(`${formatSpeedLabel(next)} selected; playback speed is coming soon`);
  };

  return (
    <View style={styles.wrapper}>
      {open && (
        <View style={styles.chooser} testID="playback-speed-chooser">
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, option === value && styles.optionSelected]}
              onPress={() => select(option)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${formatSpeedLabel(option)} playback speed`}
            >
              <Text style={styles.optionText}>{formatSpeedLabel(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <DockButton
        compact={compact}
        testID="playback-speed"
        label={`Playback speed ${formatSpeedLabel(value)}, coming soon`}
        state="reserved"
        onPress={() => setOpen(current => !current)}
      >
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>{formatSpeedLabel(value)}</Text>
      </DockButton>
    </View>
  );
};

export default PlaybackSpeedControl;
