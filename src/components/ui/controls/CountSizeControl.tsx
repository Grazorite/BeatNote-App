import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { countSizeControlStyles as styles } from '../../../styles/components/controls/countSizeControl';
import type { DanceCountSize } from '../../../utils/danceCount';

const COUNT_SIZES: DanceCountSize[] = [4, 6, 8];

const CountSizeControl: React.FC = () => {
  const countSize = useStudioStore(state => state.countSize);
  const setCountSize = useStudioStore(state => state.setCountSize);

  return (
    <View style={styles.container} testID="settings-count-size">
      <Text style={styles.label}>Dance phrase</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {COUNT_SIZES.map(size => {
          const selected = countSize === size;
          return (
            <TouchableOpacity
              key={size}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setCountSize(size)}
              accessibilityRole="radio"
              accessibilityLabel={`${size}-count phrase`}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              testID={`count-size-${size}`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {size}-count
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        Controls snapping, exports, and visible phrase lines when dance counts are shown
      </Text>
    </View>
  );
};

export default CountSizeControl;
