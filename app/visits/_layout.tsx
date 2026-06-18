import { Stack } from "expo-router";

export default function VisitsLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerBackTitle: "Inicio",
        headerTintColor: "#000",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }} 
    />
  );
}
