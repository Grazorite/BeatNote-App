import React from 'react';
import { G, Path } from 'react-native-svg';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';

interface DanceGridLinesProps {
  startMs: number;
  durationMs: number;
  width: number;
  height: number;
  testID?: string;
}

/** Draw two dotted paths per viewport, keeping beat positions anchored across row boundaries. */
const DanceGridLines: React.FC<DanceGridLinesProps> = ({ startMs, durationMs, width, height, testID }) => {
  const bpm = useStudioStore(state => state.gridPreview?.bpm ?? state.bpm);
  const origin = useStudioStore(state => state.gridPreview
    ? state.gridPreview.phraseStartMs ?? state.gridPreview.beatAnchorMs
    : state.phraseStartMs ?? state.beatAnchorMs);
  const countSize = useStudioStore(state => state.countSize);
  const paths = React.useMemo(() => {
    const beats: string[] = [];
    const phrases: string[] = [];
    if (!(durationMs > 0 && width > 0 && bpm > 0 && Number.isFinite(bpm))) return { beats, phrases };
    const interval = 60000 / bpm;
    const spacing = interval * width / durationMs;
    // In a fitted whole-song view, keep phrase boundaries legible when individual beats would merge.
    const step = spacing >= 3 ? 1 : countSize * Math.max(1, Math.ceil(3 / (spacing * countSize)));
    const first = Math.ceil((startMs - origin) / (interval * step)) * step;
    const last = (startMs + durationMs - origin) / interval;
    for (let beat = first; beat < last; beat += step) {
      const x = ((origin + beat * interval - startMs) / durationMs) * width;
      (beat % countSize === 0 ? phrases : beats).push(`M${x.toFixed(2)},1v${height - 2}`);
    }
    return { beats, phrases };
  }, [startMs, durationMs, width, height, bpm, origin, countSize]);
  return (
    <G pointerEvents="none" testID={testID}>
      <Path d={paths.beats.join(' ')} fill="none" stroke={colors.gridMiddle} strokeWidth={1.25}
        strokeDasharray="1 4" strokeLinecap="round" opacity={0.8} />
      <Path d={paths.phrases.join(' ')} fill="none" stroke={colors.gridMajor} strokeWidth={2}
        strokeDasharray="1 3" strokeLinecap="round" />
    </G>
  );
};

export default React.memo(DanceGridLines);
