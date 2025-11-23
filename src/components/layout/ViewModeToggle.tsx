import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';

const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStudioStore();

  return (
    <View style={styles.viewModeToggle}>
      <TouchableOpacity 
        style={[styles.toggleButton, viewMode === 'unified' && styles.activeToggle]}
        onPress={() => setViewMode('unified')}
      >
        <Text style={styles.toggleText}>Unified</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.toggleButton, viewMode === 'multitrack' && styles.activeToggle]}
        onPress={() => setViewMode('multitrack')}
      >
        <Text style={styles.toggleText}>Multitrack</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewModeToggle: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#ff6600',
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ViewModeToggle;