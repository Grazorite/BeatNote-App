import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  AccessibilityInfo,
  Alert,
  findNodeHandle,
  Platform,
  SectionList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import {
  enqueueImport,
  resolveRelinkConfirmation,
  type RelinkConfirmation,
} from '../../../features/library/importPipeline';
import {
  deleteProject,
  openProject,
  renameProject,
  revertToSaved,
  saveCurrent,
  type OpenProjectOptions,
} from '../../../features/library/projectService';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { projectManagerModalStyles as styles } from '../../../styles/components/modals/projectManagerModal';
import type { MusicItem } from '../../../types/library';
import type { PersistedContent, SavedProjectSummary } from '../../../types/project';
import { MAX_TEXT_SCALE, SUPPORTED_AUDIO_EXTENSIONS } from '../../../utils/libraryConstants';
import { changedMarkerCount, changedSettingNames } from '../../../utils/draftResolution';
import { groupProjectSections } from '../../../utils/projectNames';
import { extractPersistedContent } from '../../../utils/persistedContent';
import GlassBackdrop from '../controls/GlassBackdrop';
import AppModal from '../common/AppModal';
import CurrentProjectSection, {
  type CurrentProjectDraftState,
} from '../projects/CurrentProjectSection';
import ProjectRow from '../projects/ProjectRow';
import ConfirmDialog from './ConfirmDialog';
import CsvReplaceConfirm from './CsvReplaceConfirm';
import ExportModal from './ExportModal';
import SaveProjectPrompt from './SaveProjectPrompt';

interface ProjectManagerModalProps {
  visible: boolean;
  onClose: () => void;
  /** Scroll the complete manager to this song instead of filtering its contents. */
  musicItemId?: string | null;
  onChooseMusic: () => void;
  onSave: () => void | Promise<void>;
  onSaveAsNewProject: () => void | Promise<void>;
}

interface RelinkPromptState extends RelinkConfirmation {
  returnFocusRef?: React.RefObject<unknown>;
}

type ProjectListRow =
  | { kind: 'current'; key: string }
  | { kind: 'group'; key: string; title: string }
  | { kind: 'empty'; key: string; text: string }
  | {
    kind: 'project';
    key: string;
    project: SavedProjectSummary;
    displayTitle: string | null;
    audioMissing: boolean;
    canRelink: boolean;
  };

interface ProjectListSection {
  key: 'current' | 'current-song' | 'all';
  title: string;
  data: ProjectListRow[];
}

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
] as const;

const AUDIO_PICKER_TYPES = Platform.OS === 'web'
  ? [...AUDIO_MIME_TYPES, ...SUPPORTED_AUDIO_EXTENSIONS]
  : [...AUDIO_MIME_TYPES];

const compareNewest = (left: SavedProjectSummary, right: SavedProjectSummary): number => (
  right.modifiedAt.localeCompare(left.modifiedAt)
    || right.revision - left.revision
    || left.projectId.localeCompare(right.projectId)
);

