import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';
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
  if (!message) return null;
  const shouldAnnounce = announcedRef.current !== message;
  announcedRef.current = message;
  return (
    <Animated.View
      testID="dock-toast"
      style={[styles.toast, stacked ? styles.toastStacked : styles.toastFloating]}
      pointerEvents={action ? 'auto' : 'none'}
      accessibilityLiveRegion={shouldAnnounce ? 'polite' : 'none'}
      aria-live={shouldAnnounce ? 'polite' : 'off'}
      entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(160).reduceMotion(ReduceMotion.System)}
      layout={LinearTransition.duration(180).reduceMotion(ReduceMotion.System)}
    >
      <GlassBackdrop
        gradientId="dock-toast-glass"
        radius={12}
        testID="dock-toast-glass"
        variant="toast"
      />
      <Text style={styles.toastText}>{message}</Text>
      {action && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={action.onPress}
          style={styles.toastAction}
          testID="dock-toast-action"
        >
          <Text style={styles.toastActionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default DockToast;
