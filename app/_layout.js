import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { useFonts, NunitoSans_400Regular, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { View } from 'react-native';

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#161b22',
        },
        headerTintColor: '#c9d1d9',
        headerTitleStyle: {
          fontFamily: 'NunitoSans_700Bold',
          fontSize: 22,
          color: '#f0f6fc',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: '#161b22',
          borderBottomWidth: 1,
          borderBottomColor: '#30363d',
        }
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Flow Day' }} />
      <Stack.Screen name="routine/[id]" />
      <Stack.Screen name="create" options={{ title: 'Create/Edit Routine' }} />
      <Stack.Screen name="block/[id]" />
    </Stack>
  );
}
