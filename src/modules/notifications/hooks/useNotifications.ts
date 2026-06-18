import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { notificationsApi } from '../services/notifications.api';
import type { NotificationState } from '../types/notification.types';
import { getUniqueDeviceId } from '../utils/deviceInfo';

import { saveRegisteredDevice, getRegisteredDevice, clearNotificationRegistration } from '../utils/notificationStorage';

// ─── Foreground handler (nivel módulo — se ejecuta solo UNA vez) ───────────
// Garantiza que al llegar una notificación con la app ABIERTA se muestre la
// alerta, el sonido y el banner (shouldShowBanner para foreground).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Crea el canal de Android con prioridad MAX (Heads-up banner).
 * Debe llamarse antes de pedir permisos.
 * Es idempotente — llamarlo múltiples veces no tiene efectos secundarios.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notificaciones Condominio',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#007AFF',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    isRegistered: false,
    fcmToken: null,
    deviceId: null,
    permissionStatus: 'undetermined',
    error: null,
  });

  // ─── 1. Obtener permisos y token FCM nativo ────────────────────────────────
  const requestPermissionsAndGetToken = useCallback(async () => {
    if (!Device.isDevice) {
      setState(s => ({ ...s, error: 'Push Notifications require a physical device' }));
      return null;
    }

    try {
      await ensureAndroidChannel();

      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setState(s => ({ ...s, permissionStatus: finalStatus }));

      if (finalStatus !== 'granted') {
        setState(s => ({ ...s, error: 'Permiso no concedido para notificaciones push' }));
        return null;
      }

      const pushTokenData = await Notifications.getDevicePushTokenAsync();
      const token = pushTokenData.data;
      const deviceId = await getUniqueDeviceId();

      setState(s => ({ ...s, fcmToken: token, deviceId }));
      return { token, deviceId };

    } catch (e: any) {
      console.error('[useNotifications] Error getting push token:', e);
      setState(s => ({ ...s, error: e.message }));
      return null;
    }
  }, []);

  // ─── 2. Registro con guard — nunca llama al backend si el token no cambió ──
  const registerDevice = useCallback(async () => {
    try {
      const data = await requestPermissionsAndGetToken();
      if (!data) return false;

      const { token, deviceId } = data;

      // Guard centralizado: si el logout limpió el almacenamiento, savedToken será null
      // y la comparación fallará, forzando un registro real.
      const { token: savedToken, deviceId: savedDeviceId } = await getRegisteredDevice();

      if (savedToken === token && savedDeviceId === deviceId) {
        console.log('[useNotifications] Registro previo detectado en cache, skip API call');
        setState(s => ({ ...s, isRegistered: true }));
        return true;
      }

      console.log('[useNotifications] Iniciando registro en backend (Token nuevo o cache limpio)...');
      const platform = Platform.OS as 'ios' | 'android' | 'web';

      const response = await notificationsApi.registerDevice({
        device_id: deviceId,
        token_fcm: token,
        platform,
        app_version: Application.nativeApplicationVersion || '1.0.0',
        metadata: {
          brand: Device.brand,
          model: Device.modelName,
          os: Device.osName,
          osVersion: Device.osVersion,
        },
      });

      if (response.success) {
        await saveRegisteredDevice(token, deviceId);
        setState(s => ({ ...s, isRegistered: true, error: null }));
        console.log('[useNotifications] Dispositivo registrado y activo en DB:', deviceId);
        return true;
      }

      return false;
    } catch (e: any) {
      console.error('[useNotifications] Error registrando dispositivo:', e);
      setState(s => ({ ...s, error: e.message }));
      return false;
    }
  }, [requestPermissionsAndGetToken]);

  // ─── 3. Desregistro en logout ──────────────────────────────────────────────
  const unregisterDevice = useCallback(async () => {
    try {
      const deviceId = state.deviceId || await getUniqueDeviceId();
      if (!deviceId) return false;

      const response = await notificationsApi.deactivateDevice({ device_id: deviceId });

      if (response.success) {
        // Limpiar registro local para que el próximo login registre de nuevo
        await clearNotificationRegistration();
        setState(s => ({ ...s, isRegistered: false, fcmToken: null }));
        console.log('[useNotifications] Dispositivo desactivado en backend y cache limpio');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('[useNotifications] Error desregistrando:', e);
      return false;
    }
  }, [state.deviceId]);

  return {
    ...state,
    registerDevice,
    unregisterDevice,
    requestPermissionsAndGetToken,
  };
}
