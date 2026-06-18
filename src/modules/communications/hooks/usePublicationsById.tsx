import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { usePublicationsStore } from "../store/publications.store";

export function usePublicationById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const items = usePublicationsStore((s) => s.items);

  const publication = useMemo(
    () => items.find((p) => p._id === id),
    [items, id]
  );

  return { id, publication };
}
