import { BootSplash } from "@/src/components/layout/BootSplash";
import { Stack, useRouter, useSegments } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect } from "react";
import "../global.css";
import { useAuthStore } from "../src/modules/auth/store/auth.store";
import { NotificationProvider } from "@/src/modules/notifications/providers/NotificationProvider";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isReady) return;

    const group = segments[0];              // "(auth)" | "(tabs)" | "chat" | "payments" | ...
    const inAuth = group === "(auth)";
    // Las rutas autenticadas incluyen (tabs) y todas las rutas detail del Root Stack
    const inAuthenticatedArea = group === "(tabs)"
      || group === "chat"
      || group === "payments"
      || group === "visits"
      || group === "home"
      || group === "events"
      || group === "notifications"
      || group === "account";

    // Si no hay token, fuerza auth
    if (!token && !inAuth) {
      router.replace("/(auth)/login");
      return;
    }

    // Si hay token y no está en ninguna área autenticada, fuerza tabs
    if (token && !inAuthenticatedArea && !inAuth) {
      router.replace("/(tabs)/home");
    }
  }, [token, isReady, segments, router]);

  if (!isReady) return <BootSplash />;

  return (
    <KeyboardProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </NotificationProvider>
    </KeyboardProvider>
  );
}
