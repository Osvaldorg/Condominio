import { api } from "../client";
import type { GetPackagesResponse } from "../types/packages";

export const packagesApi = {
  getResidentPackages: async (page = 1, limit = 20, estado?: string) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (estado) {
      params.append('estado', estado);
    }
    
    const { data } = await api.get<GetPackagesResponse>(`/packages/resident?${params.toString()}`);
    return data;
  },
};
