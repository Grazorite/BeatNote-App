import { useStudioStore, type StudioStore } from '../../hooks/useStudioStore';
import {
  SAVED_PROJECT_VERSION,
  type PersistedContent,
  type ProjectIndexRecord,
  type SavedProject,
  type SongDraft,
} from '../../types/project';
import { computeContentFingerprint } from '../../utils/contentFingerprint';
import { planSave } from '../../utils/draftResolution';
import { DRAFT_FLUSH_TIMEOUT_MS } from '../../utils/libraryConstants';
import type {
  ExportOptions,
  ExportResult as EngineExportResult,
} from '../../utils/exportTypes';
import {
  findNameClash,
  sanitizeExportFilename,
  suggestUniqueName,
  validateProjectName,
} from '../../utils/projectNames';
import {
  applyPersistedContent,
  extractPersistedContent,
  splitProjectEnvelope,
  toProjectRecord,
} from '../../utils/persistedContent';
import { compareProjectVersion } from '../../utils/projectManager';
import audioStore from './audioStore';
import { flushDraft } from './draftAutosave';
import { cancelQueued, type PersistenceIssue } from './persistencePipeline';
import type { SwitchResult } from './trackSwitch';
import {
  deleteProjectWithDependencies,
  mutateProject,
  mutateProjectAndDraft,
  readProject,
  toProjectSummary,
  type ProjectDraftMutation,
} from './repositories';

export type SaveResult =
  | { kind: 'saved'; project: SavedProject }
  | { kind: 'needsName'; suggestedName: string }
  | { kind: 'invalidName'; error: string }
  | { kind: 'nameConflict'; suggestion: string }
  | { kind: 'revisionConflict'; projectId: string; storedRevision: number }
  | { kind: 'readOnly'; projectId: string }
  | { kind: 'noSong' }
  | { kind: 'failed'; reason: string; retry: () => Promise<SaveResult> };

export type RenameResult =
  | { kind: 'renamed'; project: SavedProject }
  | { kind: 'invalidName'; error: string }
  | { kind: 'nameConflict'; suggestion: string }
  | { kind: 'readOnly'; projectId: string }
  | { kind: 'notFound'; projectId: string }
  | { kind: 'failed'; reason: string; retry: () => Promise<RenameResult> };

export type OpenResult =
  | { kind: 'opened'; project: SavedProject }
  | { kind: 'needsGuard'; projectId: string }
  | { kind: 'notFound'; projectId: string }
  | { kind: 'superseded' }
  | { kind: 'failed'; reason: string; retry: () => Promise<OpenResult> };

export type RevertResult =
  | { kind: 'reverted'; project: SavedProject }
  | { kind: 'notAvailable' }
  | { kind: 'notFound'; projectId: string }
  | { kind: 'superseded' }
  | { kind: 'failed'; reason: string; retry: () => Promise<RevertResult> };

export type ProjectExportResult =
  | { kind: 'exported'; result: EngineExportResult }
  | { kind: 'notFound'; projectId: string }
  | { kind: 'noSong' }
  | { kind: 'failed'; message: 'Export failed'; reason: string };

interface SaveOptions {
  overwriteConflict?: boolean;
}

interface InternalSaveOptions extends SaveOptions {
  recoveryProject?: SavedProject;
  recoveryAuthoredFingerprint?: string;
}

interface ProjectServiceDependencies {
  getState: typeof useStudioStore.getState;
  setState: typeof useStudioStore.setState;
  randomUUID: () => string;
  now: () => number;
  availableBytes: () => number | null | Promise<number | null>;
  mutateProjectAndDraft: typeof mutateProjectAndDraft;
  mutateProject: typeof mutateProject;
  deleteProjectWithDependencies: typeof deleteProjectWithDependencies;
  readProject: typeof readProject;
  exportToCSV: (options: ExportOptions) => Promise<EngineExportResult>;
  flushDraft: typeof flushDraft;
  cancelQueued: typeof cancelQueued;
  requestTrackSwitch: (request: {
    musicItemId: string;
    origin: 'projectOpen';
    explicitProjectId: string;
  }) => Promise<SwitchResult>;
}

