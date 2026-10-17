import type { LayerId, MarkerAnnotation } from '../hooks/useStudioStore';

export type DraftUiState = 'saved' | 'dirty' | 'unsaved' | 'emptyUnnamed';

export interface CsvImportPreview {
  sourceName: string;
  imported: Partial<Record<LayerId, {
    markers: number[];
    annotations: MarkerAnnotation[];
  }>>;
  importedMarkerCount: number;
  importedAnnotationCount: number;
  skippedRows: number;
  existingMarkerCount: number;
  existingAnnotationCount: number;
  beyondDurationCount: number;
}

export interface CsvUndoSnapshot {
  layers: Record<LayerId, {
    markers: number[];
    annotations: MarkerAnnotation[];
  }>;
  priorDraftState: DraftUiState;
  createdAt: number;
}
