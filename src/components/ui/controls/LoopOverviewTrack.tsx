import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { generateWaveformPath, useWaveformData } from '../../../hooks/useWaveformData';
import { colors } from '../../../styles/common';
import { loopOverviewTrackStyles as styles } from '../../../styles/components/controls/loopOverviewTrack';
import { msToOverviewX, overviewPlayheadX } from '../../../utils/loopRange';

interface LoopOverviewTrackProps {
  audioUri: string | null;
  width: number;
}

/** Render full-song timing content, visible markers, and the live playhead. */
const LoopOverviewTrack: React.FC<LoopOverviewTrackProps> = ({ audioUri, width }) => {
  const currentTime = useStudioStore(state => state.currentTime);
  const songDuration = useStudioStore(state => state.songDuration);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const layers = useStudioStore(state => state.allLayersData);
  const { waveformData } = useWaveformData(audioUri);
  const drawable = songLoaded && Number.isFinite(songDuration) && songDuration > 0 && width > 0;
  const playheadX = overviewPlayheadX(currentTime, songDuration, width);
  const waveformPath = useMemo(() => {
    if (!drawable || waveformData?.source !== 'decoded' || waveformData.peaks.length === 0) return '';
    return generateWaveformPath(
      waveformData.peaks,
      width,
      34,
      0,
      songDuration,
      waveformData.duration,
    );
  }, [drawable, songDuration, waveformData?.duration, waveformData?.peaks, waveformData?.source, width]);

  return (
    <View testID="loop-overview-track" style={styles.track} pointerEvents="none">
      <Svg width={Math.max(0, width)} height={34}>
        <Rect x={0} y={0} width={Math.max(0, width)} height={34} fill={colors.loopTrack} />
        {waveformPath ? (
          <Path d={waveformPath} stroke={colors.success} strokeWidth={1} fill="none" opacity={0.7} />
        ) : (
          <Rect x={0} y={15} width={Math.max(0, width)} height={4} fill={colors.border} />
        )}
        {drawable && layers.flatMap(layer => layer.isVisible
          ? layer.markers.filter(marker => Number.isFinite(marker) && marker >= 0 && marker <= songDuration)
              .map((marker, index) => (
                <Line
                  key={`${layer.id}-${marker}-${index}`}
                  x1={msToOverviewX(marker, songDuration, width)}
                  x2={msToOverviewX(marker, songDuration, width)}
                  y1={7}
                  y2={27}
                  stroke={colors.marker}
                  strokeWidth={3}
                />
              ))
          : [])}
        {drawable && (
          <Line
            x1={playheadX}
            x2={playheadX}
            y1={1}
            y2={33}
            stroke={colors.loopPlayhead}
            strokeWidth={2}
            testID="loop-overview-playhead"
          />
        )}
      </Svg>
    </View>
  );
};

export default React.memo(LoopOverviewTrack);
