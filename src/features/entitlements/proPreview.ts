/** Only features exposed in the current phone app belong in this showcase. */
export const PRO_FEATURE_PREVIEWS = [
  { demo: 'playback', category: 'Playback', title: 'Play songs back to back', detail: 'Continuous Play starts the next song in your queue when this one ends.' },
  { demo: 'speed', category: 'Speed', title: 'Set your rehearsal speed', detail: 'Adjust speed in 0.05× steps. Choose 4, 8 or 12 presets, then hold one to save a speed you use often.' },
  { demo: 'tempo', category: 'Tempo', title: 'Line up your counts', detail: 'Preview the suggested BPM against the song. Apply it when the counts line up.' },
  { demo: 'remote', category: 'Lock Screen', title: 'Use the Lock Screen', detail: 'Play, pause or skip ten seconds from the Lock Screen or Control Centre.' },
] as const;

/** Current app behavior, deliberately separate from the future entitlement roadmap. */
export const PRO_COMPARISON = [
  { label: 'Fine speed adjustment', pro: '✓', lite: '—' },
  { label: 'Custom speed presets', pro: '4 / 8 / 12', lite: '—' },
  { label: 'Continuous Play', pro: '✓', lite: '—' },
  { label: 'Timing & BPM controls', pro: '✓', lite: '—' },
  { label: 'Automatic BPM suggestion', pro: '✓', lite: '—' },
  { label: 'Lock Screen controls', pro: '✓', lite: '—' },
  { label: 'Import your own music', pro: '✓', lite: '✓' },
  { label: 'Waveform & scrubbing', pro: '✓', lite: '✓' },
  { label: 'Markers & annotation notes', pro: '✓', lite: '✓' },
  { label: 'Save & reopen projects', pro: '✓', lite: '✓' },
  { label: 'Repeat & loop ranges', pro: '✓', lite: '✓' },
  { label: 'Built-in speed presets', pro: '✓', lite: '✓' },
  { label: 'CSV & PDF export', pro: '✓', lite: '✓' },
] as const;
