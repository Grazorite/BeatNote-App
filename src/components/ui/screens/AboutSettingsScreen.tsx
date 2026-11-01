import React from 'react';
import { Alert, Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import appConfig from '../../../../app.json';
import { aboutSettingsStyles as styles } from '../../../styles/components/settings/aboutSettings';
import SettingsSubpage from '../settings/SettingsSubpage';

interface AboutSettingsScreenProps {
  onBack: () => void;
}

const FEEDBACK_URL = 'https://github.com/Grazorite/BeatNote-App/issues/new';

const AboutSettingsScreen: React.FC<AboutSettingsScreenProps> = ({ onBack }) => {
  const version = appConfig.expo.version;
  const build = appConfig.expo.ios.buildNumber;

  const showLicences = () => {
    Alert.alert(
      'Open Source Licences',
      'BeatNote is MIT licensed. Dependency licence notices will be included before the App Store release.',
    );
  };

  const sendFeedback = () => {
    void Linking.openURL(FEEDBACK_URL).catch(() => {
      Alert.alert('Unable to open feedback', 'Please try again when a browser connection is available.');
    });
  };

  return (
    <SettingsSubpage title="About BeatNote" onBack={onBack} testID="about-settings-page">
      <View style={styles.identity}>
        <Image source={require('../../../../assets/icon.png')} style={styles.icon} />
        <Text style={styles.appName}>BeatNote for iOS</Text>
        <Text style={styles.version}>Version {version} ({build})</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={showLicences}
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
          BeatNote does not currently send crash reports or anonymous usage statistics. Any future
          diagnostics will be opt-in and explained here.
        </Text>
      </View>
    </SettingsSubpage>
  );
};

export default AboutSettingsScreen;