const defaultDependencies: ProjectServiceDependencies = {
  getState: useStudioStore.getState,
  setState: useStudioStore.setState,
  randomUUID: audioStore.randomUUID,
  now: Date.now,
  availableBytes: audioStore.availableBytes,
  mutateProjectAndDraft,
  mutateProject,
  deleteProjectWithDependencies,
  readProject,
  exportToCSV: async options => (
    await import('../../utils/exportEngine')
  ).ExportEngine.exportToCSV(options),
  flushDraft,
  cancelQueued,
  requestTrackSwitch: async request => (
    await import('./trackSwitch')
  ).requestTrackSwitch(request),
};

const sameBaseline = (
  left: StudioStore['draftBaseline'],
  right: StudioStore['draftBaseline'],
): boolean => left?.projectId === right?.projectId && left?.revision === right?.revision;

const mergeStoredUnknownFields = (
  current: PersistedContent,
  storedProject: SavedProject,
): PersistedContent => {
  const stored = splitProjectEnvelope(storedProject).content;
  const storedLayers = new Map(stored.layers.map(layer => [layer.id, layer]));
  return {
    ...current,
    extras: { ...current.extras, ...stored.extras },
    settings: {
      ...current.settings,
      ...stored.settings,
      viewMode: current.settings.viewMode,
      showGridLines: current.settings.showGridLines,
      layerSpecificNavigation: current.settings.layerSpecificNavigation,
      primaryView: current.settings.primaryView,
      countSize: current.settings.countSize,
      rowDensity: current.settings.rowDensity,
      followPlayhead: current.settings.followPlayhead,
      playbackSpeed: current.settings.playbackSpeed,
      loopRange: current.settings.loopRange,
      loopEnabled: current.settings.loopEnabled,
    },
    layers: current.layers.map(layer => ({
      ...layer,
      ...storedLayers.get(layer.id),
      id: layer.id,
      name: layer.name,
      color: layer.color,
      markers: [...layer.markers],
      annotations: layer.annotations.map(annotation => ({ ...annotation })),
      isVisible: layer.isVisible,
    })),
  };
};

const projectMatches = (left: SavedProject, right: SavedProject): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
);

const upsertIssue = (
  dependencies: ProjectServiceDependencies,
  issue: PersistenceIssue,
): void => {
  dependencies.setState((state: StudioStore) => ({
    persistenceIssues: [
      ...state.persistenceIssues.filter(existing => (
        existing.kind !== issue.kind || existing.label !== issue.label
      )),
      issue,
    ],
  }));
};

const displayTitleFor = (state: StudioStore, musicItemId: string): string => (
  state.libraryItems[musicItemId]?.displayTitle ?? state.currentAudioFilename ?? 'Untitled'
);

const versionForNewRecord = (state: StudioStore): string => {
  const loadedVersion = state.loadedProjectSource?.version;
  return loadedVersion !== undefined
    && compareProjectVersion(loadedVersion, SAVED_PROJECT_VERSION) > 0
    ? loadedVersion
    : SAVED_PROJECT_VERSION;
};

const buildProject = (
  state: StudioStore,
  projectId: string,
  name: string,
  revision: number,
  content: PersistedContent,
  nowIso: string,
  stored: SavedProject | null,
): SavedProject => {
  const envelope = stored === null
    ? {
      version: versionForNewRecord(state),
      projectId,
      musicItemId: state.currentMusicItemId as string,
      revision,
      metadata: {
        name,
        duration: state.songDuration,
        createdAt: nowIso,
        modifiedAt: nowIso,
      },
      audio: {
        uri: '',
        filename: state.libraryItems[state.currentMusicItemId as string]?.originalFilename
          ?? state.currentAudioFilename
          ?? displayTitleFor(state, state.currentMusicItemId as string),
      },
    }
    : {
      ...splitProjectEnvelope(stored).envelope,
      version: compareProjectVersion(stored.version, SAVED_PROJECT_VERSION) > 0
        ? stored.version
        : SAVED_PROJECT_VERSION,
      revision,
      metadata: {
        ...splitProjectEnvelope(stored).envelope.metadata,
        name,
        modifiedAt: nowIso,
      },
    };
  return toProjectRecord(envelope, content);
};

