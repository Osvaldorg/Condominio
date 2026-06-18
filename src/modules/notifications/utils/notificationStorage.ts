import * as SecureStore from 'expo-secure-store';

const REGISTERED_TOKEN_KEY = 'registered_fcm_token';
const REGISTERED_DEVICE_KEY = 'registered_device_id';

/**
 * Guarda en almacenamiento seguro los datos del último registro exitoso.
 */
export async function saveRegisteredDevice(token: string, deviceId: string) {
  try {
    await Promise.all([
      SecureStore.setItemAsync(REGISTERED_TOKEN_KEY, token),
      SecureStore.setItemAsync(REGISTERED_DEVICE_KEY, deviceId),
    ]);
  } catch (e) {
    console.warn('[notificationStorage] Error guardando registro:', e);
  }
}

/**
 * Recupera los datos del último registro guardado.
 */
export async function getRegisteredDevice() {
  try {
    const [token, deviceId] = await Promise.all([
      SecureStore.getItemAsync(REGISTERED_TOKEN_KEY),
      SecureStore.getItemAsync(REGISTERED_DEVICE_KEY),
    ]);
    return { token, deviceId };
  } catch (e) {
    console.warn('[notificationStorage] Error recuperando registro:', e);
    return { token: null, deviceId: null };
  }
}

/**
 * Limpia el registro local. Se debe llamar al cerrar sesión
 * para forzar que el siguiente login realice un nuevo registro en el backend.
 */
export async function clearNotificationRegistration() {
  try {
    console.log('[notificationStorage] Limpiando registro local de notificaciones...');
    await Promise.all([
      SecureStore.deleteItemAsync(REGISTERED_TOKEN_KEY),
      SecureStore.deleteItemAsync(REGISTERED_DEVICE_KEY),
    ]);
  } catch (e) {
    console.warn('[notificationStorage] Error limpiando registro:', e);
  }
}
