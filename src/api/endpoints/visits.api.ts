import { api } from "../client";
import type {
  CreateAuthorizationResponse,
  CreateUnicaVezPayload,
  CreateVipPayload,
  CreateProveedorPayload,
  CreatePersonalAuthorizationPayload,
  ListAuthorizationsResponse,
  ListProvidersResponse,
  CreateProviderResponse,
  CreateProviderPayload,
  GetCurrentVisitsResponse,
  Authorization,
  ListPersonalResponse,
  CreatePersonalResponse,
  CreatePersonalPayload,
} from "../types/visits";

type CreateUnicaVezBackendPayload = CreateUnicaVezPayload & {
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
  limite_ingresos?: number;
};

type CreateAuthorizationPayload = CreateVipPayload | CreateUnicaVezBackendPayload | CreateProveedorPayload | CreatePersonalAuthorizationPayload;


export const visitsApi = {
  listResidentAuthorizations: async (page = 1, limit = 20, activas = true) => {
    const { data } = await api.get<ListAuthorizationsResponse>(
      `/visits/resident/authorizations?page=${page}&limit=${limit}&activas=${activas}`
    );
    return data;
  },

  createAuthorization: async (payload: CreateAuthorizationPayload) => {
    const { data } = await api.post<CreateAuthorizationResponse>(
      "/visits/resident/authorizations",
      payload
    );
    return data;
  },

  getProviders: async () => {
    const { data } = await api.get<ListProvidersResponse>("/visits/providers");
    return data;
  },

  createProvider: async (payload: CreateProviderPayload) => {
    const { data } = await api.post<CreateProviderResponse>("/visits/resident/providers", payload);
    return data;
  },

  getPersonal: async () => {
    const { data } = await api.get<ListPersonalResponse>("/visits/resident/personal");
    return data;
  },

  createPersonal: async (payload: CreatePersonalPayload) => {
    const { data } = await api.post<CreatePersonalResponse>("/visits/resident/personal", payload);
    return data;
  },

  createPersonalAuthorization: async (payload: CreatePersonalAuthorizationPayload) => {
    const { data } = await api.post<CreateAuthorizationResponse>(
      "/visits/resident/personal/authorize",
      payload
    );
    return data;
  },

  getCurrentVisits: async () => {
    const { data } = await api.get<GetCurrentVisitsResponse>("/visits/resident/current");
    return data;
  },

  cancelAuthorization: async (id: string, motivo: string = "Cancelada por el residente") => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/visits/resident/authorizations/${id}`,
      { data: { motivo } }
    );
    return data;
  },

  getAuthorizationById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; autorizacion: Authorization }>(
      `/visits/resident/authorizations/${id}`
    );
    return data;
  },

  getVisitTypes: async () => {
    // Retorna { success: true, tipos: [...] }
    const { data } = await api.get<{ success: boolean; tipos: { _id: string; nombre: string; descripcion: string }[] }>(
      "/visits/types"
    );
    return data;
  },
};
