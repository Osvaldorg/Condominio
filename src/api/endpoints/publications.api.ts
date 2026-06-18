import { api } from "../client";
import type { PublicationsResponse } from "../types/publications";

type ListParams = {
  page?: number;
  limit?: number;
  tipo?: string;
  desde?: string;
  hasta?: string;
};

export const publicationsApi = {
  listResident: async (params: ListParams = {}) => {
    const { data } = await api.get<PublicationsResponse>(
      "/communications/resident/publications",
      { params }
    );
    return data;
  },
};
