import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { helpButtonStyles as styles } from '../../../styles/components/controls/helpButton';

const HelpButton: React.FC = () => {
  const { setShowHelpScreen } = useStudioStore();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowHelpScreen(true)}
    >
      <View style={styles.buttonContent}>
        <HelpCircle size={16} color="#ffffff" />
        <Text style={styles.buttonText}>
          Help & Shortcuts
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HelpButton;