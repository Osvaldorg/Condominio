import { useState } from "react";
import { authApi } from "../../../api/endpoints/auth.api";
import { useAuthStore } from "../store/auth.store";
import { useNotifications } from "../../notifications/hooks/useNotifications";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const { registerDevice } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.loginMobile({ username, password });
      if (!res.success) throw new Error(res.message || "Login fallido");
      await setSession(res.token, res.user);
      
      // Registrar silenciosamente. Si falla no bloquea la UI, se reintenta luego en NotificationProvider.
      registerDevice().catch(e => console.warn('Registration error on login:', e));
      
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Error al iniciar sesión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
