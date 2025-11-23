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
    top: 15,
    right: 5,
    width: 30,
    height: 30,
    backgroundColor: '#333333',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SidebarToggle;