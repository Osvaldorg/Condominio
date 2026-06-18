import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { eventsApi } from "../../../api/endpoints/events.api";
import type { Evento } from "../../../api/types/events";
import { EventCard } from "../components/EventCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EventsScreen() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"activas" | "historial">("activas");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const isActivas = tab === "activas";
      const eventsRes = await eventsApi.listMyEvents(isActivas);

      if (!eventsRes.success) throw new Error("No se pudieron cargar los eventos");

      const allItems = eventsRes.eventos ?? [];

      allItems.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());

      setItems(allItems);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [tab])
  );

  const filteredItems = items.filter((item) => {
    let status = "pendiente";
    if (item.estatus === "cancelado") {
      status = "cancelada";
    } else {
      const act = new Date() >= new Date(item.fecha_inicio) && new Date() <= new Date(item.fecha_fin);
      status = act ? "activa" : (new Date() > new Date(item.fecha_fin) ? "vencida" : "pendiente");
    }

    if (tab === "activas") {
      return status === "activa" || status === "pendiente";
    } else {
      return status === "cancelada" || status === "vencida" || status === "expirada";
    }
  });

  return (
    <View className="flex-1 bg-white">

      {error && (
        <View className="mx-5 mt-3 p-3 rounded-xl bg-red-50">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      <View className="flex-row mx-5 mt-4 bg-neutral-100 p-1 rounded-xl mb-4">
        <Pressable
          onPress={() => setTab("activas")}
          className={`flex-1 py-2 items-center rounded-lg ${tab === "activas" ? "bg-white shadow-sm" : ""}`}
        >
          <Text className={`font-semibold ${tab === "activas" ? "text-black" : "text-neutral-500"}`}>
            Activos
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("historial")}
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => <EventCard data={item} />}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-10 items-center">
              <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#D1D5DB" />
              <Text className="text-neutral-500 mt-3 text-base">No hay eventos registrados</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

