import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useMotionPreference } from '../../../animations/MotionPreference';

import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import ProFeatureDemo from './ProFeatureDemo';

import { PRO_FEATURE_PREVIEWS } from '../../../features/entitlements/proPreview';
import { proSettingsStyles as styles, proSlideWidth, proIllustrationSize } from '../../../styles/components/settings/proSettings';

const ProFeatureCarousel: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const { height } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const reduceMotion = useMotionPreference() !== false;
  const scroll = useRef<React.ElementRef<typeof Animated.ScrollView>>(null);
  const page = useSharedValue(0);
  const selected = useSharedValue(0);
  const last = PRO_FEATURE_PREVIEWS.length - 1;
  const handleScroll = useAnimatedScrollHandler(event => {
    const position = Math.min(last, Math.max(0, event.contentOffset.x / Math.max(width, 1)));
    page.value = position;
    const nearest = Math.round(position);
    if (nearest !== selected.value) {
      selected.value = nearest;
      runOnJS(setActive)(nearest);
    }
  }, [width]);
  const indicator = useAnimatedStyle(() => {
    const position = reduceMotion ? Math.round(page.value) : page.value;
    const base = Math.floor(position);
    const fraction = position - base;
    const left = 44 * (base + Math.max(0, 2 * fraction - 1));
    const right = 44 * (base + Math.min(1, 2 * fraction));
    return { transform: [{ translateX: left }], width: 18 + right - left };
  }, [reduceMotion]);

  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => { scroll.current?.scrollTo({ x: active * width, animated: false }); }, [width]); // Preserve the page on rotation.

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={styles.viewport}>
      {width > 0 && <Animated.ScrollView
        ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        testID="pro-feature-carousel" scrollEventThrottle={16} onScroll={handleScroll}
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
      </Animated.ScrollView>}
      <View style={styles.pagination}>
        {PRO_FEATURE_PREVIEWS.map((feature, index) => <Pressable key={feature.category}
          style={styles.dotButton} accessibilityRole="button" accessibilityLabel={`Show ${feature.category} features`}
          accessibilityState={{ selected: active === index }} testID={`pro-feature-${index}`}
          onPress={() => { scroll.current?.scrollTo({ x: index * width, animated: !reduceMotion }); }}>
          <View style={styles.dot} />
        </Pressable>)}
        <Animated.View pointerEvents="none" style={[styles.activeDot, indicator]} testID="pro-page-indicator" />
      </View>
    </View>
  );
};

export default ProFeatureCarousel;
