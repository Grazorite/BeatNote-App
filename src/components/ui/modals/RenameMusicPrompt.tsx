import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { renameMusicPromptStyles as styles } from '../../../styles/components/modals/renameMusicPrompt';
import { colors } from '../../../styles/common';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { normalizeDisplayTitle } from '../../../utils/projectNames';
import GlassBackdrop from '../controls/GlassBackdrop';

export interface RenameMusicPromptProps {
  visible: boolean;
  initialTitle: string;
  onClose: () => void;
  onConfirm: (title: string) => Promise<string | null>;
}

const focusNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  (node as { focus?: () => void } | null)?.focus?.();
};

const RenameMusicPrompt: React.FC<RenameMusicPromptProps> = ({
  visible,
  initialTitle,
  onClose,
  onConfirm,
}) => {
  const titleRef = useRef<Text>(null);
  const [value, setValue] = useState(initialTitle);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const normalized = normalizeDisplayTitle(value);
  const validationError = normalized === null ? 'Enter a song name' : null;
  const error = validationError ?? submitError;

  useEffect(() => {
    if (!visible) return;
    setValue(initialTitle);
    setSubmitting(false);
    setSubmitError(null);
  }, [initialTitle, visible]);

  const close = useCallback(() => {
    if (!submitting) onClose();
  }, [onClose, submitting]);

  const confirm = useCallback(async () => {
    if (normalized === null || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const nextError = await onConfirm(normalized);
    if (nextError === null) return;
    setSubmitError(nextError);
    setSubmitting(false);
  }, [normalized, onConfirm, submitting]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      onShow={() => focusNode(titleRef.current)}
      accessibilityViewIsModal
    >
      <View style={styles.overlay} testID="rename-music-prompt">
        <View style={styles.container}>
          <GlassBackdrop gradientId="rename-music-prompt-glass" radius={16} />
          <Text
            ref={titleRef}
            style={styles.title}
            accessibilityRole="header"
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
          >
            Rename Song
          </Text>
          <TextInput
            style={[
              styles.input,
              error !== null && styles.inputError,
              focused === 'input' && styles.focused,
            ]}
            value={value}
            onChangeText={text => {
              setValue(text);
              setSubmitError(null);
            }}
            onFocus={() => setFocused('input')}
            onBlur={() => setFocused(value => value === 'input' ? null : value)}
            selectTextOnFocus
            placeholder="Song name"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Song name"
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
            testID="rename-music-title"
          />
          {error !== null && (
            <Text
              style={styles.error}
              accessibilityLiveRegion="polite"
              maxFontSizeMultiplier={MAX_TEXT_SCALE}
              testID="rename-music-error"
            >
              {error}
            </Text>
          )}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancel,
                focused === 'cancel' && styles.focused,
              ]}
              onPress={close}
              onFocus={() => setFocused('cancel')}
              onBlur={() => setFocused(value => value === 'cancel' ? null : value)}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Cancel renaming song"
              accessibilityState={{ disabled: submitting }}
              testID="rename-music-cancel"
            >
              <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.save,
                focused === 'save' && styles.focused,
                (normalized === null || submitting) && styles.disabled,
              ]}
              onPress={() => { void confirm(); }}
              onFocus={() => setFocused('save')}
              onBlur={() => setFocused(value => value === 'save' ? null : value)}
              disabled={normalized === null || submitting}
              accessibilityRole="button"
              accessibilityLabel="Save song name"
              accessibilityState={{ disabled: normalized === null || submitting }}
              testID="rename-music-save"
            >
              <Text
                style={[styles.buttonText, styles.saveText]}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
              >
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RenameMusicPrompt;
