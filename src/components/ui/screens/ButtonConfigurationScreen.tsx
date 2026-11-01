import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  type SeekButtonBehaviour,
  type SeekDurationSeconds,
  updateSettingsPreferences,
  useSettingsPreferences,
} from '../../../features/settings/preferences';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface ButtonConfigurationScreenProps {
  onBack: () => void;
}

const SEEK_BEHAVIOURS: ReadonlyArray<{
  value: SeekButtonBehaviour;
  label: string;
  detail: string;
}> = [
  {
    value: 'tapTrackHoldSeek',
    label: 'Tap changes track',
    detail: 'Hold seeks backward or forward.',
  },
  {
    value: 'tapSeekHoldTrack',
    label: 'Tap seeks',
    detail: 'Hold changes to the previous or next track.',
  },
];

const SEEK_DURATIONS: ReadonlyArray<SeekDurationSeconds> = [
  0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 15, 20, 25, 30,
];

const ButtonConfigurationScreen: React.FC<ButtonConfigurationScreenProps> = ({ onBack }) => {
  const advancedSpeed = useProductCapability('playback.advancedSpeed');
  const preferences = useSettingsPreferences();
  return (
    <SettingsSubpage title="Buttons" onBack={onBack} testID="button-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Previous & Next</Text>
        <Text style={styles.hint}>
          The small −/+ seconds label on each track button shows its seek distance.
        </Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {SEEK_BEHAVIOURS.map(option => {
            const selected = preferences.seekButtonBehaviour === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, styles.optionWithDetail, selected && styles.optionSelected]}
                onPress={() => {
                  void updateSettingsPreferences({ seekButtonBehaviour: option.value });
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                aria-checked={selected}
                testID={`seek-behaviour-${option.value}`}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionText}>{option.label}</Text>
                  <Text style={styles.optionDetail}>{option.detail}</Text>
                </View>
                {selected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Seek Distance</Text>
        <View style={styles.durationGrid} accessibilityRole="radiogroup">
          {SEEK_DURATIONS.map(duration => {
            const selected = preferences.seekDurationSeconds === duration;
            return (
              <TouchableOpacity
                key={duration}
                style={[styles.durationOption, selected && styles.optionSelected]}
                onPress={() => {
                  void updateSettingsPreferences({ seekDurationSeconds: duration });
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${duration} seconds`}
                accessibilityState={{ selected }}
                aria-checked={selected}
                testID={`seek-duration-${duration}`}
              >
                <Text style={styles.optionText}>{duration}s</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Playback Speed</Text>
        <SettingsInfoRow
          label="Built-in Speed Presets"
          detail="Available in Lite and Pro with pitch preservation."
          testID="speed-presets-included"
        />
        <SettingsInfoRow
          label="Fine Slider and +/− Controls"
          detail={advancedSpeed ? 'Pro · Available in the playback speed chooser.' : 'Pro required.'}
          disabled={!advancedSpeed}
          testID="fine-speed-status"
        />
        <SettingsInfoRow
          label="Custom Range, Count, and Presets"
          detail="Planned for Pro · Includes long-press preset editing."
          disabled
          testID="custom-speed-placeholder"
        />
      </View>
    </SettingsSubpage>
  );
};

export default ButtonConfigurationScreen;
