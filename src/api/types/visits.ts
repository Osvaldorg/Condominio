export type Authorization = {
  _id: string;

  tipo_visita_id: any; // viene populado como objeto; puedes tiparlo luego
  residente_id?: any;
  personal_id?: any;
  proveedor_id?: any;

  nombre_visitante: string;

  // VIP:
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
  es_preferente?: boolean;
  accesos_ilimitados?: boolean;

  // Única vez:
  es_visita_unica?: boolean;
  fecha_visita_unica?: string | null;

  estado?: string; // "activa", etc.
  codigo_acceso?: string;
  qr_code?: string;
  limite_ingresos?: number; // Para Eventos o Autorizaciones múltiples
  invitados_registrados?: number; // Backend stats mapeados de eventos

  es_evento?: boolean; // Propiedad Frontend para UI
  evento_id?: string;  // ID Original del Evento

  createdAt?: string;
  updatedAt?: string;
};

export type CreateVipPayload = {
  tipo_visita_id: string;
  nombre_visitante: string;
  fecha_inicio_vigencia: string; // "2026-02-01"
  fecha_fin_vigencia: string;    // "2026-05-03"
  es_preferente: boolean;
  accesos_ilimitados: boolean;
};

export type CreateProveedorPayload = {
  tipo_visita_id: string;
  proveedor_id: string;
  nombre_visitante: string;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
  es_preferente?: boolean;
  accesos_ilimitados?: boolean;
};

// (Muy probable) Única vez:
export type CreateUnicaVezPayload = {
  tipo_visita_id: string;
  nombre_visitante: string;
  es_visita_unica: true;
  fecha_visita_unica: string; // "2026-02-10"
  // si tu backend pide limite_ingresos, lo agregamos:
  // limite_ingresos?: number;
};

type CreateUnicaVezBackendPayload = CreateUnicaVezPayload & {
  fecha_inicio_vigencia: string; // YYYY-MM-DD
  fecha_fin_vigencia: string;    // YYYY-MM-DD (fecha + 1 día)
  limite_ingresos?: number;
};

export type CreatePersonalAuthorizationPayload = {
  personal_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_semana?: number[]; // [0, 1, 2, ..., 6]
};

export type CreateAuthorizationResponse = {
  success: boolean;
  message: string;
  autorizacion: Authorization;
  qr_code?: string;     // "data:image/png;base64,..."
  text_code?: string;   // código legible
  expiration?: string;  // ISO
};

export type ListAuthorizationsResponse = {
  success: boolean;
  autorizaciones: Authorization[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type Provider = {
  _id: string;
  nombre: string;
  servicio: string;
  empresa?: string;
  telefono?: string;
};

export type CreateProviderPayload = {
  nombre: string;
  servicio: string;
  empresa?: string;
  telefono?: string;
};

export type ListProvidersResponse = {
  success: boolean;
  proveedores: Provider[];
};

export type CreateProviderResponse = {
  success: boolean;
  message: string;
  proveedor: Provider;
};

export type Personal = {
  _id: string;
  nombre: string;
  telefono?: string;
  tipo_servicio: string;
  estatus: string;
};

export type CreatePersonalPayload = {
  nombre: string;
  telefono?: string;
  tipo_servicio: string;
};

export type ListPersonalResponse = {
  success: boolean;
  personal: Personal[];
};

export type CreatePersonalResponse = {
  success: boolean;
  message: string;
  personal: Personal;
  autorizacion?: {
    id: string;
    qr_code: string;
    codigo_acceso: string;
    limite_ingresos: number;
    // adding _id mapping since store expects _id
    _id?: string;
  };
};

export type CurrentVisit = {
  registro_id: string;
  autorizacion_id?: string;
  nombre_visitante: string;
  telefono_visitante?: string;
  tipo_visita: string;
  tipo_visita_descripcion?: string;
  fecha_hora_ingreso: string;
  tiempo_dentro: {
    minutos: number;
    horas: number;
    texto: string;
  };
  metodo_acceso: string;
  observaciones?: string;
  detalles_adicionales?: any;
};

export type GetCurrentVisitsResponse = {
  success: boolean;
  visitas_actuales: CurrentVisit[];
  total: number;
  timestamp: string;
};
