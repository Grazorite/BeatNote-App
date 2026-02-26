---
inclusion: always
---

# BeatNote — Choreography-Specific Features

## Target user

Choreographers and dancers who need to map music structure to movement. The app must support their specific vocabulary and workflow, not just generic audio annotation.

## 8-count grid mode

Dance is structured in 8-beat phrases (8-counts). Some styles use 6-count phrases (e.g. waltz, some Latin styles).

### 8-count implementation

- Add `countSize: 4 | 6 | 8` to the store (default: `8`)
- The rhythmic grid renders phrase boundaries at `countSize * (60000 / bpm)` ms intervals
- Individual beats still render at `60000 / bpm` ms intervals (lighter visual weight)
- Phrase boundaries render with higher opacity and a label (e.g. "1", "9", "17"...)
- `generateSnapTargets` in `magneticSnapping.ts` must include phrase boundaries as snap targets
- Add a count size selector to the sidebar (alongside BPM control)

### Beat counting display

- Show the current beat number and phrase number in the transport bar
- Format: `Phrase 3 | Beat 5` or `Bar 3 | Count 5` (use "Count" for dance context)
- Update in real time during playback

## Layer name customisation

Users can rename any of the 6 layers to match their choreography vocabulary (e.g. rename "Guitar" to "Formation", "Other" to "Counts").

### Layer name implementation

- Add `customName?: string` to the `Layer` interface in `useStudioStore.ts`
- Display `customName ?? name` everywhere a layer name is shown
- Add an inline edit on the layer selector (long-press or edit icon)
- Persist custom names in the project file (`BeatNoteProject.layers[].customName`)
- Do not change the `LayerId` — it remains the internal key

## PDF choreography export

Export a formatted PDF that a choreographer can print or share.

### Content (user-selectable, each section is a toggle)

- **Header**: song title, BPM, duration, export date
- **Timeline view**: horizontal bar showing phrase boundaries and marker positions per layer
- **Marker list**: table sorted by timestamp — columns: Time (mm:ss), Count (phrase:beat), Layer, Annotation
- **8-count grid layout**: grid with phrases as rows, counts 1–8 as columns, markers placed in cells
- **Notes section**: blank lined area at the bottom for handwritten notes

### PDF export implementation

- Use `react-native-html-to-pdf` or a web-based approach (generate HTML → print/share)
- On web: generate HTML string → `window.print()` or download as PDF via `html2pdf.js`
- On iOS: generate HTML → `expo-print` → share via share sheet
- Add PDF export option to `ExportModal` alongside existing CSV and MIDI options
- PDF export lives in `src/utils/exportEngine.ts` as `exportToPDF(options: PDFExportOptions)`

### PDFExportOptions type

```typescript
interface PDFExportOptions {
  projectName: string
  bpm: number
  songDuration: number
  countSize: 4 | 6 | 8
  layers: Layer[]
  sections: {
    header: boolean
    timelineView: boolean
    markerList: boolean
    countGrid: boolean
    notesSection: boolean
  }
}
```

## Slow-down / pitch-preserve playback

Allows dancers to learn sections at reduced speed without the pitch shifting down.

### Slow-down implementation

- iOS: native `AVAudioUnitTimePitch` via the `modules/audio-time-stretch/` Expo Module
- Web: `AudioContext` with `AudioBufferSourceNode.playbackRate` (no pitch preservation — acceptable degradation on web)
- Add a playback speed control to the transport bar: `0.5x | 0.75x | 1x` (default `1x`)
- Speed state: `playbackSpeed: 0.5 | 0.75 | 1.0` in the store
- The speed control is only fully functional on iOS; on web show it with a "(pitch may shift)" note

## Annotation vocabulary

Annotations are free-text but the UI should make common choreography terms easy to enter:

- Add a suggestion chip row above the annotation text field showing common terms
- Default suggestions: `"Hit"`, `"8-count"`, `"Formation"`, `"Freeze"`, `"Turn"`, `"Jump"`, `"Accent"`
- Tapping a chip appends it to the current annotation text
- Suggestions are not persisted — they are static defaults for now

## Export format for choreography notes (CSV)

The existing CSV export should include a `Count (phrase:beat)` column alongside the existing `Marker Time (bars:beats)` column, using the `countSize` setting for phrase calculation.

Update `ExportEngine.exportToCSV` to:

- Accept `countSize` in `ExportOptions`
- Add column: `Count (phrase:beat)` calculated as `Math.floor(timeMs / phraseMs) + 1 : beatWithinPhrase`
