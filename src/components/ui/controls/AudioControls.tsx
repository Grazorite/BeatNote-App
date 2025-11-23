import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { audioControlsStyles as styles } from '../../../styles/components/controls/audioControls';
import ProjectManagerModal from '../modals/ProjectManagerModal';
import SaveProjectModal from '../modals/SaveProjectModal';

interface AudioControlsProps {
  onLoadSong: () => void;
  onTogglePlayback: () => void;
  hasSound: boolean;
  audioUri: string | null;
  audioFilename: string | null;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  onLoadSong,
  onTogglePlayback,
  hasSound,
  audioUri,
  audioFilename,
}) => {
  const { isPlaying, songLoaded, saveProject, loadProject } = useStudioStore();
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSaveProject = useCallback(async (projectName: string) => {
    if (!audioUri || !audioFilename) {
      Alert.alert('Error', 'No audio file loaded');
      return;
    }
    
    try {
      await saveProject(projectName, audioUri, audioFilename);
      setShowSaveModal(false);
      Alert.alert('Success', 'Project saved successfully!\nAccess it via "Load Project"');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save project');
    }
  }, [audioUri, audioFilename, saveProject]);

  const handleLoadProject = useCallback(async (filename: string) => {
    try {
      await loadProject(filename);
      Alert.alert('Success', 'Project loaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [loadProject]);

  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={[styles.button, songLoaded && styles.buttonLoaded]} 
        onPress={onLoadSong}
      >
        <Text style={styles.buttonText}>
          {songLoaded ? '♪ Song Loaded' : 'Load Song'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, !songLoaded && styles.buttonDisabled]} 
        onPress={songLoaded ? () => setShowSaveModal(true) : undefined}
        disabled={!songLoaded}
      >
        <Text style={styles.buttonText}>Save Project</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setShowProjectManager(true)}
      >
        <Text style={styles.buttonText}>Load Project</Text>
      </TouchableOpacity>

      <SaveProjectModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProject}
      />

      <ProjectManagerModal
        visible={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        onLoadProject={handleLoadProject}
      />
    </View>
  );
};



export default AudioControls;