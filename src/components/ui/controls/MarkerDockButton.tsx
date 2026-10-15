import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MarkerAddIcon, MarkerIcon, MarkerLeftIcon, MarkerRemoveIcon, MarkerRemoveLastIcon, MarkerRightIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';

type MarkerDockAction = 'previous' | 'add' | 'next' | 'removePrevious';

interface MarkerDockButtonProps {
  action: MarkerDockAction;
  onSeek: (position: number) => void;
  onAddMarker: () => void;
  onToast: (message: string) => void;
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
  const enabled = action === 'removePrevious'
    ? true
    : action === 'add'
      ? canAdd
      : action === 'previous'
        ? state.loaded && hasPrevious
        : state.loaded && hasNext;

  const activate = () => {
    if (action === 'add') {
      onAddMarker();
      onToast(nearby === null ? 'Marker added' : 'Marker removed');
    } else if (action === 'removePrevious') {
      if (hasRemovable) {
        state.removePrevious();
        onToast('Previous marker removed');
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
        ? <MarkerRemoveLastIcon size={19} color={color} />
        : !canAdd
          ? <MarkerIcon size={20} color={color} />
          : nearby === null
            ? <MarkerAddIcon size={20} color={color} />
            : <MarkerRemoveIcon size={20} color={color} />;

  return (
    <DockButton compact={compact} testID={testIDs[action]} label={labels[action]} state={enabled ? 'inactive' : 'unavailable'} onPress={activate}>
      {icon}
    </DockButton>
  );
};

export default MarkerDockButton;
