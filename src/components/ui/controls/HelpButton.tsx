import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { BeatNoteIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { helpButtonStyles as styles } from '../../../styles/components/controls/helpButton';

const HelpButton: React.FC = () => {
  const { setShowHelpScreen } = useStudioStore();

  return (
    <TouchableOpacity
      testID="settings-help"
      style={styles.button}
      onPress={() => setShowHelpScreen(true)}
    >
      <View style={styles.buttonContent}>
        <BeatNoteIcon name="help" size={16} />
        <Text style={styles.buttonText}>
          Help & Shortcuts
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HelpButton;
