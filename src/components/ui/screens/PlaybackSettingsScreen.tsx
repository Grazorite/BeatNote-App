import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  type KeepScreenOnMode,
  updateSettingsPreferences,
  useSettingsPreferences,
} from '../../../features/settings/preferences';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import ModernToggle from '../common/ModernToggle';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface PlaybackSettingsScreenProps {
  onBack: () => void;
}

const KEEP_SCREEN_OPTIONS: ReadonlyArray<{ value: KeepScreenOnMode; label: string }> = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'always', label: 'Always while using BeatNote' },
  { value: 'whilePlaying', label: 'While Playing Only' },
];

const PlaybackSettingsScreen: React.FC<PlaybackSettingsScreenProps> = ({ onBack }) => {
  const preferences = useSettingsPreferences();
  const continuousAvailable = useProductCapability('playback.continuous');

  return (
    <SettingsSubpage title="Playback" onBack={onBack} testID="playback-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Queue</Text>
        <View style={styles.card}>
          <ModernToggle
            label="Continuous Play"
            value={continuousAvailable && preferences.continuousPlay}
            disabled={!continuousAvailable}
            onValueChange={continuousPlay => {
              void updateSettingsPreferences({ continuousPlay });
            }}
            accessibilityHint={continuousAvailable
              ? 'Automatically starts the next song in the queue.'
              : 'Pro required.'}
            testID="continuous-play-toggle"
          />
          <Text style={styles.hint} testID="continuous-play-detail">
            {continuousAvailable
              ? 'Pro · Automatically starts the next song in the current queue.'
              : 'Pro required · Lite stops when the current song ends.'}
          </Text>
        </View>
        <SettingsInfoRow
          label="Pause on Headset Disconnect"
          detail="Lite · Planned. BeatNote does not yet observe audio-route changes reliably."
          disabled
          testID="pause-headset-placeholder"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Keep Screen On</Text>
        <Text style={styles.hint}>Lite · Choose when BeatNote prevents the display from sleeping.</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {KEEP_SCREEN_OPTIONS.map(option => {
            const selected = preferences.keepScreenOn === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => { void updateSettingsPreferences({ keepScreenOn: option.value }); }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                aria-checked={selected}
                testID={`keep-screen-on-${option.value}`}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SettingsSubpage>
  );
};

export default PlaybackSettingsScreen;
