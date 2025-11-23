import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, dimensions } from '../../../styles/common';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, title, message, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: dimensions.borderRadius,
    padding: dimensions.spacing.lg,
    margin: dimensions.spacing.lg,
    minWidth: 280,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: dimensions.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.lg,
    paddingVertical: dimensions.spacing.sm,
    borderRadius: dimensions.borderRadius,
    alignSelf: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ErrorModal;