export type PackageStatus = 'por_retirar' | 'notificado' | 'retirado' | 'eliminado';

export interface Package {
  _id: string;
  residente_id: any;
  usuario_caseta_id: any;
  numero_guia?: string;
  empresa_paqueteria?: string;
  descripcion?: string;
  fecha_recepcion: string;
  fecha_notificacion?: string;
  fecha_retiro?: string;
  usuario_retiro_id?: any;
  estado: PackageStatus;
  observaciones?: string;
  foto_paquete_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPackagesResponse {
  success: boolean;
  paquetes: Package[];
  pagination: PaginationMeta;
}
