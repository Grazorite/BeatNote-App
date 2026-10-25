import React, { useState } from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { BeatNoteIcon, type BeatNoteIconName } from '../../icons';
import { currentProjectSectionStyles as styles } from '../../../styles/components/projects/currentProjectSection';
import { colors } from '../../../styles/common';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';

export type CurrentProjectDraftState =
  | { kind: 'saved' }
  | { kind: 'edited' }
  | { kind: 'based'; baselineName: string };

type ActionCallback = () => void | Promise<void>;

export interface CurrentProjectSectionProps {
  hasSong: boolean;
  projectName?: string | null;
  displayTitle?: string | null;
  draftState?: CurrentProjectDraftState;
  newerProjectName?: string | null;
  onOpenNewerProject?: ActionCallback;
  onChooseMusic: ActionCallback;
  onSave: ActionCallback;
  onSaveAsNewProject: ActionCallback;
  onImportCsv: ActionCallback;
  onExportCsv: ActionCallback;
  onRevertToSaved: ActionCallback;
  onUndoCsvImport: ActionCallback;
  saveDisabled?: boolean;
  saveAsNewDisabled?: boolean;
  importCsvDisabled?: boolean;
  exportCsvDisabled?: boolean;
  revertDisabled?: boolean;
  showUndoCsvImport?: boolean;
  undoCsvImportDisabled?: boolean;
  openNewerProjectDisabled?: boolean;
}

interface SectionActionProps {
  label: string;
  onPress: ActionCallback;
  disabled: boolean;
  testID: string;
  emphasis?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const SectionAction: React.FC<SectionActionProps> = ({
  label,
  onPress,
  disabled,
  testID,
  emphasis = 'primary',
  fullWidth = false,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.action,
        fullWidth && styles.actionFullWidth,
        emphasis === 'secondary' && styles.secondaryAction,
        focused && styles.actionFocused,
        disabled && styles.actionDisabled,
      ]}
      onPress={disabled ? undefined : () => { void onPress(); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <Text
        style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}
        maxFontSizeMultiplier={MAX_TEXT_SCALE}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const draftStatePresentation = (state: CurrentProjectDraftState): {
  icon: BeatNoteIconName;
  text: string;
} => {
  switch (state.kind) {
    case 'saved':
      return { icon: 'current', text: 'Saved' };
    case 'based':
      return { icon: 'restore', text: `Draft based on “${state.baselineName}”` };
    case 'edited':
      return { icon: 'warning', text: 'Edited — not saved' };
  }
};

const CurrentProjectSection: React.FC<CurrentProjectSectionProps> = ({
  hasSong,
  projectName = null,
  displayTitle = null,
  draftState = { kind: 'edited' },
  newerProjectName = null,
  onOpenNewerProject,
  onChooseMusic,
  onSave,
  onSaveAsNewProject,
  onImportCsv,
  onExportCsv,
  onRevertToSaved,
  onUndoCsvImport,
  saveDisabled = false,
  saveAsNewDisabled = false,
  importCsvDisabled = false,
  exportCsvDisabled = false,
  revertDisabled = true,
  showUndoCsvImport = false,
  undoCsvImportDisabled = false,
  openNewerProjectDisabled = false,
}) => {
  const [focusedControl, setFocusedControl] = useState<string | null>(null);
  const { fontScale } = useWindowDimensions();
  const useSingleColumnActions = fontScale > 1.4;

  if (!hasSong) {
    return (
      <View style={styles.container} testID="current-project-section">
        <View style={styles.noSongHeader}>
          <BeatNoteIcon name="music-library" size={24} color={colors.textSecondary} />
          <Text
            style={styles.projectName}
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
            testID="current-project-name"
          >
            No song chosen
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.chooseMusicAction,
            focusedControl === 'choose-music' && styles.actionFocused,
          ]}
          onPress={() => { void onChooseMusic(); }}
          onFocus={() => setFocusedControl('choose-music')}
          onBlur={() => setFocusedControl(value => value === 'choose-music' ? null : value)}
          accessibilityRole="button"
          accessibilityLabel="Choose Music"
          testID="current-project-choose-music"
        >
          <BeatNoteIcon name="music-library" size={20} color={colors.text} />
          <Text style={styles.chooseMusicLabel} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
            Choose Music
          </Text>
        </TouchableOpacity>
        <View style={styles.actionGrid}>
          <SectionAction label="Save" onPress={onSave} disabled testID="current-project-save" fullWidth={useSingleColumnActions} />
          <SectionAction label="Save as New Project" onPress={onSaveAsNewProject} disabled testID="current-project-save-as-new" fullWidth={useSingleColumnActions} />
          <SectionAction label="Import CSV" onPress={onImportCsv} disabled testID="current-project-import-csv" fullWidth={useSingleColumnActions} />
          <SectionAction label="Export CSV" onPress={onExportCsv} disabled testID="current-project-export-csv" fullWidth={useSingleColumnActions} />
        </View>
      </View>
    );
  }

