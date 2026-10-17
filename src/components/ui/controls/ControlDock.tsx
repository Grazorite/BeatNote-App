import React from 'react';
import { View } from 'react-native';
import { BeatNoteIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { controlDockStyles as styles } from '../../../styles/components/controls/controlDock';
import type { DockToastAction } from '../../../hooks/useDockToast';
import AnnotationDockButton from './AnnotationDockButton';
import DockButton from './DockButton';
import InnerLoopControl from './InnerLoopControl';
import MarkerDockButton from './MarkerDockButton';
import PlaybackSpeedControl from './PlaybackSpeedControl';
import PlaybackTimeProbe from './PlaybackTimeProbe';
import PlayPauseControl from './PlayPauseControl';
import RepeatControl from './RepeatControl';

interface ControlDockProps {
  isLandscape: boolean;
  onTogglePlayback: () => void;
  onSeek: (position: number) => void;
  onAddMarker: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (value: number) => void;
  canAnnotate: boolean;
  hasAnnotation: boolean;
  onAnnotate: () => void;
  onToast: (message: string, action?: DockToastAction | null) => void;
}

const Spacer = () => <View style={styles.cell} pointerEvents="none" />;

const ControlDock: React.FC<ControlDockProps> = ({
  onTogglePlayback,
  onSeek,
  onAddMarker,
  playbackSpeed,
  onPlaybackSpeedChange,
  canAnnotate,
  hasAnnotation,
  onAnnotate,
  onToast,
  isLandscape,
}) => {
  const songLoaded = useStudioStore(state => state.songLoaded);
  const cellStyle = isLandscape ? [styles.cell, styles.landscapeCell] : styles.cell;
  const reserved = (testID: string, label: string, message: string, icon: React.ReactNode) => (
    <View style={cellStyle}>
      <DockButton
        compact={isLandscape}
        testID={testID}
        label={`${label}, coming soon`}
        state={songLoaded ? 'reserved' : 'unavailable'}
        onPress={() => onToast(message)}
      >
        {icon}
      </DockButton>
    </View>
  );
  const marker = (action: 'previous' | 'add' | 'next' | 'removePrevious') => (
    <View style={cellStyle}>
      <MarkerDockButton compact={isLandscape} action={action} onSeek={onSeek} onAddMarker={onAddMarker} onToast={onToast} />
    </View>
  );

  const repeat = <View style={cellStyle}><RepeatControl compact={isLandscape} onToast={onToast} /></View>;
  const innerLoop = <View style={cellStyle}><InnerLoopControl compact={isLandscape} onToast={onToast} /></View>;
  const annotation = (
    <View style={cellStyle}>
      <AnnotationDockButton
        compact={isLandscape}
        songLoaded={songLoaded}
        atMarker={canAnnotate}
        hasAnnotation={hasAnnotation}
        onPress={canAnnotate ? onAnnotate : () => onToast('Add a marker first')}
      />
    </View>
  );
  const speed = (
    <View style={cellStyle}>
      <PlaybackSpeedControl compact={isLandscape} value={playbackSpeed} onSelect={onPlaybackSpeedChange} />
    </View>
  );
  const firstTrack = reserved('first-track-control', 'First track', 'First track is in development', <BeatNoteIcon name="first" size={20} color={colors.textSecondary} />);
  const previousTrack = reserved('previous-track-control', 'Previous track', 'Previous track is in development', <BeatNoteIcon testID="previous-track-icon" name="previous" size={20} color={colors.textSecondary} />);
  const nextTrack = reserved('next-track-control', 'Next track', 'Next track is in development', <BeatNoteIcon testID="next-track-icon" name="next" size={20} color={colors.textSecondary} />);
  const shuffle = reserved('shuffle-control', 'Shuffle', 'Shuffle is in development', <BeatNoteIcon name="shuffle" size={20} color={colors.textSecondary} />);

  if (isLandscape) {
    return (
      <View testID="control-dock" style={[styles.root, styles.landscapeRoot]}>
        <View style={styles.landscapeGrid}>
          <View style={styles.landscapeRow}>{marker('previous')}{marker('next')}</View>
          <View style={styles.landscapeRow}>{marker('add')}{marker('removePrevious')}</View>
          <View style={styles.landscapeRow}>{innerLoop}{annotation}</View>
          <View style={styles.landscapePlayBlock}><PlayPauseControl onTogglePlayback={onTogglePlayback} /></View>
          <View style={styles.landscapeRow}>{repeat}{speed}</View>
          <View style={styles.landscapeRow}>{firstTrack}{shuffle}</View>
          <View style={styles.landscapeRow}>{previousTrack}{nextTrack}</View>
        </View>
        <PlaybackTimeProbe />
      </View>
    );
  }

  return (
    <View testID="control-dock" style={styles.root}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {marker('previous')}
          {marker('add')}
          {marker('next')}
          <Spacer /><Spacer />
          {repeat}{innerLoop}{shuffle}
        </View>
        <View style={styles.row}>
          {firstTrack}{previousTrack}{nextTrack}
          <Spacer /><Spacer />
          {annotation}
          {speed}
          {marker('removePrevious')}
        </View>
        <View style={styles.playBlock}>
          <PlayPauseControl onTogglePlayback={onTogglePlayback} />
        </View>
      </View>
      <PlaybackTimeProbe />
    </View>
  );
};

export default React.memo(ControlDock);
