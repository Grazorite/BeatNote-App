import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';

export interface AnnotationFieldRef {
  focus: () => void;
}

const AnnotationField = forwardRef<AnnotationFieldRef>((props, ref) => {
  const { 
    currentTime, 
    activeLayerId, 
    allLayersData, 
    showAnnotations,
    updateMarkerAnnotation,
    setTextInputFocused,
    songLoaded
  } = useStudioStore();
  
  const [annotation, setAnnotation] = useState('');
  const textInputRef = useRef<TextInput>(null);
  
  // Find annotation for current marker across all layers
  useEffect(() => {
    // Check all layers for markers at current position
    let foundMarker = null;
    let foundLayer = null;
    
    for (const layer of allLayersData) {
      const marker = layer.markers.find(marker => 
        Math.abs(marker - currentTime) < 100
      );
      if (marker !== undefined) {
        foundMarker = marker;
        foundLayer = layer;
        break;
      }
    }
    
    if (foundMarker !== null && foundLayer) {
      const existingAnnotation = foundLayer.annotations.find(ann => 
        Math.abs(ann.timestamp - foundMarker) < 100
      );
      setAnnotation(existingAnnotation?.text || '');
    } else {
      setAnnotation('');
    }
  }, [currentTime, allLayersData]);
  
  const handleAnnotationChange = (text: string) => {
    setAnnotation(text);
    
    // Find marker across all layers
    for (const layer of allLayersData) {
      const marker = layer.markers.find(marker => 
        Math.abs(marker - currentTime) < 100
      );
      if (marker !== undefined) {
        updateMarkerAnnotation(layer.id, marker, text);
        break;
      }
    }
  };
  
  if (!showAnnotations) return null;
  
  // Check if any layer has a marker at current position
  const hasNearbyMarker = allLayersData.some(layer => 
    layer.markers.some(marker => Math.abs(marker - currentTime) < 100)
  );
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (hasNearbyMarker && songLoaded) {
        textInputRef.current?.focus();
      }
    }
  }), [hasNearbyMarker, songLoaded]);
  
  return (
    <View style={{
      flex: 1,
      marginHorizontal: 16,
      justifyContent: 'center',
    }}>
      <TextInput
        style={{
          backgroundColor: hasNearbyMarker ? '#333333' : '#222222',
          color: hasNearbyMarker ? '#ffffff' : '#666666',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 0,
          fontSize: 14,
          borderWidth: 1,
          borderColor: hasNearbyMarker ? '#555555' : '#333333',
          height: 80,
        }}
        value={annotation}
        onChangeText={handleAnnotationChange}
        placeholder={!songLoaded ? "Please load a song first" : hasNearbyMarker ? "Add annotation..." : "No marker at current position"}
        placeholderTextColor="#666666"
        editable={hasNearbyMarker && songLoaded}
        multiline={false}
        maxLength={100}
        ref={textInputRef}
        onFocus={() => setTextInputFocused(true)}
        onBlur={() => setTextInputFocused(false)}
      />
    </View>
  );
});

export default AnnotationField;