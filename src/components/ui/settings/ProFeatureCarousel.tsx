import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import ProFeatureDemo from './ProFeatureDemo';

import { PRO_FEATURE_PREVIEWS } from '../../../features/entitlements/proPreview';
import { proSettingsStyles as styles, proSlideWidth, proIllustrationSize } from '../../../styles/components/settings/proSettings';

const ProFeatureCarousel: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const { height } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const scroll = useRef<ScrollView>(null);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled: boolean) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => { scroll.current?.scrollTo({ x: active * width, animated: false }); }, [width]); // Preserve the page on rotation.

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={styles.viewport}>
      {width > 0 && <ScrollView
        ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        testID="pro-feature-carousel" scrollEventThrottle={32}
        onScroll={event => setActive(Math.max(0, Math.min(PRO_FEATURE_PREVIEWS.length - 1,
          Math.round(event.nativeEvent.contentOffset.x / width))))}
      >
        {PRO_FEATURE_PREVIEWS.map((feature, index) => <View
          key={feature.category} style={[styles.slide, proSlideWidth(width)]}
          accessibilityElementsHidden={active !== index} importantForAccessibility={active === index ? 'auto' : 'no-hide-descendants'}
        >
          <View style={[styles.illustration, proIllustrationSize(height)]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <ProFeatureDemo kind={feature.demo} active={active === index && foreground && !paused} reduceMotion={reduceMotion} />
          </View>
          <Text style={styles.eyebrow}>{feature.category}</Text>
          <Text style={styles.title}>{feature.title}</Text>
          <Text style={styles.body}>{feature.detail}</Text>
        </View>)}
      </ScrollView>}
      <View style={styles.pagination}>
        {PRO_FEATURE_PREVIEWS.map((feature, index) => <Pressable key={feature.category}
          style={styles.dotButton} accessibilityRole="button" accessibilityLabel={`Show ${feature.category} features`}
          accessibilityState={{ selected: active === index }} testID={`pro-feature-${index}`}
          onPress={() => { setActive(index); scroll.current?.scrollTo({ x: index * width, animated: !reduceMotion }); }}>
          <View style={[styles.dot, active === index && styles.activeDot]} />
        </Pressable>)}
      </View>
    </View>
  );
};

export default ProFeatureCarousel;
