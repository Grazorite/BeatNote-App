import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity } from 'react-native';
import { annotationCalloutStyles as styles } from '../../../styles/components/controls/annotationCallout';
import { ANNOTATION_FADE_MS } from '../../../utils/markerSelection';
import GlassBackdrop from './GlassBackdrop';

interface AnnotationCalloutProps {
  text: string | null;
  onPress: () => void;
  stacked?: boolean;
  onPresenceChange?: (present: boolean) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/** Show a bounded timed preview for the most recently reached annotated marker. */
const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({
  text,
  onPress,
  stacked = false,
  onPresenceChange,
}) => {
  const visibleText = text?.trim() ?? '';
  const [renderedText, setRenderedText] = useState(visibleText || null);
  const opacity = useRef(new Animated.Value(visibleText ? 1 : 0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current?.stop();
    if (visibleText) {
      setRenderedText(visibleText);
      const animation = Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
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
  }, [opacity, visibleText]);

  useEffect(() => () => animationRef.current?.stop(), []);

  useEffect(() => {
    onPresenceChange?.(renderedText !== null);
  }, [onPresenceChange, renderedText]);

  if (renderedText === null) return null;
  return (
    <AnimatedTouchableOpacity
      testID="annotation-callout"
      accessibilityRole="button"
      accessibilityLabel={`Annotation: ${renderedText}`}
      accessibilityHint="Opens the annotation editor"
      activeOpacity={0.86}
      onPress={onPress}
      disabled={!visibleText}
      accessibilityElementsHidden={!visibleText}
      style={[styles.container, stacked ? styles.stacked : styles.floating, { opacity }]}
    >
      <GlassBackdrop gradientId="annotation-callout-glass" radius={12} variant="callout" />
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text} testID="annotation-callout-text">
        {renderedText}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

export default React.memo(AnnotationCallout);
