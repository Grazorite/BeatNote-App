import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { layerNameSettingsStyles as styles } from '../../../styles/components/controls/layerNameSettings';
import {
  DEFAULT_ANNOTATION_LANE_NAME,
  getAnnotationLaneDisplayName,
  getLayerDisplayName,
  MAX_CUSTOM_LAYER_NAME_LENGTH,
} from '../../../utils/layers';

interface LayerNameRowProps {
  layer: Layer;
  disabled: boolean;
  annotationLane?: boolean;
}

const LayerNameRow: React.FC<LayerNameRowProps> = ({ layer, disabled, annotationLane = false }) => {
  const setLayerCustomName = useStudioStore(state => state.setLayerCustomName);
  const setTextInputFocused = useStudioStore(state => state.setTextInputFocused);
  const displayName = annotationLane
    ? getAnnotationLaneDisplayName(layer)
    : getLayerDisplayName(layer);
  const [value, setValue] = useState(displayName);

  useEffect(() => setValue(displayName), [displayName]);

  const commit = () => {
    setTextInputFocused(false);
    const storedValue = annotationLane
      && value.trim().toLocaleLowerCase() === DEFAULT_ANNOTATION_LANE_NAME.toLocaleLowerCase()
      ? layer.name
      : value;
    setLayerCustomName(layer.id, storedValue);
  };

  const fieldLabel = annotationLane ? 'Annotation lane name' : `${layer.name} layer name`;
  const resetLabel = annotationLane ? 'Reset annotation lane name' : `Reset ${layer.name} layer name`;

  return (
    <View style={styles.row}>
      <View style={[styles.swatch, { backgroundColor: layer.color }]} />
      {!annotationLane && <Text style={styles.defaultName}>{layer.name}</Text>}
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
        accessibilityLabel={fieldLabel}
        testID={`settings-layer-name-${layer.id}`}
      />
      <TouchableOpacity
        onPress={() => {
          setValue(annotationLane ? DEFAULT_ANNOTATION_LANE_NAME : layer.name);
          setLayerCustomName(layer.id, layer.name);
        }}
        disabled={disabled || layer.customName === undefined}
        accessibilityRole="button"
        accessibilityLabel={resetLabel}
        style={styles.resetButton}
      >
        <Text style={[styles.resetText, (disabled || layer.customName === undefined) && styles.disabled]}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface LayerNameSettingsProps {
  singleAnnotationLane?: boolean;
}

const LayerNameSettings: React.FC<LayerNameSettingsProps> = ({ singleAnnotationLane = false }) => {
  const layers = useStudioStore(state => state.layers);
  const allLayersData = useStudioStore(state => state.allLayersData);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const displayedLayers = singleAnnotationLane
    ? allLayersData.filter(layer => layer.id === 'vocals')
    : layers;

  return (
    <View style={styles.container} testID="settings-layer-names">
      <Text style={styles.helpText}>
        {singleAnnotationLane
          ? "This name is saved with the song's draft and projects and used in exports."
          : "Names are saved with this song's draft and projects."}
      </Text>
      {displayedLayers.map(layer => (
        <LayerNameRow
          key={layer.id}
          layer={layer}
          disabled={!songLoaded}
          annotationLane={singleAnnotationLane}
        />
      ))}
    </View>
  );
};

export default LayerNameSettings;
