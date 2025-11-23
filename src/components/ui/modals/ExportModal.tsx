import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { ExportEngine } from '../../../utils/exportEngine';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { exportModalStyles as styles } from '../../../styles/components/modals/exportModal';

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
  const { layers, bpm, songDuration } = useStudioStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'midi' | 'csv') => {
    setIsExporting(true);
    try {
      const filename = format === 'midi' 
        ? await ExportEngine.exportToMIDI({ format, layers, bpm, songDuration, projectName })
        : await ExportEngine.exportToCSV({ format, layers, bpm, songDuration, projectName });
      
      Alert.alert(
        'Export Successful', 
        `${format.toUpperCase()} file "${filename}" has been downloaded to your Downloads folder.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export markers');
    } finally {
      setIsExporting(false);
    }
  };

  const visibleLayers = layers.filter(layer => layer.isVisible);
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
          <Text style={styles.title}>
            Export Markers
          </Text>
          
          <Text style={styles.subtitle}>
            {totalMarkers} markers from {visibleLayers.length} layers
          </Text>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.midiButton,
              isExporting && styles.disabledButton
            ]}
            onPress={() => handleExport('midi')}
            disabled={isExporting}
          >
            <Text style={styles.buttonText}>
              Export as MIDI
            </Text>
            <Text style={styles.buttonSubtext}>
              For Logic Pro, Ableton, Pro Tools
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.csvButton,
              isExporting && styles.disabledButton
            ]}
            onPress={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Text style={styles.buttonText}>
              Export as CSV
            </Text>
            <Text style={styles.buttonSubtext}>
              For Excel, Adobe Audition
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