import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import { controlDockStyles as styles } from '../../../styles/components/controls/controlDock';

interface DockToastProps {
  message: string | null;
}

const DockToast: React.FC<DockToastProps> = ({ message }) => {
  const announcedRef = useRef<string | null>(null);
  if (!message) return null;
  const shouldAnnounce = announcedRef.current !== message;
  announcedRef.current = message;
  return (
    <View
      testID="dock-toast"
      style={styles.toast}
      pointerEvents="none"
      accessibilityLiveRegion={shouldAnnounce ? 'polite' : 'none'}
      aria-live={shouldAnnounce ? 'polite' : 'off'}
    >
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export default DockToast;
