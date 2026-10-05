import React from 'react';
import { Text, View } from 'react-native';
import { rowGutterStyles as styles } from '../../../styles/components/waveform/rowGutter';

interface RowGutterProps {
  startMs: number;
  phraseNumber?: number;
  countLabel?: string;
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
  phraseNumber,
  countLabel,
  width,
  testID,
}) => {
  const hasPhraseLabel = phraseNumber !== undefined && countLabel !== undefined;
  const startTime = formatTime(startMs);

  return (
    <View
      style={[styles.container, { width }]}
      accessibilityLabel={`Row starts at ${startTime}`}
      testID={testID}
    >
      <Text style={styles.time}>{startTime}</Text>
      {hasPhraseLabel && (
        <>
          <Text style={styles.phrase}>Phrase {phraseNumber}</Text>
          <Text style={styles.count}>Count {countLabel}</Text>
        </>
      )}
    </View>
  );
};

export default React.memo(RowGutter);
