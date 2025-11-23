import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  copyErrorToClipboard = () => {
    const errorText = `Error: ${this.state.error?.message || 'Unknown error'}\n\nStack Trace:\n${this.state.error?.stack || 'No stack trace'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText);
      Alert.alert('Copied', 'Error details copied to clipboard');
    } else {
      Alert.alert('Error Details', errorText);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={this.copyErrorToClipboard}>
            <Text style={styles.copyButtonText}>Copy Error Details</Text>
          </TouchableOpacity>
          <Text style={styles.errorStack}>
            {this.state.error?.stack}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  errorTitle: {
    color: '#ff0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorStack: {
    color: '#cccccc',
    fontSize: 10,
    fontFamily: 'monospace',
    maxHeight: 200,
  },
});

export default ErrorBoundary;