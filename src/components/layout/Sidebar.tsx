import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStudioStore } from '../../hooks/useStudioStore';
import StemSelector from '../ui/controls/StemSelector';
import LayerControls from '../ui/controls/LayerControls';
import SidebarToggle from '../ui/controls/SidebarToggle';
import ViewModeToggle from './ViewModeToggle';
import BpmControl from '../ui/controls/BpmControl';
import CanvasOptionsToggle from '../ui/controls/CanvasOptionsToggle';
import MarkerOptionsToggle from '../ui/controls/MarkerOptionsToggle';

import HelpButton from '../ui/controls/HelpButton';
import { sidebarStyles as styles } from '../../styles/layout/sidebar';

const Sidebar: React.FC = () => {
  const { isSidebarCollapsed } = useStudioStore();

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isSidebarCollapsed ? 60 : 280, { duration: 300 }),
    height: '100%',
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
          showsVerticalScrollIndicator={true}
          indicatorStyle="default"
        >
          <View style={styles.sidebarSection}>
            <HelpButton />
          </View>
          <View style={styles.sidebarSection}>
            <ViewModeToggle />
          </View>
          <View style={styles.sidebarSection}>
            <StemSelector />
          </View>
          <View style={styles.sidebarSection}>
            <BpmControl />
          </View>
          <View style={styles.sidebarSection}>
            <CanvasOptionsToggle />
          </View>
          <View style={styles.sidebarSection}>
            <MarkerOptionsToggle />
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};



export default Sidebar;