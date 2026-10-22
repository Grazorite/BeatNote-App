import React, { useMemo, useRef, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { projectRowStyles as styles } from '../../../styles/components/projects/projectRow';
import { colors } from '../../../styles/common';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { BeatNoteIcon } from '../../icons';
import {
  handleOverflowAccessibilityAction,
  OverflowMenu,
  overflowAccessibilityActions,
  type OverflowMenuAction,
} from '../common';
import ConfirmDialog from '../modals/ConfirmDialog';

export interface ProjectRowProject {
  projectId: string;
  name: string;
  markerCount: number;
  modifiedAt: string;
  readOnly: boolean;
}

export type ProjectRowAction = (returnFocusRef?: React.RefObject<unknown>) => void;

export interface ProjectRowProps {
  project: ProjectRowProject;
  /** Supply only for rows rendered in All Projects. */
  displayTitle?: string | null;
  audioMissing?: boolean;
  disabled?: boolean;
  openDisabled?: boolean;
  renameDisabled?: boolean;
  exportDisabled?: boolean;
  deleteDisabled?: boolean;
  onOpen: ProjectRowAction;
  onRename: ProjectRowAction;
  onExport: ProjectRowAction;
  onDelete: ProjectRowAction;
}

const formatModifiedTime = (modifiedAt: string): string => {
  const date = new Date(modifiedAt);
  if (!Number.isFinite(date.getTime())) return modifiedAt;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const markerLabel = (count: number): string => `${count} ${count === 1 ? 'marker' : 'markers'}`;

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  displayTitle = null,
  audioMissing = false,
  disabled = false,
  openDisabled = false,
  renameDisabled = false,
  exportDisabled = false,
  deleteDisabled = false,
  onOpen,
  onRename,
  onExport,
  onDelete,
}) => {
  const { fontScale } = useWindowDimensions();
  const copyRef = useRef<View>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteReturnFocusRef, setDeleteReturnFocusRef] = useState<React.RefObject<unknown>>();
  const modified = formatModifiedTime(project.modifiedAt);
  const markers = markerLabel(project.markerCount);

  const actions = useMemo<OverflowMenuAction[]>(() => [
    {
      name: 'open',
      label: 'Open',
      onPress: returnFocusRef => onOpen(returnFocusRef ?? copyRef),
      disabled: disabled || openDisabled,
      testID: `project-open-${project.projectId}`,
    },
    {
      name: 'rename',
      label: 'Rename',
      onPress: returnFocusRef => onRename(returnFocusRef ?? copyRef),
      disabled: disabled || project.readOnly || renameDisabled,
      testID: `project-rename-${project.projectId}`,
    },
    {
      name: 'export',
      label: 'Export CSV',
      onPress: returnFocusRef => onExport(returnFocusRef ?? copyRef),
      disabled: disabled || exportDisabled,
      testID: `project-export-${project.projectId}`,
    },
    {
      name: 'delete',
      label: 'Delete',
      onPress: returnFocusRef => {
        setDeleteReturnFocusRef(returnFocusRef ?? copyRef);
        setDeleteVisible(true);
      },
      disabled: disabled || deleteDisabled,
      destructive: true,
      testID: `project-delete-${project.projectId}`,
    },
  ], [
    deleteDisabled,
    disabled,
    exportDisabled,
    onExport,
    onOpen,
    onRename,
    openDisabled,
    project.projectId,
    project.readOnly,
    renameDisabled,
  ]);

  const accessibilityLabel = [
    project.name,
    displayTitle,
    markers,
    `Modified ${modified}`,
    audioMissing ? 'Audio missing' : null,
    project.readOnly ? 'Read-only, newer version' : null,
  ].filter(Boolean).join(', ');

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      testID={`project-row-${project.projectId}`}
    >
      <View
        ref={copyRef}
        style={styles.copy}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
        accessibilityActions={disabled ? undefined : overflowAccessibilityActions(actions)}
        onAccessibilityAction={event => handleOverflowAccessibilityAction(event, actions)}
      >
        <Text
          style={styles.name}
          numberOfLines={fontScale > 1 ? 2 : 1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={MAX_TEXT_SCALE}
        >
          {project.name}
        </Text>
        {displayTitle !== null && (
          <Text
            style={styles.displayTitle}
            numberOfLines={fontScale > 1 ? 2 : 1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
          >
            {displayTitle}
          </Text>
        )}
        <Text style={styles.metadata} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
          {markers} · Modified {modified}
        </Text>
        {(audioMissing || project.readOnly) && (
          <View style={styles.states} accessible={false}>
            {audioMissing && (
              <View style={styles.state}>
                <BeatNoteIcon name="missing-audio" size={18} color={colors.iconDestructive} />
                <Text style={styles.missing} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
                  Audio missing
                </Text>
              </View>
            )}
            {project.readOnly && (
              <View style={styles.state}>
                <BeatNoteIcon name="warning" size={18} color={colors.textSecondary} />
                <Text style={styles.readOnly} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
                  Read-only (newer version)
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <OverflowMenu
        actions={actions}
        accessibilityLabel={`More actions for ${project.name}`}
        disabled={disabled}
        testID={`project-overflow-${project.projectId}`}
      />
      <ConfirmDialog
        visible={deleteVisible}
        title="Delete Project?"
        message={`Delete “${project.name}”? This cannot be undone.`}
        actions={[{
          label: 'Delete',
          destructive: true,
          testID: `project-delete-confirm-${project.projectId}`,
          onPress: () => {
            setDeleteVisible(false);
            onDelete(deleteReturnFocusRef ?? copyRef);
          },
        }]}
        onCancel={() => setDeleteVisible(false)}
        returnFocusRef={deleteReturnFocusRef ?? copyRef}
        testID={`project-delete-dialog-${project.projectId}`}
      />
    </View>
  );
};

export default React.memo(ProjectRow);
