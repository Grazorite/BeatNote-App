import type { MusicItem } from '../types/library';
import type { SavedProjectSummary } from '../types/project';
import {
  DISPLAY_TITLE_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from './libraryConstants';

export type NameValidation =
  | { valid: true; value: string }
  | { valid: false; value: string; error: string };

export interface ProjectGroup {
  musicItemId: string;
  displayTitle: string;
  projects: SavedProjectSummary[];
}

export interface ProjectManagerSections {
  currentProject: SavedProjectSummary | null;
  currentDisplayTitle: string | null;
  projectsForCurrentSong: SavedProjectSummary[];
  allProjectGroups: ProjectGroup[];
  audioRemoved: SavedProjectSummary[];
}

const titleCollator = new Intl.Collator(undefined, { sensitivity: 'base' });

const compareModifiedNewest = (
  left: SavedProjectSummary,
  right: SavedProjectSummary,
): number => {
  if (left.modifiedAt > right.modifiedAt) return -1;
  if (left.modifiedAt < right.modifiedAt) return 1;
  if (left.projectId < right.projectId) return -1;
  if (left.projectId > right.projectId) return 1;
  return 0;
};

/** Trim and validate a user-entered project name without discarding invalid input. */
export function validateProjectName(name: string): NameValidation {
  const value = name.trim();
  if (value.length === 0) {
    return { valid: false, value, error: 'Project name is required' };
  }
  if (value.length > PROJECT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      value,
      error: `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer`,
    };
  }
  return { valid: true, value };
}

/** Find a same-song project whose trimmed name matches case-insensitively. */
export function findNameClash(
  name: string,
  musicItemId: string,
  summaries: readonly SavedProjectSummary[],
  excludingProjectId: string | null = null,
): SavedProjectSummary | null {
  const normalized = name.trim().toLocaleLowerCase();
  return summaries.find(summary => (
    summary.musicItemId === musicItemId
    && summary.projectId !== excludingProjectId
    && summary.name.trim().toLocaleLowerCase() === normalized
  )) ?? null;
}

/** Suggest the lowest unique `(n)` project name for one song. */
export function suggestUniqueName(
  name: string,
  musicItemId: string,
  summaries: readonly SavedProjectSummary[],
  excludingProjectId: string | null = null,
): string {
  const trimmed = name.trim().slice(0, PROJECT_NAME_MAX_LENGTH);
  if (findNameClash(trimmed, musicItemId, summaries, excludingProjectId) === null) return trimmed;

  for (let suffixNumber = 2; ; suffixNumber += 1) {
    const suffix = ` (${suffixNumber})`;
    const base = trimmed.slice(0, PROJECT_NAME_MAX_LENGTH - suffix.length).trimEnd();
    const candidate = `${base}${suffix}`;
    if (findNameClash(candidate, musicItemId, summaries, excludingProjectId) === null) {
      return candidate;
    }
  }
}

/** Normalize a music display title, returning null when the trimmed title is empty. */
export function normalizeDisplayTitle(title: string): string | null {
  const normalized = title.trim().slice(0, DISPLAY_TITLE_MAX_LENGTH);
  return normalized.length > 0 ? normalized : null;
}

/** Convert a project name into a cross-platform-safe CSV filename. */
export function sanitizeExportFilename(projectName: string): string {
  const normalized = projectName
    .trim()
    .replace(/[\u0000-\u001f\\/?%*:|"<>]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, PROJECT_NAME_MAX_LENGTH);
  return `${normalized || 'BeatNote_Project'}.csv`;
}

/** Build the ordered Project Manager sections without hiding empty sections. */
export function groupProjectSections(
  currentMusicItemId: string | null,
  currentProjectId: string | null,
  summaries: readonly SavedProjectSummary[],
  items: Readonly<Record<string, MusicItem>>,
): ProjectManagerSections {
  const currentProject = currentProjectId === null
    ? null
    : summaries.find(summary => summary.projectId === currentProjectId) ?? null;
  const currentDisplayTitle = currentMusicItemId === null
    ? null
    : items[currentMusicItemId]?.displayTitle ?? null;
  const projectsForCurrentSong = currentMusicItemId === null
    ? []
    : summaries
      .filter(summary => summary.musicItemId === currentMusicItemId
        && summary.projectId !== currentProjectId)
      .sort(compareModifiedNewest);
  const audioRemoved = summaries
    .filter(summary => items[summary.musicItemId]?.removed === true)
    .sort(compareModifiedNewest);
  const grouped = new Map<string, SavedProjectSummary[]>();

  summaries.forEach(summary => {
    if (summary.musicItemId === currentMusicItemId || items[summary.musicItemId]?.removed === true) {
      return;
    }
    const projects = grouped.get(summary.musicItemId) ?? [];
    projects.push(summary);
    grouped.set(summary.musicItemId, projects);
  });

  const allProjectGroups = [...grouped.entries()]
    .map(([musicItemId, projects]) => ({
      musicItemId,
      displayTitle: items[musicItemId]?.displayTitle ?? 'Audio missing',
      projects: projects.sort(compareModifiedNewest),
    }))
    .sort((left, right) => {
      const titleOrder = titleCollator.compare(left.displayTitle, right.displayTitle);
      if (titleOrder !== 0) return titleOrder;
      if (left.musicItemId < right.musicItemId) return -1;
      if (left.musicItemId > right.musicItemId) return 1;
      return 0;
    });

  return {
    currentProject,
    currentDisplayTitle,
    projectsForCurrentSong,
    allProjectGroups,
    audioRemoved,
  };
}