  const statePresentation = draftStatePresentation(draftState);
  const canOpenNewerProject = newerProjectName !== null && onOpenNewerProject !== undefined;

  return (
    <View style={styles.container} testID="current-project-section">
      <Text
        style={styles.projectName}
        numberOfLines={2}
        maxFontSizeMultiplier={MAX_TEXT_SCALE}
        testID="current-project-name"
      >
        {projectName ?? 'Unsaved draft'}
      </Text>
      <Text
        style={styles.displayTitle}
        numberOfLines={2}
        maxFontSizeMultiplier={MAX_TEXT_SCALE}
        testID="current-project-display-title"
      >
        {displayTitle ?? 'Untitled song'}
      </Text>

      <View style={styles.stateRow} testID="current-project-state">
        <BeatNoteIcon name={statePresentation.icon} size={18} color={colors.textSecondary} />
        <Text style={styles.stateText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
          {statePresentation.text}
        </Text>
      </View>

      {newerProjectName !== null && (
        <View style={styles.newerProject} testID="current-project-newer-note">
          <Text style={styles.newerProjectText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
            A newer project “{newerProjectName}” exists
          </Text>
          <TouchableOpacity
            style={[
              styles.inlineAction,
              focusedControl === 'open-newer' && styles.actionFocused,
              (!canOpenNewerProject || openNewerProjectDisabled) && styles.actionDisabled,
            ]}
            onPress={canOpenNewerProject && !openNewerProjectDisabled
              ? () => { void onOpenNewerProject(); }
              : undefined}
            onFocus={() => setFocusedControl('open-newer')}
            onBlur={() => setFocusedControl(value => value === 'open-newer' ? null : value)}
            disabled={!canOpenNewerProject || openNewerProjectDisabled}
            accessibilityRole="button"
            accessibilityLabel={`Open newer project ${newerProjectName}`}
            accessibilityState={{ disabled: !canOpenNewerProject || openNewerProjectDisabled }}
            testID="current-project-open-newer"
          >
            <Text style={styles.inlineActionText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Open</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionGrid}>
        <SectionAction label="Save" onPress={onSave} disabled={saveDisabled} testID="current-project-save" fullWidth={useSingleColumnActions} />
        <SectionAction label="Save as New Project" onPress={onSaveAsNewProject} disabled={saveAsNewDisabled} testID="current-project-save-as-new" fullWidth={useSingleColumnActions} />
        <SectionAction label="Import CSV" onPress={onImportCsv} disabled={importCsvDisabled} testID="current-project-import-csv" fullWidth={useSingleColumnActions} />
        <SectionAction label="Export CSV" onPress={onExportCsv} disabled={exportCsvDisabled} testID="current-project-export-csv" fullWidth={useSingleColumnActions} />
      </View>

      <View style={styles.contextActions}>
        <SectionAction
          label="Revert to Saved"
          onPress={onRevertToSaved}
          disabled={revertDisabled}
          testID="current-project-revert"
          emphasis="secondary"
          fullWidth={useSingleColumnActions}
        />
        {showUndoCsvImport && (
          <SectionAction
            label="Undo CSV Import"
            onPress={onUndoCsvImport}
            disabled={undoCsvImportDisabled}
            testID="current-project-undo-csv"
            emphasis="secondary"
            fullWidth={useSingleColumnActions}
          />
        )}
      </View>
    </View>
  );
};

export default React.memo(CurrentProjectSection);
