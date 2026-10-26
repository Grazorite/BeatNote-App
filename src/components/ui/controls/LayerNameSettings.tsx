import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { layerNameSettingsStyles as styles } from '../../../styles/components/controls/layerNameSettings';
import { getLayerDisplayName, MAX_CUSTOM_LAYER_NAME_LENGTH } from '../../../utils/layers';

const LayerNameRow: React.FC<{ layer: Layer; disabled: boolean }> = ({ layer, disabled }) => {
  const setLayerCustomName = useStudioStore(state => state.setLayerCustomName);
  const setTextInputFocused = useStudioStore(state => state.setTextInputFocused);
  const [value, setValue] = useState(getLayerDisplayName(layer));

  useEffect(() => setValue(getLayerDisplayName(layer)), [layer.customName, layer.name]);

  const commit = () => {
    setTextInputFocused(false);
    setLayerCustomName(layer.id, value);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.swatch, { backgroundColor: layer.color }]} />
      <Text style={styles.defaultName}>{layer.name}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        onFocus={() => setTextInputFocused(true)}
        onBlur={commit}
        onSubmitEditing={commit}
        editable={!disabled}
        maxLength={MAX_CUSTOM_LAYER_NAME_LENGTH}
        returnKeyType="done"
        selectTextOnFocus
        style={[styles.input, disabled && styles.disabled]}
        accessibilityLabel={`${layer.name} layer name`}
        testID={`settings-layer-name-${layer.id}`}
      />
      <TouchableOpacity
        onPress={() => {
          setValue(layer.name);
          setLayerCustomName(layer.id, layer.name);
        }}
        disabled={disabled || layer.customName === undefined}
        accessibilityRole="button"
        accessibilityLabel={`Reset ${layer.name} layer name`}
        style={styles.resetButton}
      >
        <Text style={[styles.resetText, (disabled || layer.customName === undefined) && styles.disabled]}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const LayerNameSettings: React.FC = () => {
  const layers = useStudioStore(state => state.layers);
  const songLoaded = useStudioStore(state => state.songLoaded);

  return (
    <View style={styles.container} testID="settings-layer-names">
      <Text style={styles.helpText}>
        Names are saved with this song's draft and projects.
      </Text>
      {layers.map(layer => <LayerNameRow key={layer.id} layer={layer} disabled={!songLoaded} />)}
    </View>
  );
};

export default LayerNameSettings;
