import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, TextInput, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProjectManager } from '../../../utils/projectManager';
import { ProjectListItem } from '../../../types/project';
import { projectManagerModalStyles as styles } from '../../../styles/components/modals/projectManagerModal';
import GlassBackdrop from '../controls/GlassBackdrop';
import { colors } from '../../../styles/common';

interface ProjectManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadProject: (filename: string) => void;
}

const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  visible,
  onClose,
  onLoadProject,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projectList = await ProjectManager.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadProjects();
    }
  }, [visible, loadProjects]);

  const handleDelete = useCallback((filename: string, name: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProjectManager.deleteProject(filename);
              loadProjects();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  }, [loadProjects]);

  const handleRename = useCallback(async (filename: string) => {
    if (!newName.trim()) return;
    
    try {
      await ProjectManager.renameProject(filename, newName.trim());
      setEditingProject(null);
      setNewName('');
      loadProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to rename project');
    }
  }, [newName, loadProjects]);

  const formatDuration = useCallback((ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  const renderProject = useCallback(({ item }: { item: ProjectListItem }) => (
    <View style={styles.projectItem}>
      {editingProject === item.filename ? (
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
              onPress={() => handleRename(item.filename)}
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
          <Text style={styles.projectName}>
            {item.name}
          </Text>
          <Text style={styles.projectInfo}>
            {formatDuration(item.duration)} • {item.markerCount} marker{item.markerCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.projectDate}>
            Modified: {formatDate(item.modifiedAt)}
          </Text>
          <View style={styles.projectActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.loadButton]}
              onPress={() => {
                onLoadProject(item.filename);
                onClose();
              }}
              testID={`load-saved-project-${item.name}`}
            >
              <Text style={styles.actionButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.renameButton]}
              onPress={() => {
                setEditingProject(item.filename);
                setNewName(item.name);
              }}
            >
              <Text style={styles.actionButtonText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.filename, item.name)}
              testID={`delete-saved-project-${item.name}`}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [editingProject, newName, handleRename, handleDelete, onLoadProject, onClose, formatDuration, formatDate]);

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
          <Text style={styles.title}>
            Projects
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
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
          {loading ? (
            <Text style={styles.loadingText}>
              Loading projects...
            </Text>
          ) : projects.length === 0 ? (
            <Text style={styles.emptyText}>
              No saved projects yet
            </Text>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.filename}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProjectManagerModal;
