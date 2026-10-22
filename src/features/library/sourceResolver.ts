import type {
  MusicItem,
  PlaybackCapabilities,
  SourceProviderId,
} from '../../types/library';
import audioStore from './audioStore';

export interface SourceProvider {
  id: SourceProviderId;
  capabilities: PlaybackCapabilities;
  resolve(item: MusicItem): Promise<{ uri: string }>;
}

export const LOCAL_CAPABILITIES: PlaybackCapabilities = Object.freeze({
  exactSeeking: true,
  waveformAccess: true,
  pitchPreservingSpeed: true,
  offlinePlayback: true,
  queueControl: true,
  backgroundPlayback: true,
  repeat: true,
  shuffle: true,
});

export const NO_SOURCE_CAPABILITIES: PlaybackCapabilities = Object.freeze({
  exactSeeking: false,
  waveformAccess: false,
  pitchPreservingSpeed: false,
  offlinePlayback: false,
  queueControl: false,
  backgroundPlayback: false,
  repeat: false,
  shuffle: false,
});

export class SourceUnavailableError extends Error {
  readonly musicItemId: string;
  readonly provider: SourceProviderId;

  constructor(item: MusicItem, options?: ErrorOptions) {
    super(`Audio is unavailable for ${item.displayTitle}`, options);
    this.name = 'SourceUnavailableError';
    this.musicItemId = item.id;
    this.provider = item.source.provider;
  }
}

const localProvider: SourceProvider = {
  id: 'local',
  capabilities: LOCAL_CAPABILITIES,

  async resolve(item: MusicItem): Promise<{ uri: string }> {
    try {
      if (await audioStore.checkAvailable(item.source.reference) !== 'available') {
        throw new SourceUnavailableError(item);
      }
      return { uri: await audioStore.resolvePlayableUri(item.source.reference) };
    } catch (error) {
      if (error instanceof SourceUnavailableError) throw error;
      throw new SourceUnavailableError(item, { cause: error });
    }
  },
};

const providers: Readonly<Record<SourceProviderId, SourceProvider>> = Object.freeze({
  local: localProvider,
});

export const getProvider = (id: SourceProviderId): SourceProvider => providers[id];

export const capabilitiesFor = (item: MusicItem | null): PlaybackCapabilities => (
  item === null ? NO_SOURCE_CAPABILITIES : getProvider(item.source.provider).capabilities
);

/** Preserve the transitional direct-file path as local until every picker routes through Library. */
export const capabilitiesForLoadedItem = (
  item: MusicItem | null,
  hasDirectLocalAudio: boolean,
): PlaybackCapabilities => {
  if (item === null) return hasDirectLocalAudio ? LOCAL_CAPABILITIES : NO_SOURCE_CAPABILITIES;
  if (!hasDirectLocalAudio || item.availability !== 'available' || item.removed) {
    return NO_SOURCE_CAPABILITIES;
  }
  return capabilitiesFor(item);
};

export const resolveSource = (item: MusicItem): Promise<{ uri: string }> => (
  getProvider(item.source.provider).resolve(item)
);
