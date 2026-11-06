import React from 'react';
import { Linking, Text, TouchableOpacity } from 'react-native';
import { telegramFeedbackStyles as styles } from '../../../styles/components/common/telegramFeedbackButton';
import { showPrompt } from './AppPrompt';

const FEEDBACK_URL = 'https://t.me/+4edtI3WUOqZlN2U1';

const sendFeedback = () => {
  void Linking.openURL(FEEDBACK_URL).catch(() => {
    showPrompt('Unable to open Telegram', 'Try opening the BeatNote Helpdesk invite again.');
  });
};

export default function TelegramFeedbackButton({ testID }: { testID: string }) {
  return (
    <TouchableOpacity
      style={styles.feedbackButton}
      onPress={sendFeedback}
      accessibilityRole="link"
      accessibilityHint="Opens the invite to the BeatNote Helpdesk group"
      testID={testID}
    >
      <Text style={styles.feedbackText}>Give feedback on Telegram</Text>
    </TouchableOpacity>
  );
}
