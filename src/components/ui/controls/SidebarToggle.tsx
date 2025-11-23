import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useStudioStore } from '../../../hooks/useStudioStore';

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
      <TouchableOpacity style={styles.toggle} onPress={toggleSidebar}>
        <Animated.View style={animatedStyle}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              fill="#ffffff"
            />
          </Svg>
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