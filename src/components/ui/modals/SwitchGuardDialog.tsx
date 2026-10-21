import React, { useCallback, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  findNodeHandle,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import {
  resolveSwitchGuard,
  type SwitchGuardResolution,
} from '../../../features/library/trackSwitch';
import { saveAsNew, saveCurrent, type SaveResult } from '../../../features/library/projectService';
import { switchGuardDialogStyles as styles } from '../../../styles/components/modals/switchGuardDialog';
import GlassBackdrop from '../controls/GlassBackdrop';
import ConfirmDialog from './ConfirmDialog';
import SaveProjectPrompt from './SaveProjectPrompt';

const SwitchGuardDialog: React.FC = () => {
  const switchGuard = useStudioStore(state => state.switchGuard);
  const currentMusicItemId = useStudioStore(state => state.currentMusicItemId);
  const currentTitle = useStudioStore(state => (
    state.currentMusicItemId === null
      ? 'this song'
      : state.libraryItems[state.currentMusicItemId]?.displayTitle ?? 'this song'
  ));
  const projectName = useStudioStore(state => state.draftBaselineName ?? 'saved project');
  const saveButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const titleRef = useRef<Text>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInitial, setNameInitial] = useState('');
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<string | null>(null);
  const [showRevisionConflict, setShowRevisionConflict] = useState(false);

  const reportSwitchResult = useCallback((result: SwitchGuardResolution) => {
    if (result.kind !== 'failed') return;
    Alert.alert(result.reason.title, result.reason.message, [
      { text: 'Stay', style: 'cancel' },
      { text: 'Retry', onPress: () => { void result.reason.retry(); } },
    ]);
  }, []);

  const continueAfterSave = useCallback(async (result: SaveResult) => {
    if (result.kind === 'saved') {
      setShowNamePrompt(false);
      setShowRevisionConflict(false);
      reportSwitchResult(await resolveSwitchGuard('saved'));
      return;
    }
    if (result.kind === 'needsName') {
      setNameInitial(result.suggestedName);
      setDuplicateSuggestion(null);
      setShowNamePrompt(true);
      return;
    }
    if (result.kind === 'nameConflict') {
      setDuplicateSuggestion(result.suggestion);
      setShowNamePrompt(true);
      return;
    }
    if (result.kind === 'revisionConflict') {
      setShowRevisionConflict(true);
      return;
    }
    if (result.kind === 'readOnly') {
      setNameInitial(`${projectName} copy`);
      setShowNamePrompt(true);
      return;
    }
    if (result.kind === 'failed') {
      Alert.alert('Project Not Saved', result.reason);
    } else if (result.kind === 'invalidName') {
      Alert.alert('Project Not Saved', result.error);
    } else if (result.kind === 'noSong') {
      Alert.alert('Project Not Saved', 'The current song is no longer available.');
    }
    await resolveSwitchGuard('cancel');
  }, [projectName, reportSwitchResult]);

  const saveAndSwitch = useCallback(async () => {
    const result = await resolveSwitchGuard('save');
    if (result.kind === 'saveResult') await continueAfterSave(result.result);
    else reportSwitchResult(result);
  }, [continueAfterSave, reportSwitchResult]);

  const cancelPendingSave = useCallback(() => {
    setShowNamePrompt(false);
    setShowRevisionConflict(false);
    setDuplicateSuggestion(null);
    void resolveSwitchGuard('cancel');
  }, []);

  if (switchGuard === null || currentMusicItemId === null) return null;

  return (
    <>
      <Modal
        visible={!showNamePrompt && !showRevisionConflict}
        transparent
        animationType="fade"
        onRequestClose={cancelPendingSave}
        onShow={() => {
          const handle = findNodeHandle(titleRef.current);
          if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
        }}
        accessibilityViewIsModal
      >
        <View style={styles.overlay} testID="switch-guard-dialog">
          <View style={styles.container}>
            <GlassBackdrop gradientId="switch-guard-glass" radius={16} testID="switch-guard-glass" />
            <Text ref={titleRef} style={styles.title} accessibilityRole="header">
              Save changes before switching?
            </Text>
            <Text style={styles.message}>
              Your changes to “{currentTitle}” differ from the saved project “{projectName}”.
              {' '}BeatNote can keep them as a draft.
            </Text>
            <TouchableOpacity
              ref={saveButtonRef}
              style={[styles.button, styles.saveButton]}
              onPress={() => { void saveAndSwitch(); }}
              testID="switch-save-and-continue"
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save &amp; Switch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.keepButton]}
              onPress={() => { void resolveSwitchGuard('keepDraft').then(reportSwitchResult); }}
              testID="switch-keep-draft"
            >
              <Text style={styles.buttonText}>Keep Draft &amp; Switch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelPendingSave}
              testID="switch-cancel"
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SaveProjectPrompt
        visible={showNamePrompt}
        initialName={nameInitial}
        duplicateSuggestion={duplicateSuggestion}
        onClose={cancelPendingSave}
        onConfirm={async name => { await continueAfterSave(await saveAsNew(name)); }}
        returnFocusRef={saveButtonRef}
      />

      <ConfirmDialog
        visible={showRevisionConflict}
        title="This project changed since you opened it"
        message="Choose Overwrite to replace the newer saved version, or save these changes as a new project."
        actions={[
          {
            label: 'Overwrite',
            onPress: () => { void saveCurrent({ overwriteConflict: true }).then(continueAfterSave); },
          },
          {
            label: 'Save as New Project',
            onPress: () => {
              setShowRevisionConflict(false);
              setNameInitial(`${projectName} copy`);
              setShowNamePrompt(true);
            },
          },
        ]}
        onCancel={cancelPendingSave}
        returnFocusRef={saveButtonRef}
      />
    </>
  );
};

export default SwitchGuardDialog;
