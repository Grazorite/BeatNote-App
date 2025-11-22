import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StudioScreen from './src/features/studio/StudioScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StudioScreen />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