const formatDuration = (milliseconds: number | null | undefined): string => {
  if (milliseconds === null || milliseconds === undefined) return 'unknown duration';
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  visible,
  onClose,
  musicItemId = null,
  onChooseMusic,
  onSave,
  onSaveAsNewProject,
}) => {
  const insets = useSafeAreaInsets();
  const titleRef = useRef<Text>(null);
  const listRef = useRef<SectionList<ProjectListRow, ProjectListSection>>(null);
  const nativePickerActiveRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const webTitleProps = Platform.OS === 'web' ? { tabIndex: -1 as const } : {};
  const {
    projectSummaries,
    libraryItems,
    currentMusicItemId,
    draftBaseline,
    draftBaselineName,
    draftUiState,
    loadedProjectSource,
    libraryStatus,
    saveInProgress,
    songLoaded,
    allLayersData,
    notify,
    csvPreview,
    csvUndo,
    previewCsvImport,
    discardCsvPreview,
    applyCsvReplace,
    undoCsvReplace,
  } = useStudioStore(useShallow(state => ({
    projectSummaries: state.projectSummaries,
    libraryItems: state.libraryItems,
    currentMusicItemId: state.currentMusicItemId,
    draftBaseline: state.draftBaseline,
    draftBaselineName: state.draftBaselineName,
    draftUiState: state.draftUiState,
    loadedProjectSource: state.loadedProjectSource,
    libraryStatus: state.libraryStatus,
    saveInProgress: state.saveInProgress,
    songLoaded: state.songLoaded,
    allLayersData: state.allLayersData,
    notify: state.notify,
    csvPreview: state.csvPreview,
    csvUndo: state.csvUndo,
    previewCsvImport: state.previewCsvImport,
    discardCsvPreview: state.discardCsvPreview,
    applyCsvReplace: state.applyCsvReplace,
    undoCsvReplace: state.undoCsvReplace,
  })));
  const [renameProjectState, setRenameProjectState] = useState<{
    project: SavedProjectSummary;
    returnFocusRef?: React.RefObject<unknown>;
  } | null>(null);
  const [renameSuggestion, setRenameSuggestion] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [relinkConfirmation, setRelinkConfirmation] = useState<RelinkPromptState | null>(null);
  const [pendingOpenProjectId, setPendingOpenProjectId] = useState<string | null>(null);
  const [discardAction, setDiscardAction] = useState<'open' | 'revert' | null>(null);
  const [exportTarget, setExportTarget] = useState<{ id: string | 'current'; name: string; markerCount: number } | null>(null);

  const summaries = useMemo(() => Object.values(projectSummaries), [projectSummaries]);
  const grouped = useMemo(() => groupProjectSections(
    currentMusicItemId,
    draftBaseline?.projectId ?? null,
    summaries,
    libraryItems,
  ), [currentMusicItemId, draftBaseline?.projectId, libraryItems, summaries]);
  const interactionsDisabled = libraryStatus !== 'ready' || saveInProgress || actionBusyId !== null;
  const visibleMarkerCount = useMemo(() => allLayersData
    .filter(layer => layer.isVisible)
    .reduce((count, layer) => count + layer.markers.length, 0), [allLayersData]);

  const newestCurrentProject = useMemo(() => {
    if (currentMusicItemId === null || draftBaseline === null || draftUiState !== 'dirty') return null;
    const newest = summaries
      .filter(project => project.musicItemId === currentMusicItemId)
      .sort(compareNewest)[0] ?? null;
    return newest?.projectId === draftBaseline.projectId ? null : newest;
  }, [currentMusicItemId, draftBaseline, draftUiState, summaries]);
  const currentDraftState: CurrentProjectDraftState = newestCurrentProject !== null
    ? { kind: 'based', baselineName: draftBaselineName ?? 'saved project' }
    : draftUiState === 'saved'
      ? { kind: 'saved' }
      : { kind: 'edited' };

  const sections = useMemo<ProjectListSection[]>(() => {
    const currentSongRows: ProjectListRow[] = grouped.projectsForCurrentSong.map(project => {
      const audioMissing = libraryItems[project.musicItemId]?.availability === 'missing';
      return {
        kind: 'project',
        key: `current-${project.projectId}`,
        project,
        displayTitle: null,
        audioMissing,
        canRelink: audioMissing,
      };
    });
    const allRows: ProjectListRow[] = [];
    grouped.allProjectGroups.forEach(group => {
      allRows.push({ kind: 'group', key: `group-${group.musicItemId}`, title: group.displayTitle });
      group.projects.forEach(project => {
        const item = libraryItems[project.musicItemId];
        allRows.push({
          kind: 'project',
          key: `all-${project.projectId}`,
          project,
          displayTitle: group.displayTitle,
          audioMissing: item?.availability === 'missing',
          canRelink: item?.availability === 'missing',
        });
      });
    });
    if (grouped.audioRemoved.length > 0) {
      allRows.push({ kind: 'group', key: 'group-audio-removed', title: 'Audio removed' });
      grouped.audioRemoved.forEach(project => {
        allRows.push({
          kind: 'project',
          key: `removed-${project.projectId}`,
          project,
          displayTitle: libraryItems[project.musicItemId]?.displayTitle ?? 'Audio removed',
          audioMissing: true,
          canRelink: true,
        });
      });
    }
    return [
      { key: 'current', title: 'Current Project', data: [{ kind: 'current', key: 'current' }] },
      {
        key: 'current-song',
        title: `Projects for ${grouped.currentDisplayTitle ?? 'current song'}`,
        data: currentSongRows.length > 0
          ? currentSongRows
          : [{ kind: 'empty', key: 'current-empty', text: 'No other projects for this song' }],
      },
      {
        key: 'all',
        title: 'All Projects',
        data: allRows.length > 0
          ? allRows
          : [{ kind: 'empty', key: 'all-empty', text: 'No other saved projects' }],
      },
    ];
  }, [grouped, libraryItems]);

  useEffect(() => {
    if (!visible || musicItemId === null) return undefined;
    const sectionIndex = sections.findIndex(section => section.data.some(row => (
      row.kind === 'project' && row.project.musicItemId === musicItemId
    )));
    if (sectionIndex < 0) return undefined;
    const itemIndex = sections[sectionIndex].data.findIndex(row => (
      row.kind === 'project' && row.project.musicItemId === musicItemId
    ));
    const timer = setTimeout(() => {
      listRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex,
        viewOffset: 56,
        animated: false,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [musicItemId, sections, visible]);

  useEffect(() => {
    if (visible) return;
    discardCsvPreview();
    setPendingOpenProjectId(null);
    setDiscardAction(null);
    setExportTarget(null);
  }, [discardCsvPreview, visible]);

  const closeAndChooseMusic = useCallback(() => {
    onClose();
    requestAnimationFrame(onChooseMusic);
  }, [onChooseMusic, onClose]);

  const openProjectAndClose = useCallback(async (
    projectId: string,
    options?: OpenProjectOptions,
  ): Promise<boolean> => {
    if (interactionsDisabled) return false;
    const result = await openProject(projectId, options);
    if (result.kind === 'opened') {
      onClose();
      return true;
    }
    if (result.kind === 'needsGuard') {
      const isSameSong = projectSummaries[projectId]?.musicItemId === currentMusicItemId;
      if (isSameSong) {
        setPendingOpenProjectId(projectId);
        return false;
      }
      onClose();
      return true;
    }
    const message = result.kind === 'failed'
      ? result.reason
      : result.kind === 'notFound'
        ? 'This project is no longer available.'
        : 'The current song changed while the project was opening.';
    Alert.alert('Project Not Opened', message);
    return false;
  }, [currentMusicItemId, interactionsDisabled, onClose, projectSummaries]);

  const pickCsv = useCallback(async () => {
    nativePickerActiveRef.current = true;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'web' ? ['text/csv', 'text/comma-separated-values', '.csv'] : ['text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      const webFile = asset.file as { text?: () => Promise<string> } | undefined;
      const content = webFile?.text !== undefined
        ? await webFile.text()
        : await FileSystem.readAsStringAsync(asset.uri);
      previewCsvImport(content, asset.name);
    } catch (error) {
      Alert.alert('Import Failed', error instanceof Error ? error.message : 'Unable to read this CSV file.');
    } finally {
      // iOS can deliver the page-sheet dismissal request just after the document picker resolves.
      // Keep the project sheet mounted long enough for the CSV preview to become visible.
      setTimeout(() => { nativePickerActiveRef.current = false; }, 500);
    }
  }, [previewCsvImport]);

  const replaceCsv = useCallback(() => {
    if (!applyCsvReplace()) return;
    onClose();
    notify('CSV imported', {
      label: 'Undo',
      onPress: () => { useStudioStore.getState().undoCsvReplace(); },
    });
  }, [applyCsvReplace, notify, onClose]);

  const confirmDiscardMessage = useMemo(() => {
    if (loadedProjectSource === null) return 'Discard the current changes? This cannot be undone.';
    const current = extractPersistedContent(useStudioStore.getState());
    const baseline: PersistedContent = {
      layers: loadedProjectSource.layers as PersistedContent['layers'],
      bpm: loadedProjectSource.metadata.bpm,
      stemCount: loadedProjectSource.metadata.stemCount,
      settings: loadedProjectSource.settings,
      extras: {},
    };
    const markerCount = changedMarkerCount(current, baseline);
    if (markerCount > 0) {
      return `Discard changes to ${markerCount} marker${markerCount === 1 ? '' : 's'}? This cannot be undone.`;
    }
    const settings = changedSettingNames(current, baseline);
    if (settings.length > 0) {
      return `Discard changed settings (${settings.join(', ')})? This cannot be undone.`;
    }
    return 'Discard the current changes? This cannot be undone.';
  }, [allLayersData, loadedProjectSource]);

  const saveAndOpen = useCallback(async () => {
    if (pendingOpenProjectId === null) return;
    const target = pendingOpenProjectId;
    const result = await saveCurrent();
    if (result.kind !== 'saved') {
      Alert.alert('Project Not Opened', 'BeatNote could not save the current changes. Resolve the save issue, then try again.');
      return;
    }
    setPendingOpenProjectId(null);
    await openProjectAndClose(target);
  }, [openProjectAndClose, pendingOpenProjectId]);

  const performDiscard = useCallback(async () => {
    const action = discardAction;
    setDiscardAction(null);
    if (action === 'open' && pendingOpenProjectId !== null) {
      const target = pendingOpenProjectId;
      setPendingOpenProjectId(null);
      await openProjectAndClose(target, { discardChanges: true });
      return;
    }
    if (action === 'revert') {
      const result = await revertToSaved();
      if (result.kind === 'reverted') notify('Reverted to saved project');
      else if (result.kind === 'failed') Alert.alert('Project Not Reverted', result.reason);
    }
  }, [discardAction, notify, openProjectAndClose, pendingOpenProjectId]);

  const handleRename = useCallback(async (name: string) => {
    if (renameProjectState === null) return;
    const result = await renameProject(renameProjectState.project.projectId, name);
    if (result.kind === 'renamed') {
      setRenameProjectState(null);
      setRenameSuggestion(null);
      notify(`Renamed project to “${result.project.metadata.name}”`);
      return;
    }
    if (result.kind === 'nameConflict') {
      setRenameSuggestion(result.suggestion);
      return;
    }
    const message = result.kind === 'invalidName'
      ? result.error
      : result.kind === 'failed'
        ? result.reason
        : result.kind === 'readOnly'
          ? 'Newer-version projects are read-only.'
          : 'This project is no longer available.';
    Alert.alert('Project Not Renamed', message);
  }, [notify, renameProjectState]);

  const handleDelete = useCallback(async (projectId: string) => {
    setActionBusyId(projectId);
    try {
      await deleteProject(projectId);
      notify('Project deleted');
    } catch (error) {
      Alert.alert(
        'Project Not Deleted',
        error instanceof Error ? error.message : 'Failed to delete project',
      );
    } finally {
      setActionBusyId(null);
    }
  }, [notify]);

  const relinkItem = useCallback(async (
    item: MusicItem,
    returnFocusRef?: React.RefObject<unknown>,
  ) => {
    setActionBusyId(item.id);
    nativePickerActiveRef.current = true;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_PICKER_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      const outcome = await enqueueImport({
        origin: 'relink',
        relinkTargetId: item.id,
        sourceUri: asset.uri,
        originalFilename: asset.name,
        reportedBytes: asset.size ?? null,
      });
      if (outcome.kind === 'relinkNeedsConfirm') {
        setRelinkConfirmation({ ...outcome, returnFocusRef });
      } else if (outcome.kind === 'failed') {
        notify(outcome.error.message);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "BeatNote couldn't relink this song");
    } finally {
      setActionBusyId(null);
      setTimeout(() => { nativePickerActiveRef.current = false; }, 500);
    }
  }, [notify]);

  const resolveRelink = useCallback(async (useFile: boolean) => {
    if (relinkConfirmation === null) return;
    const confirmation = relinkConfirmation;
    setRelinkConfirmation(null);
    setActionBusyId(confirmation.musicItemId);
    try {
      const outcome = await resolveRelinkConfirmation(confirmation.staged.stagingRef, useFile);
      if (outcome.kind === 'failed') notify(outcome.error.message);
    } catch (error) {
      notify(error instanceof Error ? error.message : "BeatNote couldn't relink this song");
    } finally {
      setActionBusyId(null);
    }
  }, [notify, relinkConfirmation]);

  const renderRow = useCallback(({ item }: { item: ProjectListRow }) => {
    if (item.kind === 'current') {
      return (
        <CurrentProjectSection
          hasSong={currentMusicItemId !== null}
          projectName={draftBaselineName}
          displayTitle={grouped.currentDisplayTitle}
          draftState={currentDraftState}
          newerProjectName={newestCurrentProject?.name ?? null}
          onOpenNewerProject={newestCurrentProject === null
            ? undefined
            : () => { void openProjectAndClose(newestCurrentProject.projectId); }}
          onChooseMusic={closeAndChooseMusic}
          onSave={onSave}
          onSaveAsNewProject={onSaveAsNewProject}
          onImportCsv={pickCsv}
          onExportCsv={() => setExportTarget({
            id: 'current',
            name: draftBaselineName ?? grouped.currentDisplayTitle ?? 'Untitled',
            markerCount: visibleMarkerCount,
          })}
          onRevertToSaved={() => setDiscardAction('revert')}
          onUndoCsvImport={() => {
            if (undoCsvReplace()) notify('CSV import undone');
          }}
          saveDisabled={interactionsDisabled || currentMusicItemId === null}
          saveAsNewDisabled={interactionsDisabled || currentMusicItemId === null}
          importCsvDisabled={interactionsDisabled || !songLoaded}
          exportCsvDisabled={interactionsDisabled || !songLoaded || visibleMarkerCount === 0}
          revertDisabled={interactionsDisabled || draftUiState !== 'dirty' || draftBaseline === null}
          showUndoCsvImport={csvUndo !== null}
          undoCsvImportDisabled={interactionsDisabled}
          openNewerProjectDisabled={interactionsDisabled}
        />
      );
    }
    if (item.kind === 'group') {
      return <Text style={styles.groupTitle} maxFontSizeMultiplier={MAX_TEXT_SCALE}>{item.title}</Text>;
    }
    if (item.kind === 'empty') {
      return <Text style={styles.emptyText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>{item.text}</Text>;
    }
    const musicItem = libraryItems[item.project.musicItemId];
    return (
      <ProjectRow
        project={item.project}
        displayTitle={item.displayTitle}
        audioMissing={item.audioMissing}
        disabled={interactionsDisabled}
        exportDisabled={item.project.markerCount === 0}
        onOpen={returnFocusRef => {
          void openProjectAndClose(item.project.projectId).then(opened => {
            if (!opened) requestAnimationFrame(() => (
              returnFocusRef?.current as { focus?: () => void } | undefined
            )?.focus?.());
          });
        }}
        onRename={returnFocusRef => {
          setRenameSuggestion(null);
          setRenameProjectState({ project: item.project, returnFocusRef });
        }}
        onExport={() => setExportTarget({
          id: item.project.projectId,
          name: item.project.name,
          markerCount: item.project.markerCount,
        })}
        onRelink={item.canRelink && musicItem !== undefined
          ? returnFocusRef => { void relinkItem(musicItem, returnFocusRef); }
          : undefined}
        onDelete={() => { void handleDelete(item.project.projectId); }}
      />
    );
  }, [
    closeAndChooseMusic,
    currentDraftState,
    currentMusicItemId,
    draftBaselineName,
    grouped.currentDisplayTitle,
    handleDelete,
    interactionsDisabled,
    libraryItems,
    newestCurrentProject,
    csvUndo,
    draftBaseline,
    draftUiState,
    onSave,
    onSaveAsNewProject,
    openProjectAndClose,
    pickCsv,
    relinkItem,
    songLoaded,
    visibleMarkerCount,
    undoCsvReplace,
  ]);

  return (
    <AppModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!nativePickerActiveRef.current) onClose();
      }}
      onShow={() => {
        const handle = findNodeHandle(titleRef.current);
        if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
        titleRef.current?.focus?.();
      }}
      accessibilityViewIsModal
    >
      <View style={styles.container}>
        <GlassBackdrop gradientId="projects-modal-glass" radius={0} testID="projects-modal-glass" />
        <View style={[
          styles.header,
          isLandscape && {
            paddingLeft: Math.max(20, insets.left + 12),
            paddingRight: Math.max(20, insets.right + 12),
          },
        ]}>
          <Text
            ref={titleRef}
            style={styles.title}
            accessibilityRole="header"
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
            {...webTitleProps}
          >
            Projects
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close Projects"
          >
            <Text style={styles.closeButtonText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Close</Text>
          </TouchableOpacity>
        </View>

        <SectionList
          ref={listRef}
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: Math.max(16, insets.bottom + 12) },
            isLandscape && {
              paddingLeft: Math.max(20, insets.left + 12),
              paddingRight: Math.max(20, insets.right + 12),
            },
          ]}
          sections={sections}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => (
            <Text
              style={styles.sectionTitle}
              accessibilityRole="header"
              maxFontSizeMultiplier={MAX_TEXT_SCALE}
            >
              {section.title}
            </Text>
          )}
          keyExtractor={item => item.key}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <SaveProjectPrompt
          visible={renameProjectState !== null}
          title="Rename Project"
          confirmLabel="Rename"
          initialName={renameProjectState?.project.name ?? ''}
          duplicateSuggestion={renameSuggestion}
          onClose={() => {
            setRenameProjectState(null);
            setRenameSuggestion(null);
          }}
          onConfirm={handleRename}
          returnFocusRef={renameProjectState?.returnFocusRef}
        />

        <ConfirmDialog
          visible={relinkConfirmation !== null}
          title={relinkConfirmation?.decision === 'looksOriginal'
            ? 'This looks like the original file'
            : 'Use this audio file?'}
          message={relinkConfirmation === null ? '' : (() => {
            const stored = libraryItems[relinkConfirmation.musicItemId];
            if (relinkConfirmation.decision === 'looksOriginal') {
              return 'BeatNote found the same filename and duration. Use this file to restore the audio?';
            }
            return [
              `Stored: “${stored?.displayTitle ?? 'Song'}” — ${formatDuration(stored?.durationMs)}.`,
              `Chosen: “${relinkConfirmation.chosen.originalFilename}” — ${formatDuration(relinkConfirmation.chosen.durationMs)}.`,
            ].join(' ');
          })()}
          actions={[{
            label: 'Use This File',
            testID: 'confirm-relink-use-file',
            onPress: () => { void resolveRelink(true); },
          }]}
          onCancel={() => { void resolveRelink(false); }}
          returnFocusRef={relinkConfirmation?.returnFocusRef}
          testID="project-relink-confirm"
        />

        <ConfirmDialog
          visible={pendingOpenProjectId !== null && discardAction === null}
          title="Save changes before opening?"
          message="The current project has changes that are not in the most recent saved version."
          actions={[
            { label: 'Save & Open', testID: 'project-guard-save-open', onPress: () => { void saveAndOpen(); } },
            { label: 'Discard Changes & Open', destructive: true, testID: 'project-guard-discard-open', onPress: () => setDiscardAction('open') },
          ]}
          onCancel={() => setPendingOpenProjectId(null)}
          testID="project-open-guard"
        />

        <ConfirmDialog
          visible={discardAction !== null}
          title={discardAction === 'revert' ? 'Revert to Saved?' : 'Discard Changes & Open?'}
          message={confirmDiscardMessage}
          actions={[{
            label: discardAction === 'revert' ? 'Revert' : 'Discard Changes & Open',
            destructive: true,
            testID: 'confirm-discard-project-changes',
            onPress: () => { void performDiscard(); },
          }]}
          onCancel={() => setDiscardAction(null)}
          testID="project-discard-confirm"
        />

        <CsvReplaceConfirm
          visible={csvPreview !== null}
          preview={csvPreview}
          projectName={draftBaselineName}
          onCancel={discardCsvPreview}
          onReplace={replaceCsv}
        />

        <ExportModal
          visible={exportTarget !== null}
          onClose={() => setExportTarget(null)}
          projectName={exportTarget?.name ?? 'Untitled'}
          projectId={exportTarget?.id ?? 'current'}
          markerCount={exportTarget?.markerCount ?? 0}
        />
      </View>
    </AppModal>
  );
};

export default ProjectManagerModal;
