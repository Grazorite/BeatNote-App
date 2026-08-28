import { LayerId } from '../hooks/useStudioStore';
import { ImportResult } from './importTypes';

const layerIdMap: Record<string, LayerId> = {
  Vocals: 'vocals',
  Drums: 'drums',
  Bass: 'bass',
  Piano: 'piano',
  Guitar: 'guitar',
  Other: 'other',
};

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export class ImportEngine {
  static async importFromCSV(csvContent: string): Promise<ImportResult> {
    const lines = csvContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    if (lines.length < 2) {
      throw new Error('Invalid CSV format');
    }

    const header = splitCsvLine(lines[0]);
    const layerIndex = header.findIndex((column) => column === 'Layer');
    const markerMsIndex = header.findIndex((column) => column === 'Marker Time (ms)');
    const annotationIndex = header.findIndex((column) => column === 'Annotation');

    if (layerIndex === -1 || markerMsIndex === -1) {
      throw new Error('Invalid CSV format - missing required columns');
    }

    const layers: ImportResult['layers'] = {};
    let importedMarkers = 0;
    let skippedRows = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const values = splitCsvLine(lines[i]);

      if (values.length <= Math.max(layerIndex, markerMsIndex)) {
        skippedRows += 1;
        continue;
      }

      const rawLayerName = values[layerIndex]?.trim();
      const rawTimestamp = values[markerMsIndex]?.trim();
      const annotation = annotationIndex >= 0 ? (values[annotationIndex] ?? '').trim() : '';

      const layerId = layerIdMap[rawLayerName];
      const timestamp = Number.parseInt(rawTimestamp, 10);

      if (!layerId || Number.isNaN(timestamp)) {
        skippedRows += 1;
        continue;
      }

      if (!layers[layerId]) {
        layers[layerId] = { markers: [], annotations: [] };
      }

      layers[layerId].markers.push(timestamp);
      if (annotation.length > 0) {
        layers[layerId].annotations.push({ timestamp, text: annotation });
      }

      importedMarkers += 1;
    }

    if (importedMarkers === 0) {
      throw new Error('No valid marker rows were found in the CSV');
    }

    return {
      layers,
      importedMarkers,
      skippedRows,
    };
  }
}
