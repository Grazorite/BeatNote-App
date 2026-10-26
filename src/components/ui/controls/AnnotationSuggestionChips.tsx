import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { annotationSuggestionChipStyles as styles } from '../../../styles/components/controls/annotationSuggestionChips';
import {
  appendAnnotationSuggestion,
  DEFAULT_ANNOTATION_SUGGESTIONS,
} from '../../../utils/annotationSuggestions';

interface AnnotationSuggestionChipsProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}

const AnnotationSuggestionChips: React.FC<AnnotationSuggestionChipsProps> = ({
  value,
  onChange,
  maxLength,
  disabled = false,
}) => (
  <View style={styles.container} testID="annotation-suggestions">
    <Text style={styles.label}>Suggestions</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.row}
    >
      {DEFAULT_ANNOTATION_SUGGESTIONS.map(suggestion => (
        <TouchableOpacity
          key={suggestion}
          style={[styles.chip, disabled && styles.disabled]}
          onPress={() => onChange(appendAnnotationSuggestion(value, suggestion, maxLength))}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Add ${suggestion} annotation suggestion`}
          testID={`annotation-suggestion-${suggestion.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        >
          <Text style={styles.chipText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default AnnotationSuggestionChips;