const draftFor = (
  project: SavedProject,
  content: PersistedContent,
  fingerprint: string,
  nowIso: string,
): SongDraft => ({
  schemaVersion: 1,
  musicItemId: project.musicItemId,
  baseline: { projectId: project.projectId, revision: project.revision },
  baselineFingerprint: fingerprint,
  content,
  updatedAt: nowIso,
});

const applySavedProject = (
  dependencies: ProjectServiceDependencies,
  project: SavedProject,
  persistedFingerprint: string,
  authoredFingerprint: string,
  expectedMusicItemId: string,
  expectedBaseline: StudioStore['draftBaseline'],
): void => {
  let needsDraftFlush = false;
  dependencies.setState((state: StudioStore) => {
    const stillCurrent = state.currentMusicItemId === expectedMusicItemId
      && sameBaseline(state.draftBaseline, expectedBaseline);
    if (!stillCurrent) {
      needsDraftFlush = state.libraryStatus === 'ready'
        && state.songLoaded
        && state.currentMusicItemId !== null;
      return {
        projectSummaries: {
          ...state.projectSummaries,
          [project.projectId]: toProjectSummary(project),
        },
        saveInProgress: false,
      };
    }

    const currentContent = extractPersistedContent(state);
    const currentFingerprint = computeContentFingerprint(currentContent);
    needsDraftFlush = currentFingerprint !== authoredFingerprint;
    const liveContentWithSavedUnknowns = mergeStoredUnknownFields(currentContent, project);
    return {
      ...applyPersistedContent(liveContentWithSavedUnknowns),
      projectSummaries: {
        ...state.projectSummaries,
        [project.projectId]: toProjectSummary(project),
      },
      draftBaseline: { projectId: project.projectId, revision: project.revision },
      draftBaselineFingerprint: persistedFingerprint,
      draftBaselineName: project.metadata.name,
      lastWrittenFingerprint: persistedFingerprint,
      draftUiState: needsDraftFlush ? 'dirty' : 'saved',
      loadedProjectSource: project,
      csvUndo: null,
      saveInProgress: false,
      persistenceIssues: state.persistenceIssues.filter(issue => (
        issue.label !== `project ${project.projectId}`
        && issue.label !== `project-save:${project.projectId}`
      )),
    };
  });
  dependencies.getState().notify(`Saved “${project.metadata.name}”`);
  if (needsDraftFlush) void dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
};

