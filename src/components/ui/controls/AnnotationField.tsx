import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { LayerId, SelectedMarker, useStudioStore } from '../../../hooks/useStudioStore';

interface AnnotationFieldProps {
  isMobile?: boolean;
  compact?: boolean;
}

export interface AnnotationFieldRef {
  focus: () => void;
}

const AnnotationField = forwardRef<AnnotationFieldRef, AnnotationFieldProps>(({ isMobile = false, compact = false }, ref) => {
  const { 
    currentTime, 
    allLayersData, 
    showAnnotations,
    isPlaying,
    isTextInputFocused,
    selectedMarker,
    setSelectedMarker,
    updateMarkerAnnotation,
    setTextInputFocused,
    songLoaded
  } = useStudioStore(useShallow(state => ({
    currentTime: state.currentTime,
    allLayersData: state.allLayersData,
    showAnnotations: state.showAnnotations,
    isPlaying: state.isPlaying,
    isTextInputFocused: state.isTextInputFocused,
    selectedMarker: state.selectedMarker,
    setSelectedMarker: state.setSelectedMarker,
    updateMarkerAnnotation: state.updateMarkerAnnotation,
    setTextInputFocused: state.setTextInputFocused,
    songLoaded: state.songLoaded,
  })));
  
  const [annotation, setAnnotation] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const previousMarkers = useRef<string[]>([]);
  const syncedMarker = useRef<string | null>(null);

  useEffect(() => {
    const markers = allLayersData.flatMap(layer =>
      layer.markers.map(timestamp => `${layer.id}:${timestamp}`)
    );
    const addedMarker = markers.find(marker => !previousMarkers.current.includes(marker));
    previousMarkers.current = markers;

    if (addedMarker) {
      const [layerId, timestamp] = addedMarker.split(':');
      setSelectedMarker({ layerId: layerId as LayerId, timestamp: Number(timestamp) });
      return;
    }

    const markerStillExists = selectedMarker && allLayersData.some(layer =>
      layer.id === selectedMarker.layerId && layer.markers.includes(selectedMarker.timestamp)
    );
    if (markerStillExists && (isPlaying || isTextInputFocused)) return;

    let closestMarker: SelectedMarker | null = null;
    let closestDistance = 100;
    for (const layer of allLayersData) {
      for (const timestamp of layer.markers) {
        const distance = Math.abs(timestamp - currentTime);
        if (distance < closestDistance) {
          closestMarker = { layerId: layer.id, timestamp };
          closestDistance = distance;
        }
      }
    }
    const selectionIsUnchanged = selectedMarker?.layerId === closestMarker?.layerId
      && selectedMarker?.timestamp === closestMarker?.timestamp;
    if (!selectionIsUnchanged) {
      setSelectedMarker(closestMarker);
    }
  }, [currentTime, allLayersData, isPlaying, isTextInputFocused, selectedMarker]);

  useEffect(() => {
    if (!selectedMarker) {
      syncedMarker.current = null;
      setAnnotation('');
      return;
    }
    const markerKey = `${selectedMarker.layerId}:${selectedMarker.timestamp}`;
    if (isTextInputFocused && syncedMarker.current === markerKey) return;
    const layer = allLayersData.find(item => item.id === selectedMarker.layerId);
    const existingAnnotation = layer?.annotations.find(ann =>
      Math.abs(ann.timestamp - selectedMarker.timestamp) < 100
    );
    syncedMarker.current = markerKey;
    setAnnotation(existingAnnotation?.text || '');
  }, [selectedMarker, allLayersData, isTextInputFocused]);
  
  const handleAnnotationChange = (text: string) => {
    setAnnotation(text);
    if (selectedMarker) {
      updateMarkerAnnotation(selectedMarker.layerId, selectedMarker.timestamp, text);
    }
  };
  
  const canEdit = Boolean(selectedMarker && allLayersData.some(layer =>
    layer.id === selectedMarker.layerId && layer.markers.includes(selectedMarker.timestamp)
  ));
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (canEdit && songLoaded) {
        textInputRef.current?.focus();
      }
    }
  }), [canEdit, songLoaded]);
  
  if (!showAnnotations) return null;
  
  return (
    <View
      pointerEvents={songLoaded ? 'auto' : 'none'}
      style={{
        flex: isMobile ? (compact ? undefined : 0) : 1,
        flexShrink: compact ? 0 : undefined,
        height: compact ? 40 : isMobile ? 48 : undefined,
        width: isMobile ? '100%' : undefined,
        marginHorizontal: isMobile ? 0 : 16,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 14,
      }}
    >
      <TextInput
        style={{
          width: isMobile ? '100%' : undefined,
          backgroundColor: isMobile
            ? canEdit ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.14)'
            : canEdit ? '#333333' : '#222222',
          color: canEdit ? '#ffffff' : '#666666',
          borderRadius: 12,
          paddingHorizontal: isMobile ? 16 : 12,
          paddingVertical: 0,
          fontSize: 14,
          borderWidth: 1,
          borderColor: isMobile
            ? canEdit ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'
            : canEdit ? '#555555' : '#333333',
          height: compact ? 40 : isMobile ? 48 : 80,
        }}
        value={annotation}
        onChangeText={handleAnnotationChange}
        placeholder={!songLoaded ? undefined : canEdit ? "Add annotation..." : "Add a marker to annotate"}
        placeholderTextColor={isMobile ? '#8c8c96' : '#666666'}
        editable={canEdit && songLoaded}
        accessibilityState={{ disabled: !songLoaded || !canEdit }}
        multiline={false}
        maxLength={100}
        ref={textInputRef}
        onFocus={() => setTextInputFocused(true)}
        onBlur={() => setTextInputFocused(false)}
        testID="marker-annotation"
      />
    </View>
  );
});

export default AnnotationField;
