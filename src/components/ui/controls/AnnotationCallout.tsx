import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { annotationCalloutStyles as styles } from '../../../styles/components/controls/annotationCallout';
import GlassBackdrop from './GlassBackdrop';

interface AnnotationCalloutProps {
  text: string;
  onPress: () => void;
}

/** Show a bounded preview for only the annotation at the current marker. */
const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({ text, onPress }) => {
  if (!text.trim()) return null;
  return (
    <TouchableOpacity
      testID="annotation-callout"
      accessibilityRole="button"
      accessibilityLabel={`Annotation: ${text}`}
      accessibilityHint="Opens the annotation editor"
      activeOpacity={0.86}
      onPress={onPress}
      style={styles.container}
    >
      <GlassBackdrop gradientId="annotation-callout-glass" radius={12} variant="callout" />
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.text} testID="annotation-callout-text">
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo(AnnotationCallout);
