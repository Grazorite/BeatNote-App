import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MarkerIcon, MarkerAddIcon, MarkerRemoveIcon } from '../../icons';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { markerButtonStyles as styles } from '../../../styles/components/controls/markerButton';

interface MarkerButtonProps {
  onTap: () => void;
}

const MarkerButton: React.FC<MarkerButtonProps> = ({ onTap }) => {
  const { songLoaded, currentTime, layers, activeLayerId } = useStudioStore();
  
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
  
  return (
    <TouchableOpacity 
      style={[styles.markerButton, !songLoaded && styles.markerButtonDisabled]} 
      onPress={songLoaded ? onTap : undefined}
      disabled={!songLoaded}
    >
      {getIcon()}
    </TouchableOpacity>
  );
};



export default MarkerButton;