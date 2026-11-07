import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useMotionPreference } from '../../animations/MotionPreference';
import { pageTransition } from '../../animations/motion';
import { useStudioStore } from '../../hooks/useStudioStore';
import StemSelector from '../ui/controls/StemSelector';
import SidebarToggle from '../ui/controls/SidebarToggle';
import ViewModeToggle from './ViewModeToggle';
import { STEM_SEPARATION_UI_ENABLED } from '../../features/stemSeparation/featureFlags';

import DebugTierControl from '../ui/controls/DebugTierControl';
import { useProductCapability } from '../../features/entitlements/useProductCapability';
import HelpScreen from '../ui/screens/HelpScreen';
import AboutSettingsScreen from '../ui/screens/AboutSettingsScreen';
import BpmSettingsScreen from '../ui/screens/BpmSettingsScreen';
import PlaybackSettingsScreen from '../ui/screens/PlaybackSettingsScreen';
import ButtonConfigurationScreen from '../ui/screens/ButtonConfigurationScreen';
import DataManagementScreen from '../ui/screens/DataManagementScreen';
import ProSettingsScreen from '../ui/screens/ProSettingsScreen';
import DisplaySettingsScreen from '../ui/screens/DisplaySettingsScreen';
import SettingsNavigationRow from '../ui/settings/SettingsNavigationRow';
import { sidebarStyles as styles } from '../../styles/layout/sidebar';
import { colors } from '../../styles/common';
import GlassBackdrop from '../ui/controls/GlassBackdrop';
import OutwardSparkle from '../ui/common/OutwardSparkle';
import AppModal from '../ui/common/AppModal';
import HeaderBackButton from '../ui/common/HeaderBackButton';
import { BeatNoteIcon } from '../icons';

type SettingsDetail = 'display' | 'playback' | 'buttons' | 'bpm' | 'data' | 'pro' | 'about' | 'licences' | null;

const useEdgeSwipeBack = (onBack: () => void) => {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  return useMemo(() => PanResponder.create({
    // This responder is mounted on a dedicated 28-point leading-edge strip. Claim immediately so
    // nested ScrollViews cannot take the gesture before horizontal intent becomes measurable.
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (_event, gesture) => {
      if (
        (gesture.dx >= 64 || gesture.vx >= 0.5)
        && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
      ) onBackRef.current();
    },
    onPanResponderTerminationRequest: () => false,
  }).panHandlers, []);
};

interface SettingsRootSectionsProps {
  bpmAvailable: boolean;
  displayAvailable: boolean;
  showProRow?: boolean;
  onOpenDisplay: () => void;
  onOpenPlayback: () => void;
  onOpenButtons: () => void;
  onOpenBpm: () => void;
  onOpenData: () => void;
  onOpenPro: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
}

const SettingsRootSections: React.FC<SettingsRootSectionsProps> = ({
  bpmAvailable,
  displayAvailable,
  showProRow = true,
  onOpenDisplay,
  onOpenPlayback,
  onOpenButtons,
  onOpenBpm,
  onOpenData,
  onOpenPro,
  onOpenHelp,
  onOpenAbout,
}) => (
  <>
    <View style={styles.sidebarSection}>
      <DebugTierControl />
    </View>
    <View style={[styles.sidebarSection, styles.navigationRows]}>
      <SettingsNavigationRow
        label="Playback Settings"
        onPress={onOpenPlayback}
        testID="settings-playback"
      />
      <SettingsNavigationRow
        label="Button Configurations"
        onPress={onOpenButtons}
        testID="settings-buttons"
      />
      <SettingsNavigationRow
        label="Display & Annotations"
        detail={displayAvailable ? undefined : 'Pro only'}
        disabled={!displayAvailable}
        onPress={onOpenDisplay}
        testID="settings-display"
      />
      <SettingsNavigationRow
        label="Timing & BPM"
        detail={bpmAvailable ? undefined : 'Pro only'}
        onPress={onOpenBpm}
        disabled={!bpmAvailable}
        testID="settings-bpm-entry"
      />
      <SettingsNavigationRow
        label="Data Management"
        onPress={onOpenData}
        testID="settings-data"
      />
      {showProRow ? (
        <SettingsNavigationRow
          label="BeatNote Pro"
          onPress={onOpenPro}
          testID="settings-pro"
        />
      ) : null}
      <SettingsNavigationRow
        label="Help & Support"
        onPress={onOpenHelp}
        testID="settings-help"
      />
      <SettingsNavigationRow
        label="About BeatNote"
        onPress={onOpenAbout}
        testID="settings-about"
      />
    </View>
  </>
);

