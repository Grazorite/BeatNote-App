export interface BeatNoteProject {
  version: string;
  metadata: {
    name: string;
    bpm: number;
    duration: number;
    stemCount: 2 | 4 | 6;
    createdAt: string;
    modifiedAt: string;
  };
  audio: {
    uri: string;
    filename: string;
  };
  layers: {
    id: string;
    name: string;
    color: string;
    markers: number[];
    annotations: { timestamp: number; text: string; }[];
    isVisible: boolean;
  }[];
  settings: {
    viewMode: 'unified' | 'multitrack';
    showGridLines: boolean;
    layerSpecificNavigation: boolean;
  };
}

export interface ProjectListItem {
  filename: string;
  name: string;
  modifiedAt: string;
  duration: number;
  stemCount: 2 | 4 | 6;
}