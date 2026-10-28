import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisCacheEntry } from '../../types/analysis';
import {
  validateAnalysisCacheEntry,
  type ValidationResult,
} from '../../utils/recordValidation';
import {
  enqueueWrite,
  markReadFailed,
  markReadSucceeded,
  PersistenceReadError,
  type PersistenceIssue,
} from '../library/persistencePipeline';

export const ANALYSIS_KEY_PREFIX = 'beatnote.analysis.v1.';

export interface AnalysisRepositoryOptions {
  now?: () => number;
  availableBytes?: () => number | null | Promise<number | null>;
  onIssue?: (issue: PersistenceIssue) => void;
}

export const analysisKey = (musicItemId: string): string => (
  `${ANALYSIS_KEY_PREFIX}${musicItemId}`
);

interface AnalysisDefinition {
  key: string;
  label: string;
  validate: (value: unknown) => ValidationResult<AnalysisCacheEntry | null>;
}

const analysisDefinition = (musicItemId: string): AnalysisDefinition => ({
  key: analysisKey(musicItemId),
  label: `the analysis cache for ${musicItemId}`,
  validate: value => validateAnalysisCacheEntry(value, musicItemId),
});

async function reportReadFailure(
  definition: AnalysisDefinition,
  error: unknown,
  options: AnalysisRepositoryOptions,
): Promise<void> {
  markReadFailed(definition.key);
  options.onIssue?.({
    kind: 'readFailed',
    label: definition.label,
    message: `BeatNote couldn't read ${definition.label}`,
    error,
    retry: async () => { await readRecord(definition, options, true); },
  });
}

async function readRecord(
  definition: AnalysisDefinition,
  options: AnalysisRepositoryOptions = {},
  throwOnReadFailure = false,
  throwOnInvalid = throwOnReadFailure,
): Promise<AnalysisCacheEntry | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(definition.key);
  } catch (error) {
    await reportReadFailure(definition, error, options);
    if (throwOnReadFailure) throw new PersistenceReadError(definition.label, error);
    return null;
  }

  if (raw === null) {
    markReadSucceeded(definition.key);
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const corruptKey = `${definition.key}_corrupt_${(options.now ?? Date.now)()}`;
    try {
      await AsyncStorage.setItem(corruptKey, raw);
    } catch (quarantineError) {
      console.error(`Failed to quarantine corrupt value for ${definition.key}`, quarantineError);
    }
    await reportReadFailure(definition, error, options);
    if (throwOnReadFailure) throw new PersistenceReadError(definition.label, error);
    return null;
  }

  const result = definition.validate(parsed);
  if (result.invalidIds.length > 0) {
    console.warn(`Ignored invalid analysis cache record for ${definition.key}`, result.invalidIds);
    markReadFailed(definition.key);
    if (throwOnInvalid) {
      const error = new Error(`Invalid ${definition.label}`);
      options.onIssue?.({
        kind: 'readFailed',
        label: definition.label,
        message: `BeatNote couldn't read ${definition.label}`,
        error,
        retry: async () => { await readRecord(definition, options, true); },
      });
      throw new PersistenceReadError(definition.label, error);
    }
  } else {
    markReadSucceeded(definition.key);
  }
  return result.valid;
}

function writeRecord(
  definition: AnalysisDefinition,
  value: AnalysisCacheEntry,
  options: AnalysisRepositoryOptions,
): Promise<void> {
  return enqueueWrite({
    label: definition.label,
    family: 'analysis',
    targetKeys: [definition.key],
    coalesceKey: `analysis:${definition.key.slice(ANALYSIS_KEY_PREFIX.length)}`,
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: () => AsyncStorage.setItem(definition.key, JSON.stringify(value)),
  });
}

export const readAnalysis = (
  musicItemId: string,
  options?: AnalysisRepositoryOptions,
): Promise<AnalysisCacheEntry | null> => (
  readRecord(analysisDefinition(musicItemId), options)
);

export const readAnalysisStrict = (
  musicItemId: string,
  options?: AnalysisRepositoryOptions,
): Promise<AnalysisCacheEntry | null> => (
  readRecord(analysisDefinition(musicItemId), options, true)
);

export const writeAnalysis = (
  musicItemId: string,
  entry: AnalysisCacheEntry,
  options?: AnalysisRepositoryOptions,
): Promise<void> => {
  if (entry.musicItemId !== musicItemId) {
    return Promise.reject(new Error('Analysis cache music item ID does not match its storage key'));
  }
  return writeRecord(analysisDefinition(musicItemId), entry, options ?? {});
};

export const removeAnalysis = (
  musicItemId: string,
  options: AnalysisRepositoryOptions = {},
): Promise<void> => {
  const definition = analysisDefinition(musicItemId);
  return enqueueWrite({
    label: definition.label,
    family: 'analysis',
    targetKeys: [definition.key],
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: () => AsyncStorage.removeItem(definition.key),
  });
};
