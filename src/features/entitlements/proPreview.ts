/** Only features exposed in the current phone app belong in this showcase. */
export const PRO_FEATURE_PREVIEWS = [
  { demo: 'playback', category: 'Playback', title: 'Keep rehearsal moving', detail: 'Play through your queue without stopping. Continuous Play starts the next song so you can stay in the flow.' },
  { demo: 'speed', category: 'Speed', title: 'Practise at your pace', detail: 'Fine-tune your speed. Choose 4, 8, or 12 presets and long-press any preset to make it your own.' },
  { demo: 'tempo', category: 'Tempo', title: 'Find the beat faster', detail: 'Get a suggested BPM for your music. Preview the beat grid, adjust the timing, and apply it when it fits.' },
  { demo: 'remote', category: 'Lock Screen', title: 'Stay in control', detail: 'Pause, play, and seek from the Lock Screen or Control Centre without returning to the studio.' },
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