const Sidebar: React.FC = () => {
  const isSidebarCollapsed = useStudioStore(state => state.isSidebarCollapsed);
  const toggleSidebar = useStudioStore(state => state.toggleSidebar);
  const showHelpScreen = useStudioStore(state => state.showHelpScreen);
  const setShowHelpScreen = useStudioStore(state => state.setShowHelpScreen);
  const bpmAvailable = useProductCapability('analysis.bpm');
  const displayAvailable = useProductCapability('waveform.display');
  const directTiming = useStudioStore(state => state.timingShortcutOpen) && bpmAvailable;
  const [settingsDetail, setActiveDetail] = useState<SettingsDetail>(null);
  const activeDetail = directTiming ? 'bpm' : settingsDetail;
  const insets = useAppSafeAreaInsets();
  const screenData = useWindowDimensions();
  
  const isMobile = Platform.OS !== 'web' || screenData.width < 768;
  const pageWidth = Math.max(screenData.width, 1);
  const settingsEntryX = useSharedValue(pageWidth);
  const detailVisible = showHelpScreen || activeDetail !== null;
  const detailProgress = useSharedValue(detailVisible ? 1 : 0);
  const reduceMotion = useMotionPreference();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSidebarCollapsed ? 60 : 280, pageTransition),
    };
  });

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isSidebarCollapsed ? 0 : 1, { duration: isSidebarCollapsed ? 150 : 300 }),
  }));

  useEffect(() => {
    if (!isMobile) return;
    settingsEntryX.value = isSidebarCollapsed
      ? pageWidth
      : withTiming(0, pageTransition);
  }, [isMobile, isSidebarCollapsed, pageWidth, settingsEntryX]);

  useEffect(() => {
    if (!isMobile) return;
    detailProgress.value = withTiming(detailVisible ? 1 : 0, pageTransition);
  }, [detailProgress, detailVisible, isMobile]);

  useEffect(() => {
    if ((!bpmAvailable && activeDetail === 'bpm') || (!displayAvailable && activeDetail === 'display')) {
      setActiveDetail(null);
    }
  }, [activeDetail, bpmAvailable, displayAvailable]);

  const mobileEntryStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsEntryX.value }],
  }));

  const settingsStackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(detailProgress.value, [0, 1], [0, -pageWidth * 0.25]) }],
  }));

  const helpStackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(detailProgress.value, [0, 1], [pageWidth, 0]) }],
  }));

  const closeMobileSettings = () => {
    setActiveDetail(null);
    setShowHelpScreen(false);
    settingsEntryX.value = withTiming(pageWidth, pageTransition, finished => {
      if (finished) runOnJS(toggleSidebar)();
    });
  };

  const goBack = () => {
    if (showHelpScreen) {
      setShowHelpScreen(false);
    } else if (activeDetail === 'licences') {
      setActiveDetail('about');
    } else if (activeDetail !== null && !directTiming) {
      setActiveDetail(null);
    } else if (isMobile) {
      closeMobileSettings();
    } else {
      toggleSidebar();
    }
  };
  const edgeSwipeHandlers = useEdgeSwipeBack(goBack);
  const aboutPage = (activeDetail === 'about' || activeDetail === 'licences') && (
    <AboutSettingsScreen
      showLicences={activeDetail === 'licences'}
      onOpenLicences={() => setActiveDetail('licences')}
      onBack={goBack}
    />
  );
  if (isMobile) {
    return (
      <AppModal
        visible={!isSidebarCollapsed}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={goBack}
      >
        <Animated.View style={[styles.settingsPage, mobileEntryStyle]} testID="settings-page">
          <Animated.View
            style={[styles.mobileStackPage, settingsStackStyle]}
            pointerEvents={detailVisible ? 'none' : 'auto'}
            accessibilityElementsHidden={detailVisible}
            importantForAccessibility={detailVisible ? 'no-hide-descendants' : 'auto'}
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
                <HeaderBackButton
                  onPress={goBack}
                  accessibilityLabel="Back to editor from Settings"
                  label="Back"
                  testID="sidebar-toggle"
                />
                <Text style={styles.mobileTitle} testID="settings-title">Settings</Text>
                <View style={styles.mobileProSlot}>
                  <TouchableOpacity
                    style={styles.mobileProButton}
                    onPress={() => setActiveDetail('pro')}
                    accessibilityRole="button"
                    accessibilityLabel="Open BeatNote Pro"
                    testID="settings-pro"
                  >
                    <BeatNoteIcon name="pro" size={14} color={colors.onAccent} />
                    <Text style={styles.mobileProText}>Pro</Text>
                  </TouchableOpacity>
                  {reduceMotion === false && !isSidebarCollapsed && !detailVisible && (
                    <OutwardSparkle size={12} halfWidth={27} halfHeight={17} travel={8} repeatEveryMs={1800} style={styles.proSparkle} />
                  )}
                </View>
              </View>
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.mobileScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <SettingsRootSections
                  displayAvailable={displayAvailable}
                  bpmAvailable={bpmAvailable}
                  showProRow={false}
                  onOpenDisplay={() => setActiveDetail('display')}
                  onOpenPlayback={() => setActiveDetail('playback')}
                  onOpenButtons={() => setActiveDetail('buttons')}
                  onOpenBpm={() => setActiveDetail('bpm')}
                  onOpenData={() => setActiveDetail('data')}
                  onOpenPro={() => setActiveDetail('pro')}
                  onOpenHelp={() => setShowHelpScreen(true)}
                  onOpenAbout={() => setActiveDetail('about')}
                />
              </ScrollView>
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.mobileStackPage, helpStackStyle]}
            pointerEvents={detailVisible ? 'auto' : 'none'}
            accessibilityElementsHidden={!detailVisible}
            importantForAccessibility={detailVisible ? 'auto' : 'no-hide-descendants'}
          >
            {showHelpScreen && (
              <HelpScreen visible embedded onClose={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'bpm' && (
              <BpmSettingsScreen backLabel={directTiming ? 'Editor' : 'Settings'} onBack={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'display' && (
              <DisplaySettingsScreen onBack={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'playback' && (
              <PlaybackSettingsScreen onBack={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'buttons' && (
              <ButtonConfigurationScreen onBack={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'data' && (
              <DataManagementScreen onBack={goBack} />
            )}
            {!showHelpScreen && activeDetail === 'pro' && (
              <ProSettingsScreen onBack={goBack} />
            )}
            {!showHelpScreen && aboutPage}
          </Animated.View>
          <View
            {...edgeSwipeHandlers}
            style={styles.edgeSwipeCapture}
            pointerEvents="box-only"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID="settings-edge-swipe"
          />
        </Animated.View>
      </AppModal>
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
        {showHelpScreen ? (
          <HelpScreen visible embedded onClose={goBack} />
        ) : activeDetail === 'display' ? (
          <DisplaySettingsScreen onBack={goBack} />
        ) : activeDetail === 'bpm' ? (
          <BpmSettingsScreen backLabel={directTiming ? 'Editor' : 'Settings'} onBack={goBack} />
        ) : activeDetail === 'playback' ? (
          <PlaybackSettingsScreen onBack={goBack} />
        ) : activeDetail === 'buttons' ? (
          <ButtonConfigurationScreen onBack={goBack} />
        ) : activeDetail === 'data' ? (
          <DataManagementScreen onBack={goBack} />
        ) : activeDetail === 'pro' ? (
          <ProSettingsScreen onBack={goBack} />
        ) : aboutPage || (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="default"
          >
            <SettingsRootSections
              displayAvailable={displayAvailable}
              bpmAvailable={bpmAvailable}
              onOpenDisplay={() => setActiveDetail('display')}
              onOpenPlayback={() => setActiveDetail('playback')}
              onOpenButtons={() => setActiveDetail('buttons')}
              onOpenBpm={() => setActiveDetail('bpm')}
              onOpenData={() => setActiveDetail('data')}
              onOpenPro={() => setActiveDetail('pro')}
              onOpenHelp={() => setShowHelpScreen(true)}
              onOpenAbout={() => setActiveDetail('about')}
            />
            {STEM_SEPARATION_UI_ENABLED && (
              <>
                <View style={styles.sidebarSection}><ViewModeToggle /></View>
                <View style={styles.sidebarSection}><StemSelector /></View>
              </>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </Animated.View>
  );
};



export default Sidebar;
