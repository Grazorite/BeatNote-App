import type { LibrarySortKey, MusicItem } from '../types/library';
import type { PlaybackQueue } from '../types/queue';
import { PREVIOUS_RESTART_THRESHOLD_MS } from './libraryConstants';

const titleCollator = new Intl.Collator(undefined, { sensitivity: 'base' });

const compareIds = (left: MusicItem, right: MusicItem): number => (
  left.id < right.id ? -1 : left.id > right.id ? 1 : 0
);

const descendingDate = (left: string, right: string): number => (
  right < left ? -1 : right > left ? 1 : 0
);

export function compareLibraryItems(
  left: MusicItem,
  right: MusicItem,
  sortKey: LibrarySortKey,
): number {
  let comparison = 0;

  switch (sortKey) {
    case 'title':
      comparison = titleCollator.compare(left.displayTitle, right.displayTitle);
      break;
    case 'recentlyAdded':
      comparison = descendingDate(left.addedAt, right.addedAt);
      break;
    case 'recentlyPlayed':
      if (left.lastPlayedAt === null) comparison = right.lastPlayedAt === null ? 0 : 1;
      else if (right.lastPlayedAt === null) comparison = -1;
      else comparison = descendingDate(left.lastPlayedAt, right.lastPlayedAt);
      break;
    case 'duration':
      if (left.durationMs === null) comparison = right.durationMs === null ? 0 : 1;
      else if (right.durationMs === null) comparison = -1;
      else comparison = left.durationMs - right.durationMs;
      break;
  }

  return comparison === 0 ? compareIds(left, right) : comparison;
}

export function sortLibraryItems(
  items: readonly MusicItem[],
  sortKey: LibrarySortKey,
): MusicItem[] {
  return [...items].sort((left, right) => compareLibraryItems(left, right, sortKey));
}

export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}

export function filterLibraryItems(items: readonly MusicItem[], query: string): MusicItem[] {
  const normalizedQuery = normalizeForSearch(query.trim());
  if (!normalizedQuery) return [...items];

  return items.filter(item => (
    normalizeForSearch(item.displayTitle).includes(normalizedQuery)
    || normalizeForSearch(item.originalFilename).includes(normalizedQuery)
  ));
}

export function buildQueue(
  items: readonly MusicItem[],
  collectionId: string,
  sortKey: LibrarySortKey,
  currentId: string,
): PlaybackQueue {
  const snapshot = sortLibraryItems(
    items.filter(item => !item.removed && item.collectionIds.includes(collectionId)),
    sortKey,
  ).map(item => item.id);
  const currentIndex = snapshot.indexOf(currentId);

  return {
    schemaVersion: 1,
    snapshot,
    order: [...snapshot],
    currentIndex: currentIndex >= 0 ? currentIndex : null,
    shuffle: false,
    collectionId,
    sortKey,
  };
}

export function shuffleOrder(
  snapshot: readonly string[],
  currentId: string,
  random: () => number = Math.random,
): string[] {
  const currentIsPresent = snapshot.includes(currentId);
  const rest = snapshot.filter(id => id !== currentId);

  for (let index = rest.length - 1; index > 0; index -= 1) {
    const sample = Math.max(0, Math.min(0.9999999999999999, random()));
    const swapIndex = Math.floor(sample * (index + 1));
    [rest[index], rest[swapIndex]] = [rest[swapIndex], rest[index]];
  }

  return currentIsPresent ? [currentId, ...rest] : rest;
}

const currentQueueId = (queue: PlaybackQueue): string | null => (
  queue.currentIndex === null ? null : queue.order[queue.currentIndex] ?? null
);

