import React, { useCallback, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { confirmDialogStyles as styles } from '../../../styles/components/modals/confirmDialog';
import GlassBackdrop from '../controls/GlassBackdrop';

export interface ConfirmDialogAction {
  label: string;
  onPress: () => void;
  testID?: string;
  destructive?: boolean;
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmDialogAction[];
  onCancel: () => void;
  returnFocusRef?: React.RefObject<unknown>;
  testID?: string;
}

const focusAccessibilityNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  if (typeof (node as { focus?: () => void } | null)?.focus === 'function') {
    (node as { focus: () => void }).focus();
  }
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  actions,
  onCancel,
  returnFocusRef,
  testID = 'confirm-dialog',
}) => {
  const titleRef = useRef<Text>(null);
  const close = useCallback(() => {
    onCancel();
    requestAnimationFrame(() => focusAccessibilityNode(returnFocusRef?.current));
  }, [onCancel, returnFocusRef]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      onShow={() => focusAccessibilityNode(titleRef.current)}
      accessibilityViewIsModal
    >
      <View style={styles.overlay} testID={testID}>
        <View style={styles.container}>
          <GlassBackdrop gradientId={`${testID}-glass`} radius={16} testID={`${testID}-glass`} />
          <Text ref={titleRef} style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {actions.map(action => (
              <TouchableOpacity
                key={action.label}
                style={[styles.button, action.destructive && styles.destructiveButton]}
                onPress={action.onPress}
                testID={action.testID}
              >
                <Text style={[
                  styles.buttonText,
                  styles.primaryButtonText,
                  action.destructive && styles.destructiveButtonText,
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={close}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;
