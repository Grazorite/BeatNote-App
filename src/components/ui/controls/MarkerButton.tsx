import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MarkerIcon, MarkerAddIcon, MarkerRemoveIcon, MarkerLeftIcon, MarkerRightIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { markerButtonStyles as styles } from '../../../styles/components/controls/markerButton';

interface MarkerButtonProps {
  onTap: () => void;
  onSeek: (position: number) => void;
}

const MarkerButton: React.FC<MarkerButtonProps> = ({ onTap, onSeek }) => {
  const { songLoaded, currentTime, layers, activeLayerId, navigateToLeftMarker, navigateToRightMarker, allLayersData, ghostPlayheadTime, songDuration, layerSpecificNavigation } = useStudioStore();
  
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
    return allMarkers.some(marker => marker > currentTime) || currentTime < songDuration;
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
        style={[styles.markerButton, (!songLoaded || !canNavigateLeft()) && styles.markerButtonDisabled]} 
        onPress={(songLoaded && canNavigateLeft()) ? handleLeftNavigation : undefined}
        disabled={!songLoaded || !canNavigateLeft()}
      >
        <MarkerLeftIcon size={24} color={(songLoaded && canNavigateLeft()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.markerButton, !songLoaded && styles.markerButtonDisabled]} 
        onPress={songLoaded ? onTap : undefined}
        disabled={!songLoaded}
      >
        {getIcon()}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.markerButton, (!songLoaded || !canNavigateRight()) && styles.markerButtonDisabled]} 
        onPress={(songLoaded && canNavigateRight()) ? handleRightNavigation : undefined}
        disabled={!songLoaded || !canNavigateRight()}
      >
        <MarkerRightIcon size={24} color={(songLoaded && canNavigateRight()) ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
    </View>
  );
};



export default MarkerButton;