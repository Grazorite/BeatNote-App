import React from 'react';
import { Text, View } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { rowGutterStyles as styles } from '../../../styles/components/waveform/rowGutter';
import { danceCountAtTime } from '../../../utils/danceCount';

interface RowGutterProps {
  startMs: number;
  width: number;
  testID?: string;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const RowGutter: React.FC<RowGutterProps> = ({
  startMs,
  width,
  testID,
}) => {
  const startTime = formatTime(startMs);
  const bpm = useStudioStore(state => state.bpm);
  const countSize = useStudioStore(state => state.countSize);
  const countLabel = danceCountAtTime(startMs, bpm, countSize).absoluteCount;

  return (
    <View
      style={[styles.container, { width }]}
      accessibilityLabel={`Row starts at ${startTime}, dance count ${countLabel}`}
      testID={testID}
    >
      <Text
        style={styles.time}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        numberOfLines={1}
      >
        {startTime}
      </Text>
      <Text style={styles.count} numberOfLines={1} testID={testID ? `${testID}-count` : undefined}>
        {countLabel}
      </Text>
    </View>
  );
};

export default React.memo(RowGutter);
