import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { ProjectManager } from '../../../utils/projectManager';
import { ProjectListItem } from '../../../types/project';
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
    return new Date(isoString).toLocaleDateString();
  }, []);

  const renderProject = useCallback(({ item }: { item: ProjectListItem }) => (
    <View style={{
      backgroundColor: colors.surface,
      padding: 16,
      marginBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {editingProject === item.filename ? (
        <View>
          <TextInput
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              padding: 8,
              borderRadius: 4,
              marginBottom: 8,
            }}
            value={newName}
            onChangeText={setNewName}
            placeholder="Project name"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                padding: 8,
                borderRadius: 4,
                flex: 1,
              }}
              onPress={() => handleRename(item.filename)}
            >
              <Text style={{ color: colors.background, textAlign: 'center' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors.border,
                padding: 8,
                borderRadius: 4,
                flex: 1,
              }}
              onPress={() => {
                setEditingProject(null);
                setNewName('');
              }}
            >
              <Text style={{ color: colors.text, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
            {item.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
            {formatDuration(item.duration)} • {item.stemCount} stems • {formatDate(item.modifiedAt)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                padding: 8,
                borderRadius: 4,
                flex: 1,
              }}
              onPress={() => {
                onLoadProject(item.filename);
                onClose();
              }}
            >
              <Text style={{ color: colors.background, textAlign: 'center' }}>Load</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors.border,
                padding: 8,
                borderRadius: 4,
              }}
              onPress={() => {
                setEditingProject(item.filename);
                setNewName(item.name);
              }}
            >
              <Text style={{ color: colors.text }}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#ff4444',
                padding: 8,
                borderRadius: 4,
              }}
              onPress={() => handleDelete(item.filename, item.name)}
            >
              <Text style={{ color: '#ffffff' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ), [editingProject, newName, handleRename, handleDelete, onLoadProject, onClose, formatDuration, formatDate]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
            Project Manager
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          {loading ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Loading projects...
            </Text>
          ) : projects.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              No saved projects found
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