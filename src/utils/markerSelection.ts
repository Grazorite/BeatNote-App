import type { Layer, LayerId, SelectedMarker } from '../hooks/useStudioStore';

export const ANNOTATION_DWELL_MS = 2000;
export const ANNOTATION_FADE_MS = 650;

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

/**
 * Return the newest annotated marker crossed by one forward playhead update. Unlike a dwell
 * window, this selects an interval crossing. Callers must keep a monotonic previousTime within
 * each explicit playback traversal so native clock corrections cannot cross an interval twice.
 */
export const findCrossedAnnotationMarker = (
  layers: Layer[],
  previousTime: number,
  currentTime: number,
  preferredLayerId: LayerId,
): SelectedMarker | null => {
  if (!Number.isFinite(previousTime) || !Number.isFinite(currentTime) || currentTime <= previousTime) {
    return null;
  }

  let selected: (SelectedMarker & { preferred: boolean }) | null = null;
  for (const layer of layers) {
    for (const timestamp of layer.markers) {
      if (timestamp <= previousTime || timestamp > currentTime) continue;
      const annotation = layer.annotations.find(item => Math.abs(item.timestamp - timestamp) < 100);
      if (!annotation?.text.trim()) continue;

      const preferred = layer.id === preferredLayerId;
      if (
        !selected
        || timestamp > selected.timestamp
        || (timestamp === selected.timestamp && preferred && !selected.preferred)
      ) {
        selected = { layerId: layer.id, timestamp, preferred };
      }
    }
  }

  return selected ? { layerId: selected.layerId, timestamp: selected.timestamp } : null;
};
