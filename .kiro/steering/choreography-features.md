---
inclusion: always
---

# BeatNote — Choreography-Specific Features

## Status

The original six choreography feature areas are implemented in the V1 preview: dance-count timing,
custom layer names, PDF export, pitch-preserved speed, annotation vocabulary suggestions, and
phrase/count CSV data. Remaining work is physical-device acceptance and Lite/Pro enforcement, not
initial implementation.

## Dance-count grid and authored timing

- `countSize` supports 4, 6, or 8 counts and defaults to 8.
- Project BPM, `beatAnchorMs`, and optional `phraseStartMs` are the source of truth for beat, phrase,
  snapping, live count, waveform guidance, and export calculations.
- The persisted `showDanceCounts` setting hides or shows phrase emphasis, waveform count labels, and
  the live transport count. It does not change snapping or export semantics.
- Automatic BPM analysis is assistance only. It offers a preview that the user can apply or decline;
  it never silently replaces an authored grid.
- Downbeat/phrase-start confidence is advisory. Users can always set Count 1 manually and use fine
  anchor nudges.

Basic automatic BPM assistance belongs to the proposed Lite workflow. V2 Pro may add advanced tempo
maps, deeper phrase/downbeat assistance, and configurable or batch analysis.

## Waveform display

- Decoded waveform artwork in the wrapped canvas, detail canvas, and overview strip is controlled by
  the `waveform.display` Pro capability and a persisted `showWaveform` project setting.
- The toggle is off for new and older projects unless the user enables it.
- With artwork off, the same timeline geometry renders as solid timing/progress bars. Seeking,
  scrubbing, markers, loops, playhead, BPM/count guidance, and annotations remain fully usable in Lite.
- V1's preview entitlement exposes the toggle for validation. Purchase enforcement begins only with
  the V2 entitlement rollout.

## Annotation lane names

- `Layer.customName` is persisted without changing the stable `LayerId` schema.
- The V1 phone editor exposes one lane, internally `vocals`, presented as **Annotations** unless the
  user supplies a custom name.
- Existing multi-layer projects remain readable. Multi-layer editing and naming are V2 Pro expansion
  candidates.

## PDF choreography export

The project export surface supports CSV and PDF in V1. The PDF can include:

- project/song header;
- timeline;
- timestamped marker list;
- phrase/count grid; and
- notes/annotations.

Web builds create printable HTML and open the browser print flow. iOS uses `expo-print` and the share
sheet. MIDI generation remains in the engine for compatibility but is not exposed in the V1 UI.

## Pitch-preserved rehearsal speed

- Playback supports 0.5× through 2× in 0.05× increments, defaulting to 1×.
- Common presets are `0.5×, 0.75×, 0.8×, 0.9×, 1×, 1.25×, 1.5×, 2×`.
- `expo-audio` applies high-quality pitch correction at the player boundary.
- Playback speed persists with project/draft content and survives play, pause, seek, loop, source,
  queue, and background-audio lifecycle changes.
- V1 physical acceptance still needs musical-quality checks across the range, live adjustment,
  VoiceOver, Bluetooth, interruptions, background playback, and loops.

Pitch-preserved speed is available in the V1 preview while `beatnote.pro` is not enforced. It remains
a V2 Pro candidate; 1× playback must remain available in Lite.

## Annotation vocabulary

Free-text annotations include built-in suggestion chips: `Hit`, `8-count`, `Formation`, `Freeze`,
`Turn`, `Jump`, and `Accent`. Built-in suggestions remain available in Lite. User-defined vocabulary
sets and reusable choreography templates are V2 Pro candidates.

## CSV choreography data

CSV export includes stable timestamps, BPM-derived bar/beat timing, `Count (phrase:beat)`, layer name,
and annotation. Count values use the same authored BPM/anchor/phrase-start contract as the editor and
PDF export. CSV remains the baseline Lite export format.
