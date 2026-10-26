import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Platform, ScrollView } from 'react-native';
import { exportProjectCsv, exportProjectPdf } from '../../../features/library/projectService';
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
  const [pdfOptions, setPdfOptions] = useState({
    includeHeader: true,
    includeTimeline: true,
    includeMarkerList: true,
    includeCountGrid: true,
    includeNotes: true,
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const outcome = format === 'csv'
        ? await exportProjectCsv(projectId)
        : await exportProjectPdf(projectId, pdfOptions);
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
      const formatLabel = format.toUpperCase();
      const message = Platform.OS === 'ios'
        ? (result.shared
          ? `${formatLabel} file "${result.filename}" was exported and opened in the share sheet.`
          : `${formatLabel} file "${result.filename}" was saved locally at:\n${result.uri}`)
        : format === 'pdf'
          ? 'The choreography sheet opened in a print window. Choose “Save as PDF” to download it.'
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
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            Export Project
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
            onPress={() => { void handleExport('csv'); }}
            disabled={isExporting}
            testID="export-csv"
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Export CSV
            </Text>
            <Text style={[styles.buttonSubtext, styles.primaryButtonSubtext]}>
              Includes timestamps, bar:beat and phrase:count timing, and annotations
            </Text>
          </TouchableOpacity>

          <View style={styles.pdfOptions} testID="pdf-export-options">
            <Text style={styles.optionsTitle}>PDF choreography sheet</Text>
            {([
              ['includeHeader', 'Project header'],
              ['includeTimeline', 'Song timeline'],
              ['includeMarkerList', 'Marker list'],
              ['includeCountGrid', 'Phrase/count grid'],
              ['includeNotes', 'Annotation notes'],
            ] as const).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={styles.optionRow}
                onPress={() => setPdfOptions(current => ({ ...current, [key]: !current[key] }))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: pdfOptions[key] }}
                aria-checked={pdfOptions[key]}
                testID={`pdf-option-${key}`}
              >
                <View style={[styles.checkbox, pdfOptions[key] && styles.checkboxChecked]}>
                  <Text style={styles.checkmark}>{pdfOptions[key] ? '✓' : ''}</Text>
                </View>
                <Text style={styles.optionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.pdfButton,
              isExporting && styles.disabledButton,
            ]}
            onPress={() => { void handleExport('pdf'); }}
            disabled={isExporting}
            testID="export-pdf"
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Export PDF</Text>
            <Text style={[styles.buttonSubtext, styles.primaryButtonSubtext]}>
              Print-ready choreography sheet with your selected sections
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ExportModal;
