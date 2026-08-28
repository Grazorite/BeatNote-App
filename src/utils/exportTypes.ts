import { Layer } from '../hooks/useStudioStore';

export type ExportFormat = 'midi' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  layers: Layer[];
  bpm: number;
  songDuration: number;
  projectName: string;
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
