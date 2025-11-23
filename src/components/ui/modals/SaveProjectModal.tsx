import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { saveProjectModalStyles as styles } from '../../../styles/components/modals/saveProjectModal';

interface SaveProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [projectName, setProjectName] = useState('');

  const handleSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim());
      setProjectName('');
    }
  };

  const handleClose = () => {
    setProjectName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Save Project
          </Text>
          
          <TextInput
            style={styles.textInput}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Enter project name"
            placeholderTextColor="#888888"
            autoFocus
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                !projectName.trim() && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={!projectName.trim()}
            >
              <Text style={styles.buttonText}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SaveProjectModal;