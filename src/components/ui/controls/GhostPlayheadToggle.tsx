import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';

const GhostPlayheadToggle: React.FC = () => {
  const { showGhostInTimeline, setShowGhostInTimeline } = useStudioStore();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
        Ghost Playhead
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: showGhostInTimeline ? colors.accent : colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: showGhostInTimeline ? colors.accent : colors.border,
        }}
        onPress={() => setShowGhostInTimeline(!showGhostInTimeline)}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: showGhostInTimeline ? colors.background : 'transparent',
            borderWidth: 2,
            borderColor: showGhostInTimeline ? colors.background : colors.textSecondary,
            marginRight: 8,
          }}
        />
        <Text style={{ color: showGhostInTimeline ? colors.background : colors.text, fontSize: 12 }}>
          Show in Timeline
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GhostPlayheadToggle;