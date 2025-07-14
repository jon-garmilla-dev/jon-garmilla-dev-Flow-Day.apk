import { Stack } from 'expo-router';
import { useFonts, NunitoSans_400Regular, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageLayout, { usePageLayout } from '../../src/components/layout/PageLayout';

// Componente interno para poder usar el contexto del PageLayout
function StackNavigator() {
  const { openMenu } = usePageLayout();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity onPress={openMenu} style={{ marginLeft: 15 }}>
            <Ionicons name="menu" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: '#161b22',
          borderBottomWidth: 1,
          borderBottomColor: '#30363d',
        },
        headerTintColor: '#c9d1d9',
        headerTitleStyle: {
          fontFamily: 'NunitoSans_700Bold',
          fontSize: 22,
          color: '#f0f6fc',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Flow Day' }} />
      <Stack.Screen name="routine/[id]" />
      <Stack.Screen name="create" options={{ title: 'Create/Edit Routine' }} />
      <Stack.Screen name="block/[id]" />
    </Stack>
  );
}

export default function AppStackLayout() {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <PageLayout>
      <StackNavigator />
    </PageLayout>
  );
}
