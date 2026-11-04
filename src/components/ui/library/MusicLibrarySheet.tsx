import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { controlMs } from '../../../animations/motion';
import { useMotionPreference } from '../../../animations/MotionPreference';
import {
  cancelImport,
  dismissImportJob,
  enqueueImport,
  resolveRelinkConfirmation,
  type RelinkConfirmation,
} from '../../../features/library/importPipeline';
import { runLibraryBoot } from '../../../features/library/useLibraryLifecycle';
import { requestTrackSwitch } from '../../../features/library/trackSwitch';
import {
  deleteMusicItem,
  getDeleteMusicItemSummary,
  renameMusicItem,
  type DeleteMusicItemSummary,
} from '../../../features/library/libraryActions';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { musicLibrarySheetStyles as styles } from '../../../styles/components/library/musicLibrarySheet';
import { colors } from '../../../styles/common';
import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type LibrarySortDirection,
  type LibrarySortKey,
  type MusicItem,
} from '../../../types/library';
import {
  MAX_TEXT_SCALE,
  SUPPORTED_AUDIO_EXTENSIONS,
} from '../../../utils/libraryConstants';
import {
  defaultLibrarySortDirection,
  filterLibraryItems,
  sortLibraryItems,
} from '../../../utils/queueOrder';
import { BeatNoteIcon } from '../../icons';
import { BottomSheet } from '../common';
import SwitchGuardDialog from '../modals/SwitchGuardDialog';
import ConfirmDialog from '../modals/ConfirmDialog';
import RenameMusicPrompt from '../modals/RenameMusicPrompt';
import ImportProgressRow from './ImportProgressRow';
import MusicLibraryRow from './MusicLibraryRow';

export interface MusicLibrarySheetProps {
  returnFocusRef: React.RefObject<unknown>;
  restoreFocusOnClose?: boolean;
  onShowProjects: (item: MusicItem) => void;
}

interface DeletePromptState {
  item: MusicItem;
  summary: DeleteMusicItemSummary;
  returnFocusRef?: React.RefObject<unknown>;
}

interface RelinkPromptState extends RelinkConfirmation {
  returnFocusRef?: React.RefObject<unknown>;
}

const SORT_OPTIONS: ReadonlyArray<{ value: LibrarySortKey; label: string }> = [
  { value: 'recentlyAdded', label: 'Recently Added' },
  { value: 'recentlyPlayed', label: 'Recently Played' },
  { value: 'title', label: 'Title' },
  { value: 'duration', label: 'Duration' },
  { value: 'custom', label: 'Custom Order' },
];

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
] as const;

const AUDIO_PICKER_TYPES = Platform.OS === 'web'
  ? [...AUDIO_MIME_TYPES, ...SUPPORTED_AUDIO_EXTENSIONS]
  : [...AUDIO_MIME_TYPES];

