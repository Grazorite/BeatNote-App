import { Platform } from 'react-native';
import { Layer } from '../hooks/useStudioStore';

export interface ExportOptions {
  format: 'midi' | 'csv';
  layers: Layer[];
  bpm: number;
  songDuration: number;
  projectName: string;
}

export class ExportEngine {
  static async exportToCSV(options: ExportOptions): Promise<string> {
    const { layers, projectName } = options;
    
    // CSV Header
    let csvContent = 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats)\n';
    
    // Add markers from all visible layers
    layers.forEach(layer => {
      if (layer.isVisible && layer.markers.length > 0) {
        layer.markers.forEach(markerTime => {
          const seconds = (markerTime / 1000).toFixed(3);
          const bars = Math.floor(markerTime / (60000 / options.bpm * 4)) + 1;
          const beats = Math.floor((markerTime % (60000 / options.bpm * 4)) / (60000 / options.bpm)) + 1;
          
          csvContent += `${layer.name},${markerTime},${seconds},${bars}:${beats}\n`;
        });
      }
    });
    
    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_markers.csv`;
    
    if (Platform.OS === 'web') {
      this.downloadFile(csvContent, filename, 'text/csv');
      return filename;
    }
    
    throw new Error('Export not supported on this platform');
  }
  
  static async exportToMIDI(options: ExportOptions): Promise<string> {
    const { layers, bpm, projectName } = options;
    
    // Simple MIDI file structure for markers
    const header = new Uint8Array([
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
      0x00, 0x00, // Format type 0
      0x00, 0x01, // Number of tracks (1)
      0x01, 0xE0  // Ticks per quarter note (480)
    ]);
    
    const trackHeader = new Uint8Array([
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      0x00, 0x00, 0x00, 0x00  // Track length (will be updated)
    ]);
    
    const tempoMicroseconds = Math.floor(60000000 / bpm);
    const tempoEvent = new Uint8Array([
      0x00, // Delta time
      0xFF, 0x51, 0x03, // Tempo meta event
      (tempoMicroseconds >> 16) & 0xFF,
      (tempoMicroseconds >> 8) & 0xFF,
      tempoMicroseconds & 0xFF
    ]);
    
    let trackData = new Uint8Array([...tempoEvent]);
    
    // Add markers as MIDI text events
    const allMarkers: { time: number; layer: string }[] = [];
    layers.forEach(layer => {
      if (layer.isVisible) {
        layer.markers.forEach(markerTime => {
          allMarkers.push({ time: markerTime, layer: layer.name });
        });
      }
    });
    
    allMarkers.sort((a, b) => a.time - b.time);
    
    let lastTime = 0;
    allMarkers.forEach(marker => {
      const deltaTime = Math.max(0, Math.floor((marker.time - lastTime) * 480 / 1000));
      const markerText = `${marker.layer} Marker`;
      const textBytes = new TextEncoder().encode(markerText);
      const deltaTimeBytes = this.encodeVariableLength(deltaTime);
      
      const markerEvent = new Uint8Array([
        ...deltaTimeBytes,
        0xFF, 0x01, // Text event
        textBytes.length,
        ...textBytes
      ]);
      
      trackData = new Uint8Array([...trackData, ...markerEvent]);
      lastTime = marker.time;
    });
    
    const endOfTrack = new Uint8Array([0x00, 0xFF, 0x2F, 0x00]);
    trackData = new Uint8Array([...trackData, ...endOfTrack]);
    
    // Update track length
    const trackLength = trackData.length;
    trackHeader[7] = trackLength & 0xFF;
    trackHeader[6] = (trackLength >> 8) & 0xFF;
    trackHeader[5] = (trackLength >> 16) & 0xFF;
    trackHeader[4] = (trackLength >> 24) & 0xFF;
    
    const midiData = new Uint8Array([...header, ...trackHeader, ...trackData]);
    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_markers.mid`;
    
    if (Platform.OS === 'web') {
      this.downloadBinaryFile(midiData, filename, 'audio/midi');
      return filename;
    }
    
    throw new Error('Export not supported on this platform');
  }
  
  private static encodeVariableLength(value: number): number[] {
    const bytes: number[] = [];
    bytes.push(value & 0x7F);
    value >>= 7;
    
    while (value > 0) {
      bytes.unshift((value & 0x7F) | 0x80);
      value >>= 7;
    }
    
    return bytes;
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