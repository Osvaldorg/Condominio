import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Inicio",
      }}
    >
      {/* HomeScreen no necesita header nativo propio — los tabs ya actúan como su "frame" */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
