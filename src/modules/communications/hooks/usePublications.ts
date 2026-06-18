import { useCallback } from "react";
import { publicationsApi } from "../../../api/endpoints/publications.api";
import { usePublicationsStore } from "../store/publications.store";

export function usePublications() {
  const items = usePublicationsStore((s) => s.items);
  const loading = usePublicationsStore((s) => s.loading);
  const error = usePublicationsStore((s) => s.error);
  const page = usePublicationsStore((s) => s.page);
  const totalPages = usePublicationsStore((s) => s.totalPages);

  const setItems = usePublicationsStore((s) => s.setItems);
  const setLoading = usePublicationsStore((s) => s.setLoading);
  const setError = usePublicationsStore((s) => s.setError);
  const setPageInfo = usePublicationsStore((s) => s.setPageInfo);

  const fetchList = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicationsApi.listResident({
          page: nextPage,
          limit: 20,
        });

        if (!res.success) throw new Error("No se pudieron cargar los boletines");

        setItems(res.publicaciones ?? []);
        setPageInfo(res.pagination.page, res.pagination.totalPages);
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar boletines");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setItems, setPageInfo]
  );

  const refresh = useCallback(() => fetchList(1), [fetchList]);

  return { items, loading, error, page, totalPages, fetchList, refresh };
}
