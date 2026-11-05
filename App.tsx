import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MotionPreferenceProvider } from './src/animations/MotionPreference';
import StudioScreen from './src/features/studio/StudioScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AppPromptHost } from './src/components/ui/common/AppPrompt';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MotionPreferenceProvider>
          <ErrorBoundary>
            <StudioScreen />
          </ErrorBoundary>
          <AppPromptHost root />
        </MotionPreferenceProvider>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
