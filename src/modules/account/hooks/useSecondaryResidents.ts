import { useState, useCallback, useEffect } from 'react';
import { residentsApi } from '../../../api/endpoints/residents.api';
import { useAuthStore } from '../../auth/store/auth.store';

export function useSecondaryResidents() {
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const fetchResidents = useCallback(async () => {
    // Solo si es residente principal
    if (!user?.residente?.es_principal) return;
    
    try {
      setIsLoading(true);
      const res = await residentsApi.getSecondaryResidents();
      if (res.success) {
        setResidents(res.data.residentes || []);
      }
    } catch (error) {
      console.error("Error fetching secondary residents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const toggleStatus = async (residenteId: string, currentStatus: string) => {
    const isActivating = currentStatus === 'inactivo';
    
    // Optimistic update
    setResidents(prev => prev.map(r => 
      r._id === residenteId ? { ...r, estatus: isActivating ? 'activo' : 'inactivo' } : r
    ));

    const res = await residentsApi.toggleSecondaryResidentStatus(residenteId, isActivating);
    
    if (!res.success) {
      // Rollback if failed
      setResidents(prev => prev.map(r => 
        r._id === residenteId ? { ...r, estatus: currentStatus } : r
      ));
      return { success: false, message: res.message };
    }
    
    return { success: true };
  };

  const addResident = async (userData: any) => {
    const res = await residentsApi.createSecondaryResident(userData);
    if (res.success) {
      // Re-fetch to get the new list with populated data
      await fetchResidents();
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  return {
    residents,
    isLoading,
    toggleStatus,
    addResident,
    refresh: fetchResidents
  };
}
