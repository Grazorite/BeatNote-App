import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectControlsStyles as styles } from '../../../styles/components/controls/projectControls';
import { BeatNoteIcon } from '../../icons';
import {
  openProject,
  openProjectWithAudioShim,
  saveAsNew,
  saveCurrent,
  type OpenResult,
  type SaveResult,
} from '../../../features/library/projectService';
import { resolveSource } from '../../../features/library/sourceResolver';
import type { ImportResult } from '../../../utils/importTypes';
import ProjectManagerModal from '../modals/ProjectManagerModal';
import ConfirmDialog from '../modals/ConfirmDialog';
import SaveProjectPrompt from '../modals/SaveProjectPrompt';
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
  isMobile = false,
}) => {
  const {
    songLoaded,
    allLayersData,
    toggleSidebar,
    libraryStatus,
    currentMusicItemId,
    libraryItems,
    draftBaseline,
    draftBaselineName,
    saveInProgress,
  } = useStudioStore(useShallow(state => ({
    songLoaded: state.songLoaded,
    allLayersData: state.allLayersData,
    toggleSidebar: state.toggleSidebar,
    libraryStatus: state.libraryStatus,
    currentMusicItemId: state.currentMusicItemId,
    libraryItems: state.libraryItems,
    draftBaseline: state.draftBaseline,
    draftBaselineName: state.draftBaselineName,
    saveInProgress: state.saveInProgress,
  })));
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptInitialName, setSavePromptInitialName] = useState('');
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<string | null>(null);
  const [showRevisionConflict, setShowRevisionConflict] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const saveButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const defaultProjectName = currentMusicItemId === null
    ? 'Untitled'
    : libraryItems[currentMusicItemId]?.displayTitle ?? 'Untitled';

  const openSavePrompt = useCallback((name: string) => {
    setSavePromptInitialName(name);
    setDuplicateSuggestion(null);
    setShowSavePrompt(true);
  }, []);

  const handleSaveResult = useCallback((result: SaveResult) => {
    switch (result.kind) {
      case 'saved':
        setShowSavePrompt(false);
        setShowRevisionConflict(false);
        setDuplicateSuggestion(null);
        break;
      case 'needsName':
        openSavePrompt(result.suggestedName);
        break;
      case 'nameConflict':
        setDuplicateSuggestion(result.suggestion);
        setShowSavePrompt(true);
        break;
      case 'revisionConflict':
        setShowRevisionConflict(true);
        break;
      case 'readOnly':
        openSavePrompt(`${draftBaselineName ?? defaultProjectName} copy`);
        break;
      default:
        break;
    }
  }, [defaultProjectName, draftBaselineName, openSavePrompt]);

  const handleSaveCurrent = useCallback(async () => {
    if (libraryStatus !== 'ready' || saveInProgress) return;
    if (draftBaseline === null) {
      openSavePrompt(defaultProjectName);
      return;
    }
    handleSaveResult(await saveCurrent());
  }, [defaultProjectName, draftBaseline, handleSaveResult, libraryStatus, openSavePrompt, saveInProgress]);

  const handleSaveAsNew = useCallback(async (projectName: string) => {
    if (libraryStatus !== 'ready' || saveInProgress) return;
    handleSaveResult(await saveAsNew(projectName));
  }, [handleSaveResult, libraryStatus, saveInProgress]);

  const reportOpenResult = useCallback((result: OpenResult): boolean => {
    if (result.kind === 'opened') return true;
    if (result.kind === 'needsGuard') {
      Alert.alert('Save changes before opening?', 'Use Save Project or discard your edits before opening another project.');
      return false;
    }
    if (result.kind === 'failed') {
      Alert.alert('Project Not Opened', result.reason);
      return false;
    }
    if (result.kind === 'notFound') {
      Alert.alert('Project Not Found', 'This project is no longer available.');
      return false;
    }
    if (result.kind === 'superseded') {
      Alert.alert('Project Not Opened', 'The current song changed while the project was opening.');
      return false;
    }
    return false;
  }, []);

  const handleLoadProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (libraryStatus !== 'ready') return false;
    try {
      const result = await openProject(projectId);
      if (result.kind !== 'needsSwitch') return reportOpenResult(result);

      const item = useStudioStore.getState().libraryItems[result.musicItemId];
      if (!item || item.removed || item.availability !== 'available') {
        Alert.alert('Audio Unavailable', 'Reconnect this project’s audio before opening it.');
        return false;
      }
      const source = await resolveSource(item);
      const switched = await openProjectWithAudioShim(projectId, {
        musicItemId: item.id,
        uri: source.uri,
        filename: item.originalFilename,
        durationMs: item.durationMs ?? 0,
      });
      return reportOpenResult(switched);
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
      return false;
    }
  }, [libraryStatus, reportOpenResult]);

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
    setShowSavePrompt(false);
    setShowRevisionConflict(false);
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
        ref={saveButtonRef}
        style={[styles.button, isMobile && styles.buttonMobile, (!songLoaded || libraryLocked || saveInProgress) && styles.buttonDisabled]}
        onPress={songLoaded && !libraryLocked && !saveInProgress ? () => {
          Keyboard.dismiss();
          void handleSaveCurrent();
        } : undefined}
        disabled={!songLoaded || libraryLocked || saveInProgress}
        accessibilityLabel="Save Project"
        accessibilityState={{ disabled: !songLoaded || libraryLocked || saveInProgress }}
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

      <SaveProjectPrompt
        visible={showSavePrompt}
        initialName={savePromptInitialName}
        duplicateSuggestion={duplicateSuggestion}
        onClose={() => {
          setShowSavePrompt(false);
          setDuplicateSuggestion(null);
        }}
        onConfirm={handleSaveAsNew}
        returnFocusRef={saveButtonRef}
      />

      <ConfirmDialog
        visible={showRevisionConflict}
        title="This project changed since you opened it"
        message="Choose Overwrite to replace the newer saved version, or save these changes as a new project."
        actions={[
          {
            label: 'Overwrite',
            testID: 'confirm-overwrite-project',
            onPress: () => { void saveCurrent({ overwriteConflict: true }).then(handleSaveResult); },
          },
          {
            label: 'Save as New Project',
            testID: 'conflict-save-as-new',
            onPress: () => {
              setShowRevisionConflict(false);
              openSavePrompt(`${draftBaselineName ?? defaultProjectName} copy`);
            },
          },
        ]}
        onCancel={() => setShowRevisionConflict(false)}
        returnFocusRef={saveButtonRef}
      />

      <ProjectManagerModal
        visible={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        onOpenProject={handleLoadProject}
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
