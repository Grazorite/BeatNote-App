import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudioStore } from '../../../hooks/useStudioStore';
import type { SavedProjectSummary } from '../../../types/project';
import { deleteProject, renameProject } from '../../../features/library/projectService';
import { projectManagerModalStyles as styles } from '../../../styles/components/modals/projectManagerModal';
import { colors } from '../../../styles/common';
import GlassBackdrop from '../controls/GlassBackdrop';

interface ProjectManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenProject: (projectId: string) => Promise<boolean>;
}

const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  visible,
  onClose,
  onOpenProject,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const projectSummaries = useStudioStore(state => state.projectSummaries);
  const projects = useMemo(() => Object.values(projectSummaries).sort((left, right) => (
    right.modifiedAt.localeCompare(left.modifiedAt)
      || right.revision - left.revision
      || left.projectId.localeCompare(right.projectId)
  )), [projectSummaries]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleDelete = useCallback((projectId: string, name: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteProject(projectId).catch(() => {
              Alert.alert('Error', 'Failed to delete project');
            });
          },
        },
      ],
    );
  }, []);

  const handleRename = useCallback(async (projectId: string) => {
    const result = await renameProject(projectId, newName);
    if (result.kind === 'renamed') {
      setEditingProject(null);
      setNewName('');
      return;
    }
    if (result.kind === 'nameConflict') {
      setNewName(result.suggestion);
      Alert.alert('Name Already Used', 'A project with this name already exists for this song.');
      return;
    }
    if (result.kind === 'invalidName') {
      Alert.alert('Invalid Project Name', result.error);
      return;
    }
    Alert.alert('Error', 'Failed to rename project');
  }, [newName]);

  const formatDate = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, []);

  const renderProject = useCallback(({ item }: { item: SavedProjectSummary }) => (
    <View style={styles.projectItem}>
      {editingProject === item.projectId ? (
        <View>
          <TextInput
            style={styles.editInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Project name"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => { void handleRename(item.projectId); }}
            >
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditingProject(null);
                setNewName('');
              }}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.projectInfo}>
            {item.markerCount} marker{item.markerCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.projectDate}>Modified: {formatDate(item.modifiedAt)}</Text>
          <View style={styles.projectActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.loadButton]}
              onPress={() => {
                void onOpenProject(item.projectId).then(opened => {
                  if (opened) onClose();
                });
              }}
              testID={`load-saved-project-${item.name}`}
            >
              <Text style={styles.actionButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.renameButton]}
              disabled={item.readOnly}
              onPress={() => {
                setEditingProject(item.projectId);
                setNewName(item.name);
              }}
            >
              <Text style={styles.actionButtonText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.projectId, item.name)}
              testID={`delete-saved-project-${item.name}`}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [editingProject, formatDate, handleDelete, handleRename, newName, onClose, onOpenProject]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <GlassBackdrop gradientId="projects-modal-glass" radius={0} testID="projects-modal-glass" />
        <View style={[
          styles.header,
          isLandscape && {
            paddingLeft: Math.max(20, insets.left + 12),
            paddingRight: Math.max(20, insets.right + 12),
          },
        ]}>
          <Text style={styles.title}>Projects</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.content,
          isLandscape && {
            paddingLeft: Math.max(20, insets.left + 12),
            paddingRight: Math.max(20, insets.right + 12),
          },
        ]}>
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No saved projects yet</Text>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={item => item.projectId}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProjectManagerModal;
