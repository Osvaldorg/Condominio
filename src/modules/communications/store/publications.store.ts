import { create } from "zustand";
import type { Publication } from "../../../api/types/publications";

type State = {
  items: Publication[];
  loading: boolean;
  error: string | null;

  page: number;
  totalPages: number;

  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setItems: (items: Publication[]) => void;
  setPageInfo: (page: number, totalPages: number) => void;

  reset: () => void;
};

export const usePublicationsStore = create<State>((set) => ({
  items: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setItems: (items) => set({ items }),
  setPageInfo: (page, totalPages) => set({ page, totalPages }),

  reset: () =>
    set({
      items: [],
      loading: false,
      error: null,
      page: 1,
      totalPages: 1,
    }),
}));
