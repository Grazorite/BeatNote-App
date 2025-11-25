import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectControlsStyles as styles } from '../../../styles/components/controls/projectControls';
import { Upload, Save, FolderOpen, Download, AudioLines } from 'lucide-react-native';
import ProjectManagerModal from '../modals/ProjectManagerModal';
import SaveProjectModal from '../modals/SaveProjectModal';
import ExportModal from '../modals/ExportModal';
import ImportModal from '../modals/ImportModal';

interface ProjectControlsProps {
  onLoadSong: () => void;
  onTogglePlayback: () => void;
  hasSound: boolean;
  audioUri: string | null;
  audioFilename: string | null;
}

const ProjectControls: React.FC<ProjectControlsProps> = ({
  onLoadSong,
  onTogglePlayback,
  hasSound,
  audioUri,
  audioFilename,
}) => {
  const { isPlaying, songLoaded, saveProject, loadProject, layers } = useStudioStore();
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleSaveProject = useCallback(async (projectName: string) => {
    if (!audioUri || !audioFilename) {
      Alert.alert('Error', 'No audio file loaded');
      return;
    }
    
    try {
      await saveProject(projectName, audioUri, audioFilename);
      setShowSaveModal(false);
      Alert.alert('Success', 'Project saved successfully!\nAccess it via "Load Project"');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save project');
    }
  }, [audioUri, audioFilename, saveProject]);

  const handleLoadProject = useCallback(async (filename: string) => {
    try {
      await loadProject(filename);
      Alert.alert('Success', 'Project loaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [loadProject]);

  const handleImportSuccess = useCallback(() => {
    setShowImportModal(false);
    Alert.alert('Import Successful', 'CSV data has been imported and merged with existing markers.');
  }, []);

  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={[styles.button, songLoaded && styles.buttonLoaded]} 
        onPress={onLoadSong}
      >
        <AudioLines size={20} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>
          {songLoaded ? 'Song Loaded' : 'Load Song'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, !songLoaded && styles.buttonDisabled]} 
        onPress={songLoaded ? () => setShowSaveModal(true) : undefined}
        disabled={!songLoaded}
      >
        <Save size={20} color={songLoaded ? "#ffffff" : "#666666"} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Save Project</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, !songLoaded && styles.buttonDisabled]} 
        onPress={songLoaded ? () => setShowProjectManager(true) : undefined}
        disabled={!songLoaded}
      >
        <FolderOpen size={20} color={songLoaded ? "#ffffff" : "#666666"} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Load Project</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, (!songLoaded || layers.every(l => l.markers.length === 0)) && styles.buttonDisabled]} 
        onPress={songLoaded && layers.some(l => l.markers.length > 0) ? () => setShowExportModal(true) : undefined}
        disabled={!songLoaded || layers.every(l => l.markers.length === 0)}
      >
        <Download size={20} color={songLoaded && layers.some(l => l.markers.length > 0) ? "#ffffff" : "#666666"} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Export Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, !songLoaded && styles.buttonDisabled]} 
        onPress={songLoaded ? () => setShowImportModal(true) : undefined}
        disabled={!songLoaded}
      >
        <Upload size={20} color={songLoaded ? "#ffffff" : "#666666"} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Import Data</Text>
      </TouchableOpacity>

      <SaveProjectModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProject}
      />

      <ProjectManagerModal
        visible={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        onLoadProject={handleLoadProject}
      />
      
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectName={audioFilename || 'Untitled'}
      />
      
      <ImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </View>
  );
};

export default ProjectControls;