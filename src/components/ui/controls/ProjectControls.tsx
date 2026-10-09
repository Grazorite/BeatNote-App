import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectControlsStyles as styles } from '../../../styles/components/controls/projectControls';
import { Upload, Save, FolderOpen, Download, AudioLines, Menu } from 'lucide-react-native';
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
  onLoadProjectAudio: (uri: string, filename: string) => void;
  isMobile?: boolean;
}

const ProjectControls: React.FC<ProjectControlsProps> = ({
  onLoadSong,
  onTogglePlayback,
  hasSound,
  audioUri,
  audioFilename,
  onLoadProjectAudio,
  isMobile = false,
}) => {
  const { songLoaded, saveProject, loadProject, layers, toggleSidebar } = useStudioStore();
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
      const audio = await loadProject(filename);
      onLoadProjectAudio(audio.audioUri, audio.audioFilename);
      Alert.alert('Success', 'Project loaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [loadProject, onLoadProjectAudio]);

  const handleImportSuccess = useCallback(() => {
    setShowImportModal(false);
    Alert.alert('Import Successful', 'CSV data has been imported and merged with existing markers.');
  }, []);

  const actions = (
    <>
      {isMobile && (
        <TouchableOpacity
          style={[styles.button, styles.buttonMobile, styles.sidebarToggleMobile]}
          onPress={toggleSidebar}
          accessibilityLabel="Open settings sidebar"
          testID="sidebar-open-toggle"
        >
          <Menu size={18} color="#ffffff" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, songLoaded && styles.buttonLoaded]}
        onPress={onLoadSong}
        accessibilityLabel={songLoaded ? 'Song Loaded' : 'Load Song'}
        testID="load-song"
      >
        <AudioLines size={20} color="#ffffff" style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>{songLoaded ? 'Song Loaded' : 'Load Song'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, !songLoaded && styles.buttonDisabled]}
        onPress={songLoaded ? () => {
          Keyboard.dismiss();
          setShowSaveModal(true);
        } : undefined}
        disabled={!songLoaded}
        accessibilityLabel="Save Project"
        testID="save-project"
      >
        <Save size={20} color={songLoaded ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Save Project</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile]}
        onPress={() => setShowProjectManager(true)}
        accessibilityLabel="Load Project"
        testID="load-project"
      >
        <FolderOpen size={20} color="#ffffff" style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Load Project</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, (!songLoaded || layers.every(l => l.markers.length === 0)) && styles.buttonDisabled]}
        onPress={songLoaded && layers.some(l => l.markers.length > 0) ? () => setShowExportModal(true) : undefined}
        disabled={!songLoaded || layers.every(l => l.markers.length === 0)}
        accessibilityLabel="Export Data"
        testID="export-data"
      >
        <Download size={20} color={songLoaded && layers.some(l => l.markers.length > 0) ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Export Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, !songLoaded && styles.buttonDisabled]}
        onPress={songLoaded ? () => setShowImportModal(true) : undefined}
        disabled={!songLoaded}
        accessibilityLabel="Import Data"
        testID="import-data"
      >
        <Upload size={20} color={songLoaded ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Import Data</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={isMobile ? styles.controlsMobile : styles.controls}>
      {isMobile ? (
        <View style={styles.mobileActions} testID="project-actions-scroll">{actions}</View>
      ) : actions}

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
