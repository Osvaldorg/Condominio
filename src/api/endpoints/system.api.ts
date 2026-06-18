import { api } from "../client";
import { NotificationResponse } from "../types/system";

export const systemApi = {
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get<NotificationResponse>("/system/notifications", {
        params: { page, limit },
      });
      return {
        success: true,
        notificaciones: response.data.notifications || [],
        pagination: {
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 20,
          totalPages: response.data.pagination?.totalPages || 1,
        },
      };
    } catch (error: any) {
      console.error("Error obteniendo notificaciones:", error);
      return { success: false, notificaciones: [], message: error?.message };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await api.put(`/system/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put(`/system/notifications/read-all`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  },
};
