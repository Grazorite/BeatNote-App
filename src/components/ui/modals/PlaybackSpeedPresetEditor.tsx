import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { playbackSpeedPresetEditorStyles as styles } from '../../../styles/components/modals/playbackSpeedPresetEditor';
import { colors } from '../../../styles/common';
import {
  formatSpeedLabel,
  normalizePlaybackSpeed,
  type PlaybackSpeedBounds,
} from '../../../utils/playbackSpeed';
import AppModal from '../common/AppModal';
import GlassBackdrop from '../controls/GlassBackdrop';

interface PlaybackSpeedPresetEditorProps {
  visible: boolean;
  value: number;
  defaultValue: number;
  bounds: PlaybackSpeedBounds;
  onClose: () => void;
  onSave: (value: number) => void;
  onUseDefault: () => void;
}

/** Edits or clears one Pro playback-speed preset. */
const PlaybackSpeedPresetEditor: React.FC<PlaybackSpeedPresetEditorProps> = ({
  visible,
  value,
  defaultValue,
  bounds,
  onClose,
  onSave,
  onUseDefault,
}) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (visible) setDraft(String(value));
  }, [value, visible]);

  const parsed = Number.parseFloat(draft.replace(',', '.'));
  const valid = Number.isFinite(parsed) && parsed >= bounds.min && parsed <= bounds.max;
  const save = (): void => {
    if (!valid) return;
    Keyboard.dismiss();
    onSave(normalizePlaybackSpeed(parsed, bounds));
  };

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay} testID="speed-preset-editor">
        <View style={styles.container}>
          <GlassBackdrop gradientId="speed-preset-editor-glass" radius={16} />
          <Text style={styles.title}>Preset Speed</Text>
          <Text style={styles.hint}>
            Enter {formatSpeedLabel(bounds.min)} to {formatSpeedLabel(bounds.max)} in 0.05× steps.
          </Text>
          <TextInput
            style={[styles.input, !valid && styles.inputError]}
            value={draft}
            onChangeText={setDraft}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            autoFocus
            maxLength={4}
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Custom playback speed"
            testID="speed-preset-input"
            onSubmitEditing={save}
          />
          {!valid && (
            <Text style={styles.error}>Enter a speed within the range shown.</Text>
          )}
          <TouchableOpacity
            style={styles.defaultAction}
            onPress={onUseDefault}
            accessibilityRole="button"
            accessibilityLabel={`Use default preset ${formatSpeedLabel(defaultValue)}`}
            testID="speed-preset-use-default"
          >
            <Text style={styles.defaultActionText}>Use Default ({formatSpeedLabel(defaultValue)})</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              accessibilityRole="button"
              testID="speed-preset-cancel"
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, !valid && styles.disabled]}
              onPress={save}
              disabled={!valid}
              accessibilityRole="button"
              accessibilityState={{ disabled: !valid }}
              testID="speed-preset-save"
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppModal>
  );
};

export default PlaybackSpeedPresetEditor;
