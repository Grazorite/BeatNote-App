import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { exportModalStyles as styles } from '../../../styles/components/modals/exportModal';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onSuccess }) => {
  const { importFromCSV } = useStudioStore();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets[0]) {
        const csvContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await importFromCSV(csvContent);
        
        onSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import CSV data'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Import Data
          </Text>
          
          <Text style={styles.subtitle}>
            Select a CSV file to import markers and annotations
          </Text>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.importButton,
              isImporting && styles.disabledButton
            ]}
            onPress={handleImport}
            disabled={isImporting}
          >
            <Text style={styles.buttonText}>
              {isImporting ? 'Importing...' : 'Select CSV File'}
            </Text>
            <Text style={styles.buttonSubtext}>
              Merge with existing markers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isImporting}
          >
            <Text style={styles.buttonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ImportModal;