async function runSave(
  dependencies: ProjectServiceDependencies,
  mode: 'current' | 'new',
  requestedName: string | null,
  options: InternalSaveOptions = {},
): Promise<SaveResult> {
  const initial = dependencies.getState();
  const musicItemId = initial.currentMusicItemId;
  if (musicItemId === null || !initial.songLoaded || initial.libraryStatus !== 'ready') {
    return { kind: 'noSong' };
  }
  if (initial.saveInProgress) {
    return { kind: 'failed', reason: 'A project save is already in progress', retry: () => runSave(
      dependencies,
      mode,
      requestedName,
      options,
    ) };
  }

  if (mode === 'current' && initial.draftBaseline === null) {
    return { kind: 'needsName', suggestedName: displayTitleFor(initial, musicItemId) };
  }
  const nameValidation = requestedName === null ? null : validateProjectName(requestedName);
  if (nameValidation !== null && !nameValidation.valid) {
    return { kind: 'invalidName', error: nameValidation.error };
  }

  const initialBaseline = initial.draftBaseline;
  const projectId = options.recoveryProject?.projectId ?? (mode === 'new'
    ? dependencies.randomUUID()
    : (initial.draftBaseline as NonNullable<typeof initial.draftBaseline>).projectId);
  const expectedBaseline = mode === 'current' ? initial.draftBaseline : null;
  const normalizedName = nameValidation?.value ?? initial.draftBaselineName ?? '';
  dependencies.setState({ saveInProgress: true });
  dependencies.cancelQueued(`draft:${musicItemId}`);

  let persistedFingerprintForCommit: string | null = null;
  let authoredFingerprintForCommit: string | null = null;
  let attemptedProject: SavedProject | undefined = options.recoveryProject;
  const reported: { issue?: PersistenceIssue } = {};
  const retryWith = (
    recoveryProject?: SavedProject,
    recoveryAuthoredFingerprint?: string,
  ): Promise<SaveResult> => runSave(
    dependencies,
    mode,
    requestedName,
    { ...options, recoveryProject, recoveryAuthoredFingerprint },
  );
  try {
    const result = await dependencies.mutateProjectAndDraft<SaveResult>(
      projectId,
      musicItemId,
      (stored, index): ProjectDraftMutation<SaveResult> => {
        const state = dependencies.getState();
        if (state.currentMusicItemId !== musicItemId
          || !state.songLoaded
          || !sameBaseline(state.draftBaseline, initialBaseline)) {
          return { kind: 'noWrite', result: { kind: 'noSong' } };
        }
        if (options.recoveryProject !== undefined
          && stored !== null
          && projectMatches(stored, options.recoveryProject)) {
          const recoveredContent = splitProjectEnvelope(stored).content;
          const recoveredFingerprint = computeContentFingerprint(recoveredContent);
          persistedFingerprintForCommit = recoveredFingerprint;
          authoredFingerprintForCommit = options.recoveryAuthoredFingerprint
            ?? computeContentFingerprint(extractPersistedContent(state));
          return {
            kind: 'write',
            project: stored,
            draft: draftFor(stored, recoveredContent, recoveredFingerprint, new Date(
              dependencies.now(),
            ).toISOString()),
            result: { kind: 'saved', project: stored },
          };
        }
        if (mode === 'new' && stored !== null) {
          return {
            kind: 'noWrite',
            result: {
              kind: 'failed',
              reason: 'Generated project ID already exists',
              retry: () => retryWith(undefined),
            },
          };
        }
        if (mode === 'current' && stored === null) {
          return {
            kind: 'noWrite',
            result: { kind: 'needsName', suggestedName: displayTitleFor(state, musicItemId) },
          };
        }
        if (stored !== null
          && compareProjectVersion(stored.version, SAVED_PROJECT_VERSION) > 0
          && mode === 'current') {
          return { kind: 'noWrite', result: { kind: 'readOnly', projectId } };
        }

        const summaries = Object.values(index.projects);
        const effectiveName = mode === 'current' && stored !== null
          ? stored.metadata.name
          : normalizedName;
        const clash = findNameClash(
          effectiveName,
          musicItemId,
          summaries,
          mode === 'current' ? projectId : null,
        );
        if (clash !== null) {
          return {
            kind: 'noWrite',
            result: {
              kind: 'nameConflict',
              suggestion: suggestUniqueName(
                effectiveName,
                musicItemId,
                summaries,
                mode === 'current' ? projectId : null,
              ),
            },
          };
        }

        let revision = 1;
        if (mode === 'current' && expectedBaseline !== null) {
          const plan = planSave(expectedBaseline, stored?.revision ?? null);
          if (plan.kind === 'conflict' && !options.overwriteConflict) {
            return {
              kind: 'noWrite',
              result: {
                kind: 'revisionConflict',
                projectId,
                storedRevision: stored?.revision ?? expectedBaseline.revision,
              },
            };
          }
          revision = plan.kind === 'update'
            ? plan.revision
            : Math.max(stored?.revision ?? 0, expectedBaseline.revision) + 1;
        }

        const authoredContent = extractPersistedContent(state);
        const authoredFingerprint = computeContentFingerprint(authoredContent);
        const content = mode === 'current' && stored !== null
          ? mergeStoredUnknownFields(authoredContent, stored)
          : authoredContent;
        const fingerprint = computeContentFingerprint(content);
        const nowIso = new Date(dependencies.now()).toISOString();
        const project = buildProject(
          state,
          projectId,
          effectiveName,
          revision,
          content,
          nowIso,
          mode === 'current' ? stored : null,
        );
        attemptedProject = project;
        persistedFingerprintForCommit = fingerprint;
        authoredFingerprintForCommit = authoredFingerprint;
        return {
          kind: 'write',
          project,
          draft: draftFor(project, content, fingerprint, nowIso),
          result: { kind: 'saved', project },
        };
      },
      {
        now: dependencies.now,
        availableBytes: dependencies.availableBytes,
        onIssue: issue => { reported.issue = issue; },
      },
    );

    if (result.kind === 'saved'
      && persistedFingerprintForCommit !== null
      && authoredFingerprintForCommit !== null) {
      applySavedProject(
        dependencies,
        result.project,
        persistedFingerprintForCommit,
        authoredFingerprintForCommit,
        musicItemId,
        initialBaseline,
      );
    } else {
      if (result.kind === 'needsName' && mode === 'current') {
        dependencies.setState({
          draftBaseline: null,
          draftBaselineFingerprint: null,
          draftBaselineName: null,
        });
      }
      dependencies.setState({ saveInProgress: false });
      void dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
    }
    return result;
  } catch (error) {
    dependencies.setState({ saveInProgress: false });
    void dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
    const reason = error instanceof Error ? error.message : String(error);
    const retry = () => retryWith(attemptedProject, authoredFingerprintForCommit ?? undefined);
    upsertIssue(dependencies, {
      kind: reported.issue?.kind ?? 'writeFailed',
      label: `project-save:${projectId}`,
      message: 'Project not saved',
      detail: reason,
      error,
      retry: async () => {
        const result = await retry();
        if (result.kind !== 'saved') throw new Error(
          result.kind === 'failed' ? result.reason : 'Project save still needs attention',
        );
      },
    });
    return {
      kind: 'failed',
      reason,
      retry,
    };
  }
}

