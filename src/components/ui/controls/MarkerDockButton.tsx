import React from 'react';
import { Alert } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { MarkerAddIcon, MarkerIcon, MarkerLeftIcon, MarkerRemoveIcon, MarkerRemoveLastIcon, MarkerRightIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import type { DockToastAction } from '../../../hooks/useDockToast';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';
import { capabilitiesForLoadedItem } from '../../../features/library/sourceResolver';

type MarkerDockAction = 'previous' | 'add' | 'next' | 'removePrevious';

interface MarkerDockButtonProps {
  action: MarkerDockAction;
  onSeek: (position: number) => void;
  onAddMarker: () => void;
  onToast: (message: string, action?: DockToastAction | null) => void;
  compact?: boolean;
}

const MarkerDockButton: React.FC<MarkerDockButtonProps> = ({ action, onSeek, onAddMarker, onToast, compact }) => {
  const state = useStudioStore(useShallow(store => ({
    loaded: store.songLoaded,
    current: store.currentTime,
    duration: store.songDuration,
    activeLayerId: store.activeLayerId,
    layers: store.layers,
    allLayers: store.allLayersData,
    layerSpecific: store.layerSpecificNavigation,
    ghost: store.ghostPlayheadTime,
    navigateLeft: store.navigateToLeftMarker,
    navigateRight: store.navigateToRightMarker,
    removePrevious: store.removeLastMarker,
    deletionHistory: store.markerDeletionHistory,
    restoreLastDeletion: store.restoreLastMarkerDeletion,
    deleteBefore: store.deleteMarkersBefore,
    exactSeeking: capabilitiesForLoadedItem(
      store.currentMusicItemId === null ? null : store.libraryItems[store.currentMusicItemId] ?? null,
      store.songLoaded && store.currentAudioUri !== null,
    ).exactSeeking,
  })));
  const activeLayer = state.layers.find(layer => layer.id === state.activeLayerId);
  const activeMarkers = activeLayer?.markers ?? [];
  const scopedMarkers = state.layerSpecific
    ? state.allLayers.find(layer => layer.id === state.activeLayerId)?.markers ?? []
    : state.allLayers.flatMap(layer => layer.markers);
  const navigable = state.ghost === null ? scopedMarkers : [...scopedMarkers, state.ghost];
  const hasPrevious = state.current > 0 || navigable.some(marker => marker < state.current);
  const hasNext = state.current < state.duration || navigable.some(marker => marker > state.current);
  const hasRemovable = scopedMarkers.some(marker => marker < state.current);
  const nearby = activeMarkers.reduce<number | null>((nearest, marker) => {
    if (Math.abs(marker - state.current) > 100) return nearest;
    if (nearest === null || Math.abs(marker - state.current) < Math.abs(nearest - state.current)) return marker;
    return nearest;
  }, null);
  const canAdd = state.loaded && Boolean(activeLayer?.isVisible);
  const canOpenDeletionActions = state.deletionHistory.length > 0 || hasRemovable;
  const requiresExactSeeking = action === 'previous' || action === 'next';
  const capabilityGated = state.loaded && requiresExactSeeking && !state.exactSeeking;
  const enabled = (action === 'removePrevious'
    ? state.loaded && canOpenDeletionActions
    : action === 'add'
      ? canAdd
      : action === 'previous'
        ? state.loaded && hasPrevious
        : state.loaded && hasNext) && (!requiresExactSeeking || state.exactSeeking);

  const restoreLastDeletion = () => {
    state.restoreLastDeletion();
    onToast('Marker deletion restored');
  };
  const confirmDeleteBeforePlayhead = () => {
    const count = state.allLayers.reduce(
      (total, layer) => total + layer.markers.filter(marker => marker < state.current).length,
      0,
    );
    if (count === 0) {
      onToast('No markers before the playhead');
      return;
    }
    Alert.alert(
      'Delete markers before playhead?',
      `This will delete ${count} marker${count === 1 ? '' : 's'} across all layers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deleted = state.deleteBefore(state.current);
            if (deleted > 0) {
              onToast(`${deleted} marker${deleted === 1 ? '' : 's'} deleted`, {
                label: 'Undo',
                onPress: restoreLastDeletion,
              });
            }
          },
        },
      ],
    );
  };
  const openDeletionActions = () => {
    const buttons = [
      ...(state.deletionHistory.length > 0
        ? [{ text: 'Restore deleted marker', onPress: restoreLastDeletion }]
        : []),
      ...(hasRemovable
        ? [{ text: 'Delete earlier markers…', style: 'destructive' as const, onPress: confirmDeleteBeforePlayhead }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert('Marker actions', undefined, buttons);
  };
  const activate = () => {
    if (action === 'add') {
      onAddMarker();
      onToast(nearby === null ? 'Marker added' : 'Marker removed');
    } else if (action === 'removePrevious') {
      if (hasRemovable) {
        state.removePrevious();
        onToast('Previous marker deleted', {
          label: 'Undo',
          onPress: restoreLastDeletion,
        });
      } else {
        onToast('No previous marker to delete');
      }
    } else {
      (action === 'previous' ? state.navigateLeft : state.navigateRight)();
      onSeek(useStudioStore.getState().currentTime);
    }
  };
  const labels = {
    previous: 'Previous marker',
    add: nearby === null ? 'Add marker' : 'Remove nearby marker',
    next: 'Next marker',
    removePrevious: 'Remove previous marker',
  };
  const testIDs = {
    previous: 'navigate-left-marker',
    add: 'add-marker',
    next: 'navigate-right-marker',
    removePrevious: 'remove-last-marker',
  };
  const color = enabled ? colors.text : colors.textSecondary;
  const icon = action === 'previous'
    ? <MarkerLeftIcon size={20} color={color} />
    : action === 'next'
      ? <MarkerRightIcon size={20} color={color} />
      : action === 'removePrevious'
        ? <MarkerRemoveLastIcon size={20} color={color} />
        : !canAdd
          ? <MarkerIcon size={20} color={color} />
          : nearby === null
            ? <MarkerAddIcon size={20} color={color} />
            : <MarkerRemoveIcon size={20} color={color} />;

  return (
    <DockButton
      compact={compact}
      testID={testIDs[action]}
      label={labels[action]}
      hint={capabilityGated
        ? 'Exact seeking is unavailable for this audio source'
        : action === 'removePrevious' && enabled
          ? 'Double tap to delete. Press and hold for restore and bulk-delete actions.'
          : undefined}
      description={capabilityGated
        ? 'Not available for this source: exact seeking'
        : undefined}
      state={enabled ? 'inactive' : 'unavailable'}
      onPress={activate}
      onLongPress={action === 'removePrevious' ? openDeletionActions : undefined}
      accessibilityActions={action === 'removePrevious' ? [
        ...(state.deletionHistory.length > 0 ? [{ name: 'restoreLastDeletion', label: 'Restore deleted marker' }] : []),
        ...(hasRemovable ? [{ name: 'deleteBeforePlayhead', label: 'Delete earlier markers' }] : []),
      ] : undefined}
      onAccessibilityAction={action === 'removePrevious' ? event => {
        if (event.nativeEvent.actionName === 'restoreLastDeletion') restoreLastDeletion();
        if (event.nativeEvent.actionName === 'deleteBeforePlayhead') confirmDeleteBeforePlayhead();
      } : undefined}
    >
      {icon}
    </DockButton>
  );
};

export default MarkerDockButton;
