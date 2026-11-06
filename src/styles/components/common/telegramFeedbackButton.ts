import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const telegramFeedbackStyles = StyleSheet.create({
  feedbackButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: dimensions.borderRadius,
  },
  feedbackText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '600',
  },
});
