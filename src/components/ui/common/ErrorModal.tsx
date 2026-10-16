import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import GlassBackdrop from '../controls/GlassBackdrop';
import { errorModalStyles as styles } from '../../../styles/components/common/errorModal';

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
          <GlassBackdrop gradientId="error-modal-glass" radius={16} testID="error-modal-glass" />
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

export default ErrorModal;
