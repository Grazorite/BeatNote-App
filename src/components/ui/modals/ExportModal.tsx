import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { ExportEngine } from '../../../utils/exportEngine';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { exportModalStyles as styles } from '../../../styles/components/modals/exportModal';
import GlassBackdrop from '../controls/GlassBackdrop';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  projectName,
}) => {
  const { allLayersData, bpm, songDuration } = useStudioStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await ExportEngine.exportToCSV({
        format: 'csv',
        layers: allLayersData,
        bpm,
        songDuration,
        projectName,
      });

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

  const visibleLayers = allLayersData.filter(layer => layer.isVisible);
  const totalMarkers = visibleLayers.reduce((sum, layer) => sum + layer.markers.length, 0);

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
            {totalMarkers} marker{totalMarkers === 1 ? '' : 's'} ready to export
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
            <Text style={styles.buttonText}>
              Export CSV
            </Text>
            <Text style={styles.buttonSubtext}>
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
