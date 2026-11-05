import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { confirmDialogStyles as styles } from '../../../styles/components/modals/confirmDialog';
import GlassBackdrop from '../controls/GlassBackdrop';
import AppModal from '../common/AppModal';

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
  confirmationText?: string;
  confirmationPrompt?: string;
  secureConfirmation?: boolean;
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
  confirmationText,
  confirmationPrompt,
  secureConfirmation = false,
}) => {
  const titleRef = useRef<Text>(null);
  const [typedConfirmation, setTypedConfirmation] = useState('');
  useEffect(() => {
    if (!visible) setTypedConfirmation('');
  }, [visible]);
  const confirmationMatches = confirmationText === undefined || typedConfirmation === confirmationText;
  const close = useCallback(() => {
    onCancel();
    requestAnimationFrame(() => focusAccessibilityNode(returnFocusRef?.current));
  }, [onCancel, returnFocusRef]);

  return (
    <AppModal
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
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }}><Text style={styles.message}>{message}</Text></ScrollView>
          {confirmationText !== undefined && (
            <View style={styles.confirmationGroup}>
              <Text style={styles.confirmationPrompt}>
                {confirmationPrompt ?? (
                  <>Type <Text style={styles.confirmationPhrase}>{confirmationText}</Text> to continue.</>
                )}
              </Text>
              <TextInput
                value={typedConfirmation}
                onChangeText={setTypedConfirmation}
                autoCapitalize={confirmationText === confirmationText.toUpperCase() ? 'characters' : 'none'}
                autoCorrect={false}
                spellCheck={false}
                secureTextEntry={secureConfirmation}
                returnKeyType="done"
                style={styles.confirmationInput}
                accessibilityLabel={`Type ${confirmationText} to confirm`}
                testID={`${testID}-confirmation-input`}
              />
            </View>
          )}
          <View style={styles.actions}>
            {actions.map(action => (
              <TouchableOpacity
                key={action.label}
                style={[
                  styles.button,
                  action.destructive && styles.destructiveButton,
                  !confirmationMatches && styles.disabledButton,
                ]}
                onPress={action.onPress}
                disabled={!confirmationMatches}
                accessibilityState={{ disabled: !confirmationMatches }}
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
    </AppModal>
  );
};

export default ConfirmDialog;