export function setShuffle(
  queue: PlaybackQueue,
  on: boolean,
  random: () => number = Math.random,
): PlaybackQueue {
  const currentId = currentQueueId(queue);

  if (!on) {
    const currentIndex = currentId === null ? null : queue.snapshot.indexOf(currentId);
    return {
      ...queue,
      order: [...queue.snapshot],
      currentIndex: currentIndex !== null && currentIndex >= 0 ? currentIndex : null,
      shuffle: false,
    };
  }

  if (queue.snapshot.length <= 1 || currentId === null) {
    return { ...queue, order: [...queue.order], shuffle: true };
  }

  return {
    ...queue,
    order: shuffleOrder(queue.snapshot, currentId, random),
    currentIndex: 0,
    shuffle: true,
  };
}

export type QueueAction = 'first' | 'previous' | 'next';
export type QueueTarget =
  | { kind: 'switch'; index: number }
  | { kind: 'seekZero' }
  | { kind: 'disabled'; reason: 'Choose music to start a queue' | 'End of queue' };

export function queueTarget(
  queue: PlaybackQueue,
  action: QueueAction,
  currentTimeMs: number,
  hasSong: boolean,
): QueueTarget {
  if (!hasSong || queue.order.length === 0 || queue.currentIndex === null) {
    return { kind: 'disabled', reason: 'Choose music to start a queue' };
  }

  if (action === 'first') {
    return queue.currentIndex > 0 ? { kind: 'switch', index: 0 } : { kind: 'seekZero' };
  }

  if (action === 'previous') {
    if (currentTimeMs > PREVIOUS_RESTART_THRESHOLD_MS) return { kind: 'seekZero' };
    return queue.currentIndex > 0
      ? { kind: 'switch', index: queue.currentIndex - 1 }
      : { kind: 'seekZero' };
  }

  const nextIndex = queue.currentIndex + 1;
  return nextIndex < queue.order.length
    ? { kind: 'switch', index: nextIndex }
    : { kind: 'disabled', reason: 'End of queue' };
}

export function removeFromQueue(queue: PlaybackQueue, musicItemId: string): PlaybackQueue {
  const currentId = currentQueueId(queue);
  const snapshot = queue.snapshot.filter(id => id !== musicItemId);
  const order = queue.order.filter(id => id !== musicItemId);

  if (order.length === 0) {
    return { ...queue, snapshot, order, currentIndex: null, shuffle: false };
  }

  if (currentId !== null && currentId !== musicItemId) {
    const preservedIndex = order.indexOf(currentId);
    return { ...queue, snapshot, order, currentIndex: preservedIndex >= 0 ? preservedIndex : null };
  }

  const priorIndex = queue.currentIndex ?? 0;
  return { ...queue, snapshot, order, currentIndex: Math.min(priorIndex, order.length - 1) };
}

export function restoreQueue(
  queue: PlaybackQueue,
  existingIds: Iterable<string>,
): PlaybackQueue {
  const existing = new Set(existingIds);
  const currentId = currentQueueId(queue);
  const snapshot = queue.snapshot.filter(id => existing.has(id));
  const order = queue.shuffle
    ? queue.order.filter(id => existing.has(id) && snapshot.includes(id))
    : [...snapshot];
  const orderSet = new Set(order);
  for (const id of snapshot) {
    if (!orderSet.has(id)) order.push(id);
  }

  if (order.length === 0) {
    return { ...queue, snapshot, order, currentIndex: null, shuffle: false };
  }

  const currentIndex = currentId === null ? null : order.indexOf(currentId);
  return {
    ...queue,
    snapshot,
    order,
    currentIndex: currentIndex !== null && currentIndex >= 0 ? currentIndex : null,
  };
}

export interface QueueCandidate {
  index: number;
  musicItemId: string;
}

export function nextSkipCandidate(
  queue: PlaybackQueue,
  fromIndex: number,
  direction: -1 | 1,
  visited: ReadonlySet<string>,
): QueueCandidate | null {
  for (
    let index = fromIndex + direction;
    index >= 0 && index < queue.order.length;
    index += direction
  ) {
    const musicItemId = queue.order[index];
    if (!visited.has(musicItemId)) return { index, musicItemId };
  }
  return null;
}
