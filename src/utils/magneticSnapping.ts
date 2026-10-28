/**
 * Magnetic snapping utility for playhead positioning
 */

const SNAP_THRESHOLD = 50; // pixels

export const snapToNearestTarget = (
  targetTime: number,
  snapTargets: number[],
  pixelsPerMs: number
): number => {
  if (snapTargets.length === 0) return targetTime;
  
  let closestTarget = targetTime;
  let minDistance = Infinity;
  
  for (const snapTarget of snapTargets) {
    const distance = Math.abs(targetTime - snapTarget);
    const pixelDistance = distance * pixelsPerMs;
    
    if (pixelDistance <= SNAP_THRESHOLD && distance < minDistance) {
      minDistance = distance;
      closestTarget = snapTarget;
    }
  }
  
  return closestTarget;
};

export const generateSnapTargets = (
  bpm: number,
  countSize: 4 | 6 | 8,
  songDuration: number,
  markers: number[],
  viewportStartTime: number,
  viewportDuration: number,
  beatAnchorMs = 0,
  phraseStartMs: number | null = null,
): number[] => {
  const targets: number[] = [];
  
  // Add phrase boundaries for the selected dance-count size.
  const msPerBeat = 60000 / bpm;
  const msPerMajorLine = msPerBeat * countSize;
  const safeAnchor = Number.isFinite(beatAnchorMs) ? beatAnchorMs : 0;
  const majorLineOrigin = phraseStartMs !== null && Number.isFinite(phraseStartMs)
    ? phraseStartMs
    : safeAnchor;

  const startBeat = Math.floor((viewportStartTime - majorLineOrigin) / msPerMajorLine);
  const endBeat = Math.ceil(
    (viewportStartTime + viewportDuration - majorLineOrigin) / msPerMajorLine,
  );
  
  for (let beat = startBeat; beat <= endBeat; beat++) {
    const beatTime = majorLineOrigin + beat * msPerMajorLine;
    if (beatTime >= 0 && beatTime <= songDuration) {
      targets.push(beatTime);
    }
  }
  
  // Add markers within viewport
  const visibleMarkers = markers.filter(marker => 
    marker >= viewportStartTime && marker <= viewportStartTime + viewportDuration
  );
  targets.push(...visibleMarkers);
  
  return targets;
};
