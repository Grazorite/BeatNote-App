import { StyleSheet, Platform } from 'react-native';

export const timelineScrollbarStyles = StyleSheet.create({
  container: {
    marginTop: 15,
    alignItems: 'center',
  },
  timeline: {
    backgroundColor: '#111111',
    borderRadius: 4,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginTop: 8,
  },
  timeText: {
    color: '#999999',
    fontSize: 10,
  },
  cursorAuto: Platform.OS === 'web' ? { cursor: 'auto' } : {},
  cursorResize: Platform.OS === 'web' ? { cursor: 'ew-resize' } : {},
});