import React from 'react';
import { Text, View } from 'react-native';

import { setDebugTier } from '../../../features/entitlements/capabilityService';
import { useProductTier } from '../../../features/entitlements/useProductTier';
import { danceCountVisibilityControlStyles as styles } from '../../../styles/components/controls/danceCountVisibilityControl';
import ModernToggle from '../common/ModernToggle';

/**
 * Debug-only switch between the Lite and Pro tiers, used to exercise capability gates before
 * purchases exist. Remove when the V2 purchase provider ships.
 */
const DebugTierControl: React.FC = () => {
  const tier = useProductTier();
  const isPro = tier === 'pro';

  return (
    <View style={styles.container} testID="settings-debug-tier">
      <ModernToggle
        label="Pro features"
        value={isPro}
        onToggle={() => { void setDebugTier(isPro ? 'lite' : 'pro'); }}
        accessibilityHint="Debug only. Switches between the Lite and Pro feature sets."
        testID="debug-tier-toggle"
      />
      <Text style={styles.hint}>
        Debug only. Currently {isPro ? 'Pro' : 'Lite'}. Used to test feature gating before purchases exist.
      </Text>
    </View>
  );
};

export default DebugTierControl;
