import { StyleSheet } from 'react-native';

export const helpScreenStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxWidth: 800,
    maxHeight: '90%',
    width: '90%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollContainer: {
    maxHeight: 600,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ff6600',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shortcutGroup: {
    marginBottom: 16,
  },
  shortcutGroupTitle: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shortcutKeys: {
    color: '#ffffff',
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  shortcutDescription: {
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
  },
});