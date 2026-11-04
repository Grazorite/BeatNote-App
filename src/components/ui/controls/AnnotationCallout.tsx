import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text } from 'react-native';
import { feedbackMs } from '../../../animations/motion';
import { useMotionPreference } from '../../../animations/MotionPreference';
import { annotationCalloutStyles as styles } from '../../../styles/components/controls/annotationCallout';
import { ANNOTATION_FADE_MS } from '../../../utils/markerSelection';
import GlassBackdrop from './GlassBackdrop';

interface AnnotationCalloutProps {
  text: string | null;
  onPress: () => void;
  stacked?: boolean;
  onPresenceChange?: (present: boolean) => void;
}

/** Show a bounded timed preview for the most recently reached annotated marker. */
const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({
  text,
  onPress,
  stacked = false,
  onPresenceChange,
}) => {
  const reduced = useMotionPreference() !== false;
  const visibleText = text?.trim() ?? '';
  const [renderedText, setRenderedText] = useState(visibleText || null);
  const opacity = useRef(new Animated.Value(visibleText ? 1 : 0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current?.stop();
    if (reduced) {
      opacity.setValue(visibleText ? 1 : 0);
      setRenderedText(visibleText || null);
      return;
    }
    if (visibleText) {
      setRenderedText(visibleText);
      const animation = Animated.timing(opacity, {
        toValue: 1,
        duration: feedbackMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      animationRef.current = animation;
      animation.start(() => {
        if (animationRef.current === animation) animationRef.current = null;
      });
      return undefined;
    }
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: ANNOTATION_FADE_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (animationRef.current === animation) animationRef.current = null;
      if (finished) setRenderedText(null);
    });
    return () => animation.stop();
  }, [opacity, visibleText, reduced]);

  useEffect(() => () => animationRef.current?.stop(), []);

  useEffect(() => {
    onPresenceChange?.(renderedText !== null);
  }, [onPresenceChange, renderedText]);

  if (renderedText === null) return null;
  // The native view owns the fade. TouchableOpacity would attach a second opacity
  // animation to that same view and restart it when disabled during dismissal.
  return (
    <Animated.View
      testID="annotation-callout"
      pointerEvents={visibleText ? 'auto' : 'none'}
      accessibilityElementsHidden={!visibleText}
      importantForAccessibility={visibleText ? 'auto' : 'no-hide-descendants'}
      style={[styles.container, stacked ? styles.stacked : styles.floating, { opacity }]}
    >
      <GlassBackdrop gradientId="annotation-callout-glass" radius={12} variant="callout" />
      <Pressable
        testID="annotation-callout-action"
        accessibilityRole="button"
        accessibilityLabel={`Annotation: ${renderedText}`}
        accessibilityHint="Opens the annotation editor"
        onPress={onPress}
        disabled={!visibleText}
        style={styles.content}
      >
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text} testID="annotation-callout-text">
          {renderedText}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default React.memo(AnnotationCallout);
