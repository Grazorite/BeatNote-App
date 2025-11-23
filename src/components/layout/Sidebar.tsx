import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStudioStore } from '../../hooks/useStudioStore';
import StemSelector from '../ui/StemSelector';
import LayerControls from '../ui/LayerControls';
import SidebarToggle from '../ui/SidebarToggle';

const Sidebar: React.FC = () => {
  const { isSidebarCollapsed } = useStudioStore();

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isSidebarCollapsed ? 60 : 280, { duration: 300 }),
  }));

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isSidebarCollapsed ? 0 : 1, { duration: isSidebarCollapsed ? 150 : 300 }),
  }));

  return (
    <Animated.View style={[styles.sidebar, animatedStyle]}>
      <SidebarToggle />
      <Animated.View style={[styles.contentContainer, contentOpacity]}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sidebarTitle}>Controls</Text>
          <View style={styles.sidebarSection}>
            <StemSelector />
          </View>
          <View style={styles.sidebarSection}>
            <LayerControls />
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#111111',
    borderRightWidth: 1,
    borderRightColor: '#333333',
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    flexGrow: 1,
  },
  sidebarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sidebarSection: {
    marginBottom: 20,
  },
});

export default Sidebar;