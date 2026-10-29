import { useShallow } from 'zustand/react/shallow';

import { markerLoopRangeAtTime } from '../utils/loopRange';
import { useStudioStore } from './useStudioStore';

/** Marker-bounded segment currently being looped, in milliseconds. */
export interface MarkerLoopSegment {
  loopStartMs: number;
  loopEndMs: number;
}

/**
 * Resolve the segment "Loop between markers" is repeating, for display only. Returns null unless
 * marker looping is on. The marker set mirrors the playback engine (active layer only, or all
 * layers), and song start/end act as implicit boundaries. The result changes only when the
 * playhead crosses a marker, so subscribers do not re-render on every playback tick.
 */
export function useMarkerLoopSegment(): MarkerLoopSegment | null {
  return useStudioStore(useShallow((state): MarkerLoopSegment | null => {
    if (!state.isLoopMarkerActive || !state.songLoaded) return null;
    const markers = state.layerSpecificNavigation
      ? state.allLayersData.find(layer => layer.id === state.activeLayerId)?.markers ?? []
      : state.allLayersData.flatMap(layer => layer.markers);
    const range = markerLoopRangeAtTime(markers, state.currentTime, state.songDuration);
    return range.loopStartMs !== null && range.loopEndMs !== null
      ? { loopStartMs: range.loopStartMs, loopEndMs: range.loopEndMs }
      : null;
  }));
}
