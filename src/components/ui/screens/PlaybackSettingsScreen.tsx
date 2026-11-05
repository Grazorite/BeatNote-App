import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  type KeepScreenOnMode,
  REMOTE_SEEK_SECONDS,
  updateSettingsPreferences,
  useSettingsPreferences,
} from '../../../features/settings/preferences';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import ModernToggle from '../common/ModernToggle';
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
  const remoteAvailable = useProductCapability('playback.remoteControls');
  const continuousAvailable = useProductCapability('playback.continuous');

  return (
    <SettingsSubpage title="Playback Settings" onBack={onBack} testID="playback-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Queue</Text>
        <View style={styles.settingWithCaption}>
          <ModernToggle
            label="Continuous Play"
            value={continuousAvailable && preferences.continuousPlay}
            disabled={!continuousAvailable}
            onValueChange={continuousPlay => {
              void updateSettingsPreferences({ continuousPlay });
            }}
            accessibilityHint={continuousAvailable
              ? 'Automatically starts the next song in the queue.'
              : 'Pro only'}
            testID="continuous-play-toggle"
          />
          <Text style={styles.hint} testID="continuous-play-detail">
            {continuousAvailable
              ? 'Play the next song when this one ends.'
              : 'Pro only'}
          </Text>
        </View>
        <View style={styles.settingWithCaption}>
          <ModernToggle
            label="Pause on Headset Disconnect"
            value={preferences.pauseOnHeadsetDisconnect}
            onValueChange={pauseOnHeadsetDisconnect => {
              void updateSettingsPreferences({ pauseOnHeadsetDisconnect });
            }}
            accessibilityHint="Pause when headphones or another audio output disconnect."
            testID="pause-headset-toggle"
          />
          <Text style={styles.hint}>
            Pause when headphones disconnect so the song won’t play through the speaker.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Control Centre</Text>
        <Text style={styles.hint}>{remoteAvailable ? 'Choose what the Lock Screen and Control Centre buttons do.' : 'Pro only'}</Text>
        <View style={[styles.segmentedOptions, !remoteAvailable && styles.disabled]} accessibilityRole="radiogroup">
          {(['seek', 'tracks'] as const).map(mode => {
            const selected = preferences.remoteButtonMode === mode;
            return <TouchableOpacity key={mode} accessibilityRole="radio" aria-checked={selected} disabled={!remoteAvailable}
              accessibilityState={{ selected, disabled: !remoteAvailable }}
              onPress={() => { void updateSettingsPreferences({ remoteButtonMode: mode }); }}
              style={[styles.segmentedOption, selected && styles.segmentedOptionSelected]}>
              <Text style={styles.optionText}>{mode === 'seek' ? 'Skip seconds' : 'Change songs'}</Text>
            </TouchableOpacity>;
          })}
        </View>
        {preferences.remoteButtonMode === 'seek' && (
          <View style={[styles.segmentedOptions, !remoteAvailable && styles.disabled]} accessibilityRole="radiogroup">
            {REMOTE_SEEK_SECONDS.map(seconds => {
              const selected = preferences.remoteSeekSeconds === seconds;
              return <TouchableOpacity key={seconds} accessibilityRole="radio" aria-checked={selected} accessibilityLabel={`${seconds} seconds`}
                disabled={!remoteAvailable} accessibilityState={{ selected, disabled: !remoteAvailable }}
                onPress={() => { void updateSettingsPreferences({ remoteSeekSeconds: seconds }); }}
                style={[styles.segmentedOption, selected && styles.segmentedOptionSelected]}>
                <Text style={styles.optionText}>{seconds}s</Text>
              </TouchableOpacity>;
            })}
          </View>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Keep Screen On</Text>
        <Text style={styles.hint}>Choose when the screen stays awake.</Text>
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
