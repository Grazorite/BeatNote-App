export type MigrationEntryStatus = 'pending' | 'importing' | 'migrated' | 'missing'
  | 'skippedNewer' | 'failedRetrying';

export interface MigrationEntry {
  legacyKey: string;
  status: MigrationEntryStatus;
  projectId: string;
  musicItemId: string | null;
  stagedRelativePath: string | null;
  attempts: number;
  lastError: string | null;
}

export interface MigrationJournal {
  schemaVersion: 1;
  migrationVersion: 1;
  state: 'running' | 'complete';
  startedAt: string;
  entries: Record<string, MigrationEntry>;
  unresolvedCount: number;
}