async function runRename(
  dependencies: ProjectServiceDependencies,
  projectId: string,
  requestedName: string,
): Promise<RenameResult> {
  const validation = validateProjectName(requestedName);
  if (!validation.valid) return { kind: 'invalidName', error: validation.error };

  const reported: { issue?: PersistenceIssue } = {};
  try {
    const result = await dependencies.mutateProject<RenameResult>(
      projectId,
      (stored, index) => {
        if (stored === null) {
          return { kind: 'noWrite', result: { kind: 'notFound', projectId } };
        }
        if (compareProjectVersion(stored.version, SAVED_PROJECT_VERSION) > 0) {
          return { kind: 'noWrite', result: { kind: 'readOnly', projectId } };
        }
        const summaries = Object.values(index.projects);
        const clash = findNameClash(validation.value, stored.musicItemId, summaries, projectId);
        if (clash !== null) {
          return {
            kind: 'noWrite',
            result: {
              kind: 'nameConflict',
              suggestion: suggestUniqueName(
                validation.value,
                stored.musicItemId,
                summaries,
                projectId,
              ),
            },
          };
        }
        const renamed: SavedProject = {
          ...stored,
          metadata: {
            ...stored.metadata,
            name: validation.value,
          },
        };
        return { kind: 'write', project: renamed, result: { kind: 'renamed', project: renamed } };
      },
      {
        availableBytes: dependencies.availableBytes,
        onIssue: issue => { reported.issue = issue; },
      },
    );
    if (result.kind === 'renamed') {
      dependencies.setState((state: StudioStore) => ({
        projectSummaries: {
          ...state.projectSummaries,
          [projectId]: toProjectSummary(result.project),
        },
        ...(state.draftBaseline?.projectId === projectId ? {
          draftBaselineName: result.project.metadata.name,
          loadedProjectSource: state.loadedProjectSource?.projectId === projectId
            ? result.project
            : state.loadedProjectSource,
        } : {}),
        persistenceIssues: state.persistenceIssues.filter(issue => (
          issue.label !== `project ${projectId}`
          && issue.label !== `project-rename:${projectId}`
        )),
      }));
    }
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const retry = () => runRename(dependencies, projectId, requestedName);
    upsertIssue(dependencies, {
      kind: reported.issue?.kind ?? 'writeFailed',
      label: `project-rename:${projectId}`,
      message: 'Project not renamed',
      detail: reason,
      error,
      retry: async () => {
        const result = await retry();
        if (result.kind !== 'renamed') throw new Error(
          result.kind === 'failed' ? result.reason : 'Project rename still needs attention',
        );
      },
    });
    return { kind: 'failed', reason, retry };
  }
}

