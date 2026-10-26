import { Layer } from '../hooks/useStudioStore';
import { ExportOptions, PDFExportOptions } from './exportTypes';
import { danceCountAtTime } from './danceCount';
import { getLayerDisplayName } from './layers';

function sanitizeProjectName(projectName: string): string {
  return projectName.replace(/[^a-zA-Z0-9]/g, '_');
}

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatClock = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

function collectVisibleMarkers(layers: Layer[]) {
  const allMarkers: { time: number; layer: string; annotation: string }[] = [];

  layers.forEach((layer) => {
    if (!layer.isVisible || layer.markers.length === 0) {
      return;
    }

    layer.markers.forEach((markerTime) => {
      const annotation = layer.annotations.find((ann) => Math.abs(ann.timestamp - markerTime) < 100);
      allMarkers.push({
        time: markerTime,
        layer: getLayerDisplayName(layer),
        annotation: annotation?.text ?? '',
      });
    });
  });

  allMarkers.sort((a, b) => a.time - b.time);
  return allMarkers;
}

export function buildCsvContent(options: ExportOptions): { filename: string; content: string } {
  const allMarkers = collectVisibleMarkers(options.layers);
  const filename = options.filename ?? `${sanitizeProjectName(options.projectName)}_markers.csv`;

  if (allMarkers.length === 0) {
    return {
      filename,
      content: 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Count (phrase:beat),Annotation\n',
    };
  }

  let csvContent = 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Count (phrase:beat),Annotation\n';

  allMarkers.forEach((marker) => {
    const seconds = (marker.time / 1000).toFixed(3);
    const bars = Math.floor(marker.time / (60000 / options.bpm * 4)) + 1;
    const beats = Math.floor((marker.time % (60000 / options.bpm * 4)) / (60000 / options.bpm)) + 1;
    const danceCount = danceCountAtTime(marker.time, options.bpm, options.countSize);
    csvContent += `${marker.layer},${marker.time},${seconds},${bars}:${beats},${danceCount.phrase}:${danceCount.count},"${marker.annotation.replace(/"/g, '""')}"\n`;
  });

  return { filename, content: csvContent };
}

