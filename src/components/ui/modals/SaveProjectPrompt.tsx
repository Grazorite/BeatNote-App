import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../styles/common';
import { saveProjectPromptStyles as styles } from '../../../styles/components/modals/saveProjectPrompt';
import { validateProjectName } from '../../../utils/projectNames';
import GlassBackdrop from '../controls/GlassBackdrop';
import AppModal from '../common/AppModal';

interface SaveProjectPromptProps {
  visible: boolean;
  initialName: string;
  title?: string;
  confirmLabel?: string;
  duplicateSuggestion?: string | null;
  onClose: () => void;
  onConfirm: (projectName: string) => void | Promise<void>;
  returnFocusRef?: React.RefObject<unknown>;
}

const focusAccessibilityNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  if (typeof (node as { focus?: () => void } | null)?.focus === 'function') {
    (node as { focus: () => void }).focus();
  }
};

const SaveProjectPrompt: React.FC<SaveProjectPromptProps> = ({
  visible,
  initialName,
  title = 'Save as New Project',
  confirmLabel = 'Save',
  duplicateSuggestion = null,
  onClose,
  onConfirm,
  returnFocusRef,
}) => {
  const titleRef = useRef<Text>(null);
  const [projectName, setProjectName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const validation = validateProjectName(projectName);

  useEffect(() => {
    if (visible) setProjectName(initialName);
  }, [initialName, visible]);

  const close = useCallback(() => {
    if (submitting) return;
    onClose();
    requestAnimationFrame(() => focusAccessibilityNode(returnFocusRef?.current));
  }, [onClose, returnFocusRef, submitting]);

  const confirm = useCallback(async () => {
    if (!validation.valid || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(validation.value);
    } finally {
      setSubmitting(false);
    }
  }, [onConfirm, submitting, validation]);

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      onShow={() => focusAccessibilityNode(titleRef.current)}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <GlassBackdrop
            gradientId="save-project-prompt-glass"
            radius={16}
            testID="save-project-modal-glass"
          />
          <Text ref={titleRef} style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <TextInput
            style={[styles.textInput, !validation.valid && styles.textInputError]}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Enter project name"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Project name"
            testID="save-project-name"
          />
          {!validation.valid && (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {validation.error}
            </Text>
          )}
          {duplicateSuggestion !== null && (
            <View style={styles.duplicateNotice} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>
                A project with this name already exists for this song
              </Text>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setProjectName(duplicateSuggestion)}
                testID="use-project-name-suggestion"
              >
                <Text style={styles.suggestionText}>Use “{duplicateSuggestion}”</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={close}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!validation.valid || submitting) && styles.disabledButton,
              ]}
              onPress={confirm}
              disabled={!validation.valid || submitting}
              accessibilityState={{ disabled: !validation.valid || submitting }}
              testID="confirm-save-project"
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {submitting ? 'Saving…' : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppModal>
  );
};

export default SaveProjectPrompt;
