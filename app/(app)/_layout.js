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
        headerShown: false, // Desactivamos la cabecera por defecto
      }}
    >
      <Stack.Screen name="index" />
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
