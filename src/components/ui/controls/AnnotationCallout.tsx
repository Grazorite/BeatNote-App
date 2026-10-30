import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { annotationCalloutStyles as styles } from '../../../styles/components/controls/annotationCallout';
import { ANNOTATION_FADE_MS } from '../../../utils/markerSelection';
import GlassBackdrop from './GlassBackdrop';

interface AnnotationCalloutProps {
  text: string;
  onPress: () => void;
  stacked?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

/** Show a bounded timed preview for the most recently reached annotated marker. */
const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({ text, onPress, stacked = false }) => {
  if (!text.trim()) return null;
  return (
    <AnimatedTouchableOpacity
      testID="annotation-callout"
      accessibilityRole="button"
      accessibilityLabel={`Annotation: ${text}`}
      accessibilityHint="Opens the annotation editor"
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.container, stacked ? styles.stacked : styles.floating]}
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(ANNOTATION_FADE_MS)}
    >
      <GlassBackdrop gradientId="annotation-callout-glass" radius={12} variant="callout" />
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text} testID="annotation-callout-text">
        {text}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

export default React.memo(AnnotationCallout);
