import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { tapButtonStyles as styles } from '../../../styles/components/controls/tapButton';

interface TapButtonProps {
  onTap: () => void;
}

const TapButton: React.FC<TapButtonProps> = ({ onTap }) => {
  return (
    <TouchableOpacity style={styles.tapButton} onPress={onTap}>
      <Text style={styles.tapButtonText}>TAP</Text>
    </TouchableOpacity>
  );
};



export default TapButton;