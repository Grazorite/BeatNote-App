import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { exportProjectCsv } from '../../../features/library/projectService';
import { exportModalStyles as styles } from '../../../styles/components/modals/exportModal';
import GlassBackdrop from '../controls/GlassBackdrop';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string | 'current';
  markerCount: number;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  projectName,
  projectId,
  markerCount,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const outcome = await exportProjectCsv(projectId);
      if (outcome.kind !== 'exported') {
        const message = outcome.kind === 'failed'
          ? outcome.reason
          : outcome.kind === 'notFound'
            ? 'This project is no longer available.'
            : 'Choose music before exporting the current draft.';
        throw new Error(message);
      }
      const result = outcome.result;

      const title = 'Export Successful';
      const message = Platform.OS === 'ios'
        ? (result.shared
          ? `CSV file "${result.filename}" was exported and opened in the share sheet.`
          : `CSV file "${result.filename}" was saved locally at:\n${result.uri}`)
        : `CSV file "${result.filename}" has been downloaded to your Downloads folder.`;
      
      Alert.alert(
        title,
        message,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Failed to export data'
      );
    } finally {
      setIsExporting(false);
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
          <GlassBackdrop gradientId="export-modal-glass" radius={16} testID="export-modal-glass" />
          <Text style={styles.title}>
            Export CSV
          </Text>
          
          <Text style={styles.subtitle}>
            {markerCount} marker{markerCount === 1 ? '' : 's'} ready to export
          </Text>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.csvButton,
              isExporting && styles.disabledButton
            ]}
            onPress={handleExport}
            disabled={isExporting}
            testID="export-csv"
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Export CSV
            </Text>
            <Text style={[styles.buttonSubtext, styles.primaryButtonSubtext]}>
              Includes timestamps, BPM-derived bar:beat timing, and annotations
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isExporting}
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

export default ExportModal;
