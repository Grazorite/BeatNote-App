import {
  SHEET_CLOSE_DRAG_RATIO,
  SHEET_MEDIUM_DETENT_RATIO,
} from './libraryConstants';

export type SheetReleaseTarget = 'close' | 'medium' | 'large';

/**
 * Resolve a sheet's vertical top-edge offset after a drag.
 * Large is offset 0; medium exposes half of the available sheet height.
 */
export const resolveSheetRelease = (
  sheetHeight: number,
  releaseOffset: number,
): SheetReleaseTarget => {
  const safeHeight = Number.isFinite(sheetHeight) ? Math.max(0, sheetHeight) : 0;
  const safeOffset = Number.isFinite(releaseOffset) ? releaseOffset : 0;
  const mediumHeight = safeHeight * SHEET_MEDIUM_DETENT_RATIO;
  const mediumOffset = safeHeight - mediumHeight;
  const closeThreshold = mediumOffset + mediumHeight * SHEET_CLOSE_DRAG_RATIO;

  if (safeOffset > closeThreshold) return 'close';

  const distanceToLarge = Math.abs(safeOffset);
  const distanceToMedium = Math.abs(safeOffset - mediumOffset);
  return distanceToMedium <= distanceToLarge ? 'medium' : 'large';
};
