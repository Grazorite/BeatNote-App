/** Only features exposed in the current phone app belong in this showcase. */
export const PRO_FEATURE_PREVIEWS = [
  { demo: 'tempo', category: 'Tempo', title: 'Find the BPM and line up your counts', detail: 'Get a BPM suggestion for your song. Preview the beat grid and apply it when the counts line up.' },
  { demo: 'speed', category: 'Speed', title: 'Set your rehearsal speed', detail: 'Adjust speed in 0.05× steps. Choose 4, 8 or 12 presets, then hold one to save a speed you use often.' },
  { demo: 'appearance', category: 'Timeline appearance', title: 'Add a waveform to your timeline', detail: 'See the shape of your song and name your annotation lane.' },
  { demo: 'playback', category: 'Playback', title: 'Play songs back to back', detail: 'Continuous Play starts the next song in your queue when this one ends.' },
  { demo: 'remote', category: 'System playback controls', title: 'Control music outside BeatNote', detail: 'Play, pause or skip ten seconds from the player on your Lock Screen or in Control Centre.' },
] as const;

/** Current app behavior, deliberately separate from the future entitlement roadmap. */
export const PRO_COMPARISON = [
  { label: 'Automatic BPM suggestion', pro: '✓', lite: '—' },
  { label: 'Timing & BPM controls', pro: '✓', lite: '—' },
  { label: 'Fine speed adjustment', pro: '✓', lite: '—' },
  { label: 'Custom speed presets', pro: '4 / 8 / 12', lite: '—' },
  { label: 'Waveform display', pro: '✓', lite: '—' },
  { label: 'Custom annotation label', pro: '✓', lite: '—' },
  { label: 'Continuous Play', pro: '✓', lite: '—' },
  { label: 'System playback controls', pro: '✓', lite: '—' },
  { label: 'Import your own music', pro: '✓', lite: '✓' },
  { label: 'Timeline scrubbing', pro: '✓', lite: '✓' },
  { label: 'Markers & annotation notes', pro: '✓', lite: '✓' },
  { label: 'Save & reopen projects', pro: '✓', lite: '✓' },
  { label: 'Repeat & loop ranges', pro: '✓', lite: '✓' },
  { label: 'Built-in speed presets', pro: '✓', lite: '✓' },
  { label: 'CSV & PDF export', pro: '✓', lite: '✓' },
] as const;
