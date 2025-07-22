import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import ErrorBoundary from "../../src/components/ErrorBoundary";
import PageLayout from "../../src/components/layout/PageLayout";

// Internal component to be able to use the PageLayout context
function StackNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Disable the header by default
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
          animation: "fade", 
          animationDuration: 250,
        }}
      />
    </Stack>
  );
}

export default function AppStackLayout() {
  const [fontsLoaded] = useFonts({
    "DMSans-Regular": require("../../src/assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Bold": require("../../src/assets/fonts/DMSans-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <ErrorBoundary>
      <PageLayout>
        <StackNavigator />
      </PageLayout>
    </ErrorBoundary>
  );
}
