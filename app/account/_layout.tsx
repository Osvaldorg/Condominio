import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Inicio" }}>
      <Stack.Screen name="index" options={{ title: "Mi Cuenta", headerShown: true }} />
    </Stack>
  );
}
