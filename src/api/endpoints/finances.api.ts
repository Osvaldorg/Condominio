import { api } from "../client";
import type { 
  AccountStatusResponse, 
  PendingChargesResponse, 
  PaymentAccountsResponse, 
  PaymentHistoryResponse,
  ComprobanteDetailResponse,
  ResubmitPaymentResponse,
} from "../types/finances";

export const financesApi = {
  getAccountStatus: async () => {
    const { data } = await api.get<AccountStatusResponse>("/finances/resident/account-status");
    return data;
  },

  getPendingCharges: async () => {
    const { data } = await api.get<PendingChargesResponse>("/finances/resident/pending-charges");
    return data;
  },

  getPaymentHistory: async (page = 1, limit = 20) => {
    const { data } = await api.get<PaymentHistoryResponse>(`/finances/resident/payment-history?page=${page}&limit=${limit}`);
    return data;
  },

  getPaymentAccounts: async () => {
    const { data } = await api.get<PaymentAccountsResponse>("/finances/bank-accounts");
    return data;
  },

  /** GET /finances/resident/comprobantes/:id — Obtener datos del comprobante rechazado */
  getComprobanteDetail: async (id: string) => {
    const { data } = await api.get<ComprobanteDetailResponse>(`/finances/resident/comprobantes/${id}`);
    return data;
  },

  /** PUT /finances/resident/comprobantes/:id/resubir — Resubir comprobante rechazado */
  resubmitPayment: async (id: string, formData: FormData) => {
    const { data } = await api.put<ResubmitPaymentResponse>(
      `/finances/resident/comprobantes/${id}/resubir`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
};
