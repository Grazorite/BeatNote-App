import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { markerOptionsToggleStyles as styles } from '../../../styles/components/controls/markerOptionsToggle';

const DataButtons: React.FC = () => {
  const { setShowExportModal, setShowImportModal } = useStudioStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Data Management
      </Text>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: '#0066cc', padding: 12, borderRadius: 8, marginBottom: 8 }]}
        onPress={() => setShowExportModal(true)}
      >
        <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
          Export Data
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: '#00cc66', padding: 12, borderRadius: 8 }]}
        onPress={() => setShowImportModal(true)}
      >
        <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
          Import Data
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DataButtons;