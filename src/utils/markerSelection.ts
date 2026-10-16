import type { Layer, LayerId, SelectedMarker } from '../hooks/useStudioStore';

/** Return the closest marker within the playhead tolerance, preferring the active layer on ties. */
export const findMarkerNearTime = (
  layers: Layer[],
  currentTime: number,
  preferredLayerId: LayerId,
  toleranceMs = 100,
): SelectedMarker | null => {
  let closest: (SelectedMarker & { distance: number; preferred: boolean }) | undefined;
  for (const layer of layers) {
    for (const timestamp of layer.markers) {
      const distance = Math.abs(timestamp - currentTime);
      if (distance > toleranceMs) continue;
      const preferred = layer.id === preferredLayerId;
      if (!closest || distance < closest.distance || (distance === closest.distance && preferred && !closest.preferred)) {
        closest = { layerId: layer.id, timestamp, distance, preferred };
      }
    }
  }
  return closest ? { layerId: closest.layerId, timestamp: closest.timestamp } : null;
};

/** Read the annotation attached to a marker using the store's timestamp tolerance. */
export const getMarkerAnnotation = (layers: Layer[], marker: SelectedMarker | null): string => {
  if (!marker) return '';
  return layers
    .find(layer => layer.id === marker.layerId)
    ?.annotations.find(annotation => Math.abs(annotation.timestamp - marker.timestamp) < 100)
    ?.text ?? '';
};
