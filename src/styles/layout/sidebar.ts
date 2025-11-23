import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../common';

export const sidebarStyles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.surface,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sidebarTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 24,
  },
});