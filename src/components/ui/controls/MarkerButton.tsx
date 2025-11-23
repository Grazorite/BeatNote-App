import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MarkerIcon, MarkerAddIcon, MarkerRemoveIcon, MarkerLeftIcon, MarkerRightIcon, MarkerRemoveLastIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { markerButtonStyles as styles } from '../../../styles/components/controls/markerButton';

interface MarkerButtonProps {
  onTap: () => void;
  onSeek: (position: number) => void;
}

const MarkerButton: React.FC<MarkerButtonProps> = ({ onTap, onSeek }) => {
  const { songLoaded, currentTime, layers, activeLayerId, navigateToLeftMarker, navigateToRightMarker, removeLastMarker, allLayersData, ghostPlayheadTime, songDuration, layerSpecificNavigation } = useStudioStore();
  
  // Check if there's an existing marker near current time
  const activeLayer = layers.find(layer => layer.id === activeLayerId);
  const hasNearbyMarker = activeLayer?.markers.some(marker => 
    Math.abs(marker - currentTime) < 100
  ) || false;
  
  const getIcon = () => {
    if (!songLoaded) {
      return <MarkerIcon size={24} color="#666666" />;
    }
    if (hasNearbyMarker) {
      return <MarkerRemoveIcon size={24} color="#ffffff" />;
    }
    return <MarkerAddIcon size={24} color="#ffffff" />;
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
    <View style={styles.markerButtonContainer}>
      <TouchableOpacity 
        style={[styles.markerButton, (!songLoaded || !canRemoveLastMarker()) && styles.markerButtonDisabled]} 
        onPress={(songLoaded && canRemoveLastMarker()) ? removeLastMarker : undefined}
        disabled={!songLoaded || !canRemoveLastMarker()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <MarkerRemoveLastIcon size={24} color={(songLoaded && canRemoveLastMarker()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.markerButton, (!songLoaded || !canNavigateLeft()) && styles.markerButtonDisabled]} 
        onPress={(songLoaded && canNavigateLeft()) ? handleLeftNavigation : undefined}
        disabled={!songLoaded || !canNavigateLeft()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <MarkerLeftIcon size={24} color={(songLoaded && canNavigateLeft()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.markerButton, !songLoaded && styles.markerButtonDisabled]} 
        onPress={songLoaded ? onTap : undefined}
        disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        {getIcon()}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.markerButton, (!songLoaded || !canNavigateRight()) && styles.markerButtonDisabled]} 
        onPress={(songLoaded && canNavigateRight()) ? handleRightNavigation : undefined}
        disabled={!songLoaded || !canNavigateRight()}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <MarkerRightIcon size={24} color={(songLoaded && canNavigateRight()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
    </View>
  );
};



export default MarkerButton;