// ─────────────────────────────────────────────────────────────────────────────
// notification.types.ts
// Tipos para el módulo de Push Notifications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valores que puede tener `accion_tipo` según el modelo del backend.
 * Definen la pantalla de destino al tocar una notificación.
 */
export type NotificationActionType =
  | 'ver_comprobante'
  | 'descargar_comprobante'
  | 'ver_estado_cuenta'
  | 'responder_mensaje'
  | 'ver_cargo'
  | 'pagar_cargo'
  | 'ver_visita'
  | 'ver_evento'
  | 'ver_paquete'
  | 'ver_bitacora'
  | 'ver_publicacion'
  | 'authorization_created'
  | 'authorization_cancelled'
  | null;

/**
 * Tipos de notificación según su origen de negocio.
 */
export type NotificationEventType =
  | 'visita'
  | 'pago'
  | 'paquete'
  | 'chat'
  | 'boletin'
  | 'acceso'
  | 'general';

/**
 * Payload del campo `data` que FCM envía al dispositivo.
 * El backend serializa todos los valores como strings, por lo que accion_tipo
 * se mantiene como `string` aquí para reflejar la realidad de FCM.
 * El type guard `isValidActionType` en useNotificationNav provee type safety
 * al momento de procesar el payload.
 */
export interface FCMDataPayload {
  notification_id: string;
  /** Una de las acciones de navegación mapeadas, o string vacío si no hay acción */
  accion_tipo: NotificationActionType;
  /** JSON stringificado — parsear antes de usar  */
  accion_data: string;
  tipo: NotificationEventType;
  [key: string]: string | null;
}

/**
 * Payload para registrar un dispositivo en el backend.
 * Endpoint: POST /device/register
 */
export interface RegisterDevicePayload {
  device_id: string;
  token_fcm: string;
  platform: 'android' | 'ios' | 'web';
  app_version?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Respuesta del backend al registrar un dispositivo.
 */
export interface RegisterDeviceResponse {
  success: boolean;
  message: string;
  device?: {
    id: string;
    device_id: string;
    platform: string;
    active: boolean;
    last_activity: string;
  };
}

/**
 * Payload para desactivar un dispositivo (logout).
 * Endpoint: POST /device/deactivate
 */
export interface DeactivateDevicePayload {
  device_id: string;
}

/**
 * Estado interno del hook useNotifications.
 */
export interface NotificationState {
  isRegistered: boolean;
  fcmToken: string | null;
  deviceId: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  error: string | null;
}
