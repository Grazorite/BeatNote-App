import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';

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
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: '#333333',
          borderRadius: 12,
          padding: 24,
          width: '100%',
          maxWidth: 400,
        }}>
          <Text style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Save Project
          </Text>
          
          <TextInput
            style={{
              backgroundColor: '#222222',
              color: '#ffffff',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 16,
            }}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Enter project name"
            placeholderTextColor="#888888"
            autoFocus
          />
          
          <View style={{
            flexDirection: 'row',
            gap: 12,
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#666666',
                padding: 12,
                borderRadius: 8,
                flex: 1,
              }}
              onPress={handleClose}
            >
              <Text style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#ff6600',
                padding: 12,
                borderRadius: 8,
                flex: 1,
                opacity: projectName.trim() ? 1 : 0.5,
              }}
              onPress={handleSave}
              disabled={!projectName.trim()}
            >
              <Text style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
              }}>
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