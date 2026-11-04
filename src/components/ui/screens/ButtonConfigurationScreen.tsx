import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityActionEvent, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  type SeekButtonBehaviour,
  updateSettingsPreferences,
  useSettingsPreferences,
} from '../../../features/settings/preferences';
import { useAcceleratingPress } from '../../../hooks/useAcceleratingPress';
import { colors } from '../../../styles/common';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import {
  type PlaybackSpeedPresetCount,
} from '../../../utils/playbackSpeed';
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
    detail: 'Hold to change songs.',
  },
  {
    value: 'tapTrackHoldSeek',
    label: 'Tap changes track',
    detail: 'Hold to skip back or ahead.',
  },
];

const ButtonConfigurationScreen: React.FC<ButtonConfigurationScreenProps> = ({ onBack }) => {
  const advancedSpeed = useProductCapability('playback.advancedSpeed');
  const preferences = useSettingsPreferences();
  const [seekDraft, setSeekDraft] = useState(String(preferences.seekDurationSeconds));
  const [seekEditing, setSeekEditing] = useState(false);
  const seekDraftRef = useRef(seekDraft);

  useEffect(() => {
    if (!seekEditing) {
      const nextDraft = String(preferences.seekDurationSeconds);
      seekDraftRef.current = nextDraft;
      setSeekDraft(nextDraft);
    }
  }, [preferences.seekDurationSeconds, seekEditing]);

  const adjustSeekDistance = (delta: -0.5 | 0.5): void => {
    const seekDurationSeconds = Math.max(
      0.5,
      Math.min(30, Math.round((preferences.seekDurationSeconds + delta) * 2) / 2),
    );
    void updateSettingsPreferences({ seekDurationSeconds });
  };
  const commitSeekDistance = (submittedText?: string): void => {
    const rawValue = submittedText ?? seekDraftRef.current;
    const parsed = Number.parseFloat(rawValue.replace(',', '.'));
    const seekDurationSeconds = Number.isFinite(parsed)
      ? Math.max(0.5, Math.min(30, Math.round(parsed * 2) / 2))
      : preferences.seekDurationSeconds;
    setSeekEditing(false);
    setSeekDraft(String(seekDurationSeconds));
    void updateSettingsPreferences({ seekDurationSeconds });
  };
  const onSeekDistanceAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment') adjustSeekDistance(0.5);
    if (event.nativeEvent.actionName === 'decrement') adjustSeekDistance(-0.5);
  };
  const decrementDisabled = preferences.seekDurationSeconds <= 0.5;
  const incrementDisabled = preferences.seekDurationSeconds >= 30;
  const decrementSeek = useAcceleratingPress(
    () => adjustSeekDistance(-0.5),
    decrementDisabled,
  );
  const incrementSeek = useAcceleratingPress(
    () => adjustSeekDistance(0.5),
    incrementDisabled,
  );

  const setPresetCount = (playbackSpeedPresetCount: PlaybackSpeedPresetCount): void => {
    if (advancedSpeed) void updateSettingsPreferences({ playbackSpeedPresetCount });
  };
  return (
    <SettingsSubpage title="Buttons" onBack={onBack} testID="button-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Previous & Next</Text>
        <Text style={styles.hint}>
          In Tap Seeks mode, the number below each button shows how far it skips.
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
            {...decrementSeek}
            disabled={decrementDisabled}
            accessibilityRole="button"
            accessibilityLabel="Decrease seek distance by 0.5 seconds"
            accessibilityHint="Press and hold to accelerate"
            accessibilityState={{ disabled: decrementDisabled }}
            testID="seek-duration-decrement"
          >
            <Text style={styles.seekStepperButtonText}>−</Text>
          </TouchableOpacity>
          <View
            style={styles.seekStepperValue}
            testID="seek-duration-adjuster"
          >
            <TextInput
              style={styles.seekStepperValueInput}
              value={seekDraft}
              onChangeText={text => {
                seekDraftRef.current = text;
                setSeekDraft(text);
              }}
              onFocus={() => {
                setSeekEditing(true);
              }}
              onBlur={() => commitSeekDistance()}
              onSubmitEditing={event => commitSeekDistance(event.nativeEvent.text)}
              keyboardType="decimal-pad"
              returnKeyType="done"
              selectTextOnFocus
              maxLength={4}
              placeholderTextColor={colors.textSecondary}
              accessibilityRole="adjustable"
              accessibilityLabel="Seek distance in seconds"
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
              testID="seek-duration-value"
            />
            <Text style={styles.seekStepperValueSuffix}>s</Text>
          </View>
          <TouchableOpacity
            style={styles.seekStepperButton}
            {...incrementSeek}
            disabled={incrementDisabled}
            accessibilityRole="button"
            accessibilityLabel="Increase seek distance by 0.5 seconds"
            accessibilityHint="Press and hold to accelerate"
            accessibilityState={{ disabled: incrementDisabled }}
            testID="seek-duration-increment"
          >
            <Text style={styles.seekStepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.section, !advancedSpeed && styles.disabled]} testID="speed-count-settings">
        <Text style={styles.sectionLabel}>Preset Speed Buttons</Text>
        {!advancedSpeed && <Text style={styles.proOnlyNote}>Pro only</Text>}
        <View style={styles.segmentedOptions} accessibilityRole="radiogroup">
          {([4, 8, 12] as const).map(count => {
            const selected = preferences.playbackSpeedPresetCount === count;
            return (
              <TouchableOpacity
                key={count}
                style={[styles.segmentedOption, selected && styles.segmentedOptionSelected]}
                onPress={() => setPresetCount(count)}
                disabled={!advancedSpeed}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: !advancedSpeed }}
                aria-checked={selected}
                testID={`speed-preset-count-${count}`}
              >
                <Text style={styles.optionText}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Hold a speed preset to edit it. Tap Use Default to reset it.
        </Text>
      </View>
    </SettingsSubpage>
  );
};

export default ButtonConfigurationScreen;
