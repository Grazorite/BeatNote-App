import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { invalidateAnalysis } from '../../../features/analysis/bpmAnalysisService';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { clearWaveformCache } from '../../../hooks/useWaveformData';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import { IMPORTED_MUSIC_COLLECTION_ID } from '../../../types/library';
import ConfirmDialog from '../modals/ConfirmDialog';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface DataManagementScreenProps { onBack: () => void; }
type Confirmation = 'clearCaches' | 'deleteMarkers' | null;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DataManagementScreen: React.FC<DataManagementScreenProps> = ({ onBack }) => {
  const libraryItems = useStudioStore(state => state.libraryItems);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const markerCount = useStudioStore(state => state.allLayersData
    .reduce((total, layer) => total + layer.markers.length, 0));
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
      notify('Derived waveform and BPM caches cleared');
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

  return (
    <SettingsSubpage title="Data" onBack={onBack} testID="data-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Storage</Text>
        <SettingsInfoRow
          label="Imported Audio"
          detail={`${importedItems.length} ${importedItems.length === 1 ? 'song' : 'songs'} · ${formatBytes(importedBytes)}`}
          testID="data-imported-audio-summary"
        />
        <SettingsInfoRow
          label="Remove Imported Audio Copies"
          detail="Manage songs individually from Music › More › Delete from BeatNote. Original files are never removed."
          testID="remove-audio-guidance"
        />
        <TouchableOpacity
          style={[styles.action, busy && styles.disabled]}
          onPress={() => setConfirmation('clearCaches')}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy }}
          testID="clear-derived-caches"
        >
          <Text style={styles.actionText}>Clear Derived Waveform & BPM Caches</Text>
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
        <SettingsInfoRow
          label="Delete Saved Projects or All BeatNote Data"
          detail="Planned. Use the Projects page to delete saved projects individually."
          disabled
          testID="delete-all-data-placeholder"
        />
      </View>
      <ConfirmDialog
        visible={confirmation === 'clearCaches'}
        title="Clear derived caches?"
        message="BeatNote will discard regenerated waveform peaks and automatic BPM suggestions. Imported audio, markers, manual timing, and saved projects will remain."
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
        message="This removes every marker and annotation from the current song draft. Imported audio and saved projects are not removed."
        actions={[{
          label: 'Delete All Markers',
          destructive: true,
          testID: 'confirm-delete-all-markers',
          onPress: deleteMarkers,
        }]}
        onCancel={() => setConfirmation(null)}
        testID="delete-all-markers-confirm"
      />
    </SettingsSubpage>
  );
};

export default DataManagementScreen;
