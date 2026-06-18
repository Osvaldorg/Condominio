import { api } from "../client";

export const residentsApi = {
  getReceptionStatus: async (id: string) => {
    try {
      const response = await api.get(`/residents/mobile/reception-status/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  },

  updateReceptionStatus: async (recibiendo_personal?: boolean, recibiendo_visitas?: boolean) => {
    try {
      const response = await api.put("/residents/mobile/reception-status", {
        recibiendo_personal,
        recibiendo_visitas
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  },

  getSecondaryResidents: async () => {
    try {
      const response = await api.get("/residents/principal/secondary");
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || error.message };
    }
  },

  createSecondaryResident: async (userData: any) => {
    try {
      const response = await api.post("/residents/principal/secondary", userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || error.message };
    }
  },

  toggleSecondaryResidentStatus: async (residenteId: string, activar: boolean) => {
    try {
      const response = await api.put(`/residents/principal/secondary/${residenteId}`, { activar });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || error.message };
    }
  },
};
