import { create } from "zustand";
import { authApi } from "../../../api/endpoints/auth.api";
import type { User } from "../../../api/types/auth";
import { getToken, saveToken, deleteToken } from "../../../services/storage/secureStorage";
import { clearNotificationRegistration } from "../../notifications/utils/notificationStorage";
import { notificationsApi } from "../../notifications/services/notifications.api";
import { getUniqueDeviceId } from "../../notifications/utils/deviceInfo";

type AuthState = {
  token: string | null;
  user: User | null;
  isReady: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isReady: false,

  setSession: async (token, user) => {
    await saveToken(token);
    set({ token, user, isReady: true });
  },

  bootstrap: async () => {
    const token = await getToken();
    if(!token){
      set({ token: null, user: null, isReady: true });
      return;
    }
    set({ token, isReady: false });
    try {
      const res = await authApi.profile();
      if (res?.success && res.user) {
        set({token, user: res.user, isReady: true})
      } else {
        await deleteToken();
        set({ token: null, user: null, isReady: true });
      }
    } catch {
      await deleteToken();
      set({ token: null, user: null, isReady: true });
    }
  },

  logout: async () => {
    try {
      const deviceId = await getUniqueDeviceId();
      if (deviceId) {
        // 1. Informar al backend que el dispositivo está inactivo
        await notificationsApi.deactivateDevice({ device_id: deviceId }).catch(console.warn);
        
        // 2. IMPORTANTE: Limpiar el registro local para que el próximo login 
        // fuerce la reactivación en el backend.
        await clearNotificationRegistration();
      }
    } catch (error) {
      console.warn('[AuthStore] Error during notification cleanup on logout:', error);
    }
    await deleteToken();
    set({ token: null, user: null, isReady: true });
  },
}));
