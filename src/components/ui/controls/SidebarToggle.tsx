import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { BeatNoteIcon } from '../../icons';

const SidebarToggle: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useStudioStore();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isSidebarCollapsed ? '180deg' : '0deg', { duration: 200 }) }],
  }));

  return (
    <View style={styles.header}>
      {!isSidebarCollapsed && (
        <Text style={styles.title}>BeatNote Studio</Text>
      )}
      <TouchableOpacity style={styles.toggle} onPress={toggleSidebar} testID="sidebar-toggle">
        <Animated.View style={animatedStyle}>
          <BeatNoteIcon name="chevron-left" size={16} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggle: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default SidebarToggle;
