import { LayerId, MarkerAnnotation } from '../hooks/useStudioStore';

export interface ImportedLayerData {
  markers: number[];
  annotations: MarkerAnnotation[];
}

export interface ImportResult {
  layers: Partial<Record<LayerId, ImportedLayerData>>;
  importedMarkers: number;
  skippedRows: number;
}

export interface ImportError {
  code: 'INVALID_FORMAT' | 'MISSING_COLUMNS' | 'EMPTY_FILE' | 'NO_VALID_ROWS';
  message: string;
}
