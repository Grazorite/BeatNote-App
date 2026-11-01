import React from 'react';
import { AccessibilityActionEvent, Text, TouchableOpacity, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  type SeekButtonBehaviour,
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
    value: 'tapSeekHoldTrack',
    label: 'Tap seeks',
    detail: 'Hold changes to the previous or next track.',
  },
  {
    value: 'tapTrackHoldSeek',
    label: 'Tap changes track',
    detail: 'Hold seeks backward or forward.',
  },
];

const ButtonConfigurationScreen: React.FC<ButtonConfigurationScreenProps> = ({ onBack }) => {
  const advancedSpeed = useProductCapability('playback.advancedSpeed');
  const preferences = useSettingsPreferences();
  const adjustSeekDistance = (delta: -0.5 | 0.5): void => {
    const seekDurationSeconds = Math.max(
      0.5,
      Math.min(30, Math.round((preferences.seekDurationSeconds + delta) * 2) / 2),
    );
    void updateSettingsPreferences({ seekDurationSeconds });
  };
  const onSeekDistanceAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment') adjustSeekDistance(0.5);
    if (event.nativeEvent.actionName === 'decrement') adjustSeekDistance(-0.5);
  };
  return (
    <SettingsSubpage title="Buttons" onBack={onBack} testID="button-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Previous & Next</Text>
        <Text style={styles.hint}>
          In Tap Seeks mode, a small −/+ seconds label below each track icon shows its distance.
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
        <Text style={styles.hint}>Adjust from 0.5 to 30 seconds in 0.5-second steps.</Text>
        <View
          style={styles.seekStepper}
          testID="seek-duration-stepper"
        >
          <TouchableOpacity
            style={styles.seekStepperButton}
            onPress={() => adjustSeekDistance(-0.5)}
            disabled={preferences.seekDurationSeconds <= 0.5}
            accessibilityRole="button"
            accessibilityLabel="Decrease seek distance by 0.5 seconds"
            accessibilityState={{ disabled: preferences.seekDurationSeconds <= 0.5 }}
            testID="seek-duration-decrement"
          >
            <Text style={styles.seekStepperButtonText}>−</Text>
          </TouchableOpacity>
          <View
            style={styles.seekStepperValue}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Seek distance"
            accessibilityValue={{
              min: 0.5,
              max: 30,
              now: preferences.seekDurationSeconds,
              text: `${preferences.seekDurationSeconds} seconds`,
            }}
            accessibilityActions={[
              { name: 'decrement', label: 'Decrease seek distance' },
              { name: 'increment', label: 'Increase seek distance' },
            ]}
            onAccessibilityAction={onSeekDistanceAccessibilityAction}
            testID="seek-duration-adjuster"
          >
            <Text style={styles.seekStepperValueText} testID="seek-duration-value">
              {preferences.seekDurationSeconds}s
            </Text>
          </View>
          <TouchableOpacity
            style={styles.seekStepperButton}
            onPress={() => adjustSeekDistance(0.5)}
            disabled={preferences.seekDurationSeconds >= 30}
            accessibilityRole="button"
            accessibilityLabel="Increase seek distance by 0.5 seconds"
            accessibilityState={{ disabled: preferences.seekDurationSeconds >= 30 }}
            testID="seek-duration-increment"
          >
            <Text style={styles.seekStepperButtonText}>+</Text>
          </TouchableOpacity>
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
