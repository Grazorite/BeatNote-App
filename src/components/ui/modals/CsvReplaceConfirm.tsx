import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { csvReplaceConfirmStyles as styles } from '../../../styles/components/modals/csvReplaceConfirm';
import type { CsvImportPreview } from '../../../types/csvImport';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import GlassBackdrop from '../controls/GlassBackdrop';

interface CsvReplaceConfirmProps {
  visible: boolean;
  preview: CsvImportPreview | null;
  projectName?: string | null;
  onCancel: () => void;
  onReplace: () => void | Promise<void>;
  returnFocusRef?: React.RefObject<unknown>;
}

const focusAccessibilityNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  if (typeof (node as { focus?: () => void } | null)?.focus === 'function') {
    (node as { focus: () => void }).focus();
  }
};

const countLabel = (count: number, singular: string, plural = `${singular}s`): string => (
  `${count} ${count === 1 ? singular : plural}`
);

const CsvReplaceConfirm: React.FC<CsvReplaceConfirmProps> = ({
  visible,
  preview,
  projectName = null,
  onCancel,
  onReplace,
  returnFocusRef,
}) => {
  const titleRef = useRef<Text>(null);
  const [replacing, setReplacing] = useState(false);
  const replaceDisabled = preview === null || preview.importedMarkerCount === 0 || replacing;
  const webTitleProps = Platform.OS === 'web' ? { tabIndex: -1 as const } : {};

  useEffect(() => {
    if (!visible) setReplacing(false);
  }, [visible]);

  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => focusAccessibilityNode(returnFocusRef?.current));
  }, [returnFocusRef]);

  const cancel = useCallback(() => {
    if (replacing) return;
    onCancel();
    restoreFocus();
  }, [onCancel, replacing, restoreFocus]);

  const replace = useCallback(async () => {
    if (replaceDisabled) return;
    setReplacing(true);
    try {
      await onReplace();
      restoreFocus();
    } finally {
      setReplacing(false);
    }
  }, [onReplace, replaceDisabled, restoreFocus]);

  if (preview === null) return null;

  const targetName = projectName?.trim() || 'Unsaved draft';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
      onShow={() => focusAccessibilityNode(titleRef.current)}
      accessibilityViewIsModal
    >
      <View style={styles.overlay} testID="csv-replace-confirm">
        <View style={styles.container}>
          <GlassBackdrop
            gradientId="csv-replace-confirm-glass"
            radius={16}
            testID="csv-replace-confirm-glass"
          />
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              ref={titleRef}
              style={styles.title}
              accessibilityRole="header"
              maxFontSizeMultiplier={MAX_TEXT_SCALE}
              {...webTitleProps}
            >
              Replace markers in “{targetName}”?
            </Text>

            <View style={styles.counts}>
              <Text
                style={styles.countText}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
                testID="csv-existing-counts"
              >
                Existing: {countLabel(preview.existingMarkerCount, 'marker')},{' '}
                {countLabel(preview.existingAnnotationCount, 'annotation')}
              </Text>
              <Text
                style={styles.countText}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
                testID="csv-imported-counts"
              >
                Imported: {countLabel(preview.importedMarkerCount, 'marker')},{' '}
                {countLabel(preview.importedAnnotationCount, 'annotation')}
              </Text>
              <Text
                style={styles.countText}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
                testID="csv-skipped-count"
              >
                Skipped: {countLabel(preview.skippedRows, 'row')}
              </Text>
            </View>

            {preview.beyondDurationCount > 0 && (
              <Text
                style={styles.warningText}
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
                testID="csv-beyond-duration-count"
              >
                {preview.beyondDurationCount} markers are past the end of this song
              </Text>
            )}

            {preview.importedMarkerCount === 0 && (
              <Text
                style={styles.warningText}
                accessibilityLiveRegion="polite"
                maxFontSizeMultiplier={MAX_TEXT_SCALE}
                testID="csv-no-markers"
              >
                No markers were found
              </Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancel}
                disabled={replacing}
                accessibilityRole="button"
                accessibilityLabel="Cancel CSV import"
                accessibilityState={{ disabled: replacing }}
                testID="csv-replace-cancel"
              >
                <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.replaceButton, replaceDisabled && styles.disabledButton]}
                onPress={() => { void replace(); }}
                disabled={replaceDisabled}
                accessibilityRole="button"
                accessibilityLabel="Replace markers"
                accessibilityState={{ disabled: replaceDisabled }}
                testID="csv-replace-apply"
              >
                <Text
                  style={[styles.buttonText, styles.replaceButtonText]}
                  maxFontSizeMultiplier={MAX_TEXT_SCALE}
                >
                  {replacing ? 'Replacing…' : 'Replace'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CsvReplaceConfirm;
