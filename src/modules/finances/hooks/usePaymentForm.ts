import { useState } from "react";
import { Platform } from "react-native";
import type { MetodoPago, PaymentFormValues } from "../../../api/types/finances";

export const DEFAULT_PAYMENT_FORM: PaymentFormValues = {
  metodoPago: "transferencia",
  fechaPago: new Date(),
  institucion: "",
  referencia: "",
  cuentaDestino: "",
  observaciones: "",
  file: null,
};

/**
 * usePaymentForm
 *
 * Maneja el estado del formulario de pago.
 * Acepta valores iniciales opcionales para pre-llenar (flujo de resubida).
 */
export function usePaymentForm(initialValues?: Partial<PaymentFormValues>) {
  const [values, setValues] = useState<PaymentFormValues>({
    ...DEFAULT_PAYMENT_FORM,
    ...initialValues,
  });

  const setField = <K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Pre-llena el formulario con datos de un comprobante existente.
   * Útil en el flujo de resubida (RetryPaymentScreen).
   */
  const prefill = (data: Partial<PaymentFormValues>) => {
    setValues((prev) => ({ ...prev, ...data }));
  };

  /**
   * Construye el FormData listo para enviar al backend.
   * No incluye cargo_domicilio_id ni monto_total — son responsabilidad del llamador.
   */
  const buildFormData = (): FormData => {
    const formData = new FormData();
    formData.append("fecha_pago", values.fechaPago.toISOString());
    formData.append("metodo_pago", values.metodoPago);
    if (values.institucion.trim()) formData.append("institucion_bancaria", values.institucion.trim());
    if (values.referencia.trim()) formData.append("numero_referencia", values.referencia.trim());
    if (values.cuentaDestino) formData.append("cuenta_destino", values.cuentaDestino);
    if (values.observaciones.trim()) formData.append("observaciones", values.observaciones.trim());

    if (values.file) {
      // Android necesita el prefijo file://, iOS lo rechaza — mismo patrón que el resto del proyecto
      const fileUri =
        Platform.OS === "android"
          ? values.file.uri
          : values.file.uri.replace("file://", "");

      formData.append("comprobante", {
        uri: fileUri,
        name: values.file.name,
        type: values.file.mimeType ?? "application/octet-stream",
      } as any);
    }

    return formData;
  };

  return { values, setField, prefill, buildFormData };
}
