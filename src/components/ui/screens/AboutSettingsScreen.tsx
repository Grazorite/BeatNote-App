import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Linking, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  cancelAnimation,
  withSequence,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { pageTransition } from '../../../animations/motion';
import { useMotionPreference } from '../../../animations/MotionPreference';

import appConfig from '../../../../app.json';
import { OPEN_SOURCE_LICENCE_GROUPS } from '../../../data/openSourceLicences';
import { aboutSettingsStyles as styles } from '../../../styles/components/settings/aboutSettings';
import SettingsSubpage from '../settings/SettingsSubpage';

interface AboutSettingsScreenProps {
  onBack: () => void;
}

const FEEDBACK_URL = 'https://github.com/Grazorite/BeatNote-App/issues/new';

const AboutSettingsScreen: React.FC<AboutSettingsScreenProps> = ({ onBack }) => {
  const [showLicences, setShowLicences] = useState(false);
  const [beat, setBeat] = useState(0);
  const reduced = useMotionPreference();
  const scale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  useEffect(() => {
    cancelAnimation(scale);
    scale.value = 1;
    if (beat && reduced === false) {
      scale.value = withSequence(withTiming(1.1, { duration: 150 }), withTiming(1, { duration: 300 }));
    }
  }, [beat, reduced, scale]);

  const countIn = () => {
    if (timer.current !== undefined) return;
    let count = 1;
    setBeat(count);
    AccessibilityInfo.announceForAccessibility('Five beats, one second apart');
    timer.current = setInterval(() => {
      count += 1;
      if (count > 5) {
        clearInterval(timer.current);
        timer.current = undefined;
        setBeat(0);
      } else {
        setBeat(count);
      }
    }, 1000);
  };
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(width, 1);
  const detailProgress = useSharedValue(0);
  const version = appConfig.expo.version;
  const build = appConfig.expo.ios.buildNumber;

  const setLicencesVisible = (visible: boolean): void => {
    setShowLicences(visible);
    detailProgress.value = withTiming(visible ? 1 : 0, pageTransition);
  };

  const aboutStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(detailProgress.value, [0, 1], [0, -pageWidth * 0.25]) }],
  }));
  const licencesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(detailProgress.value, [0, 1], [pageWidth, 0]) }],
  }));

  const sendFeedback = () => {
    void Linking.openURL(FEEDBACK_URL).catch(() => {
      Alert.alert('Unable to open feedback', 'Try opening the feedback page again.');
    });
  };

  return (
    <View style={styles.stack}>
      <Animated.View
        style={[styles.stackPage, aboutStyle]}
        pointerEvents={showLicences ? 'none' : 'auto'}
        accessibilityElementsHidden={showLicences}
        importantForAccessibility={showLicences ? 'no-hide-descendants' : 'auto'}
      >
        <SettingsSubpage title="About BeatNote" onBack={onBack} testID="about-settings-page">
          <View style={styles.identity}>
            <Pressable accessibilityRole="button" accessibilityLabel="BeatNote icon" accessibilityHint="Gives you a dance count-in" onPress={countIn}>
              <Animated.Image accessible={false} source={require('../../../../assets/icon.png')} style={[styles.icon, pulseStyle]} />
            </Pressable>
            <Text style={styles.appName}>BeatNote for iOS</Text>
            <Text style={styles.version}>Version {version} ({build})</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.action}
              onPress={() => setLicencesVisible(true)}
              accessibilityRole="button"
              testID="about-open-source-licences"
            >
              <Text style={styles.actionText}>Open Source Licences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.action}
              onPress={sendFeedback}
              accessibilityRole="link"
              accessibilityHint="Opens the BeatNote feedback page in your browser"
              testID="about-send-feedback"
            >
              <Text style={styles.actionText}>Send Feedback</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Privacy & diagnostics</Text>
            <Text style={styles.privacyText}>
              BeatNote sends no crash reports or usage statistics. Future diagnostics will be opt-in.
            </Text>
          </View>
        </SettingsSubpage>
      </Animated.View>
      <Animated.View
        style={[styles.stackPage, licencesStyle]}
        pointerEvents={showLicences ? 'auto' : 'none'}
        accessibilityElementsHidden={!showLicences}
        importantForAccessibility={showLicences ? 'auto' : 'no-hide-descendants'}
      >
        <SettingsSubpage
          title="Open Source Licences"
          onBack={() => setLicencesVisible(false)}
          testID="open-source-licences-page"
          backLabel="About"
        >
          <Text style={styles.licenceIntro}>
            Copyright notices and licences for the software used in BeatNote.
          </Text>
          {OPEN_SOURCE_LICENCE_GROUPS.map(group => (
            <View key={group.title} style={styles.licenceCard} testID="open-source-licence-group">
              <Text style={styles.licenceTitle}>{group.title}</Text>
              <Text style={styles.licencePackages}>{group.packages.join('\n')}</Text>
              <Text style={styles.licenceNotice}>{group.notice}</Text>
            </View>
          ))}
        </SettingsSubpage>
      </Animated.View>
    </View>
  );
};

export default AboutSettingsScreen;
