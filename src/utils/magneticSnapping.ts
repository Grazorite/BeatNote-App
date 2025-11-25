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
  songDuration: number,
  markers: number[],
  viewportStartTime: number,
  viewportDuration: number
): number[] => {
  const targets: number[] = [];
  
  // Add major grid lines (every 8 beats)
  const beatsPerMs = bpm / 60000;
  const msPerBeat = 60000 / bpm;
  const msPerMajorLine = msPerBeat * 8;
  
  const startBeat = Math.floor(viewportStartTime / msPerMajorLine);
  const endBeat = Math.ceil((viewportStartTime + viewportDuration) / msPerMajorLine);
  
  for (let beat = startBeat; beat <= endBeat; beat++) {
    const beatTime = beat * msPerMajorLine;
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