import { api } from "../client";
import type { CreateEventPayload, CreateEventResponse, ListEventsResponse, Evento } from "../types/events";

export const eventsApi = {
  createEvent: async (payload: CreateEventPayload) => {
    const { data } = await api.post<CreateEventResponse>("/events", payload);
    return data;
  },

  listMyEvents: async (activos: boolean = true) => {
    const { data } = await api.get<ListEventsResponse>(`/events?activos=${activos}`);
    return data;
  },

  getEventById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; evento: Evento; capacidad: string }>(`/events/${id}`);
    return data;
  },

  cancelEvent: async (id: string, motivo: string = "Cancelado por el residente") => {
    const { data } = await api.delete(`/events/${id}`, { data: { motivo } });
    return data;
  },
};
