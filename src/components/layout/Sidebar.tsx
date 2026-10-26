import React, { useEffect } from 'react';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudioStore } from '../../hooks/useStudioStore';
import StemSelector from '../ui/controls/StemSelector';
import SidebarToggle from '../ui/controls/SidebarToggle';
import ViewModeToggle from './ViewModeToggle';
import { STEM_SEPARATION_UI_ENABLED } from '../../features/stemSeparation/featureFlags';

import HelpButton from '../ui/controls/HelpButton';
import BpmControl from '../ui/controls/BpmControl';
import CountSizeControl from '../ui/controls/CountSizeControl';
import LayerNameSettings from '../ui/controls/LayerNameSettings';
import HelpScreen from '../ui/screens/HelpScreen';
import { sidebarStyles as styles } from '../../styles/layout/sidebar';
import GlassBackdrop from '../ui/controls/GlassBackdrop';

const Sidebar: React.FC = () => {
  const isSidebarCollapsed = useStudioStore(state => state.isSidebarCollapsed);
  const toggleSidebar = useStudioStore(state => state.toggleSidebar);
  const showHelpScreen = useStudioStore(state => state.showHelpScreen);
  const setShowHelpScreen = useStudioStore(state => state.setShowHelpScreen);
  const insets = useSafeAreaInsets();
  const screenData = useWindowDimensions();
  
  const isMobile = Platform.OS === 'web'
    ? screenData.width < 768
    : Math.min(screenData.width, screenData.height) < 768;
  const pageWidth = Math.max(screenData.width, 1);
  const mobileTransition = { duration: 280, easing: Easing.out(Easing.cubic) };
  const settingsEntryX = useSharedValue(pageWidth);
  const helpProgress = useSharedValue(showHelpScreen ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSidebarCollapsed ? 60 : 280, { duration: 300 }),
    };
  });

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isSidebarCollapsed ? 0 : 1, { duration: isSidebarCollapsed ? 150 : 300 }),
  }));

  useEffect(() => {
    if (!isMobile) return;
    settingsEntryX.value = isSidebarCollapsed
      ? pageWidth
      : withTiming(0, mobileTransition);
  }, [isMobile, isSidebarCollapsed, pageWidth, settingsEntryX]);

  useEffect(() => {
    if (!isMobile) return;
    helpProgress.value = withTiming(showHelpScreen ? 1 : 0, mobileTransition);
  }, [helpProgress, isMobile, showHelpScreen]);

  const mobileEntryStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsEntryX.value }],
  }));

  const settingsStackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(helpProgress.value, [0, 1], [0, -pageWidth * 0.25]) }],
  }));

  const helpStackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(helpProgress.value, [0, 1], [pageWidth, 0]) }],
  }));

  const closeMobileSettings = () => {
    settingsEntryX.value = withTiming(pageWidth, mobileTransition, finished => {
      if (finished) runOnJS(toggleSidebar)();
    });
  };

  if (isMobile) {
    return (
      <Modal
        visible={!isSidebarCollapsed}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={() => showHelpScreen ? setShowHelpScreen(false) : closeMobileSettings()}
      >
        <Animated.View style={[styles.settingsPage, mobileEntryStyle]} testID="settings-page">
          <Animated.View
            style={[styles.mobileStackPage, settingsStackStyle]}
            pointerEvents={showHelpScreen ? 'none' : 'auto'}
            accessibilityElementsHidden={showHelpScreen}
            importantForAccessibility={showHelpScreen ? 'no-hide-descendants' : 'auto'}
          >
            <GlassBackdrop
              gradientId="settings-glass-mobile"
              radius={0}
              testID="settings-glass"
            />
            <View
              style={[
                styles.mobileSafeArea,
                {
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                  paddingLeft: insets.left,
                  paddingRight: insets.right,
                },
              ]}
            >
              <View style={styles.mobileHeader}>
                <Text style={styles.mobileTitle}>Settings</Text>
                <TouchableOpacity
                  style={styles.mobileCloseButton}
                  onPress={closeMobileSettings}
                  accessibilityRole="button"
                  accessibilityLabel="Close settings"
                  testID="sidebar-toggle"
                >
                  <Text style={styles.mobileCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.mobileScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>Timing</Text>
                <View style={styles.sidebarSection}>
                  <BpmControl />
                  <CountSizeControl />
                </View>
                <Text style={styles.sectionLabel}>Layer names</Text>
                <View style={styles.sidebarSection}>
                  <LayerNameSettings />
                </View>
                <Text style={styles.sectionLabel}>Support</Text>
                <View style={styles.sidebarSection}>
                  <HelpButton />
                </View>
              </ScrollView>
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.mobileStackPage, helpStackStyle]}
            pointerEvents={showHelpScreen ? 'auto' : 'none'}
            accessibilityElementsHidden={!showHelpScreen}
            importantForAccessibility={showHelpScreen ? 'auto' : 'no-hide-descendants'}
          >
            <HelpScreen
              visible
              embedded
              onClose={() => setShowHelpScreen(false)}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Animated.View
      style={[
        styles.sidebar,
        { top: insets.top, bottom: insets.bottom },
        animatedStyle,
      ]}
    >
      <GlassBackdrop
        gradientId="settings-glass-desktop"
        radius={20}
        testID="settings-glass"
      />
      <SidebarToggle />
      <Animated.View style={[styles.contentContainer, contentOpacity]}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="default"
        >
          <Text style={styles.sectionLabel}>Timing</Text>
          <View style={styles.sidebarSection}>
            <BpmControl />
            <CountSizeControl />
          </View>
          <Text style={styles.sectionLabel}>Layer names</Text>
          <View style={styles.sidebarSection}>
            <LayerNameSettings />
          </View>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.sidebarSection}>
            <HelpButton />
          </View>
          {STEM_SEPARATION_UI_ENABLED && (
            <>
              <View style={styles.sidebarSection}><ViewModeToggle /></View>
              <View style={styles.sidebarSection}><StemSelector /></View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};



export default Sidebar;
