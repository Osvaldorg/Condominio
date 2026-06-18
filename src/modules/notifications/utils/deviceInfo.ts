import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'stable_device_id';

/**
 * Generates a random UUID v4-like string in pure JS.
 * We use this instead of expo-crypto to avoid requiring a new native dev client build.
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Retorna un ID de dispositivo estable y persistente.
 *
 * La primera vez genera un UUID v4 aleatorio y lo persiste en SecureStore.
 * En reinicios, reinstalaciones del bundle JS y reinicios de Metro
 * siempre devolverá el mismo valor — el único caso donde cambia es cuando
 * el usuario hace "Uninstall" completo del APK Y borra el almacenamiento.
 *
 * Reemplaza el uso de Application.getAndroidId() (inestable entre reinstalaciones)
 * y Constants.sessionId (cambia en cada sesión de Metro).
 */
export async function getUniqueDeviceId(): Promise<string> {
  try {
    // 1. Intentar leer el ID persistente
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }

    // 2. Primera vez — generar UUID y persitirlo
    const newId = generateUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    console.log('[DeviceInfo] Nuevo device_id generado:', newId);
    return newId;

  } catch (e) {
    console.warn('[DeviceInfo] Error con SecureStore, usando fallback efímero', e);
    // Fallback: si SecureStore falla (emulador sin hardware), retorna un UUID
    // para no bloquear la app. No se persistirá, pero al menos funcionará en la sesión.
    return generateUUID();
  }
}

/**
 * Borra el device_id persistente. Solo llamar al hacer logout definitivo
 * o cuando el backend reporta el token como inválido.
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    console.log('[DeviceInfo] device_id eliminado de SecureStore');
  } catch (e) {
    console.warn('[DeviceInfo] No se pudo eliminar device_id:', e);
  }
}
