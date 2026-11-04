import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { invalidateAnalysis } from '../../../features/analysis/bpmAnalysisService';
import {
  deleteAllImportedAudio,
  deleteAllBeatNoteData,
  deleteAllSavedProjects,
} from '../../../features/library/dataDeletionService';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { clearWaveformCache } from '../../../hooks/useWaveformData';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import { IMPORTED_MUSIC_COLLECTION_ID } from '../../../types/library';
import ConfirmDialog from '../modals/ConfirmDialog';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface DataManagementScreenProps { onBack: () => void; }
type Confirmation = 'clearCaches' | 'deleteMarkers' | 'deleteProjects'
  | 'deleteImportedAudio' | 'deleteAllData' | null;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DataManagementScreen: React.FC<DataManagementScreenProps> = ({ onBack }) => {
  const libraryItems = useStudioStore(state => state.libraryItems);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const markerCount = useStudioStore(state => state.allLayersData
    .reduce((total, layer) => total + layer.markers.length, 0));
  const projectCount = useStudioStore(state => (
    Object.keys(state.projectSummaries).length + state.readOnlyLegacyProjects.length
  ));
  const importInProgress = useStudioStore(state => (
    state.importJobs.some(job => job.status !== 'failed')
  ));
  const clearAllMarkers = useStudioStore(state => state.clearAllMarkers);
  const notify = useStudioStore(state => state.notify);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [busy, setBusy] = useState(false);
  const importedItems = useMemo(() => Object.values(libraryItems).filter(item => (
    !item.removed && item.collectionIds.includes(IMPORTED_MUSIC_COLLECTION_ID)
  )), [libraryItems]);
  const importedBytes = importedItems.reduce((total, item) => total + item.byteSize, 0);

  const clearCaches = async () => {
    setConfirmation(null);
    setBusy(true);
    try {
      clearWaveformCache();
      await Promise.all(importedItems.map(item => invalidateAnalysis(item.id)));
      notify('Waveform and BPM caches cleared');
    } catch (error) {
      console.error('Unable to clear derived caches', error);
      notify("BeatNote couldn't clear every derived cache");
    } finally {
      setBusy(false);
    }
  };

  const deleteMarkers = () => {
    setConfirmation(null);
    clearAllMarkers();
    notify('Deleted all markers from the current song');
  };

  const deleteProjects = async () => {
    setConfirmation(null);
    setBusy(true);
    try {
      await deleteAllSavedProjects();
      notify('Deleted all saved projects; song drafts were kept');
    } catch (error) {
      console.error('Unable to delete saved projects', error);
      notify("BeatNote couldn't delete every saved project");
    } finally {
      setBusy(false);
    }
  };

  const deleteImportedAudio = async () => {
    setConfirmation(null);
    setBusy(true);
    try {
      await deleteAllImportedAudio();
      useStudioStore.getState().notify('Deleted all imported audio copies');
    } catch (error) {
      console.error('Unable to delete all imported audio', error);
      useStudioStore.getState().notify(
        error instanceof Error ? error.message : "BeatNote couldn't delete every imported audio copy",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteEverything = async () => {
    setConfirmation(null);
    setBusy(true);
    try {
      await deleteAllBeatNoteData();
      useStudioStore.getState().notify('Deleted all BeatNote data');
    } catch (error) {
      console.error('Unable to delete all BeatNote data', error);
      useStudioStore.getState().notify(
        error instanceof Error ? error.message : "BeatNote couldn't delete every data item",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsSubpage title="Data" onBack={onBack} testID="data-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Storage</Text>
        <SettingsInfoRow
          label="Imported Audio"
          detail={`${importedItems.length} ${importedItems.length === 1 ? 'song' : 'songs'} · ${formatBytes(importedBytes)}`}
          testID="data-imported-audio-summary"
        />
        <TouchableOpacity
          style={[styles.action, busy && styles.disabled]}
          onPress={() => setConfirmation('clearCaches')}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy }}
          testID="clear-derived-caches"
        >
          <Text style={styles.actionText}>Clear Waveform & BPM Caches</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Current Song</Text>
        <TouchableOpacity
          style={[
            styles.action,
            styles.destructiveAction,
            (!songLoaded || markerCount === 0) && styles.disabled,
          ]}
          onPress={() => setConfirmation('deleteMarkers')}
          disabled={!songLoaded || markerCount === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: !songLoaded || markerCount === 0 }}
          testID="delete-all-markers"
        >
          <Text style={[styles.actionText, styles.destructiveText]}>
            Delete All Markers ({markerCount})
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Delete Data</Text>
        <TouchableOpacity
          style={[
            styles.action,
            styles.destructiveAction,
            (busy || projectCount === 0) && styles.disabled,
          ]}
          onPress={() => setConfirmation('deleteProjects')}
          disabled={busy || projectCount === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy || projectCount === 0 }}
          testID="delete-all-projects"
        >
          <Text style={[styles.actionText, styles.destructiveText]}>
            Delete All Saved Projects ({projectCount})
          </Text>
        </TouchableOpacity>
        <SettingsInfoRow
          label="Keeps song drafts and imported audio"
          detail="Your markers and settings stay in each song’s draft."
          testID="delete-projects-detail"
        />
        <TouchableOpacity
          style={[
            styles.action,
            styles.destructiveAction,
            (busy || importInProgress || importedItems.length === 0) && styles.disabled,
          ]}
          onPress={() => setConfirmation('deleteImportedAudio')}
          disabled={busy || importInProgress || importedItems.length === 0}
          accessibilityRole="button"
          accessibilityState={{
            disabled: busy || importInProgress || importedItems.length === 0,
          }}
          testID="delete-all-imported-audio"
        >
          <Text style={[styles.actionText, styles.destructiveText]}>
            Delete All Imported Audio ({importedItems.length})
          </Text>
        </TouchableOpacity>
        <SettingsInfoRow
          label="Keeps projects and song drafts"
          detail={importInProgress
            ? 'Finish or cancel the current audio import first.'
            : "Removes BeatNote’s copies. You can reconnect your projects to the original files."}
          testID="delete-imported-audio-detail"
        />
        <TouchableOpacity
          style={[
            styles.action,
            styles.destructiveAction,
            (busy || importInProgress) && styles.disabled,
          ]}
          onPress={() => setConfirmation('deleteAllData')}
          disabled={busy || importInProgress}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy || importInProgress }}
          testID="delete-all-beatnote-data"
        >
          <Text style={[styles.actionText, styles.destructiveText]}>Delete All BeatNote Data</Text>
        </TouchableOpacity>
        <SettingsInfoRow
          label="Removes all app data"
          detail={importInProgress
            ? 'Finish or cancel the current audio import first.'
            : 'Deletes your library, projects, drafts, markers, settings and caches. Your original audio files are kept.'}
          testID="delete-all-data-detail"
        />
      </View>
      <ConfirmDialog
        visible={confirmation === 'clearCaches'}
        title="Clear waveform and BPM caches?"
        message="This clears saved waveforms and BPM suggestions. Your songs, markers, manual timing and projects are kept."
        actions={[{
          label: 'Clear Caches',
          testID: 'confirm-clear-derived-caches',
          onPress: () => { void clearCaches(); },
        }]}
        onCancel={() => setConfirmation(null)}
        testID="clear-derived-caches-confirm"
      />
      <ConfirmDialog
        visible={confirmation === 'deleteMarkers'}
        title="Delete all markers?"
        message="This clears the markers and notes in this draft. Your audio and saved projects are kept."
        actions={[{
          label: 'Delete All Markers',
          destructive: true,
          testID: 'confirm-delete-all-markers',
          onPress: deleteMarkers,
        }]}
        onCancel={() => setConfirmation(null)}
        testID="delete-all-markers-confirm"
      />
      <ConfirmDialog
        visible={confirmation === 'deleteProjects'}
        title="Delete every saved project?"
        message="All saved project versions will be permanently deleted. Your song drafts and imported audio are kept."
        confirmationText="DELETE PROJECTS"
        actions={[{
          label: 'Delete Saved Projects',
          destructive: true,
          testID: 'confirm-delete-all-projects',
          onPress: () => { void deleteProjects(); },
        }]}
        onCancel={() => setConfirmation(null)}
        testID="delete-all-projects-confirm"
      />
      <ConfirmDialog
        visible={confirmation === 'deleteImportedAudio'}
        title="Delete all imported audio?"
        message="This permanently deletes BeatNote’s audio copies. Your original files, projects and drafts are kept. Reconnect the audio to use them again."
        confirmationText="DELETE IMPORTED AUDIO"
        actions={[{
          label: 'Delete Imported Audio',
          destructive: true,
          testID: 'confirm-delete-all-imported-audio',
          onPress: () => { void deleteImportedAudio(); },
        }]}
        onCancel={() => setConfirmation(null)}
        testID="delete-all-imported-audio-confirm"
      />
      <ConfirmDialog
        visible={confirmation === 'deleteAllData'}
        title="Delete all BeatNote data?"
        message="This permanently deletes all imported audio copies, drafts, projects, markers, settings and caches. Your original files are kept."
        confirmationText="DELETE ALL DATA"
        actions={[{
          label: 'Delete All Data',
          destructive: true,
          testID: 'confirm-delete-all-beatnote-data',
          onPress: () => { void deleteEverything(); },
        }]}
        onCancel={() => setConfirmation(null)}
        testID="delete-all-beatnote-data-confirm"
      />
    </SettingsSubpage>
  );
};

export default DataManagementScreen;
