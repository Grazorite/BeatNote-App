import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectControlsStyles as styles } from '../../../styles/components/controls/projectControls';
import { BeatNoteIcon } from '../../icons';
import type { ImportResult } from '../../../utils/importTypes';
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
  const {
    songLoaded,
    saveProject,
    loadProject,
    allLayersData,
    toggleSidebar,
    libraryStatus,
  } = useStudioStore(useShallow(state => ({
    songLoaded: state.songLoaded,
    saveProject: state.saveProject,
    loadProject: state.loadProject,
    allLayersData: state.allLayersData,
    toggleSidebar: state.toggleSidebar,
    libraryStatus: state.libraryStatus,
  })));
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const handleSaveProject = useCallback(async (projectName: string) => {
    if (libraryStatus !== 'ready') return;
    if (!audioUri || !audioFilename) {
      Alert.alert('Error', 'No audio file loaded');
      return;
    }
    
    try {
      await saveProject(projectName, audioUri, audioFilename);
      setShowSaveModal(false);
      Alert.alert('Project Saved', 'Your project is available in Projects.');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save project');
    }
  }, [audioUri, audioFilename, libraryStatus, saveProject]);

  const handleLoadProject = useCallback(async (filename: string) => {
    if (libraryStatus !== 'ready') return;
    try {
      const audio = await loadProject(filename);
      onLoadProjectAudio(audio.audioUri, audio.audioFilename);
      Alert.alert('Project Opened', 'Your saved project is ready.');
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [libraryStatus, loadProject, onLoadProjectAudio]);

  const handleImportSuccess = useCallback((result: ImportResult) => {
    setShowImportModal(false);
    const imported = `${result.importedMarkers} marker${result.importedMarkers === 1 ? '' : 's'} imported.`;
    const skipped = result.skippedRows > 0
      ? ` ${result.skippedRows} row${result.skippedRows === 1 ? '' : 's'} skipped.`
      : '';
    Alert.alert('CSV Imported', `${imported}${skipped}`);
  }, []);

  const visibleMarkerCount = allLayersData
    .filter(layer => layer.isVisible)
    .reduce((sum, layer) => sum + layer.markers.length, 0);
  const hasExportableMarkers = songLoaded && visibleMarkerCount > 0;
  const libraryLocked = libraryStatus !== 'ready';

  useEffect(() => {
    if (!libraryLocked) return;
    setShowProjectManager(false);
    setShowSaveModal(false);
    setShowImportModal(false);
  }, [libraryLocked]);

  const handleChooseAudio = useCallback(() => {
    if (libraryStatus !== 'ready') return;
    const hasAnnotations = allLayersData.some(layer =>
      layer.markers.length > 0 || layer.annotations.length > 0,
    );
    if (!songLoaded || !hasAnnotations) {
      onLoadSong();
      return;
    }
    Alert.alert(
      'Replace Audio?',
      'Existing markers and annotations will stay at their current timestamps.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose Audio', onPress: onLoadSong },
      ],
    );
  }, [allLayersData, libraryStatus, onLoadSong, songLoaded]);

  const actions = (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          isMobile && styles.buttonMobile,
          songLoaded && !libraryLocked && styles.buttonLoaded,
          libraryLocked && styles.buttonDisabled,
        ]}
        onPress={libraryLocked ? undefined : handleChooseAudio}
        disabled={libraryLocked}
        accessibilityLabel={songLoaded ? 'Replace Audio File' : 'Choose Audio File'}
        testID="load-song"
      >
        <BeatNoteIcon name="audio-file" size={20} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>{songLoaded ? 'Replace Audio' : 'Choose Audio'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, (!songLoaded || libraryLocked) && styles.buttonDisabled]}
        onPress={songLoaded && !libraryLocked ? () => {
          Keyboard.dismiss();
          setShowSaveModal(true);
        } : undefined}
        disabled={!songLoaded || libraryLocked}
        accessibilityLabel="Save Project"
        testID="save-project"
      >
        <BeatNoteIcon name="save" size={20} color={songLoaded && !libraryLocked ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Save Project</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, libraryLocked && styles.buttonDisabled]}
        onPress={libraryLocked ? undefined : () => setShowProjectManager(true)}
        disabled={libraryLocked}
        accessibilityLabel="Open Projects"
        testID="load-project"
      >
        <BeatNoteIcon name="projects" size={20} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Projects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, (!songLoaded || libraryLocked) && styles.buttonDisabled]}
        onPress={songLoaded && !libraryLocked ? () => setShowImportModal(true) : undefined}
        disabled={!songLoaded || libraryLocked}
        accessibilityLabel="Import CSV"
        testID="import-data"
      >
        <BeatNoteIcon name="import" size={20} color={songLoaded && !libraryLocked ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Import CSV</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, !hasExportableMarkers && styles.buttonDisabled]}
        onPress={hasExportableMarkers ? () => setShowExportModal(true) : undefined}
        disabled={!hasExportableMarkers}
        accessibilityLabel="Export CSV"
        testID="export-data"
      >
        <BeatNoteIcon name="export" size={20} color={hasExportableMarkers ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Export CSV</Text>
      </TouchableOpacity>

      {isMobile && (
        <TouchableOpacity
          style={[styles.button, styles.buttonMobile, styles.sidebarToggleMobile]}
          onPress={toggleSidebar}
          accessibilityLabel="Open settings"
          testID="sidebar-open-toggle"
        >
          <BeatNoteIcon name="settings" size={18} />
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={isMobile ? styles.controlsMobile : styles.controls}>
      {libraryStatus === 'migrating' && (
        <Text style={styles.libraryStatus} accessibilityLiveRegion="polite" testID="library-migration-status">
          Updating your library…
        </Text>
      )}
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
