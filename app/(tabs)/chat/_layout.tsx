import { Stack } from "expo-router";

export default function ChatStackLayout() {
  // Solo maneja el index (ChatListScreen).
  // ChatDetailScreen vive en /chat/[id] — Root Stack — sin tab bar.
  return <Stack screenOptions={{ headerShown: false }} />;
}
