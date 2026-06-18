import { Stack } from "expo-router";

export default function VisitsLayout() {
  // Solo maneja el index (VisitsScreen).
  // Las pantallas de detalle (visits/[id], visits/create/*)
  // viven en /visits/* — Root Stack — sin tab bar.
  return <Stack screenOptions={{ headerShown: false }} />;
}
