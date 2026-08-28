import * as FileSystem from 'expo-file-system/legacy';
import { Share } from 'react-native';
import { ExportOptions, ExportResult } from './exportTypes';
import { buildCsvContent, buildMidiData } from './exportEngineCore';

const EXPORT_DIR = 'beatnote_exports';

function toBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let i = 0;

  while (i < bytes.length) {
    const a = bytes[i++] ?? 0;
    const b = bytes[i++] ?? 0;
    const c = bytes[i++] ?? 0;

    const triple = (a << 16) | (b << 8) | c;
    output += alphabet[(triple >> 18) & 0x3f];
    output += alphabet[(triple >> 12) & 0x3f];
    output += i - 2 < bytes.length ? alphabet[(triple >> 6) & 0x3f] : '=';
    output += i - 1 < bytes.length ? alphabet[triple & 0x3f] : '=';
  }

  return output;
}

async function ensureExportDirectory(): Promise<string> {
  const baseDir = FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error('Failed to access local document directory');
  }

  const directory = `${baseDir}${EXPORT_DIR}`;
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  return directory;
}

async function writeAndShare(uri: string): Promise<boolean> {
  const response = await Share.share({
    message: `BeatNote export: ${uri}`,
    url: uri,
    title: 'Export BeatNote file',
  });
  return response.action === Share.sharedAction;
}

export class ExportEngine {
  static async exportToCSV(options: ExportOptions): Promise<ExportResult> {
    const { filename, content } = buildCsvContent(options);
    const exportDirectory = await ensureExportDirectory();
    const uri = `${exportDirectory}/${filename}`;

    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const shared = await writeAndShare(uri);
    return { filename, uri, shared };
  }

  static async exportToMIDI(options: ExportOptions): Promise<ExportResult> {
    const { filename, data } = buildMidiData(options);
    const exportDirectory = await ensureExportDirectory();
    const uri = `${exportDirectory}/${filename}`;

    await FileSystem.writeAsStringAsync(uri, toBase64(data), {
      encoding: FileSystem.EncodingType.Base64,
    });

    const shared = await writeAndShare(uri);
    return { filename, uri, shared };
  }
}
