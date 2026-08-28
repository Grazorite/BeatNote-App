import { Platform } from 'react-native';
import { ExportOptions, ExportResult } from './exportTypes';

interface ExportEngineContract {
  exportToCSV(options: ExportOptions): Promise<ExportResult>;
  exportToMIDI(options: ExportOptions): Promise<ExportResult>;
}

async function getExportEngine(): Promise<ExportEngineContract> {
  if (Platform.OS === 'web') {
    return (await import('./exportEngine.web')).ExportEngine as ExportEngineContract;
  }

  if (Platform.OS === 'ios') {
    return (await import('./exportEngine.ios')).ExportEngine as ExportEngineContract;
  }

  throw new Error('Export is currently supported on web and iOS only');
}

export class ExportEngine {
  static async exportToCSV(options: ExportOptions): Promise<ExportResult> {
    const engine = await getExportEngine();
    return engine.exportToCSV(options);
  }

  static async exportToMIDI(options: ExportOptions): Promise<ExportResult> {
    const engine = await getExportEngine();
    return engine.exportToMIDI(options);
  }
}

export type { ExportOptions, ExportResult } from './exportTypes';
