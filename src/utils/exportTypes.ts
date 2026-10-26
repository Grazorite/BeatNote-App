import { Layer } from '../hooks/useStudioStore';

export type ExportFormat = 'midi' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  /** Optional caller-supplied safe filename, including extension. */
  filename?: string;
  layers: Layer[];
  bpm: number;
  countSize: 4 | 6 | 8;
  songDuration: number;
  projectName: string;
}

export interface PDFExportOptions extends ExportOptions {
  format: 'pdf';
  includeHeader: boolean;
  includeTimeline: boolean;
  includeMarkerList: boolean;
  includeCountGrid: boolean;
  includeNotes: boolean;
}

export interface ExportResult {
  filename: string;
  uri?: string;
  shared?: boolean;
}

export interface ExportError {
  code: 'UNSUPPORTED_PLATFORM' | 'WRITE_FAILED' | 'SHARE_FAILED' | 'NO_DATA';
  message: string;
}
