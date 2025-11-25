import { StyleSheet } from 'react-native';

export const exportModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  exportButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  midiButton: {
    backgroundColor: '#ff6600',
  },
  csvButton: {
    backgroundColor: '#0066cc',
  },
  importButton: {
    backgroundColor: '#009944',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#cccccc',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#666666',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});