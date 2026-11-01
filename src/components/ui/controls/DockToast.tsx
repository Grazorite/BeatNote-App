import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { DockToastAction } from '../../../hooks/useDockToast';
import { controlDockStyles as styles } from '../../../styles/components/controls/controlDock';
import GlassBackdrop from './GlassBackdrop';

interface DockToastProps {
  message: string | null;
  action?: DockToastAction | null;
  stacked?: boolean;
}

const DockToast: React.FC<DockToastProps> = ({ message, action, stacked = false }) => {
  const announcedRef = useRef<string | null>(null);
  const [renderedMessage, setRenderedMessage] = useState(message);
  const [renderedAction, setRenderedAction] = useState(action ?? null);
  const opacity = useSharedValue(message ? 1 : 0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    if (message) {
      setRenderedMessage(message);
      setRenderedAction(action ?? null);
      opacity.value = withTiming(1, { duration: 160 });
      return;
    }
    opacity.value = withTiming(0, { duration: 160 }, finished => {
      if (finished) {
        runOnJS(setRenderedMessage)(null);
        runOnJS(setRenderedAction)(null);
      }
    });
  }, [action, message, opacity]);

  if (!renderedMessage) return null;
  const shouldAnnounce = announcedRef.current !== renderedMessage;
  announcedRef.current = renderedMessage;
  return (
    <Animated.View
      testID="dock-toast"
      style={[styles.toast, stacked ? styles.toastStacked : styles.toastFloating, animatedStyle]}
      pointerEvents={message && renderedAction ? 'auto' : 'none'}
      accessibilityLiveRegion={shouldAnnounce ? 'polite' : 'none'}
      aria-live={shouldAnnounce ? 'polite' : 'off'}
    >
      <GlassBackdrop
        gradientId="dock-toast-glass"
        radius={12}
        testID="dock-toast-glass"
        variant="toast"
      />
      <Text style={styles.toastText}>{renderedMessage}</Text>
      {renderedAction && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={renderedAction.onPress}
          style={styles.toastAction}
          testID="dock-toast-action"
        >
          <Text style={styles.toastActionText}>{renderedAction.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default DockToast;
