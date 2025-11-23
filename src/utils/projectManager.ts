import AsyncStorage from '@react-native-async-storage/async-storage';
import { BeatNoteProject, ProjectListItem } from '../types/project';

const PROJECTS_KEY = 'beatnote_projects';
const PROJECT_VERSION = '1.0.0';

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
        version: PROJECT_VERSION,
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
      
      return project;
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