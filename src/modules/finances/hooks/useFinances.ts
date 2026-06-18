import { useCallback } from "react";
import { financesApi } from "../../../api/endpoints/finances.api";
import { useFinancesStore } from "../store/finances.store";

export function useFinances() {
  const balance = useFinancesStore((s) => s.balance);
  const pendingCharges = useFinancesStore((s) => s.pendingCharges);
  const paymentHistory = useFinancesStore((s) => s.paymentHistory);
  const bankAccounts = useFinancesStore((s) => s.bankAccounts);
  const loading = useFinancesStore((s) => s.loading);
  const error = useFinancesStore((s) => s.error);

  const setBalanceData = useFinancesStore((s) => s.setBalanceData);
  const setPendingCharges = useFinancesStore((s) => s.setPendingCharges);
  const setPaymentHistory = useFinancesStore((s) => s.setPaymentHistory);
  const setBankAccounts = useFinancesStore((s) => s.setBankAccounts);
  const setLoading = useFinancesStore((s) => s.setLoading);
  const setError = useFinancesStore((s) => s.setError);

  const fetchFinances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos Promise.allSettled para que si un endpoint falla no bloquee a los demás
      const [statusRes, pendingRes, historyRes] = await Promise.allSettled([
        financesApi.getAccountStatus(),
        financesApi.getPendingCharges(),
        financesApi.getPaymentHistory(),
      ]);

      if (statusRes.status === "fulfilled" && statusRes.value.success) {
        setBalanceData(statusRes.value.estado_cuenta.resumen.total_general || 0);
        setBankAccounts(statusRes.value.estado_cuenta.cuentas_referencia || []);
      }
      
      if (pendingRes.status === "fulfilled" && pendingRes.value.success) {
        setPendingCharges(pendingRes.value.cargos || []);
      }

      if (historyRes.status === "fulfilled" && historyRes.value.success) {
        setPaymentHistory(historyRes.value.comprobantes || []);
      }

    } catch (e: any) {
      setError(e?.message ?? "Error al cargar la información financiera");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setBalanceData, setPendingCharges, setPaymentHistory, setBankAccounts]);

  return { balance, pendingCharges, paymentHistory, bankAccounts, loading, error, fetchFinances };
}
