import { ExportOptions, ExportResult } from './exportTypes';
import { buildCsvContent, buildMidiData } from './exportEngineCore';

export class ExportEngine {
  static async exportToCSV(options: ExportOptions): Promise<ExportResult> {
    const { filename, content } = buildCsvContent(options);
    this.downloadFile(content, filename, 'text/csv');
    return { filename };
  }

  static async exportToMIDI(options: ExportOptions): Promise<ExportResult> {
    const { filename, data } = buildMidiData(options);
    this.downloadBinaryFile(data, filename, 'audio/midi');
    return { filename };
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static downloadBinaryFile(data: Uint8Array, filename: string, mimeType: string): void {
    const blob = new Blob([new Uint8Array(data)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
