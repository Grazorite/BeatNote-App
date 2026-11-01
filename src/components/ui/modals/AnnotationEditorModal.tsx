import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { SelectedMarker } from '../../../hooks/useStudioStore';
import { annotationEditorModalStyles as styles } from '../../../styles/components/modals/annotationEditorModal';
import { colors } from '../../../styles/common';
import BeatNoteIcon from '../../icons/BeatNoteIcon';
import GlassBackdrop from '../controls/GlassBackdrop';
import AnnotationSuggestionChips from '../controls/AnnotationSuggestionChips';
import AppModal from '../common/AppModal';

interface AnnotationEditorModalProps {
  visible: boolean;
  marker: SelectedMarker | null;
  initialText: string;
  onCancel: () => void;
  onSave: (text: string) => void;
  onDismiss?: () => void;
}

const formatMarkerTime = (timestamp: number): string => {
  const totalSeconds = Math.max(0, timestamp) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');
  return `${minutes}:${seconds}`;
};

/** Edit one marker annotation as an explicit draft that commits only on Save. */
const AnnotationEditorModal: React.FC<AnnotationEditorModalProps> = ({
  visible,
  marker,
  initialText,
  onCancel,
  onSave,
  onDismiss,
}) => {
  const [draft, setDraft] = useState(initialText);
  const { width, height } = useWindowDimensions();
  const isLandscapePhone = Math.min(width, height) < 768 && width > height;

  useEffect(() => {
    if (visible) setDraft(initialText);
  }, [initialText, visible]);

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onDismiss={onDismiss}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? (isLandscapePhone ? 'height' : 'padding') : 'height'}
        style={[styles.overlay, isLandscapePhone && styles.overlayLandscape]}
      >
        <View
          style={[styles.container, isLandscapePhone && styles.containerLandscape]}
          testID="annotation-editor"
        >
          <GlassBackdrop gradientId="annotation-editor-glass" radius={16} testID="annotation-editor-glass" />
          <View style={styles.titleRow}>
            {isLandscapePhone && <View style={styles.titleActionSpacer} />}
            <Text style={styles.title}>{initialText.trim() ? 'Edit Annotation' : 'Add Annotation'}</Text>
            {isLandscapePhone && (
              <TouchableOpacity
                style={styles.keyboardDoneButton}
                onPress={Keyboard.dismiss}
                accessibilityRole="button"
                accessibilityLabel="Hide keyboard"
                testID="annotation-keyboard-done"
              >
                <Text style={styles.keyboardDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
          {marker && (
            <Text style={[styles.timestamp, isLandscapePhone && styles.timestampLandscape]}>
              Marker at {formatMarkerTime(marker.timestamp)}
            </Text>
          )}
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              key={`${marker?.layerId ?? 'none'}-${marker?.timestamp ?? 0}`}
              autoFocus
              multiline
              maxLength={500}
              value={draft}
              onChangeText={setDraft}
              placeholder="Enter movement cue or note"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, isLandscapePhone && styles.inputLandscape]}
              textAlignVertical="top"
              blurOnSubmit={false}
              testID="annotation-editor-input"
            />
            <AnnotationSuggestionChips value={draft} onChange={setDraft} maxLength={500} />
            <View style={styles.draftMeta}>
              {draft.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setDraft('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear annotation text"
                  accessibilityHint="Clears the draft. Save to remove the annotation from this marker."
                  testID="clear-annotation-text"
                >
                  <BeatNoteIcon name="clear" size={15} color={colors.textSecondary} />
                  <Text style={styles.clearButtonText}>Clear text</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.count}>{draft.length}/500</Text>
            </View>
          </ScrollView>
          <View style={[styles.actions, isLandscapePhone && styles.actionsLandscape]}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => onSave(draft)} testID="save-annotation">
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
};

export default AnnotationEditorModal;
