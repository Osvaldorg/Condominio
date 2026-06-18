export interface ChatUser {
  _id: string;
  nombre: string;
  apellido: string;
}

export interface Conversation {
  _id: string;
  tipo: 'caseta' | 'administrador';
  asunto: string;
  estatus: 'abierta' | 'cerrada';
  usuario_id?: ChatUser;
  residente_id?: any; // Depending on how populated it is
  ultimo_mensaje_at: string;
  mensajes_no_leidos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversacion_id: string;
  remitente_id: ChatUser;
  mensaje: string;
  tipo: 'texto' | 'imagen' | 'archivo';
  archivo_url?: string;
  leido: boolean;
  fecha_leido?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  success: boolean;
  administrador: number;
  caseta: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationsResponse {
  success: boolean;
  conversaciones: Conversation[];
}

export interface MessagesResponse {
  success: boolean;
  mensajes: Message[];
  conversacion: Conversation;
  pagination: Pagination;
}

export interface SendMessagePayload {
  mensaje: string;
  tipo?: 'texto' | 'imagen' | 'archivo';
  archivo_url?: string;
}

export interface InitChatPayload {
  mensaje: string;
  asunto?: string;
}

export interface InitChatResponse {
  success: boolean;
  mensaje: Message;
  conversacion_id: string;
}

export interface SendMessageResponse {
  success: boolean;
  mensaje: Message;
}