const MusicLibrarySheet: React.FC<MusicLibrarySheetProps> = ({
  returnFocusRef,
  restoreFocusOnClose = true,
  onShowProjects,
}) => {
  const visible = useStudioStore(state => state.isLibrarySheetOpen);
  const libraryItems = useStudioStore(state => state.libraryItems);
  const librarySort = useStudioStore(state => state.librarySort);
  const librarySortDirection = useStudioStore(state => state.librarySortDirection);
  const libraryCustomOrder = useStudioStore(state => state.libraryCustomOrder);
  const projectSummaries = useStudioStore(state => state.projectSummaries);
  const importJobs = useStudioStore(state => state.importJobs);
  const libraryStatus = useStudioStore(state => state.libraryStatus);
  const currentMusicItemId = useStudioStore(state => state.currentMusicItemId);
  const loadingMusicItemId = useStudioStore(state => state.loadingMusicItemId);
  const switchPhase = useStudioStore(state => state.switchPhase);
  const switchGuard = useStudioStore(state => state.switchGuard);
  const librarySwitchFailure = useStudioStore(state => state.librarySwitchFailure);
  const saveInProgress = useStudioStore(state => state.saveInProgress);
  const closeLibrarySheet = useStudioStore(state => state.closeLibrarySheet);
  const setLibrarySort = useStudioStore(state => state.setLibrarySort);
  const setLibraryCustomOrder = useStudioStore(state => state.setLibraryCustomOrder);
  const notify = useStudioStore(state => state.notify);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [renameItem, setRenameItem] = useState<MusicItem | null>(null);
  const pendingRenameItemsRef = useRef<typeof libraryItems | null>(null);
  const listRef = useRef<FlatList<MusicItem>>(null);
  const listScrollOffsetRef = useRef(0);
  const reorderScrollOffsetRef = useRef(0);
  const reorderingRef = useRef(false);
  const [deletePrompt, setDeletePrompt] = useState<DeletePromptState | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [relinkConfirmation, setRelinkConfirmation] = useState<RelinkPromptState | null>(null);
  const [reorderPreview, setReorderPreview] = useState<{
    itemId: string;
    originIndex: number;
    targetIndex: number;
  } | null>(null);
  const controlDuration = useMotionPreference() === false ? controlMs : 0;
  const sortArrowRotation = useRef(new Animated.Value(
    librarySortDirection === 'ascending' ? 0 : 1,
  )).current;

  const collectionItems = useMemo(() => Object.values(libraryItems).filter(item => (
    !item.removed && item.collectionIds.includes(IMPORTED_MUSIC_COLLECTION_ID)
  )), [libraryItems]);
  const searchIsVisible = collectionItems.length > 8;
  const visibleItems = useMemo(() => sortLibraryItems(
    filterLibraryItems(collectionItems, searchIsVisible ? query : ''),
    librarySort,
    libraryCustomOrder,
    librarySortDirection,
  ), [
    collectionItems,
    libraryCustomOrder,
    librarySort,
    librarySortDirection,
    query,
    searchIsVisible,
  ]);

  useEffect(() => {
    Animated.timing(sortArrowRotation, {
      toValue: librarySortDirection === 'ascending' ? 0 : 1,
      duration: controlDuration,
      useNativeDriver: true,
    }).start();
  }, [controlDuration, librarySortDirection, sortArrowRotation]);
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(projectSummaries).forEach(project => {
      counts[project.musicItemId] = (counts[project.musicItemId] ?? 0) + 1;
    });
    return counts;
  }, [projectSummaries]);
  const activeLoadingId = loadingMusicItemId;
  const interactionsDisabled = libraryStatus !== 'ready'
    || switchPhase !== 'idle'
    || switchGuard !== null
    || saveInProgress
    || activeLoadingId !== null
    || actionBusyId !== null;

  const publishPendingRename = useCallback(() => {
    const items = pendingRenameItemsRef.current;
    if (items === null) return;
    pendingRenameItemsRef.current = null;
    useStudioStore.setState({ libraryItems: items });
  }, []);

  const pickAudio = useCallback(async (retryJobId?: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_PICKER_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      if (retryJobId !== undefined) dismissImportJob(retryJobId);
      await enqueueImport({
        origin: 'picker',
        sourceUri: asset.uri,
        originalFilename: asset.name,
        reportedBytes: asset.size ?? null,
      });
    } catch (error) {
      console.error('Unable to open the audio picker', error);
      notify("BeatNote couldn't open the audio picker");
    }
  }, [notify]);

  const switchTo = useCallback(async (item: MusicItem) => {
    if (item.id === currentMusicItemId) {
      closeLibrarySheet();
      return;
    }
    try {
      await requestTrackSwitch({
        musicItemId: item.id,
        origin: 'library',
        rebuildQueue: true,
      });
    } catch (error) {
      console.error('Unexpected Music Library switch failure', error);
      notify("BeatNote couldn't change songs. Try again.");
    }
  }, [closeLibrarySheet, currentMusicItemId, notify]);

  const openDeletePrompt = useCallback(async (
    item: MusicItem,
    returnFocusRef?: React.RefObject<unknown>,
  ) => {
    setActionBusyId(item.id);
    try {
      const summary = await getDeleteMusicItemSummary(item.id);
      setDeletePrompt({ item, summary, returnFocusRef });
    } catch (error) {
      console.error('Unable to prepare song deletion', error);
      notify("BeatNote couldn't check this song's saved work");
    } finally {
      setActionBusyId(null);
    }
  }, [notify]);

  const relinkItem = useCallback(async (
    item: MusicItem,
    returnFocusRef?: React.RefObject<unknown>,
  ) => {
    setActionBusyId(item.id);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_PICKER_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      const outcome = await enqueueImport({
        origin: 'relink',
        relinkTargetId: item.id,
        sourceUri: asset.uri,
        originalFilename: asset.name,
        reportedBytes: asset.size ?? null,
      });
      if (outcome.kind === 'relinkNeedsConfirm') {
        setRelinkConfirmation({ ...outcome, returnFocusRef });
      }
      if (outcome.kind === 'failed') notify(outcome.error.message);
    } catch (error) {
      console.error('Unable to relink audio', error);
      notify("BeatNote couldn't relink this song");
    } finally {
      setActionBusyId(null);
    }
  }, [notify]);

  const resolveRelink = useCallback(async (useFile: boolean) => {
    if (relinkConfirmation === null) return;
    const { staged } = relinkConfirmation;
    setRelinkConfirmation(null);
    setActionBusyId(relinkConfirmation.musicItemId);
    try {
      const outcome = await resolveRelinkConfirmation(staged.stagingRef, useFile);
      if (outcome.kind === 'failed') notify(outcome.error.message);
    } catch (error) {
      notify(error instanceof Error ? error.message : "BeatNote couldn't relink this song");
    } finally {
      setActionBusyId(null);
    }
  }, [notify, relinkConfirmation]);

  const confirmDelete = useCallback(async () => {
    if (deletePrompt === null) return;
    const { item } = deletePrompt;
    setDeletePrompt(null);
    setActionBusyId(item.id);
    try {
      const result = await deleteMusicItem(item.id);
      if (result.kind === 'deleted') notify(`Removed “${item.displayTitle}” from BeatNote`);
      if (result.kind === 'failed') notify(result.error);
    } catch (error) {
      notify(error instanceof Error ? error.message : "BeatNote couldn't remove this song.");
    } finally {
      setActionBusyId(null);
    }
  }, [deletePrompt, notify]);

  const reorderItem = useCallback((itemId: string, offset: number) => {
    const visibleIndex = visibleItems.findIndex(item => item.id === itemId);
    if (visibleIndex < 0) return;
    const targetIndex = Math.max(0, Math.min(visibleItems.length - 1, visibleIndex + offset));
    if (targetIndex === visibleIndex) return;

    const reorderedVisibleIds = visibleItems.map(item => item.id);
    const [movedId] = reorderedVisibleIds.splice(visibleIndex, 1);
    reorderedVisibleIds.splice(targetIndex, 0, movedId);
    const visibleIdSet = new Set(reorderedVisibleIds);
    const replacements = [...reorderedVisibleIds];
    const completeOrder = sortLibraryItems(collectionItems, 'custom', libraryCustomOrder)
      .map(item => visibleIdSet.has(item.id) ? replacements.shift() ?? item.id : item.id);
    setLibraryCustomOrder(completeOrder);
  }, [collectionItems, libraryCustomOrder, setLibraryCustomOrder, visibleItems]);

  const selectSort = useCallback((sort: LibrarySortKey) => {
    if (sort === 'custom' && libraryCustomOrder.length === 0) {
      setLibraryCustomOrder(sortLibraryItems(
        collectionItems,
        librarySort,
        [],
        librarySortDirection,
      ).map(item => item.id));
    }
    const direction: LibrarySortDirection = sort !== 'custom' && librarySort === sort
      ? (librarySortDirection === 'ascending' ? 'descending' : 'ascending')
      : defaultLibrarySortDirection(sort);
    setLibrarySort(sort, direction);
  }, [
    collectionItems,
    libraryCustomOrder.length,
    librarySort,
    librarySortDirection,
    setLibraryCustomOrder,
    setLibrarySort,
  ]);

  const beginReorder = useCallback((itemId: string, originIndex: number) => {
    reorderScrollOffsetRef.current = listScrollOffsetRef.current;
    reorderingRef.current = true;
    setReorderPreview({ itemId, originIndex, targetIndex: originIndex });
  }, []);

  const previewReorder = useCallback((itemId: string, offset: number) => {
    setReorderPreview(current => {
      if (current === null || current.itemId !== itemId) return current;
      const targetIndex = Math.max(
        0,
        Math.min(visibleItems.length - 1, current.originIndex + offset),
      );
      return targetIndex === current.targetIndex ? current : { ...current, targetIndex };
    });
  }, [visibleItems.length]);

  const endReorder = useCallback(() => {
    reorderingRef.current = false;
    listScrollOffsetRef.current = reorderScrollOffsetRef.current;
    setReorderPreview(null);
  }, []);

  const handleListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextOffset = event.nativeEvent.contentOffset.y;
    if (!reorderingRef.current) {
      listScrollOffsetRef.current = nextOffset;
      return;
    }
    if (Math.abs(nextOffset - reorderScrollOffsetRef.current) < 0.5) return;
    listRef.current?.scrollToOffset({ offset: reorderScrollOffsetRef.current, animated: false });
  }, []);

  const renderItem = useCallback(({ item, index }: { item: MusicItem; index: number }) => {
    const reorderShift = reorderPreview === null || reorderPreview.itemId === item.id
      ? 0
      : reorderPreview.originIndex < reorderPreview.targetIndex
        && index > reorderPreview.originIndex
        && index <= reorderPreview.targetIndex
        ? -1
        : reorderPreview.targetIndex < reorderPreview.originIndex
          && index >= reorderPreview.targetIndex
          && index < reorderPreview.originIndex
          ? 1
          : 0;

    return <MusicLibraryRow
      item={item}
      projectCount={projectCounts[item.id] ?? 0}
      current={item.id === currentMusicItemId}
      disabled={interactionsDisabled && item.id !== activeLoadingId}
      loading={item.id === activeLoadingId}
      failure={librarySwitchFailure?.musicItemId === item.id
        ? librarySwitchFailure.message
        : null}
      onPress={() => { void switchTo(item); }}
      onRetry={() => { void switchTo(item); }}
      onRename={() => setRenameItem(item)}
      onShowProjects={() => onShowProjects(item)}
      onDelete={focusRef => { void openDeletePrompt(item, focusRef); }}
      onRelink={focusRef => { void relinkItem(item, focusRef); }}
      customOrderIndex={librarySort === 'custom' ? index : undefined}
      customOrderCount={librarySort === 'custom' ? visibleItems.length : undefined}
      reorderShift={reorderShift}
      reorderActive={reorderPreview !== null}
      onReorderBy={librarySort === 'custom' ? offset => reorderItem(item.id, offset) : undefined}
      onReorderPreview={librarySort === 'custom'
        ? offset => previewReorder(item.id, offset)
        : undefined}
      onReorderStart={librarySort === 'custom' ? () => beginReorder(item.id, index) : undefined}
      onReorderEnd={librarySort === 'custom' ? endReorder : undefined}
    />;
  }, [
    currentMusicItemId,
    interactionsDisabled,
    librarySwitchFailure,
    activeLoadingId,
    beginReorder,
    endReorder,
    onShowProjects,
    openDeletePrompt,
    previewReorder,
    projectCounts,
    reorderPreview,
    relinkItem,
    librarySort,
    reorderItem,
    switchTo,
    visibleItems.length,
  ]);

  const stateContent = libraryStatus === 'readError' ? (
    <View style={styles.state}>
      <Text style={[styles.stateText, styles.errorText]} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
        BeatNote couldn't load your music library
      </Text>
      <TouchableOpacity
        style={[styles.retry, focused === 'library-retry' && styles.retryFocused]}
        onPress={() => { void runLibraryBoot(); }}
        onFocus={() => setFocused('library-retry')}
        onBlur={() => setFocused(value => value === 'library-retry' ? null : value)}
        accessibilityRole="button"
        accessibilityLabel="Retry loading music library"
        testID="music-library-retry"
      >
        <Text style={styles.retryText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Retry</Text>
      </TouchableOpacity>
    </View>
  ) : libraryStatus !== 'ready' ? (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.stateText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>
        {libraryStatus === 'migrating' ? 'Updating your library…' : 'Loading music…'}
      </Text>
    </View>
  ) : collectionItems.length === 0 ? (
    <View style={styles.state}>
      <Text style={styles.stateText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>No music yet</Text>
    </View>
  ) : visibleItems.length === 0 ? (
    <View style={styles.state}>
      <Text style={styles.stateText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>No matching songs</Text>
    </View>
  ) : null;

  return (
    <BottomSheet
      visible={visible}
      title="Music"
      initialDetent="medium"
      onClose={closeLibrarySheet}
      returnFocusRef={returnFocusRef}
      restoreFocusOnClose={restoreFocusOnClose}
      testID="music-library-sheet"
    >
      <View style={styles.content}>
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={libraryStatus === 'ready' ? visibleItems : []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={reorderPreview}
          scrollEnabled={reorderPreview === null}
          removeClippedSubviews={false}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={stateContent}
          ListHeaderComponent={(
            <>
              <TouchableOpacity
                style={[
                  styles.importButton,
                  focused === 'import' && styles.importButtonFocused,
                  libraryStatus !== 'ready' && styles.disabled,
                ]}
                onPress={() => { void pickAudio(); }}
                onFocus={() => setFocused('import')}
                onBlur={() => setFocused(value => value === 'import' ? null : value)}
                disabled={libraryStatus !== 'ready'}
                accessibilityRole="button"
                accessibilityLabel="Import Audio"
                accessibilityState={{ disabled: libraryStatus !== 'ready' }}
                testID="music-library-import"
              >
                <BeatNoteIcon name="import" size={22} color={colors.accent} />
                <Text style={styles.importText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Import Audio</Text>
              </TouchableOpacity>
              {importJobs.map(job => (
                <ImportProgressRow
                  key={job.id}
                  job={job}
                  onCancel={cancelImport}
                  onRetry={job => { void pickAudio(job.id); }}
                  onDismiss={dismissImportJob}
                />
              ))}
              {searchIsVisible && libraryStatus === 'ready' && (
                <View style={[styles.searchRow, focused === 'search' && styles.searchFocused]}>
                  <BeatNoteIcon name="search" size={19} color={colors.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setFocused('search')}
                    onBlur={() => setFocused(value => value === 'search' ? null : value)}
                    placeholder="Search music"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="search"
                    accessibilityLabel="Search music"
                    maxFontSizeMultiplier={MAX_TEXT_SCALE}
                    testID="music-library-search"
                  />
                  {query.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearch}
                      onPress={() => setQuery('')}
                      accessibilityRole="button"
                      accessibilityLabel="Clear music search"
                      testID="music-library-search-clear"
                    >
                      <BeatNoteIcon name="close" size={17} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {libraryStatus === 'ready' && (
                <View style={styles.sortSection} accessibilityRole="radiogroup">
                  <View style={styles.sortHeading}>
                    <BeatNoteIcon name="sort" size={18} color={colors.textSecondary} />
                    <Text style={styles.sortHeadingText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Sort</Text>
                  </View>
                  <View style={styles.sortGrid}>
                    {SORT_OPTIONS.map(option => {
                      const selected = librarySort === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.sortOption,
                            option.value === 'custom' && styles.sortOptionCustom,
                            selected && styles.sortOptionSelected,
                            focused === `sort-${option.value}` && styles.sortOptionFocused,
                          ]}
                          onPress={() => selectSort(option.value)}
                          onFocus={() => setFocused(`sort-${option.value}`)}
                          onBlur={() => setFocused(value => value === `sort-${option.value}` ? null : value)}
                          accessibilityRole="radio"
                          accessibilityLabel={option.value === 'custom'
                            ? 'Sort by Custom Order'
                            : `Sort by ${option.label}, ${selected
                              ? librarySortDirection
                              : defaultLibrarySortDirection(option.value)}`}
                          accessibilityHint={option.value === 'custom'
                            ? 'Drag songs into your preferred order.'
                            : 'Tap again to reverse the order.'}
                          accessibilityState={{ selected }}
                          testID={`music-library-sort-${option.value}`}
                        >
                          <View style={styles.sortOptionContent}>
                            <Text
                              style={[styles.sortOptionText, selected && styles.sortOptionTextSelected]}
                              numberOfLines={2}
                              maxFontSizeMultiplier={MAX_TEXT_SCALE}
                            >
                              {option.label}
                            </Text>
                            {selected && option.value !== 'custom' && (
                              <Animated.View style={{
                                transform: [{
                                  rotate: sortArrowRotation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '180deg'],
                                  }),
                                }],
                              }}>
                                <BeatNoteIcon name="chevron-up" size={16} color={colors.accent} />
                              </Animated.View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
          testID="music-library-list"
        />
      </View>
      <SwitchGuardDialog inLibrarySheet />
      <RenameMusicPrompt
        visible={renameItem !== null}
        initialTitle={renameItem?.displayTitle ?? ''}
        onClose={() => setRenameItem(null)}
        onDismiss={publishPendingRename}
        onConfirm={async title => {
          if (renameItem === null) return null;
          const result = await renameMusicItem(renameItem.id, title, { publish: false });
          if (result.kind === 'renamed') {
            pendingRenameItemsRef.current = result.items;
            Keyboard.dismiss();
            setRenameItem(null);
            if (Platform.OS !== 'ios') requestAnimationFrame(publishPendingRename);
            return null;
          }
          return result.error;
        }}
      />
      <ConfirmDialog
        visible={deletePrompt !== null}
        title="Delete from BeatNote?"
        message={deletePrompt === null ? '' : [
          `“${deletePrompt.item.displayTitle}” has ${deletePrompt.summary.projectCount} saved ${deletePrompt.summary.projectCount === 1 ? 'project' : 'projects'}`,
          deletePrompt.summary.hasDraft ? 'and a song draft.' : 'and no song draft.',
          'Only the copy in BeatNote will be deleted.',
          'You can reconnect the audio to your saved work later.',
        ].join(' ')}
        actions={[{
          label: 'Delete from BeatNote',
          destructive: true,
          testID: 'confirm-delete-music-item',
          onPress: () => { void confirmDelete(); },
        }]}
        onCancel={() => setDeletePrompt(null)}
        returnFocusRef={deletePrompt?.returnFocusRef}
        testID="delete-music-item-confirm"
      />
      <ConfirmDialog
        visible={relinkConfirmation !== null}
        title={relinkConfirmation?.decision === 'looksOriginal'
          ? 'This looks like the original file'
          : 'Use this audio file?'}
        message={relinkConfirmation === null ? '' : (() => {
          const stored = libraryItems[relinkConfirmation.musicItemId];
          if (relinkConfirmation.decision === 'looksOriginal') {
            return 'The name and duration match. Reconnect this file?';
          }
          const formatDuration = (milliseconds: number | null | undefined): string => {
            if (milliseconds === null || milliseconds === undefined) return 'unknown duration';
            const seconds = Math.max(0, Math.floor(milliseconds / 1000));
            return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
          };
          return [
            `Stored: “${stored?.displayTitle ?? 'Song'}” — ${formatDuration(stored?.durationMs)}.`,
            `Chosen: “${relinkConfirmation.chosen.originalFilename}” — ${formatDuration(relinkConfirmation.chosen.durationMs)}.`,
          ].join(' ');
        })()}
        actions={[{
          label: 'Use This File',
          testID: 'confirm-relink-use-file',
          onPress: () => { void resolveRelink(true); },
        }]}
        onCancel={() => { void resolveRelink(false); }}
        returnFocusRef={relinkConfirmation?.returnFocusRef}
        testID="relink-confirm"
      />
    </BottomSheet>
  );
};

export default MusicLibrarySheet;
