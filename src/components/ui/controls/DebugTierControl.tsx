import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { setDebugTier } from '../../../features/entitlements/capabilityService';
import { useProductTier } from '../../../features/entitlements/useProductTier';
import { danceCountVisibilityControlStyles as styles } from '../../../styles/components/controls/danceCountVisibilityControl';
import ModernToggle from '../common/ModernToggle';
import ConfirmDialog from '../modals/ConfirmDialog';

const DEBUG_PRO_PASSWORD = 'bananas';

/**
 * Debug-only switch between the Lite and Pro tiers, used to exercise capability gates before
 * purchases exist. Remove when the V2 purchase provider ships.
 */
const DebugTierControl: React.FC = () => {
  const tier = useProductTier();
  const isPro = tier === 'pro';
  const [showProUnlock, setShowProUnlock] = useState(false);

  const requestTierChange = (enabled: boolean): void => {
    if (!enabled) {
      void setDebugTier('lite');
      return;
    }
    setShowProUnlock(true);
  };

  const unlockPro = (): void => {
    setShowProUnlock(false);
    void setDebugTier('pro');
  };

  return (
    <>
      <View style={styles.container} testID="settings-debug-tier">
        <ModernToggle
          label="Pro features"
          value={isPro}
          onValueChange={requestTierChange}
          accessibilityHint="Debug only. Disabling selects Lite. Enabling Pro requires the debug password."
          testID="debug-tier-toggle"
        />
        <Text style={styles.hint}>
          Debug only. Currently {isPro ? 'Pro' : 'Lite'}. Enabling Pro requires the debug password.
        </Text>
      </View>
      <ConfirmDialog
        visible={showProUnlock}
        title="Enable Pro features"
        message="Enter the debug password to switch this installation to the Pro feature set."
        confirmationText={DEBUG_PRO_PASSWORD}
        confirmationPrompt="Password"
        secureConfirmation
        actions={[{
          label: 'Enable Pro',
          onPress: unlockPro,
          testID: 'confirm-enable-debug-pro',
        }]}
        onCancel={() => setShowProUnlock(false)}
        testID="debug-pro-password-dialog"
      />
    </>
  );
};

export default DebugTierControl;
