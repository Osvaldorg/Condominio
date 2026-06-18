import { create } from "zustand";
import type { Package, PaginationMeta } from "../../../api/types/packages";

interface PackagesState {
  packages: Package[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;

  setPackages: (packages: Package[]) => void;
  appendPackages: (packages: Package[]) => void;
  setPagination: (pagination: PaginationMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePackagesStore = create<PackagesState>((set) => ({
  packages: [],
  pagination: null,
  loading: false,
  error: null,

  setPackages: (packages) => set({ packages }),
  appendPackages: (newPackages) => set((state) => ({ 
    packages: [...state.packages, ...newPackages] 
  })),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ packages: [], pagination: null, error: null, loading: false }),
}));
