import AsyncStorage from '@react-native-async-storage/async-storage';
import { BeatNoteProject, ProjectListItem } from '../types/project';
import {
  isValidLoopRange,
  normalizeLoopRange,
  reclampLoopRangeToDuration,
} from './loopRange';
import { normalizePlaybackSpeed } from './playbackSpeed';

const PROJECTS_KEY = 'beatnote_projects';
export const PROJECT_VERSION = '1.1.0';

/** Compare major.minor.patch project versions by numeric component. */
export function compareProjectVersion(a: string, b: string): -1 | 0 | 1 {
  const parse = (version: string): [number, number, number] => {
    const components = version.split('.').slice(0, 3).map(component => Number.parseInt(component, 10));
    return [components[0] || 0, components[1] || 0, components[2] || 0];
  };
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

const warnInvalidLoopRange = (range: unknown, songDuration: number): void => {
  console.warn('Ignoring invalid persisted loop range', { range, songDuration });
};

const normalizePersistedLoop = (project: BeatNoteProject): BeatNoteProject => {
  const rawRange = project.settings.loopRange;
  if (compareProjectVersion(project.version, PROJECT_VERSION) < 0
    || rawRange === undefined
    || rawRange === null) {
    return {
      ...project,
      settings: { ...project.settings, loopRange: null, loopEnabled: false },
    };
  }

  if (typeof rawRange !== 'object'
    || typeof rawRange.startMs !== 'number'
    || typeof rawRange.endMs !== 'number'
    || !Number.isFinite(rawRange.startMs)
    || !Number.isFinite(rawRange.endMs)
    || rawRange.startMs >= rawRange.endMs) {
    warnInvalidLoopRange(rawRange, project.metadata.duration);
    return {
      ...project,
      settings: { ...project.settings, loopRange: null, loopEnabled: false },
    };
  }

  const duration = project.metadata.duration;
  const durationIsValid = Number.isFinite(duration) && duration > 0;
  const normalizedDuration = durationIsValid ? Math.floor(duration + 0.5) : 0;
  const normalized = durationIsValid
    ? reclampLoopRangeToDuration(
        { loopStartMs: rawRange.startMs, loopEndMs: rawRange.endMs },
        normalizedDuration,
      )
    : normalizeLoopRange(rawRange.startMs, rawRange.endMs, 0);
  const accepted = durationIsValid
    ? rawRange.startMs < normalizedDuration && isValidLoopRange(normalized, normalizedDuration)
    : normalized.loopStartMs !== null && normalized.loopEndMs !== null;

  if (!accepted) {
    warnInvalidLoopRange(rawRange, duration);
    return {
      ...project,
      settings: { ...project.settings, loopRange: null, loopEnabled: false },
    };
  }

  return {
    ...project,
    settings: {
      ...project.settings,
      loopRange: {
        startMs: normalized.loopStartMs as number,
        endMs: normalized.loopEndMs as number,
      },
      loopEnabled: typeof project.settings.loopEnabled === 'boolean'
        ? project.settings.loopEnabled
        : false,
    },
  };
};

const withProjectDefaults = (project: BeatNoteProject): BeatNoteProject => normalizePersistedLoop({
  ...project,
  settings: {
    ...project.settings,
    primaryView: project.settings.primaryView ?? 'wrapped',
    countSize: project.settings.countSize ?? 8,
    rowDensity: project.settings.rowDensity ?? { mode: 'phrase' },
    followPlayhead: project.settings.followPlayhead ?? true,
    playbackSpeed: normalizePlaybackSpeed(project.settings.playbackSpeed ?? 1),
  },
});

export class ProjectManager {
  static async getStoredProjects(): Promise<Record<string, BeatNoteProject>> {
    try {
      const stored = await AsyncStorage.getItem(PROJECTS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get stored projects:', error);
      return {};
    }
  }

  static async setStoredProjects(projects: Record<string, BeatNoteProject>): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to store projects:', error);
      throw new Error('Failed to store projects');
    }
  }

  static async saveProject(project: BeatNoteProject, filename?: string): Promise<string> {
    try {
      const projects = await this.getStoredProjects();
      const projectFilename = filename || `${project.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.beatnote`;
      
      const projectCopy = {
        ...project,
        version: compareProjectVersion(project.version, PROJECT_VERSION) > 0
          ? project.version
          : PROJECT_VERSION,
        metadata: {
          ...project.metadata,
          modifiedAt: new Date().toISOString(),
        },
      };
      
      projects[projectFilename] = projectCopy;
      await this.setStoredProjects(projects);
      return projectFilename;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  static async loadProject(filename: string): Promise<BeatNoteProject> {
    try {
      const projects = await this.getStoredProjects();
      const project = projects[filename];
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Validate project structure
      if (!project.version || !project.metadata || !project.layers) {
        throw new Error('Invalid project file format');
      }
      
      return withProjectDefaults(project);
    } catch (error) {
      console.error(`Failed to load project ${filename}:`, error);
      throw new Error('Failed to load project');
    }
  }

  static async listProjects(): Promise<ProjectListItem[]> {
    try {
      const projects = await this.getStoredProjects();
      const projectList: ProjectListItem[] = [];
      
      for (const [filename, project] of Object.entries(projects)) {
        try {
          projectList.push({
            filename,
            name: project.metadata.name,
            modifiedAt: project.metadata.modifiedAt,
            duration: project.metadata.duration,
            stemCount: project.metadata.stemCount,
            markerCount: project.layers.reduce((sum, layer) => sum + layer.markers.length, 0),
          });
        } catch (error) {
          console.warn(`Failed to process project ${filename}:`, error);
        }
      }
      
      return projectList.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  static async deleteProject(filename: string): Promise<void> {
    try {
      const projects = await this.getStoredProjects();
      delete projects[filename];
      await this.setStoredProjects(projects);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project');
    }
  }

  static async renameProject(oldFilename: string, newName: string): Promise<string> {
    try {
      const projects = await this.getStoredProjects();
      const project = projects[oldFilename];
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      project.metadata.name = newName;
      project.metadata.modifiedAt = new Date().toISOString();
      
      const newFilename = `${newName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.beatnote`;
      
      // Add with new filename and remove old
      projects[newFilename] = project;
      delete projects[oldFilename];
      
      await this.setStoredProjects(projects);
      return newFilename;
    } catch (error) {
      console.error('Failed to rename project:', error);
      throw new Error('Failed to rename project');
    }
  }
}
