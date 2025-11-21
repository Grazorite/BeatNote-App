import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import StudioScreen from './src/features/studio/StudioScreen';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StudioScreen />
      <StatusBar style="light" />
    </View>
  );
}
