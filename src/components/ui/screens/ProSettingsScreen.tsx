import React, { useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';

import { BeatNoteIcon } from '../../icons';
import { colors } from '../../../styles/common';
import { proSettingsStyles as styles } from '../../../styles/components/settings/proSettings';
import ProComparisonSheet from '../settings/ProComparisonSheet';
import ProFeatureCarousel from '../settings/ProFeatureCarousel';
import SettingsSubpage from '../settings/SettingsSubpage';

interface ProSettingsScreenProps { onBack: () => void; }

const ProSettingsScreen: React.FC<ProSettingsScreenProps> = ({ onBack }) => {
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [comparing, setComparing] = useState(false);
  const compareRef = useRef<View>(null);
  // Capture the cue from touch-down so the native parent ScrollView cannot steal its swipe.
  const swipeUp = useRef(PanResponder.create({
    onStartShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy < -24 || (Math.abs(gesture.dx) < 8 && Math.abs(gesture.dy) < 8)) setComparing(true);
    },
  })).current;

  return (
    <>
      <SettingsSubpage title="BeatNote Pro" onBack={onBack} testID="pro-settings-page" contentContainerStyle={styles.pageContent}>
        <ProFeatureCarousel paused={comparing} />
        <View {...swipeUp.panHandlers} testID="pro-compare-swipe">
          <Pressable ref={compareRef} style={styles.compareButton} accessibilityRole="button"
            accessibilityLabel="Compare Pro and Lite" accessibilityHint="Tap or swipe up to compare the included features."
            onPress={() => setComparing(true)} testID="pro-compare">
            <View style={styles.chevron}><BeatNoteIcon name="chevron-up" size={24} color={colors.text} testID="pro-compare-chevron" /></View>
            <Text style={styles.caption}>Swipe up to compare Pro & Lite</Text>
          </Pressable>
        </View>
        <View style={styles.plans} accessibilityRole="radiogroup" accessibilityLabel="Preview subscription plans">
          <Pressable style={[styles.plan, plan === 'yearly' && styles.selectedPlan]}
            onPress={() => setPlan('yearly')} accessibilityRole="radio" accessibilityState={{ selected: plan === 'yearly' }}
            aria-checked={plan === 'yearly'} testID="pro-plan-yearly">
            <Text style={styles.selection}>{plan === 'yearly' ? '✓' : '○'}</Text>
            <View style={styles.planCopy}>
              <Text style={styles.planHeading}>Yearly</Text>
              <Text style={styles.small}>7-day trial planned</Text>
            </View>
            <View style={styles.planPrice}>
              <Text style={styles.badge}>SAVE 44%</Text>
              <Text style={styles.price}>S$19.98 yearly</Text>
              <Text style={styles.small}>≈ S$1.67/month</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.plan, plan === 'monthly' && styles.selectedPlan]}
            onPress={() => setPlan('monthly')} accessibilityRole="radio" accessibilityState={{ selected: plan === 'monthly' }}
            aria-checked={plan === 'monthly'} testID="pro-plan-monthly">
            <Text style={styles.selection}>{plan === 'monthly' ? '✓' : '○'}</Text>
            <Text style={[styles.planHeading, styles.planCopy]}>Monthly</Text>
            <Text style={styles.price}>S$2.98 monthly</Text>
          </Pressable>
        </View>
        <Text style={styles.previewNote}>Pricing preview · Purchases not available yet. Trial subject to App Store availability.</Text>
        <Text style={styles.restore} accessibilityState={{ disabled: true }} testID="restore-purchases-placeholder">Restore Purchases · Unavailable</Text>
      </SettingsSubpage>
      <ProComparisonSheet visible={comparing} onClose={() => setComparing(false)} returnFocusRef={compareRef} />
    </>
  );
};

export default ProSettingsScreen;
