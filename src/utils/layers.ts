import type { PersistedLayer } from '../types/project';

export const MAX_CUSTOM_LAYER_NAME_LENGTH = 24;

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
