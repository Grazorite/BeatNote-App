import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectControlsStyles as styles } from '../../../styles/components/controls/projectControls';
import { BeatNoteIcon } from '../../icons';
import { saveAsNew, saveCurrent, type SaveResult } from '../../../features/library/projectService';
import { markMigrationNoticeShown } from '../../../features/library/migration';
import { readLibraryPrefsStrict } from '../../../features/library/repositories';
import ProjectManagerModal from '../modals/ProjectManagerModal';
import ConfirmDialog from '../modals/ConfirmDialog';
import SaveProjectPrompt from '../modals/SaveProjectPrompt';
import { MusicLibrarySheet } from '../library';
import SongTitleControl from './SongTitleControl';

interface ProjectControlsProps {
  audioFilename: string | null;
  isMobile?: boolean;
  isLandscape?: boolean;
}

const ProjectControls: React.FC<ProjectControlsProps> = ({
  audioFilename: _audioFilename,
  isMobile = false,
  isLandscape = false,
}) => {
  const {
    toggleSidebar,
    libraryStatus,
    currentMusicItemId,
    libraryItems,
    projectSummaries,
    migrationNoticeCount,
    draftBaseline,
    draftBaselineName,
    saveInProgress,
    openLibrarySheet,
    closeLibrarySheet,
    notify,
  } = useStudioStore(useShallow(state => ({
    toggleSidebar: state.toggleSidebar,
    libraryStatus: state.libraryStatus,
    currentMusicItemId: state.currentMusicItemId,
    libraryItems: state.libraryItems,
    projectSummaries: state.projectSummaries,
    migrationNoticeCount: state.migrationNoticeCount,
    draftBaseline: state.draftBaseline,
    draftBaselineName: state.draftBaselineName,
    saveInProgress: state.saveInProgress,
    openLibrarySheet: state.openLibrarySheet,
    closeLibrarySheet: state.closeLibrarySheet,
    notify: state.notify,
  })));
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [projectManagerMusicItemId, setProjectManagerMusicItemId] = useState<string | null>(null);
  const [routingLibraryToProjects, setRoutingLibraryToProjects] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptInitialName, setSavePromptInitialName] = useState('');
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<string | null>(null);
  const [showRevisionConflict, setShowRevisionConflict] = useState(false);
  const saveButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const titleButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const migrationNoticeRef = useRef<number | null>(null);

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

  const handleManagerSave = useCallback(async () => {
    if (draftBaseline !== null) {
      await handleSaveCurrent();
      return;
    }
    setShowProjectManager(false);
    requestAnimationFrame(() => openSavePrompt(defaultProjectName));
  }, [defaultProjectName, draftBaseline, handleSaveCurrent, openSavePrompt]);

  const handleManagerSaveAsNew = useCallback(() => {
    setShowProjectManager(false);
    requestAnimationFrame(() => openSavePrompt(defaultProjectName));
  }, [defaultProjectName, openSavePrompt]);

  const libraryLocked = libraryStatus !== 'ready';

  useEffect(() => {
    if (!libraryLocked) return;
    setShowProjectManager(false);
    setShowSavePrompt(false);
    setShowRevisionConflict(false);
  }, [libraryLocked]);

  const openProjects = useCallback((musicItemId: string | null = null) => {
    if (musicItemId !== null) setRoutingLibraryToProjects(true);
    closeLibrarySheet();
    requestAnimationFrame(() => {
      setProjectManagerMusicItemId(musicItemId);
      setShowProjectManager(true);
    });
  }, [closeLibrarySheet]);

  useEffect(() => {
    if (
      libraryStatus !== 'ready'
      || migrationNoticeCount === null
      || migrationNoticeRef.current === migrationNoticeCount
    ) return;
    migrationNoticeRef.current = migrationNoticeCount;
    const firstAffectedMusicItemId = Object.values(projectSummaries)
      .sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt))
      .find(project => {
        const item = libraryItems[project.musicItemId];
        return item?.availability === 'missing' || item?.removed === true;
      })?.musicItemId ?? null;
    notify(`${migrationNoticeCount} projects need their audio reconnected`, {
      label: 'Show Projects',
      onPress: () => openProjects(firstAffectedMusicItemId),
    });
    void readLibraryPrefsStrict()
      .then(preferences => markMigrationNoticeShown(preferences))
      .then(() => useStudioStore.setState({ migrationNoticeCount: null }))
      .catch(error => {
        console.error('Unable to record the migration notice', error);
      });
  }, [
    libraryItems,
    libraryStatus,
    migrationNoticeCount,
    notify,
    openProjects,
    projectSummaries,
  ]);

  const actions = (
    <>
      <SongTitleControl
        ref={titleButtonRef}
        isMobile={isMobile}
        onOpen={openLibrarySheet}
      />

      <TouchableOpacity
        ref={saveButtonRef}
        style={[styles.button, isMobile && styles.buttonMobile, (currentMusicItemId === null || libraryLocked || saveInProgress) && styles.buttonDisabled]}
        onPress={currentMusicItemId !== null && !libraryLocked && !saveInProgress ? () => {
          Keyboard.dismiss();
          void handleSaveCurrent();
        } : undefined}
        disabled={currentMusicItemId === null || libraryLocked || saveInProgress}
        accessibilityLabel="Save Project"
        accessibilityState={{ disabled: currentMusicItemId === null || libraryLocked || saveInProgress }}
        testID="save-project"
      >
        <BeatNoteIcon name="save" size={20} color={currentMusicItemId !== null && !libraryLocked ? '#ffffff' : '#666666'} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Save Project</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isMobile && styles.buttonMobile, libraryLocked && styles.buttonDisabled]}
        onPress={libraryLocked ? undefined : () => openProjects()}
        disabled={libraryLocked}
        accessibilityLabel="Open Projects"
        testID="load-project"
      >
        <BeatNoteIcon name="projects" size={20} style={isMobile ? undefined : { marginRight: 8 }} />
        <Text style={[styles.buttonText, isMobile && styles.buttonTextHidden]}>Projects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          isMobile && styles.buttonMobile,
          isMobile && styles.sidebarToggleMobile,
          !isMobile && styles.settingsButton,
        ]}
        onPress={toggleSidebar}
        accessibilityLabel="Open settings"
        testID="sidebar-open-toggle"
      >
        <BeatNoteIcon name="settings" size={18} style={isMobile ? undefined : { marginRight: 8 }} />
        {!isMobile && <Text style={styles.buttonText}>Settings</Text>}
      </TouchableOpacity>
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
        <View
          style={[styles.mobileActions, isLandscape && styles.mobileActionsLandscape]}
          testID="project-actions-scroll"
        >
          {actions}
        </View>
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
        onClose={() => {
          setShowProjectManager(false);
          setProjectManagerMusicItemId(null);
          setRoutingLibraryToProjects(false);
          requestAnimationFrame(() => titleButtonRef.current?.focus?.());
        }}
        musicItemId={projectManagerMusicItemId}
        onChooseMusic={openLibrarySheet}
        onSave={handleManagerSave}
        onSaveAsNewProject={handleManagerSaveAsNew}
      />

      <MusicLibrarySheet
        returnFocusRef={titleButtonRef}
        restoreFocusOnClose={!routingLibraryToProjects}
        onShowProjects={item => openProjects(item.id)}
      />
      
    </View>
  );
};

export default ProjectControls;
