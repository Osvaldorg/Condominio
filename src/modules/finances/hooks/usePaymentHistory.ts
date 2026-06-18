import { useState, useCallback, useRef, useEffect } from "react";
import { financesApi } from "../../../api/endpoints/finances.api";
import { useFinancesStore } from "../store/finances.store";

export function usePaymentHistory() {
  const customSetPaymentHistory = useFinancesStore(s => s.setPaymentHistory);
  const payments = useFinancesStore(s => s.paymentHistory);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchLock = useRef(false);

  // Reducer inteligente: Si la vista padre (FinancesScreen) dispara fetchFinances() 
  // esto recarga la Página 1 de golpe en el balance global. Observamos el largo del 
  // array y reseteamos el paginador internamente sin romper nada.
  useEffect(() => {
    // Si la lista encoge o reinicia (Pull to refresh del Dashboard)
    if (payments.length <= 20) {
      setPage(1);
      setHasMore(payments.length === 20); // Solo permitimos scroll si la Pág 1 vino repleta
    }
  }, [payments.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || fetchLock.current) return;
    
    fetchLock.current = true;
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const res = await financesApi.getPaymentHistory(nextPage, 20);
      
      if (res && res.success && res.comprobantes) {
         const newPayments = res.comprobantes;
         
         // Inyección inmutable para evitar duplicados en la pantalla
         useFinancesStore.setState(state => {
           const prevIds = new Set(state.paymentHistory.map(p => p._id));
           const uniques = newPayments.filter(p => !prevIds.has(p._id));
           return { paymentHistory: [...state.paymentHistory, ...uniques] };
         });
         
         setPage(nextPage);
         if (res.pagination) {
            setHasMore(nextPage < res.pagination.totalPages);
         } else {
            setHasMore(newPayments.length >= 20);
         }
      }
    } catch (e) {
      console.error("Error al cargar historial paginado:", e);
    } finally {
      setLoadingMore(false);
      fetchLock.current = false;
    }
  }, [page, hasMore, loadingMore]);

  return { loadingMore, hasMore, loadMore };
}