async function runDelete(
  dependencies: ProjectServiceDependencies,
  projectId: string,
): Promise<void> {
  const initial = dependencies.getState();
  const deletingCurrentBaseline = initial.currentMusicItemId !== null
    && initial.draftBaseline?.projectId === projectId;
  const replacementContent = deletingCurrentBaseline
    ? extractPersistedContent(initial)
    : null;
  const replacementDraft: SongDraft | null = replacementContent === null
    || initial.currentMusicItemId === null
    ? null
    : {
      schemaVersion: 1,
      musicItemId: initial.currentMusicItemId,
      baseline: null,
      baselineFingerprint: null,
      content: replacementContent,
      updatedAt: new Date(dependencies.now()).toISOString(),
    };

  dependencies.setState({ saveInProgress: true });
  if (replacementDraft !== null) dependencies.cancelQueued(`draft:${replacementDraft.musicItemId}`);
  const reported: { issue?: PersistenceIssue } = {};
  let committed = false;
  let needsDraftFlush = false;
  const applyDeletion = (result: Awaited<ReturnType<typeof deleteProjectWithDependencies>>): void => {
    committed = true;
    dependencies.setState((state: StudioStore) => {
      const stillCurrent = result.project !== null
        && state.currentMusicItemId === result.project.musicItemId
        && state.draftBaseline?.projectId === projectId;
      const libraryItems = result.removedLibraryItem && result.project !== null
        ? Object.fromEntries(Object.entries(state.libraryItems).filter(
          ([musicItemId]) => musicItemId !== result.project?.musicItemId,
        ))
        : state.libraryItems;
      if (!stillCurrent) {
        needsDraftFlush = state.libraryStatus === 'ready'
          && state.songLoaded
          && state.currentMusicItemId !== null;
        return {
          projectSummaries: result.index.projects,
          libraryItems,
          saveInProgress: false,
          persistenceIssues: state.persistenceIssues.filter(issue => (
            issue.label !== `project ${projectId}`
            && issue.label !== `project-delete:${projectId}`
          )),
        };
      }

      const currentContent = extractPersistedContent(state);
      const currentFingerprint = computeContentFingerprint(currentContent);
      const durableFingerprint = result.draft === null
        ? null
        : computeContentFingerprint(result.draft.content);
      needsDraftFlush = durableFingerprint === null || currentFingerprint !== durableFingerprint;
      return {
        projectSummaries: result.index.projects,
        libraryItems,
        draftBaseline: null,
        draftBaselineFingerprint: null,
        draftBaselineName: null,
        lastWrittenFingerprint: durableFingerprint,
        draftUiState: 'unsaved',
        saveInProgress: false,
        persistenceIssues: state.persistenceIssues.filter(issue => (
          issue.label !== `project ${projectId}`
          && issue.label !== `project-delete:${projectId}`
        )),
      };
    });
  };
  try {
    const result = await dependencies.deleteProjectWithDependencies(
      projectId,
      replacementDraft,
      {
        now: dependencies.now,
        availableBytes: dependencies.availableBytes,
        onIssue: issue => { reported.issue = issue; },
      },
      applyDeletion,
    );
    if (!committed) applyDeletion(result);
    if (needsDraftFlush) void dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
  } catch (error) {
    dependencies.setState({ saveInProgress: false });
    void dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
    const reason = error instanceof Error ? error.message : String(error);
    upsertIssue(dependencies, {
      kind: reported.issue?.kind ?? 'writeFailed',
      label: `project-delete:${projectId}`,
      message: 'Project not deleted',
      detail: reason,
      error,
      retry: () => runDelete(dependencies, projectId),
    });
    throw error;
  }
}

