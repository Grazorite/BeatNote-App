import React from 'react';
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { settingsSubpageStyles as styles } from '../../../styles/components/settings/settingsSubpage';
import HeaderBackButton from '../common/HeaderBackButton';
import GlassBackdrop from '../controls/GlassBackdrop';

interface SettingsSubpageProps {
  title: string;
  onBack: () => void;
  testID: string;
  children: React.ReactNode;
}

const SettingsSubpage: React.FC<SettingsSubpageProps> = ({ title, onBack, testID, children }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isMobile = Platform.OS === 'web' ? width < 768 : Math.min(width, height) < 768;

  return (
    <View style={styles.page} testID={testID}>
      <GlassBackdrop gradientId={`${testID}-glass`} radius={isMobile ? 0 : 20} />
      <View style={[styles.safeArea, isMobile && {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }]}>
        <View style={styles.header}>
          <HeaderBackButton
            onPress={onBack}
            accessibilityLabel={`Back to Settings from ${title}`}
            label="Settings"
            testID={`${testID}-back`}
          />
          <Text style={styles.title} numberOfLines={1} testID={`${testID}-title`}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

export default SettingsSubpage;
