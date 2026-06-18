import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { visitsApi } from "../../../api/endpoints/visits.api";
import type { Authorization } from "../../../api/types/visits";
import { useVisitsStore } from "../store/visits.store";
import { VisitCard } from "../components/VisitCard";
import { CurrentVisitsBanner } from "../components/CurrentVisitsBanner";

export default function VisitsScreen() {
  const router = useSafeRouter();
  const currentVisits = useVisitsStore((s) => s.currentVisits);
  const fetchCurrentVisits = useVisitsStore((s) => s.fetchCurrentVisits);
  
  const [items, setItems] = useState<Authorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"activas" | "historial">("activas");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (pageNumber = 1) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const isActivas = tab === "activas";
      const visitsRes = await visitsApi.listResidentAuthorizations(pageNumber, 20, isActivas);

      if (!visitsRes.success) throw new Error("No se pudieron cargar las visitas");

      let newVisits: Authorization[] = visitsRes.autorizaciones ?? [];

      setItems(prevItems => {
        let baseItems = pageNumber === 1 ? [] : prevItems;
        let allItems = [...baseItems, ...newVisits];

        allItems.sort((a, b) => {
          const dateA = a.fecha_inicio_vigencia || a.fecha_visita_unica || "";
          const dateB = b.fecha_inicio_vigencia || b.fecha_visita_unica || "";
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        return allItems;
      });

      setPage(pageNumber);

      if (visitsRes.pagination) {
        setHasMore(pageNumber < visitsRes.pagination.totalPages);
      } else {
        setHasMore(newVisits.length >= 20);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar visitas");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      load(page + 1);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load(1);
      fetchCurrentVisits();
    }, [tab])
  );

  const filteredItems = items.filter((item) => {
    const st = item.estado || "activa";

    if (tab === "activas") {
      return st === "activa" || st === "pendiente";
    } else {
      return st === "usada" || st === "expirada" || st === "cancelada" || st === "vencida";
    }
  });

  // Construir Set de autorizacion_id que están actualmente dentro del complejo
  const currentAutorizacionIds = new Set(
    currentVisits
      .filter(cv => cv.autorizacion_id)
      .map(cv => cv.autorizacion_id as string)
  );

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 flex-row items-center justify-between mb-4 mt-2">
        <Text className="text-[32px] font-extrabold text-neutral-900 tracking-tight">Visitas</Text>

        <Pressable
          onPress={() => router.push("/visits/create/type")}
          className="px-4 py-3 rounded-2xl bg-black"
        >
          <Text className="text-white font-semibold">Registrar visitante</Text>
        </Pressable>
      </View>

      {error ? (
        <View className="mx-5 p-3 rounded-xl bg-red-50 mb-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <CurrentVisitsBanner />

      <View className="flex-row mx-5 bg-neutral-100 p-1 rounded-xl mb-4">
        <Pressable
          onPress={() => {
            if (tab !== "activas") {
              setPage(1);
              setHasMore(false);
              setTab("activas");
            }
          }}
          className={`flex-1 py-2 items-center rounded-lg ${tab === "activas" ? "bg-white shadow-sm" : ""}`}
        >
          <Text className={`font-semibold ${tab === "activas" ? "text-black" : "text-neutral-500"}`}>
            Activas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (tab !== "historial") {
              setPage(1);
              setHasMore(false);
              setTab("historial");
            }
          }}
          className={`flex-1 py-2 items-center rounded-lg ${tab === "historial" ? "bg-white shadow-sm" : ""}`}
        >
          <Text className={`font-semibold ${tab === "historial" ? "text-black" : "text-neutral-500"}`}>
            Historial
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { load(1); fetchCurrentVisits(); }} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <VisitCard
            data={item}
            isInsideComplex={currentAutorizacionIds.has(item._id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-10 items-center">
              <Text className="text-neutral-600">No hay visitas registradas</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <Text className="text-neutral-500">Cargando más visitas...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
