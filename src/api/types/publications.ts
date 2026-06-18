export type Publication = {
  _id: string;
  usuario_id: string;
  titulo: string;
  contenido: string;
  tipo: 'boletin' | 'anuncio' | 'emergencia' | 'evento_comunidad';

  fecha_expiracion: string | null;
  programado: boolean;
  fecha_programada: string | null;

  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  adjunto_url?: string;
  notificaciones_enviadas: boolean;

  fecha_publicacion: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PublicationsResponse = {
  success: boolean;
  publicaciones: Publication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