const persistenceReason = (issue: PersistenceIssue): string => (
  issue.error instanceof Error ? issue.error.message : String(issue.error)
);

async function applyProjectToCurrentSong(
  dependencies: ProjectServiceDependencies,
  project: SavedProject,
  audioOverride?: { uri: string; filename: string; durationMs: number },
): Promise<'applied' | 'superseded' | 'persistenceFailed'> {
  const state = dependencies.getState();
  if (audioOverride === undefined && (state.currentMusicItemId !== project.musicItemId
    || !state.songLoaded
    || state.currentAudioUri === null)) return 'superseded';

  const { content } = splitProjectEnvelope(project);
  const fingerprint = computeContentFingerprint(content);
  dependencies.cancelQueued(`draft:${project.musicItemId}`);
  state.applyTrackState({
    musicItemId: project.musicItemId,
    audioUri: audioOverride?.uri ?? state.currentAudioUri as string,
    audioFilename: audioOverride?.filename
      ?? state.currentAudioFilename
      ?? state.libraryItems[project.musicItemId]?.originalFilename
      ?? project.audio.filename,
    content,
    songDuration: audioOverride?.durationMs ?? state.songDuration,
    baseline: { projectId: project.projectId, revision: project.revision },
    baselineFingerprint: fingerprint,
    baselineName: project.metadata.name,
    lastWrittenFingerprint: null,
    draftUiState: 'saved',
    isPlaying: state.isPlaying,
    loadedProjectSource: project,
  });
  const flushResult = await dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
  return flushResult === 'failed' ? 'persistenceFailed' : 'applied';
}

async function runOpenProject(
  dependencies: ProjectServiceDependencies,
  projectId: string,
): Promise<OpenResult> {
  let reportedIssue: PersistenceIssue | null = null;
  const project = await dependencies.readProject(projectId, {
    now: dependencies.now,
    onIssue: issue => { reportedIssue = issue; },
  });
  if (project === null) {
    if (reportedIssue !== null) {
      const issue = reportedIssue as PersistenceIssue;
      upsertIssue(dependencies, issue);
      const reason = persistenceReason(issue);
      return {
        kind: 'failed',
        reason,
        retry: () => runOpenProject(dependencies, projectId),
      };
    }
    return { kind: 'notFound', projectId };
  }

  const state = dependencies.getState();
  if (state.currentMusicItemId !== project.musicItemId || state.draftUiState === 'dirty') {
    const switchResult = await dependencies.requestTrackSwitch({
      musicItemId: project.musicItemId,
      origin: 'projectOpen',
      explicitProjectId: projectId,
    });
    if (switchResult.kind === 'committed') return { kind: 'opened', project };
    if (switchResult.kind === 'failed') {
      return {
        kind: 'failed',
        reason: switchResult.reason.message,
        retry: () => runOpenProject(dependencies, projectId),
      };
    }
    if (dependencies.getState().switchGuard !== null) return { kind: 'needsGuard', projectId };
    return { kind: 'superseded' };
  }
  const applyResult = await applyProjectToCurrentSong(dependencies, project);
  if (applyResult === 'superseded') return { kind: 'superseded' };
  if (applyResult === 'persistenceFailed') {
    return {
      kind: 'failed',
      reason: 'Project opened, but its draft could not be saved',
      retry: () => runOpenProject(dependencies, projectId),
    };
  }
  return { kind: 'opened', project };
}

