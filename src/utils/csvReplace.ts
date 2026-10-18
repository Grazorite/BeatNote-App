import type { Layer, LayerId, MarkerAnnotation } from '../hooks/useStudioStore';
import type { CsvImportPreview, CsvUndoSnapshot, DraftUiState } from '../types/csvImport';
import { ImportEngine } from './importEngine';

const LAYER_IDS: readonly LayerId[] = [
  'vocals',
  'drums',
  'bass',
  'piano',
  'guitar',
  'other',
];

type LayerData = { markers: number[]; annotations: MarkerAnnotation[] };

const cloneLayerData = (data: LayerData): LayerData => ({
  markers: [...data.markers],
  annotations: data.annotations.map(annotation => ({ ...annotation })),
});

export function parseCsvForPreview(
  text: string,
  layers: readonly Layer[],
  songDuration: number,
): CsvImportPreview {
  const parsed = ImportEngine.parseCSV(text, true);
  const imported: CsvImportPreview['imported'] = {};
  let importedAnnotationCount = 0;
  let beyondDurationCount = 0;

  for (const id of LAYER_IDS) {
    const layer = parsed.layers[id];
    if (!layer) continue;
    imported[id] = cloneLayerData(layer);
    importedAnnotationCount += layer.annotations.length;
    beyondDurationCount += layer.markers.filter(timestamp => timestamp > songDuration).length;
  }

  return {
    sourceName: '',
    imported,
    importedMarkerCount: parsed.importedMarkers,
    importedAnnotationCount,
    skippedRows: parsed.skippedRows,
    existingMarkerCount: layers.reduce((total, layer) => total + layer.markers.length, 0),
    existingAnnotationCount: layers.reduce((total, layer) => total + layer.annotations.length, 0),
    beyondDurationCount,
  };
}

export function applyCsvReplace(
  layers: Layer[],
  preview: CsvImportPreview,
  priorDraftState: DraftUiState = 'unsaved',
  createdAt = Date.now(),
): CsvUndoSnapshot {
  const snapshotLayers = {} as CsvUndoSnapshot['layers'];

  for (const id of LAYER_IDS) {
    const layer = layers.find(candidate => candidate.id === id);
    snapshotLayers[id] = layer
      ? cloneLayerData(layer)
      : { markers: [], annotations: [] };
  }

  for (const layer of layers) {
    const imported = preview.imported[layer.id];
    const replacement = imported ?? { markers: [], annotations: [] };
    const cloned = cloneLayerData(replacement);
    layer.markers = cloned.markers;
    layer.annotations = cloned.annotations;
  }

  return { layers: snapshotLayers, priorDraftState, createdAt };
}

export function restoreCsvUndo(
  layers: readonly Layer[],
  snapshot: CsvUndoSnapshot,
): Layer[] {
  return layers.map(layer => {
    const restored = cloneLayerData(snapshot.layers[layer.id]);
    return { ...layer, markers: restored.markers, annotations: restored.annotations };
  });
}
