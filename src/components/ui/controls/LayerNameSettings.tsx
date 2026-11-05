import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { flushDraft } from '../../../features/library/draftAutosave';
import { DRAFT_FLUSH_TIMEOUT_MS } from '../../../utils/libraryConstants';
import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import { layerNameSettingsStyles as styles } from '../../../styles/components/controls/layerNameSettings';
import {
  DEFAULT_ANNOTATION_LANE_NAME,
  getAnnotationLaneDisplayName,
  getLayerDisplayName,
  MAX_CUSTOM_LAYER_NAME_LENGTH,
  normalizeCustomLayerName,
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

  useEffect(() => setValue(displayName), [displayName, disabled]);

  const defaultLabel = annotationLane ? DEFAULT_ANNOTATION_LANE_NAME : layer.name;
  const nextName = normalizeCustomLayerName(value, defaultLabel);
  const canSave = !disabled && nextName !== layer.customName;
  const commit = () => {
    if (!disabled) {
      if (canSave) setLayerCustomName(layer.id, nextName ?? '');
      setValue(nextName ?? defaultLabel);
      Keyboard.dismiss();
    }
  };

  const fieldLabel = annotationLane ? 'Annotation lane name' : `${layer.name} layer name`;
  const resetLabel = annotationLane ? 'Reset annotation lane name' : `Reset ${layer.name} layer name`;

  return (
    <View style={styles.row}>
      <View
        style={[styles.swatch, { backgroundColor: annotationLane ? colors.marker : layer.color }]}
        testID={`settings-layer-swatch-${layer.id}`}
      />
      {!annotationLane && <Text style={styles.defaultName}>{layer.name}</Text>}
      <TextInput
        value={value}
        onChangeText={setValue}
        onFocus={() => setTextInputFocused(true)}
        onBlur={() => setTextInputFocused(false)}
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
        onPress={commit}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityLabel={annotationLane ? 'Save annotation label' : 'Save layer name'}
        style={styles.resetButton}
        testID={`settings-layer-save-${layer.id}`}
      >
        <Text style={[styles.saveText, !canSave && styles.disabled]}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setValue(annotationLane ? DEFAULT_ANNOTATION_LANE_NAME : layer.name);
          setLayerCustomName(layer.id, '');
          Keyboard.dismiss();
          void flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
        }}
        disabled={disabled || layer.customName === undefined}
        accessibilityRole="button"
        accessibilityLabel={resetLabel}
        style={styles.resetButton}
        testID={`settings-layer-reset-${layer.id}`}
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
  const songId = useStudioStore(state => state.currentMusicItemId);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const canRename = useProductCapability('layers.customNames');
  const displayedLayers = singleAnnotationLane
    ? allLayersData.filter(layer => layer.id === 'vocals')
    : layers;

  return (
    <View style={styles.container} testID="settings-layer-names">
      <Text style={styles.helpText}>
        {!canRename ? 'Pro only' : singleAnnotationLane
          ? 'Tap Save to use this label in the song’s draft, projects and exports.'
          : "Names are saved with this song's draft and projects."}
      </Text>
      {displayedLayers.map(layer => (
        <LayerNameRow
          key={`${songId}-${layer.id}`}
          layer={layer}
          disabled={!songLoaded || !canRename}
          annotationLane={singleAnnotationLane}
        />
      ))}
    </View>
  );
};

export default LayerNameSettings;
