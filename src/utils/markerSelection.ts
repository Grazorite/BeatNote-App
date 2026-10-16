import type { Layer, LayerId, SelectedMarker } from '../hooks/useStudioStore';

export const ANNOTATION_DWELL_MS = 2000;
export const ANNOTATION_FADE_MS = 350;

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
 * Return the newest annotated marker whose timestamp the playhead has reached and
 * whose reading window is still open. A newer annotation always wins; the active
 * layer breaks ties when layers share a timestamp.
 */
export const findTimedAnnotationMarker = (
  layers: Layer[],
  currentTime: number,
  preferredLayerId: LayerId,
  dwellMs = ANNOTATION_DWELL_MS,
): SelectedMarker | null => {
  if (!Number.isFinite(currentTime) || !Number.isFinite(dwellMs) || dwellMs < 0) return null;

  let selected: (SelectedMarker & { preferred: boolean }) | null = null;
  for (const layer of layers) {
    for (const timestamp of layer.markers) {
      const age = currentTime - timestamp;
      if (age < 0 || age > dwellMs) continue;
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
