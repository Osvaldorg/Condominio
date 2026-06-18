import { PaginatedResponse } from "./common";
import { User } from "./auth";

export type NotificationType = "push" | "in_app";

export type SystemNotification = {
  _id: string;
  user_id: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  leida: boolean;
  data_json: Record<string, any>;
  accion_requerida: boolean;
  accion_tipo?: string;
  accion_data?: any;
  fecha_leida?: string;
  enviada?: boolean;
  expira_en?: string;
  fecha_creacion?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationResponse = PaginatedResponse & {
  notifications: SystemNotification[];
};
