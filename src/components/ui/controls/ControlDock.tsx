import React from 'react';
import { View } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { controlDockStyles as styles } from '../../../styles/components/controls/controlDock';
import type { DockToastAction } from '../../../hooks/useDockToast';
import AnnotationDockButton from './AnnotationDockButton';
import InnerLoopControl from './InnerLoopControl';
import MarkerDockButton from './MarkerDockButton';
import PlaybackSpeedControl from './PlaybackSpeedControl';
import PlaybackTimeProbe from './PlaybackTimeProbe';
import PlayPauseControl from './PlayPauseControl';
import RepeatControl from './RepeatControl';
import QueueTrackButton from './QueueTrackButton';

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
  const queueControl = (action: 'first' | 'previous' | 'next' | 'shuffle') => (
    <View style={cellStyle}><QueueTrackButton compact={isLandscape} action={action} /></View>
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
    <View style={[cellStyle, styles.popupCell]}>
      <PlaybackSpeedControl compact={isLandscape} value={playbackSpeed} onSelect={onPlaybackSpeedChange} />
    </View>
  );
  const firstTrack = queueControl('first');
  const previousTrack = queueControl('previous');
  const nextTrack = queueControl('next');
  const shuffle = queueControl('shuffle');

  if (isLandscape) {
    return (
      <View testID="control-dock" style={[styles.root, styles.landscapeRoot]}>
        <View style={styles.landscapeGrid}>
          <View style={styles.landscapeRow}>{marker('previous')}{marker('next')}</View>
          <View style={styles.landscapeRow}>{marker('add')}{marker('removePrevious')}</View>
          <View style={styles.landscapeRow}>{innerLoop}{annotation}</View>
          <View style={styles.landscapePlayBlock}><PlayPauseControl onTogglePlayback={onTogglePlayback} /></View>
          <View style={[styles.landscapeRow, styles.popupRow]} pointerEvents="box-none">{repeat}{speed}</View>
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
        <View style={[styles.row, styles.popupRow]} pointerEvents="box-none">
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
