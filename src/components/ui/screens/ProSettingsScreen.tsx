import React from 'react';
import { Text, View } from 'react-native';

import { useProductTier } from '../../../features/entitlements/useProductTier';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface ProSettingsScreenProps { onBack: () => void; }

const FEATURES = [
  'Continuous playback',
  'Fine and custom speed controls',
  'BPM and tempo tools',
  'Multiple and custom annotation layers',
  'Ad removal',
  'PDF and MIDI export',
  'Future Apple Music integration, subject to feasibility',
] as const;

const ProSettingsScreen: React.FC<ProSettingsScreenProps> = ({ onBack }) => {
  const tier = useProductTier();
  return (
    <SettingsSubpage title="BeatNote Pro" onBack={onBack} testID="pro-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preview</Text>
        <SettingsInfoRow label="Current Preview Tier" detail={tier === 'pro' ? 'Pro' : 'Lite'} />
        <View style={styles.card}>
          <Text style={styles.price}>S$3.98 monthly</Text>
          <Text style={styles.price}>S$19.98 yearly</Text>
          <Text style={styles.hint}>Includes a seven-day trial on the annual subscription.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.price}>S$49.98 founders lifetime</Text>
          <Text style={styles.hint}>
            Limited beta-supporter option. A later public lifetime price may be S$79.98 or more.
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pro Features</Text>
        {FEATURES.map(feature => (
          <SettingsInfoRow key={feature} label={feature} detail="Pro" />
        ))}
        <Text style={styles.hint}>
          Stem separation is not included in this preview and is not currently available.
        </Text>
      </View>
      <View style={styles.section}>
        <SettingsInfoRow
          label="Restore Purchases"
          detail="Unavailable until StoreKit is implemented."
          disabled
          testID="restore-purchases-placeholder"
        />
      </View>
    </SettingsSubpage>
  );
};

export default ProSettingsScreen;
