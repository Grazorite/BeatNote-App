import React from 'react';
import { Text, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { overviewTimeStyles as styles } from '../../../styles/components/controls/overviewTime';

const wholeSeconds = (milliseconds: number): number => (
  Number.isFinite(milliseconds) ? Math.floor(Math.max(0, milliseconds) / 1000) : 0
);

const timestamp = (seconds: number): string => (
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
);

/** Subscribe at second boundaries without rerendering the interactive overview track. */
const OverviewTime: React.FC = () => {
  const elapsed = useStudioStore(state => wholeSeconds(Math.min(state.currentTime, state.songDuration)));
  const duration = useStudioStore(state => wholeSeconds(state.songDuration));
  const total = timestamp(duration);

  return (
    <View style={styles.container} pointerEvents="none">
      <Text
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
        numberOfLines={1}
        maxFontSizeMultiplier={1.4}
        style={[styles.text, styles.reservation]}
      >
        {total} / {total}
      </Text>
      <View style={styles.value}>
        <Text
          testID="overview-playback-time"
          accessibilityLabel={`Elapsed ${timestamp(elapsed)} of ${total}`}
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
          style={styles.text}
        >
          {timestamp(elapsed)} / {total}
        </Text>
      </View>
    </View>
  );
};

export default OverviewTime;
