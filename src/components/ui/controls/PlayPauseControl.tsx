import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BeatNoteIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { playPauseControlStyles as styles } from '../../../styles/components/controls/playPauseControl';

interface PlayPauseControlProps {
  onTogglePlayback: () => void;
  compact?: boolean;
}

const PlayPauseControl: React.FC<PlayPauseControlProps> = ({ onTogglePlayback, compact }) => {
  const isPlaying = useStudioStore(state => state.isPlaying);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const iconColor = songLoaded ? colors.text : colors.textSecondary;

  return (
    <TouchableOpacity
      testID="play-pause"
      style={[styles.button, compact && styles.compactButton, !songLoaded && styles.disabled]}
      onPress={songLoaded ? onTogglePlayback : undefined}
      disabled={!songLoaded}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause playback' : 'Play playback'}
      accessibilityState={{ disabled: !songLoaded }}
      aria-disabled={!songLoaded}
      activeOpacity={0.82}
    >
      <BeatNoteIcon name={isPlaying ? 'pause' : 'play'} size={compact ? 24 : 40} color={iconColor} />
    </TouchableOpacity>
  );
};

export default React.memo(PlayPauseControl);
