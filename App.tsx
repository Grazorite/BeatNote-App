import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StudioScreen from './src/features/studio/StudioScreen';import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <StudioScreen />
      </ErrorBoundary>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
