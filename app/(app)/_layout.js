import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { Stack } from "expo-router";

import PageLayout from "../../src/components/layout/PageLayout";

// Componente interno para poder usar el contexto del PageLayout
function StackNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Desactivamos la cabecera por defecto
        animation: "fade",
        animationDuration: 250,
        animationTypeForReplace: "push",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="routine/[id]" />
      <Stack.Screen name="create" options={{ title: "Create/Edit Routine" }} />
      <Stack.Screen name="block/[id]" />
      <Stack.Screen name="actions/index" />
      <Stack.Screen name="actions/create" />
      <Stack.Screen name="actions/picker" />
      <Stack.Screen
        name="routine/[id]/run"
        options={{
          animation: "fade", // Fade también para run
          animationDuration: 250,
        }}
      />
    </Stack>
  );
}

export default function AppStackLayout() {
  const [fontsLoaded] = useFonts({
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
