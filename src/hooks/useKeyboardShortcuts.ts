import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useStudioStore } from './useStudioStore';

interface KeyboardShortcutsProps {
  onTogglePlayback: () => void;
  onAddMarker: () => void;
  hasSound: boolean;
}

export const useKeyboardShortcuts = ({ 
  onTogglePlayback, 
  onAddMarker, 
  hasSound 
}: KeyboardShortcutsProps) => {
  const { 
    removeLastMarker, 
    redoLastMarker, 
    navigateToLeftMarker, 
    navigateToRightMarker,
    scrollTimeline,
    zoomTimeline,
    skipPlayhead,
    toggleRepeat,
    toggleLoopMarker
  } = useStudioStore();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, code, metaKey, ctrlKey, shiftKey } = event;
      
      // Space = Play/Pause
      if (key === ' ' || code === 'Space') {
        event.preventDefault();
        if (hasSound) {
          onTogglePlayback();
        }
        return;
      }
      
      // M = Add Marker
      if (key === 'm' || key === 'M' || code === 'KeyM') {
        event.preventDefault();
        if (hasSound) {
          onAddMarker();
        }
        return;
      }
      
      // Cmd+Z / Ctrl+Z = Undo (Remove Last Marker)
      if ((key === 'z' || key === 'Z' || code === 'KeyZ') && (metaKey || ctrlKey) && !shiftKey) {
        event.preventDefault();
        removeLastMarker();
        return;
      }
      
      // Cmd+Shift+Z / Ctrl+Shift+Z = Redo Last Marker
      if ((key === 'z' || key === 'Z' || code === 'KeyZ') && (metaKey || ctrlKey) && shiftKey) {
        event.preventDefault();
        redoLastMarker();
        return;
      }
      
      // Arrow Keys
      if (code === 'ArrowLeft') {
        event.preventDefault();
        if (ctrlKey && shiftKey) {
          // Ctrl+Shift+Left = Move to left marker
          navigateToLeftMarker();
        } else if (ctrlKey) {
          // Ctrl+Left = Skip back
          skipPlayhead('left');
        } else {
          // Left = Scroll timeline left
          scrollTimeline('left');
        }
        return;
      }
      
      if (code === 'ArrowRight') {
        event.preventDefault();
        if (ctrlKey && shiftKey) {
          // Ctrl+Shift+Right = Move to right marker
          navigateToRightMarker();
        } else if (ctrlKey) {
          // Ctrl+Right = Skip forward
          skipPlayhead('right');
        } else {
          // Right = Scroll timeline right
          scrollTimeline('right');
        }
        return;
      }
      
      if (code === 'ArrowUp') {
        event.preventDefault();
        // Up = Zoom in
        zoomTimeline('in');
        return;
      }
      
      if (code === 'ArrowDown') {
        event.preventDefault();
        // Down = Zoom out
        zoomTimeline('out');
        return;
      }
      
      // R = Toggle Repeat
      if (key === 'r' || key === 'R' || code === 'KeyR') {
        event.preventDefault();
        if (hasSound) {
          toggleRepeat();
        }
        return;
      }
      
      // L = Toggle Loop Marker
      if (key === 'l' || key === 'L' || code === 'KeyL') {
        event.preventDefault();
        if (hasSound) {
          toggleLoopMarker();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlayback, onAddMarker, hasSound, removeLastMarker, redoLastMarker, navigateToLeftMarker, navigateToRightMarker, scrollTimeline, zoomTimeline, skipPlayhead, toggleRepeat, toggleLoopMarker]);
};