async function runRevertToSaved(
  dependencies: ProjectServiceDependencies,
): Promise<RevertResult> {
  const initial = dependencies.getState();
  const baseline = initial.draftBaseline;
  if (initial.draftUiState !== 'dirty' || baseline === null) return { kind: 'notAvailable' };

  let reportedIssue: PersistenceIssue | null = null;
  const project = await dependencies.readProject(baseline.projectId, {
    now: dependencies.now,
    onIssue: issue => { reportedIssue = issue; },
  });
  if (project === null) {
    if (reportedIssue !== null) {
      const issue = reportedIssue as PersistenceIssue;
      upsertIssue(dependencies, issue);
      const reason = persistenceReason(issue);
      return {
        kind: 'failed',
        reason,
        retry: () => runRevertToSaved(dependencies),
      };
    }
    return { kind: 'notFound', projectId: baseline.projectId };
  }

  const state = dependencies.getState();
  if (state.currentMusicItemId !== project.musicItemId
    || state.draftUiState !== 'dirty'
    || !sameBaseline(state.draftBaseline, baseline)) return { kind: 'superseded' };
  const applyResult = await applyProjectToCurrentSong(dependencies, project);
  if (applyResult === 'superseded') return { kind: 'superseded' };
  if (applyResult === 'persistenceFailed') {
    return {
      kind: 'failed',
      reason: 'Saved content was restored, but its draft could not be saved',
      retry: () => runRevertToSaved(dependencies),
    };
  }
  return { kind: 'reverted', project };
}

async function runExportProjectCsv(
  dependencies: ProjectServiceDependencies,
  projectId: string | 'current',
): Promise<ProjectExportResult> {
  let content: PersistedContent;
  let projectName: string;
  let songDuration: number;

  if (projectId === 'current') {
    const state = dependencies.getState();
    if (state.currentMusicItemId === null || !state.songLoaded) return { kind: 'noSong' };
    content = extractPersistedContent(state);
    projectName = state.draftBaselineName ?? 'Unnamed_Draft';
    songDuration = state.songDuration;
  } else {
    let reportedIssue: PersistenceIssue | null = null;
    const project = await dependencies.readProject(projectId, {
      now: dependencies.now,
      onIssue: issue => { reportedIssue = issue; },
    });
    if (project === null) {
      if (reportedIssue !== null) {
        const issue = reportedIssue as PersistenceIssue;
        upsertIssue(dependencies, issue);
        return { kind: 'failed', message: 'Export failed', reason: persistenceReason(issue) };
      }
      return { kind: 'notFound', projectId };
    }
    content = splitProjectEnvelope(project).content;
    projectName = project.metadata.name;
    songDuration = project.metadata.duration;
  }

  try {
    const result = await dependencies.exportToCSV({
      format: 'csv',
      filename: sanitizeExportFilename(projectName),
      layers: content.layers,
      bpm: content.bpm,
      songDuration,
      projectName,
    });
    return { kind: 'exported', result };
  } catch (error) {
    return {
      kind: 'failed',
      message: 'Export failed',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export const saveCurrent = (options?: SaveOptions): Promise<SaveResult> => (
  runSave(defaultDependencies, 'current', null, options)
);

export const saveAsNew = (name: string): Promise<SaveResult> => (
  runSave(defaultDependencies, 'new', name)
);

export const renameProject = (projectId: string, name: string): Promise<RenameResult> => (
  runRename(defaultDependencies, projectId, name)
);

export const deleteProject = (projectId: string): Promise<void> => (
  runDelete(defaultDependencies, projectId)
);

export const openProject = (projectId: string): Promise<OpenResult> => (
  runOpenProject(defaultDependencies, projectId)
);

export const revertToSaved = (): Promise<RevertResult> => (
  runRevertToSaved(defaultDependencies)
);

export const exportProjectCsv = (
  projectId: string | 'current',
): Promise<ProjectExportResult> => runExportProjectCsv(defaultDependencies, projectId);

/** Test seam for save/revision/name race verification without replacing the global store. */
export const createProjectService = (dependencies: ProjectServiceDependencies) => ({
  saveCurrent: (options?: SaveOptions) => runSave(dependencies, 'current', null, options),
  saveAsNew: (name: string) => runSave(dependencies, 'new', name),
  renameProject: (projectId: string, name: string) => runRename(dependencies, projectId, name),
  deleteProject: (projectId: string) => runDelete(dependencies, projectId),
  openProject: (projectId: string) => runOpenProject(dependencies, projectId),
  revertToSaved: () => runRevertToSaved(dependencies),
  exportProjectCsv: (projectId: string | 'current') => runExportProjectCsv(dependencies, projectId),
});

export type { ProjectServiceDependencies, SaveOptions };
