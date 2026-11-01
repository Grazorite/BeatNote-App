import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { annotationCalloutStyles as styles } from '../../../styles/components/controls/annotationCallout';
import { ANNOTATION_FADE_MS } from '../../../utils/markerSelection';
import GlassBackdrop from './GlassBackdrop';

interface AnnotationCalloutProps {
  text: string | null;
  onPress: () => void;
  stacked?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/** Show a bounded timed preview for the most recently reached annotated marker. */
const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({ text, onPress, stacked = false }) => {
  const visibleText = text?.trim() ?? '';
  const [renderedText, setRenderedText] = useState(visibleText || null);
  const opacity = useSharedValue(visibleText ? 1 : 0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    if (visibleText) {
      setRenderedText(visibleText);
      opacity.value = withTiming(1, { duration: 180 });
      return;
    }
    opacity.value = withTiming(0, { duration: ANNOTATION_FADE_MS }, finished => {
      if (finished) runOnJS(setRenderedText)(null);
    });
  }, [opacity, visibleText]);

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
      style={[styles.container, stacked ? styles.stacked : styles.floating, animatedStyle]}
    >
      <GlassBackdrop gradientId="annotation-callout-glass" radius={12} variant="callout" />
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text} testID="annotation-callout-text">
        {renderedText}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

export default React.memo(AnnotationCallout);
