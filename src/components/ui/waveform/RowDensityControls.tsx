import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RowDensity, RowDensityMode } from '../../../utils/rowLayout';
import {
  densityForPreset,
  type RowDensityPresetName,
} from '../../../utils/rowDensityPresets';
import { rowDensityControlStyles as styles } from '../../../styles/components/waveform/rowDensityControls';

const PRESETS: RowDensityPresetName[] = ['spacious', 'default', 'compact'];

const PRESET_LABELS: Record<RowDensityPresetName, string> = {
  spacious: 'Spacious',
  default: 'Default',
  compact: 'Compact',
};

/** Exact match: the active-mode metric of the current density equals the preset's. */
function isPresetSelected(
  name: RowDensityPresetName,
  mode: RowDensityMode,
  density: RowDensity,
): boolean {
  const preset = densityForPreset(name, mode);
  return mode === 'phrase'
    ? preset.phrasesPerRow === density.phrasesPerRow
    : preset.rowDurationMs === density.rowDurationMs;
}

interface RowDensityControlsProps {
  mode: RowDensityMode;
  /** The already-resolved/effective density used for exact selection matching. */
  density: RowDensity;
  onChange: (density: RowDensity) => void;
}

const RowDensityControls: React.FC<RowDensityControlsProps> = ({ mode, density, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.heading}>Rows</Text>
    <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Row density preset">
      {PRESETS.map((name) => {
        const selected = isPresetSelected(name, mode, density);
        return (
          <Pressable
            key={name}
            style={[styles.control, selected && styles.controlSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={PRESET_LABELS[name]}
            testID={`row-density-preset-${name}`}
            onPress={() => onChange(densityForPreset(name, mode))}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{PRESET_LABELS[name]}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

export default RowDensityControls;
