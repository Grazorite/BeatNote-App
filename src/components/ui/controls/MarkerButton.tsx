import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MarkerIcon, MarkerAddIcon, MarkerRemoveIcon, MarkerLeftIcon, MarkerRightIcon, MarkerRemoveLastIcon, LoopMarkerIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { markerButtonStyles as styles } from '../../../styles/components/controls/markerButton';

interface MarkerButtonProps {
  onTap: () => void;
  onSeek: (position: number) => void;
  isMobile?: boolean;
}

const MarkerButton: React.FC<MarkerButtonProps> = ({ onTap, onSeek, isMobile = false }) => {
  const { songLoaded, currentTime, layers, activeLayerId, navigateToLeftMarker, navigateToRightMarker, removeLastMarker, allLayersData, ghostPlayheadTime, songDuration, layerSpecificNavigation, isLoopMarkerActive, toggleLoopMarker } = useStudioStore();
  
  // Check if there's an existing marker near current time
  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const hasNearbyMarker = activeLayer?.markers.some(marker => 
    Math.abs(marker - currentTime) < 100
  ) || false;
  
  // Check if active layer is visible
  const isActiveLayerVisible = activeLayer?.isVisible || false;
  
  const getIcon = () => {
    if (!songLoaded || !isActiveLayerVisible) {
      return <MarkerIcon size={isMobile ? 20 : 24} color="#666666" />;
    }
    if (hasNearbyMarker) {
      return <MarkerRemoveIcon size={isMobile ? 20 : 24} color="#ffffff" />;
    }
    return <MarkerAddIcon size={isMobile ? 20 : 24} color="#ffffff" />;
  };
  
  const canNavigateLeft = () => {
    if (!songLoaded) return false;
    const baseMarkers = layerSpecificNavigation 
      ? allLayersData.find(layer => layer.id === activeLayerId)?.markers || []
      : allLayersData.flatMap(layer => layer.markers);
    const allMarkers = [...baseMarkers]; // Create a copy to avoid mutation
    if (ghostPlayheadTime !== null) allMarkers.push(ghostPlayheadTime);
    return allMarkers.some(marker => marker < currentTime) || currentTime > 0;
  };
  
  const canNavigateRight = () => {
    if (!songLoaded) return false;
    const baseMarkers = layerSpecificNavigation 
      ? allLayersData.find(layer => layer.id === activeLayerId)?.markers || []
      : allLayersData.flatMap(layer => layer.markers);
    const allMarkers = [...baseMarkers]; // Create a copy to avoid mutation
    if (ghostPlayheadTime !== null) allMarkers.push(ghostPlayheadTime);
    allMarkers.push(songDuration); // End of song
    return allMarkers.some(marker => marker > currentTime);
  };
  
  const canRemoveLastMarker = () => {
    if (!songLoaded) return false;
    const baseMarkers = layerSpecificNavigation 
      ? allLayersData.find(layer => layer.id === activeLayerId)?.markers || []
      : allLayersData.flatMap(layer => layer.markers);
    return baseMarkers.some(marker => marker < currentTime);
  };
  
  const handleLeftNavigation = () => {
    navigateToLeftMarker();
    const state = useStudioStore.getState();
    onSeek(state.currentTime);
  };
  
  const handleRightNavigation = () => {
    navigateToRightMarker();
    const state = useStudioStore.getState();
    onSeek(state.currentTime);
  };
  
  return (
    <View style={[styles.markerButtonContainer, isMobile && styles.markerButtonContainerMobile]}>
      <TouchableOpacity 
        style={[
          styles.markerButton,
          isMobile && styles.markerButtonMobile,
          songLoaded && canRemoveLastMarker() ? styles.markerButtonSecondary : styles.markerButtonDisabled
        ]} 
        onPress={(songLoaded && canRemoveLastMarker()) ? removeLastMarker : undefined}
        disabled={!songLoaded || !canRemoveLastMarker()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="remove-last-marker"
      >
        <MarkerRemoveLastIcon size={isMobile ? 20 : 24} color={(songLoaded && canRemoveLastMarker()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.markerButton,
          isMobile && styles.markerButtonMobile,
          songLoaded && canNavigateLeft() ? styles.markerButtonSecondary : styles.markerButtonDisabled
        ]} 
        onPress={(songLoaded && canNavigateLeft()) ? handleLeftNavigation : undefined}
        disabled={!songLoaded || !canNavigateLeft()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="navigate-left-marker"
      >
        <MarkerLeftIcon size={isMobile ? 20 : 24} color={(songLoaded && canNavigateLeft()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.markerButton,
          isMobile && styles.markerButtonMobile,
          songLoaded && isActiveLayerVisible ? styles.markerButtonMain : styles.markerButtonDisabled
        ]} 
        onPress={songLoaded && isActiveLayerVisible ? onTap : undefined}
        disabled={!songLoaded || !isActiveLayerVisible}
        accessibilityRole="button"
        accessibilityLabel={hasNearbyMarker ? 'Remove marker' : 'Add marker'}
        accessibilityState={{ disabled: !songLoaded || !isActiveLayerVisible }}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="add-marker"
      >
        {getIcon()}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.markerButton,
          isMobile && styles.markerButtonMobile,
          songLoaded && canNavigateRight() ? styles.markerButtonSecondary : styles.markerButtonDisabled
        ]} 
        onPress={(songLoaded && canNavigateRight()) ? handleRightNavigation : undefined}
        disabled={!songLoaded || !canNavigateRight()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="navigate-right-marker"
      >
        <MarkerRightIcon size={isMobile ? 20 : 24} color={(songLoaded && canNavigateRight()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.markerButton,
          isMobile && styles.markerButtonMobile,
          songLoaded && isActiveLayerVisible ? (isLoopMarkerActive ? styles.markerButtonActive : styles.markerButtonInactive) : styles.markerButtonDisabled
        ]} 
        onPress={songLoaded && isActiveLayerVisible ? toggleLoopMarker : undefined}
        disabled={!songLoaded || !isActiveLayerVisible}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <LoopMarkerIcon size={isMobile ? 20 : 24} color={songLoaded && isActiveLayerVisible ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
    </View>
  );
};



export default MarkerButton;
