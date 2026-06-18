import { useState, useCallback } from "react";
import { financesApi } from "../../../api/endpoints/finances.api";
import type { ComprobanteDetail } from "../../../api/types/finances";

interface RetryPaymentState {
  comprobante: ComprobanteDetail | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

/**
 * Hook dedicado para el flujo de reintento de pago rechazado.
 *
 * Responsabilidades:
 *  - Cargar los datos del comprobante rechazado para pre-llenar el formulario.
 *  - Enviar el comprobante corregido al backend (PUT /comprobantes/:id/resubir).
 *
 * No modifica el store global; la actualización del historial la realiza
 * el llamador (RetryPaymentScreen) invocando fetchFinances() tras el éxito.
 */
export function useRetryPayment() {
  const [state, setState] = useState<RetryPaymentState>({
    comprobante: null,
    loading: false,
    submitting: false,
    error: null,
  });

  /** Carga los datos del comprobante rechazado para pre-llenar el formulario */
  const loadComprobante = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await financesApi.getComprobanteDetail(id);
      if (!res.success) throw new Error("No se pudo obtener el comprobante.");
      setState(prev => ({ ...prev, comprobante: res.comprobante }));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error al cargar el comprobante.";
      setState(prev => ({ ...prev, error: msg }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  /**
   * Reenvía el comprobante rechazado con la información corregida.
   * @returns true si fue exitoso, false en caso de error.
   */
  const resubmit = useCallback(
    async (id: string, formData: FormData): Promise<boolean> => {
      setState(prev => ({ ...prev, submitting: true, error: null }));
      try {
        const res = await financesApi.resubmitPayment(id, formData);
        if (!res.success) throw new Error(res.message ?? "Error al reenviar el comprobante.");
        return true;
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? "Error al reenviar el comprobante.";
        setState(prev => ({ ...prev, error: msg }));
        return false;
      } finally {
        setState(prev => ({ ...prev, submitting: false }));
      }
    },
    []
  );

  return {
    comprobante: state.comprobante,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,
    loadComprobante,
    resubmit,
  };
}
