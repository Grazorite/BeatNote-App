import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from './useStudioStore';
import { isValidLoopRange } from '../utils/loopRange';

interface KeyboardShortcutsProps {
  onTogglePlayback: () => void;
  onAddMarker: () => void;
  onFocusTextInput: () => void;
  hasSound: boolean;
}

export const useKeyboardShortcuts = ({ 
  onTogglePlayback, 
  onAddMarker, 
  onFocusTextInput,
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
    toggleLoopRangeEnabled,
    toggleLoopMarker,
    setLoopStartAtPlayhead,
    setLoopEndAtPlayhead,
    isTextInputFocused
  } = useStudioStore(useShallow(state => ({
    removeLastMarker: state.removeLastMarker,
    redoLastMarker: state.redoLastMarker,
    navigateToLeftMarker: state.navigateToLeftMarker,
    navigateToRightMarker: state.navigateToRightMarker,
    scrollTimeline: state.scrollTimeline,
    zoomTimeline: state.zoomTimeline,
    skipPlayhead: state.skipPlayhead,
    toggleRepeat: state.toggleRepeat,
    toggleLoopRangeEnabled: state.toggleLoopRangeEnabled,
    toggleLoopMarker: state.toggleLoopMarker,
    setLoopStartAtPlayhead: state.setLoopStartAtPlayhead,
    setLoopEndAtPlayhead: state.setLoopEndAtPlayhead,
    isTextInputFocused: state.isTextInputFocused,
  })));

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, code, metaKey, ctrlKey, shiftKey } = event;
      
      // Disable all shortcuts when text input is focused
      if (isTextInputFocused) return;
      
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
      
      // L = Toggle selected loop range
      if ((key === 'l' || key === 'L' || code === 'KeyL') && !metaKey && !ctrlKey && !shiftKey) {
        event.preventDefault();
        const state = useStudioStore.getState();
        if (hasSound && state.songLoaded && isValidLoopRange(state, state.songDuration)) {
          toggleLoopRangeEnabled();
        }
        return;
      }

      // Shift+L = Toggle marker-bounded loop
      if ((key === 'l' || key === 'L' || code === 'KeyL') && shiftKey && !metaKey && !ctrlKey) {
        event.preventDefault();
        if (hasSound && useStudioStore.getState().songLoaded) {
          toggleLoopMarker();
        }
        return;
      }

      if (key === '[' && !metaKey && !ctrlKey && !shiftKey) {
        event.preventDefault();
        if (hasSound && useStudioStore.getState().songLoaded) {
          setLoopStartAtPlayhead(useStudioStore.getState().currentTime);
        }
        return;
      }

      if (key === ']' && !metaKey && !ctrlKey && !shiftKey) {
        event.preventDefault();
        if (hasSound && useStudioStore.getState().songLoaded) {
          setLoopEndAtPlayhead(useStudioStore.getState().currentTime);
        }
        return;
      }
      
      // T = Focus Text Input
      if (key === 't' || key === 'T' || code === 'KeyT') {
        event.preventDefault();
        onFocusTextInput();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlayback, onAddMarker, onFocusTextInput, hasSound, removeLastMarker, redoLastMarker, navigateToLeftMarker, navigateToRightMarker, scrollTimeline, zoomTimeline, skipPlayhead, toggleRepeat, toggleLoopRangeEnabled, toggleLoopMarker, setLoopStartAtPlayhead, setLoopEndAtPlayhead, isTextInputFocused]);
};
