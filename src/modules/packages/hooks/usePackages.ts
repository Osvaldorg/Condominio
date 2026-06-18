import { useState, useCallback } from "react";
import { packagesApi } from "../../../api/endpoints/packages.api";
import { usePackagesStore } from "../store/packages.store";
import { PackageStatus } from "../../../api/types/packages";

export function usePackages(estado?: PackageStatus) {
  const { packages, pagination, loading, error, setPackages, appendPackages, setPagination, setLoading, setError } = usePackagesStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchPackages = useCallback(async (page = 1, shouldAppend = false) => {
    try {
      if (page === 1 && !shouldAppend) {
        setLoading(true);
      }
      
      // Si el filtro en la UI es "por_retirar", en realidad queremos
      // traer tanto los 'por_retirar' como los 'notificado', ya que ambos
      // significan que el paquete está en caseta esperando ser recogido.
      const queryEstado = estado === 'por_retirar' ? 'notificado' : estado;
      
      const res = await packagesApi.getResidentPackages(page, 20, queryEstado);
      
      if (res.success) {
        if (shouldAppend) {
          appendPackages(res.paquetes);
        } else {
          setPackages(res.paquetes);
        }
        setPagination(res.pagination);
      } else {
        setError("Error al obtener paquetes");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsFetchingMore(false);
    }
  }, [estado, setPackages, appendPackages, setPagination, setLoading, setError]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPackages(1, false);
  }, [fetchPackages]);

  const fetchMore = useCallback(() => {
    if (!pagination || loading || isFetchingMore || isRefreshing) return;
    
    if (pagination.page < pagination.totalPages) {
      setIsFetchingMore(true);
      fetchPackages(pagination.page + 1, true);
    }
  }, [pagination, loading, isFetchingMore, isRefreshing, fetchPackages]);

  return {
    packages,
    loading,
    error,
    isRefreshing,
    isFetchingMore,
    refresh,
    fetchMore,
    fetchInitial: useCallback(() => fetchPackages(1, false), [fetchPackages]),
  };
}
