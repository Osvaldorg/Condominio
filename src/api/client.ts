import axios from "axios";
import { ENV } from "../config/env";
import { useAuthStore } from "../modules/auth/store/auth.store";
import { getToken } from "../services/storage/secureStorage";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request (except when token doesn't exist)
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isLoggingOut = false;

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;

    // Si ocurre un 401 y no estamos en un bucle de deslogueo
    // Ignorar urls conocidas que causan ciclos o que son ruidosas durante el logout (como conteos de notificaciones)
    const isExcludedUrl = url?.includes("/device/deactivate") || url?.includes("/unread-count");

    if (status === 401 && !isLoggingOut && !isExcludedUrl) {
      const authState = useAuthStore.getState();
      
      // Si aún hay un token válido en memoria, significa que recién expiró
      if (authState.token) {
        isLoggingOut = true;
        try {
          await authState.logout();
        } finally {
          // Prevenir race conditions
          setTimeout(() => { isLoggingOut = false; }, 2000);
        }
      }
    }
    return Promise.reject(error);
  }
);

