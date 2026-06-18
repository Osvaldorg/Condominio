import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationNav } from '../hooks/useNotificationNav';
import { useAuthStore } from '../../auth/store/auth.store';

/**
 * NotificationProvider — montado en el root _layout.tsx
 *
 * Responsabilidades:
 * 1. Sincronizar el registro del dispositivo con el estado de Auth.
 * 2. Escuchar notificaciones recibidas en foreground.
 * 3. Escuchar taps a notificaciones (foreground + background).
 * 4. Manejar el "dead state": app abierta DESDE una notificación (killed state).
 *
 * ❌ ELIMINADO INTENCIONALMENTE: addPushTokenListener
 * Razón: En Expo/dev-client, llamar a getDevicePushTokenAsync() dentro del
 * listener (via forceReRegister) TAMBIÉN dispara el listener, creando un loop
 * infinito. Los tokens FCM se renuevan cada ~60 días; el backend detecta tokens
 * inválidos automáticamente (messaging/registration-token-not-registered) y
 * desactiva el dispositivo. No necesitamos el listener activo.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { registerDevice, isRegistered } = useNotifications();
  const { handleNotificationTap } = useNotificationNav();
  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // ─── 1. SINCRONIZAR REGISTRO CON AUTH ─────────────────────────────────────
  // Solo registra si: la app está lista, hay sesión activa Y el dispositivo
  // no está registrado todavía (evita re-registro en cada re-render).
  useEffect(() => {
    if (isReady && token && !isRegistered) {
      registerDevice().catch((e) =>
        console.warn('[NotificationProvider] Registration error (non-fatal):', e),
      );
    }
  }, [isReady, token, isRegistered, registerDevice]);

  // ─── 2. DEAD STATE: app abierta DESDE notificación (app completamente cerrada)
  // getLastNotificationResponseAsync() recupera el tap INCLUSO si el listener
  // no existía cuando Android relanzó la app. Se ejecuta una sola vez cuando
  // auth está resuelto para que el router ya esté listo al navegar.
  useEffect(() => {
    if (!isReady || !token) return;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        console.log('[NotificationProvider] Dead-state tap, navigating...', data?.accion_tipo);
        handleNotificationTap(data);
      }
    });
  }, [isReady, token]); // handleNotificationTap excluida intencionalmente para que
                         // solo ejecute ONCE cuando la sesión está lista.

  // ─── 3. LISTENERS DE NOTIFICACIONES ───────────────────────────────────────
  useEffect(() => {
    // Foreground: app abierta y llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Banner en foreground ya está garantizado por setNotificationHandler en useNotifications.
        // Aquí podríamos actualizar un badge count o refrescar la lista de notificaciones.
        console.log(
          '[NotificationProvider] Foreground notification received:',
          notification.request.content.title,
        );
      },
    );

    // Tap: usuario toca la notificación (foreground o background, NO dead state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[NotificationProvider] Notification tapped, navigating...', data?.accion_tipo);
        handleNotificationTap(data);
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [handleNotificationTap]);

  return <>{children}</>;
}
