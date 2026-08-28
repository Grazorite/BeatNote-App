import { Layer } from '../hooks/useStudioStore';
import { ExportOptions } from './exportTypes';

function sanitizeProjectName(projectName: string): string {
  return projectName.replace(/[^a-zA-Z0-9]/g, '_');
}

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
        layer: layer.name,
        annotation: annotation?.text ?? '',
      });
    });
  });

  allMarkers.sort((a, b) => a.time - b.time);
  return allMarkers;
}

export function buildCsvContent(options: ExportOptions): { filename: string; content: string } {
  const allMarkers = collectVisibleMarkers(options.layers);
  const filename = `${sanitizeProjectName(options.projectName)}_markers.csv`;

  if (allMarkers.length === 0) {
    return {
      filename,
      content: 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Annotation\n',
    };
  }

  let csvContent = 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Annotation\n';

  allMarkers.forEach((marker) => {
    const seconds = (marker.time / 1000).toFixed(3);
    const bars = Math.floor(marker.time / (60000 / options.bpm * 4)) + 1;
    const beats = Math.floor((marker.time % (60000 / options.bpm * 4)) / (60000 / options.bpm)) + 1;
    csvContent += `${marker.layer},${marker.time},${seconds},${bars}:${beats},"${marker.annotation.replace(/"/g, '""')}"\n`;
  });

  return { filename, content: csvContent };
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
      allMarkers.push({ time: markerTime, layer: layer.name, layerObj: layer });
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
