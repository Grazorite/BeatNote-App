import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { helpButtonStyles as styles } from '../../../styles/components/controls/helpButton';

const HelpButton: React.FC = () => {
  const { setShowHelpScreen } = useStudioStore();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowHelpScreen(true)}
    >
      <Text style={styles.buttonText}>
        Help & Shortcuts
      </Text>
    </TouchableOpacity>
  );
};

export default HelpButton;