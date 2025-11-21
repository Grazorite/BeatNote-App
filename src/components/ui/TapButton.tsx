import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  tapButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6600',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tapButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TapButton;