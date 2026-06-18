export interface Evento {
  _id: string;
  residente_id: string;
  nombre_evento: string;
  descripcion: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  max_invitados: number;
  es_qr_compartido: boolean;
  estatus?: string;
  motivo_cancelacion?: string;
  invitados_registrados: number;
  codigo_qr_evento?: string;
  qr_agotado: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventPayload = {
  nombre_evento: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio: string; // ISO string
  fecha_fin: string;    // ISO string
  max_invitados?: number;
  es_qr_compartido?: boolean;
};

export type CreateEventResponse = {
  success: boolean;
  message: string;
  evento: Evento;
  qr_compartido?: string;
};

export type ListEventsResponse = {
  success: boolean;
  eventos: Evento[];
};
