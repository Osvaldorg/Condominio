// ─────────────────────────────────────────────────────────────────────────────
// notifications.api.ts
// Capa de comunicación con los endpoints /device/* del backend
// ─────────────────────────────────────────────────────────────────────────────
import { api } from '../../../api/client';
import type {
  RegisterDevicePayload,
  RegisterDeviceResponse,
  DeactivateDevicePayload,
} from '../types/notification.types';

export const notificationsApi = {
  /**
   * Registra o actualiza el token FCM del dispositivo actual.
   * POST /device/register
   * Requiere: device_id, token_fcm, platform
   */
  registerDevice: async (
    payload: RegisterDevicePayload,
  ): Promise<RegisterDeviceResponse> => {
    const { data } = await api.post<RegisterDeviceResponse>(
      '/device/register',
      payload,
    );
    return data;
  },

  /**
   * Desactiva el dispositivo al hacer logout.
   * POST /device/deactivate
   * Requiere: device_id
   */
  deactivateDevice: async (
    payload: DeactivateDevicePayload,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/device/deactivate', payload);
    return data;
  },

  /**
   * Actualiza el token FCM cuando expira.
   * POST /device/fcm-token-update
   */
  updateFCMToken: async (payload: {
    old_token: string;
    new_token: string;
    device_id: string;
  }): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/device/fcm-token-update', payload);
    return data;
  },
};
