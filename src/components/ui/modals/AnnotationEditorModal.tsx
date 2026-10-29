import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container} testID="annotation-editor">
          <GlassBackdrop gradientId="annotation-editor-glass" radius={16} testID="annotation-editor-glass" />
          <Text style={styles.title}>{initialText.trim() ? 'Edit Annotation' : 'Add Annotation'}</Text>
          {marker && (
            <Text style={styles.timestamp}>Marker at {formatMarkerTime(marker.timestamp)}</Text>
          )}
          <TextInput
            key={`${marker?.layerId ?? 'none'}-${marker?.timestamp ?? 0}`}
            autoFocus
            multiline
            maxLength={500}
            value={draft}
            onChangeText={setDraft}
            placeholder="Enter movement cue or note"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
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
          <View style={styles.actions}>
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