export function buildPdfHtml(options: PDFExportOptions): { filename: string; html: string } {
  const markers = collectVisibleMarkers(options.layers).map(marker => ({
    ...marker,
    danceCount: danceCountAtTime(marker.time, options.bpm, options.countSize),
  }));
  const filename = options.filename ?? `${sanitizeProjectName(options.projectName)}_choreography.pdf`;
  const markerRows = markers.map(marker => `
    <tr>
      <td>${escapeHtml(formatClock(marker.time))}</td>
      <td>${marker.danceCount.phrase}:${marker.danceCount.count}</td>
      <td>${escapeHtml(marker.layer)}</td>
      ${options.includeNotes ? `<td>${escapeHtml(marker.annotation || '—')}</td>` : ''}
    </tr>`).join('');
  const timelineMarkers = markers.map(marker => {
    const left = options.songDuration > 0
      ? Math.min(100, Math.max(0, marker.time / options.songDuration * 100))
      : 0;
    return `<span class="timeline-marker" style="left:${left.toFixed(3)}%" title="${escapeHtml(marker.layer)}"></span>`;
  }).join('');
  const countRows = markers.map(marker => `
    <tr><td>${marker.danceCount.phrase}</td><td>${marker.danceCount.count}</td><td>${escapeHtml(formatClock(marker.time))}</td><td>${escapeHtml(marker.layer)}</td></tr>`).join('');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(options.projectName)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { color: #17171c; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11pt; margin: 0; }
  h1 { font-size: 24pt; margin: 0 0 4px; }
  h2 { border-bottom: 1px solid #d8d8df; font-size: 14pt; margin: 24px 0 10px; padding-bottom: 5px; }
  .meta { color: #5d5d68; display: flex; gap: 20px; }
  .timeline { background: #ececf2; border-radius: 5px; height: 22px; margin: 18px 0 4px; position: relative; }
  .timeline-marker { background: #d89018; border: 1px solid #6f4607; height: 22px; position: absolute; top: 0; width: 3px; }
  .timeline-labels { color: #696973; display: flex; font-size: 9pt; justify-content: space-between; }
  table { border-collapse: collapse; page-break-inside: auto; width: 100%; }
  tr { page-break-inside: avoid; }
  th { background: #292931; color: #fff; text-align: left; }
  th, td { border: 1px solid #d8d8df; padding: 7px 8px; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f6f6f8; }
  .empty { color: #696973; font-style: italic; }
</style></head><body>
${options.includeHeader ? `<header><h1>${escapeHtml(options.projectName)}</h1><div class="meta"><span>${options.bpm} BPM</span><span>${options.countSize}-count phrases</span><span>${markers.length} markers</span></div></header>` : ''}
${options.includeTimeline ? `<section><h2>Timeline</h2><div class="timeline">${timelineMarkers}</div><div class="timeline-labels"><span>0:00</span><span>${escapeHtml(formatClock(options.songDuration))}</span></div></section>` : ''}
${options.includeMarkerList ? `<section><h2>Choreography markers</h2>${markers.length === 0 ? '<p class="empty">No visible markers.</p>' : `<table><thead><tr><th>Time</th><th>Count</th><th>Layer</th>${options.includeNotes ? '<th>Notes</th>' : ''}</tr></thead><tbody>${markerRows}</tbody></table>`}</section>` : ''}
${options.includeCountGrid ? `<section><h2>Count grid</h2>${markers.length === 0 ? '<p class="empty">No counts to show.</p>' : `<table><thead><tr><th>Phrase</th><th>Count</th><th>Time</th><th>Layer</th></tr></thead><tbody>${countRows}</tbody></table>`}</section>` : ''}
</body></html>`;

  return { filename, html };
}

function encodeVariableLength(mutValue: number): number[] {
  const bytes: number[] = [];
  bytes.push(mutValue & 0x7f);
  mutValue >>= 7;

  while (mutValue > 0) {
    bytes.unshift((mutValue & 0x7f) | 0x80);
    mutValue >>= 7;
  }

  return bytes;
}

export function buildMidiData(options: ExportOptions): { filename: string; data: Uint8Array } {
  const { layers, bpm, projectName } = options;

  const header = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    0x01, 0xe0,
  ]);

  const trackHeader = new Uint8Array([
    0x4d, 0x54, 0x72, 0x6b,
    0x00, 0x00, 0x00, 0x00,
  ]);

  const tempoMicroseconds = Math.floor(60000000 / bpm);
  const tempoEvent = new Uint8Array([
    0x00,
    0xff, 0x51, 0x03,
    (tempoMicroseconds >> 16) & 0xff,
    (tempoMicroseconds >> 8) & 0xff,
    tempoMicroseconds & 0xff,
  ]);

  let trackData = new Uint8Array([...tempoEvent]);

  const allMarkers: { time: number; layer: string; layerObj: Layer }[] = [];
  layers.forEach((layer) => {
    if (!layer.isVisible) {
      return;
    }

    layer.markers.forEach((markerTime) => {
      allMarkers.push({ time: markerTime, layer: getLayerDisplayName(layer), layerObj: layer });
    });
  });

  allMarkers.sort((a, b) => a.time - b.time);

  let lastTime = 0;
  allMarkers.forEach((marker) => {
    const deltaTime = Math.max(0, Math.floor((marker.time - lastTime) * 480 / 1000));

    const annotation = marker.layerObj.annotations.find((ann) => Math.abs(ann.timestamp - marker.time) < 100);
    const markerText = annotation?.text ? `${marker.layer}: ${annotation.text}` : `${marker.layer} Marker`;

    const textBytes = new TextEncoder().encode(markerText);
    const deltaTimeBytes = encodeVariableLength(deltaTime);

    const markerEvent = new Uint8Array([
      ...deltaTimeBytes,
      0xff, 0x01,
      textBytes.length,
      ...textBytes,
    ]);

    trackData = new Uint8Array([...trackData, ...markerEvent]);
    lastTime = marker.time;
  });

  const endOfTrack = new Uint8Array([0x00, 0xff, 0x2f, 0x00]);
  trackData = new Uint8Array([...trackData, ...endOfTrack]);

  const trackLength = trackData.length;
  trackHeader[7] = trackLength & 0xff;
  trackHeader[6] = (trackLength >> 8) & 0xff;
  trackHeader[5] = (trackLength >> 16) & 0xff;
  trackHeader[4] = (trackLength >> 24) & 0xff;

  const filename = `${sanitizeProjectName(projectName)}_markers.mid`;
  const data = new Uint8Array([...header, ...trackHeader, ...trackData]);

  return { filename, data };
}
