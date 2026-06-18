import { api } from "../client";
import type { LoginRequest, LoginResponse, User } from "../types/auth";

type ProfileResponse = {
  success: boolean;
  message: string;
  user: User;
};

export const authApi = {
  loginMobile: async (payload: LoginRequest) => {
    const { data } = await api.post<LoginResponse>("/auth/login/mobile", payload);
    return data;
  },

  profile: async () => {
    const { data } = await api.get<ProfileResponse>("/auth/profile");
    return data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    try {
      const { data } = await api.put("/auth/change-password", {
        // Checking backend route 'auth.controller.js' it normally expects currentPassword/newPassword
        // Let's send them in standard format
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || "Error al cambiar la contraseña" };
    }
  }
};
