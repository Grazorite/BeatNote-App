import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStudioStore } from '../../hooks/useStudioStore';

const StemSelector: React.FC = () => {
  const { stemCount, setStemCount } = useStudioStore();

  const stemOptions = [
    { count: 2 as const, label: '2 Stems', description: 'Vocals + Accompaniment' },
    { count: 4 as const, label: '4 Stems', description: 'Vocals, Drums, Bass, Other' },
    { count: 5 as const, label: '5 Stems', description: 'Vocals, Drums, Bass, Piano, Other' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stem Separation</Text>
      <View style={styles.options}>
        {stemOptions.map((option) => (
          <TouchableOpacity
            key={option.count}
            style={[
              styles.option,
              stemCount === option.count && styles.activeOption
            ]}
            onPress={() => setStemCount(option.count)}
          >
            <Text style={[
              styles.optionLabel,
              stemCount === option.count && styles.activeText
            ]}>
              {option.label}
            </Text>
            <Text style={styles.optionDescription}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#222222',
    alignItems: 'center',
    flex: 1,
  },
  activeOption: {
    borderColor: '#00ff00',
    backgroundColor: '#003300',
  },
  optionLabel: {
    color: '#cccccc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#00ff00',
  },
  optionDescription: {
    color: '#888888',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default StemSelector;