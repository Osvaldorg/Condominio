export type ChargeItem = {
  id: string; // This is the cargo_domicilio_id
  cargo_id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  tipo_nombre?: string;
  fecha_vencimiento?: string;
  monto_original: number;
  total_descuentos: number;
  total_recargos: number;
  monto_final: number;
  saldo_pendiente: number;
  ya_pagado: number;
  estatus: string;
  dias_vencido: number;
  descuentos: any[];
  recargos: any[];
};

export type AccountStatusResponse = {
  success: boolean;
  estado_cuenta: {
    resumen: {
      total_pendiente: number;
      total_vencido: number;
      total_general: number;
      total_cargos: number;
    };
    cuentas_referencia: BankAccount[];
  };
};

export type PendingChargesResponse = {
  success: boolean;
  cargos: ChargeItem[];
};

export type PaymentHistoryComprobante = {
  _id: string;
  monto_total: number;
  fecha_pago: string;
  estatus: "pendiente" | "aprobado" | "rechazado";
  folio?: string;
  metodo_pago?: string;
  observaciones?: string;
  motivo_rechazo?: string;
  cargo_domicilio_id?: any; // Populated directly by backend for pending/rejected status fallbacks
  pagos_aplicados?: any[]; // The backend sends this with the populated cargo details
};

export type PaymentHistoryResponse = {
  success: boolean;
  comprobantes: PaymentHistoryComprobante[];
  pagination: any;
};

export type BankAccount = {
  _id: string;
  banco: string;
  nombre_cuenta: string;
  numero_cuenta: string;
  clabe?: string;
  tipo_cuenta?: string;
};

export type PaymentAccountsResponse = {
  success: boolean;
  cuentas: BankAccount[];
};

// ── Retry payment (resubmit rejected comprobante) ────────────────────────────

export type ComprobanteDetail = {
  id: string;
  folio: string;
  estatus: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo: string | null;
  monto_total: number;
  fecha_pago: string;
  metodo_pago: string;
  institucion_bancaria: string | null;
  numero_referencia: string | null;
  cuenta_destino: string | null;
  observaciones: string | null;
  comprobante_url: string | null;
  cargo: {
    id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    tipo_nombre: string;
    fecha_vencimiento: string;
    saldo_pendiente: number;
    estatus: string;
  } | null;
  fecha_subida: string;
  fecha_actualizacion: string;
  cuentas_bancarias: BankAccount[];
};

export type ComprobanteDetailResponse = {
  success: boolean;
  comprobante: ComprobanteDetail;
};

export type ResubmitPaymentResponse = {
  success: boolean;
  message: string;
  comprobante: {
    id: string;
    folio: string;
    monto_total: number;
    fecha_pago: string;
    metodo_pago: string;
    estatus: string;
    imagen_actualizada: boolean;
  };
};

// ── PaymentForm shared types ──────────────────────────────────────────────────

export type MetodoPago =
  | "transferencia"
  | "deposito"
  | "efectivo"
  | "tarjeta"
  | "cheque";

export type PaymentFormValues = {
  metodoPago: MetodoPago;
  fechaPago: Date;
  institucion: string;
  referencia: string;
  cuentaDestino: string;
  observaciones: string;
  file: any | null;
};
