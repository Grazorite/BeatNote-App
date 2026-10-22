import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  cancelImport,
  dismissImportJob,
} from '../../../features/library/importPipeline';
import { runLibraryBoot } from '../../../features/library/useLibraryLifecycle';
import { requestTrackSwitch } from '../../../features/library/trackSwitch';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { musicLibrarySheetStyles as styles } from '../../../styles/components/library/musicLibrarySheet';
import { colors } from '../../../styles/common';
import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type ImportJobView,
  type LibrarySortKey,
  type MusicItem,
} from '../../../types/library';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { filterLibraryItems, sortLibraryItems } from '../../../utils/queueOrder';
import { BeatNoteIcon } from '../../icons';
import { BottomSheet } from '../common';
import ImportProgressRow from './ImportProgressRow';
import MusicLibraryRow from './MusicLibraryRow';

export interface MusicLibrarySheetProps {
  returnFocusRef: React.RefObject<unknown>;
  onImportAudio: (retryJob?: ImportJobView) => void;
  onRename: (item: MusicItem) => void;
  onShowProjects: (item: MusicItem) => void;
  onDelete: (item: MusicItem) => void;
  onRelink: (item: MusicItem) => void;
}

const SORT_OPTIONS: ReadonlyArray<{ value: LibrarySortKey; label: string }> = [
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'recentlyAdded', label: 'Recently Added' },
  { value: 'recentlyPlayed', label: 'Recently Played' },
  { value: 'duration', label: 'Duration' },
];

const MusicLibrarySheet: React.FC<MusicLibrarySheetProps> = ({
  returnFocusRef,
  onImportAudio,
  onRename,
  onShowProjects,
  onDelete,
  onRelink,
}) => {
  const visible = useStudioStore(state => state.isLibrarySheetOpen);
  const libraryItems = useStudioStore(state => state.libraryItems);
  const librarySort = useStudioStore(state => state.librarySort);
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
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [requestedMusicItemId, setRequestedMusicItemId] = useState<string | null>(null);

  const collectionItems = useMemo(() => Object.values(libraryItems).filter(item => (
    !item.removed && item.collectionIds.includes(IMPORTED_MUSIC_COLLECTION_ID)
  )), [libraryItems]);
  const searchIsVisible = collectionItems.length > 8;
  const visibleItems = useMemo(() => sortLibraryItems(
    filterLibraryItems(collectionItems, searchIsVisible ? query : ''),
    librarySort,
  ), [collectionItems, librarySort, query, searchIsVisible]);
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(projectSummaries).forEach(project => {
      counts[project.musicItemId] = (counts[project.musicItemId] ?? 0) + 1;
    });
    return counts;
  }, [projectSummaries]);
  const activeLoadingId = loadingMusicItemId ?? requestedMusicItemId;
  const interactionsDisabled = libraryStatus !== 'ready'
    || switchPhase !== 'idle'
    || switchGuard !== null
    || saveInProgress
    || activeLoadingId !== null;

  useEffect(() => {
    if (
      requestedMusicItemId !== null
      && switchPhase === 'idle'
      && switchGuard === null
      && loadingMusicItemId === null
    ) setRequestedMusicItemId(null);
  }, [loadingMusicItemId, requestedMusicItemId, switchGuard, switchPhase]);

  const switchTo = useCallback(async (item: MusicItem) => {
    if (item.id === currentMusicItemId) {
      closeLibrarySheet();
      return;
    }
    setRequestedMusicItemId(item.id);
    const result = await requestTrackSwitch({
      musicItemId: item.id,
      origin: 'library',
      rebuildQueue: true,
    });
    if (result.kind === 'committed') closeLibrarySheet();
    if (result.kind === 'failed' || result.kind === 'superseded') setRequestedMusicItemId(null);
    if (result.kind === 'cancelled' && useStudioStore.getState().switchGuard === null) {
      setRequestedMusicItemId(null);
    }
  }, [closeLibrarySheet, currentMusicItemId]);

  const renderItem = useCallback(({ item }: { item: MusicItem }) => (
    <MusicLibraryRow
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
      onRename={() => onRename(item)}
      onShowProjects={() => onShowProjects(item)}
      onDelete={() => onDelete(item)}
      onRelink={() => onRelink(item)}
    />
  ), [
    currentMusicItemId,
    interactionsDisabled,
    librarySwitchFailure,
    activeLoadingId,
    onDelete,
    onRelink,
    onRename,
    onShowProjects,
    projectCounts,
    switchTo,
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
      <Text style={styles.stateText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>No matching music</Text>
    </View>
  ) : null;

  return (
    <BottomSheet
      visible={visible}
      title="Music"
      initialDetent="medium"
      onClose={closeLibrarySheet}
      returnFocusRef={returnFocusRef}
      testID="music-library-sheet"
    >
      <View style={styles.content}>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={libraryStatus === 'ready' ? visibleItems : []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
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
                onPress={() => onImportAudio()}
                onFocus={() => setFocused('import')}
                onBlur={() => setFocused(value => value === 'import' ? null : value)}
                disabled={libraryStatus !== 'ready'}
                accessibilityRole="button"
                accessibilityLabel="Import Audio"
                accessibilityState={{ disabled: libraryStatus !== 'ready' }}
                testID="music-library-import"
              >
                <BeatNoteIcon name="import" size={20} color={colors.accent} />
                <Text style={styles.importText} maxFontSizeMultiplier={MAX_TEXT_SCALE}>Import Audio</Text>
              </TouchableOpacity>
              {importJobs.map(job => (
                <ImportProgressRow
                  key={job.id}
                  job={job}
                  onCancel={cancelImport}
                  onRetry={onImportAudio}
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
                            selected && styles.sortOptionSelected,
                            focused === `sort-${option.value}` && styles.sortOptionFocused,
                          ]}
                          onPress={() => setLibrarySort(option.value)}
                          onFocus={() => setFocused(`sort-${option.value}`)}
                          onBlur={() => setFocused(value => value === `sort-${option.value}` ? null : value)}
                          accessibilityRole="radio"
                          accessibilityLabel={`Sort by ${option.label}`}
                          accessibilityState={{ selected }}
                          testID={`music-library-sort-${option.value}`}
                        >
                          <Text
                            style={[styles.sortOptionText, selected && styles.sortOptionTextSelected]}
                            numberOfLines={2}
                            maxFontSizeMultiplier={MAX_TEXT_SCALE}
                          >
                            {option.label}
                          </Text>
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
    </BottomSheet>
  );
};

export default MusicLibrarySheet;
