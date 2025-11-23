import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStudioStore } from '../../../hooks/useStudioStore';

const SidebarToggle: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useStudioStore();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isSidebarCollapsed ? '180deg' : '0deg', { duration: 200 }) }],
  }));

  return (
    <TouchableOpacity style={styles.toggle} onPress={toggleSidebar}>
      <Animated.Text style={[styles.arrow, animatedStyle]}>‹</Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    top: 20,
    right: 15,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  arrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -1,
  },
});

export default SidebarToggle;