/**
 * Shared geometry for the waveform marker head. It reuses the in-app marker shield
 * (BeatNoteIcon "marker", 24-unit box) so a marker looks the same in the toolbar, the wrapped
 * rows, and the overview strip.
 */

/** Solid shield, used for annotated markers. */
export const MARKER_SHIELD_PATH = 'M7 4h10v10l-5 5-5-5Z';

/** Inset shield for stroked, outlined heads (plain markers). */
export const MARKER_SHIELD_OUTLINE_PATH = 'M7.7 4.7h8.6v9l-4.3 4.3-4.3-4.3Z';

/** Distance, in shield units, from the shield's top edge to where the marker line should begin. */
export const MARKER_SHIELD_LINE_START = 14;

/**
 * SVG transform that centres the shield horizontally on `x` and places its top edge at `top`.
 * The shield occupies x 7–17 and y 4–19 of its 24-unit box.
 */
export const markerHeadTransform = (x: number, top: number, scale: number): string => (
  `translate(${x - 12 * scale} ${top - 4 * scale}) scale(${scale})`
);
