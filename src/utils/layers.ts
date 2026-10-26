import type { PersistedLayer } from '../types/project';

export const MAX_CUSTOM_LAYER_NAME_LENGTH = 24;
export const DEFAULT_ANNOTATION_LANE_NAME = 'Annotations';

export const normalizeCustomLayerName = (
  value: string,
  defaultName: string,
): string | undefined => {
  const trimmed = value.trim().replace(/\s+/g, ' ').slice(0, MAX_CUSTOM_LAYER_NAME_LENGTH);
  return trimmed.length === 0 || trimmed.toLocaleLowerCase() === defaultName.toLocaleLowerCase()
    ? undefined
    : trimmed;
};

export const getLayerDisplayName = (
  layer: Pick<PersistedLayer, 'name' | 'customName'>,
): string => layer.customName?.trim() || layer.name;

/** V1 phone editing uses one fixed internal layer without exposing stem-oriented vocabulary. */
export const getAnnotationLaneDisplayName = (
  layer: Pick<PersistedLayer, 'name' | 'customName'>,
): string => layer.customName?.trim() || DEFAULT_ANNOTATION_LANE_NAME;

/** Exports should describe the V1 annotation lane honestly while retaining every stable layer ID. */
export const getExportLayerDisplayName = (
  layer: Pick<PersistedLayer, 'id' | 'name' | 'customName'>,
): string => layer.id === 'vocals' && !layer.customName?.trim()
  ? DEFAULT_ANNOTATION_LANE_NAME
  : getLayerDisplayName(layer);
