export type Role = "residente" | string;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Domicilio {
  _id: string;
  numero: string;
  calle_torre_id: string;
  letra: string | null;
  estatus: string;
  referencia: string;
  createdAt: string;
  updatedAt: string;
  fecha_activacion?: string;
  motivo_estatus?: string;
}

export interface ResidenteInfo {
  id: string;
  domicilio: Domicilio;
  es_principal: boolean;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: Role[];
  estatus: string;
  residente?: ResidenteInfo;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
