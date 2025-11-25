export class ImportEngine {
  static async importFromCSV(csvContent: string): Promise<{ layers: { [layerId: string]: { markers: number[]; annotations: { timestamp: number; text: string }[] } } }> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Invalid CSV format');
    
    const header = lines[0];
    if (!header.includes('Layer') || !header.includes('Marker Time (ms)')) {
      throw new Error('Invalid CSV format - missing required columns');
    }
    
    const layerData: { [layerId: string]: { markers: number[]; annotations: { timestamp: number; text: string }[] } } = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line with quoted fields
      const matches = line.match(/([^,]+),([^,]+),([^,]+),([^,]+),"([^"]*)"/); 
      if (!matches) continue;
      
      const [, layerName, markerTimeMs, , , annotation] = matches;
      const timestamp = parseInt(markerTimeMs);
      
      if (isNaN(timestamp)) continue;
      
      // Map layer names to IDs
      const layerIdMap: { [name: string]: string } = {
        'Vocals': 'vocals',
        'Drums': 'drums', 
        'Bass': 'bass',
        'Piano': 'piano',
        'Guitar': 'guitar',
        'Other': 'other'
      };
      
      const layerId = layerIdMap[layerName];
      if (!layerId) continue;
      
      if (!layerData[layerId]) {
        layerData[layerId] = { markers: [], annotations: [] };
      }
      
      layerData[layerId].markers.push(timestamp);
      
      if (annotation.trim()) {
        layerData[layerId].annotations.push({ timestamp, text: annotation });
      }
    }
    
    return { layers: layerData };
  }
}