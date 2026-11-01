import React from 'react';
import { Text, View } from 'react-native';

import { liteAdPlaceholderStyles as styles } from '../../../styles/components/ads/liteAdPlaceholder';

/**
 * V1 layout reservation for the Lite ad placement. The future ad provider replaces only the
 * creative frame; the surrounding layout and Pro removal behaviour remain stable.
 */
const LiteAdPlaceholder: React.FC<{ safeAreaBottom?: number }> = ({ safeAreaBottom = 0 }) => (
  <View
    style={[styles.slot, safeAreaBottom > 0 && { paddingBottom: safeAreaBottom }]}
    testID="lite-ad-space"
    accessible
    accessibilityRole="text"
    accessibilityLabel="Advertisement space"
  >
    <View style={styles.creative}>
      <Text style={styles.label}>Ad space</Text>
    </View>
  </View>
);

export default React.memo(LiteAdPlaceholder);
