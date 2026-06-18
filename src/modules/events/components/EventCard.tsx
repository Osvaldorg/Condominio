import React from "react";
import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { Evento } from "../../../api/types/events";

interface EventCardProps {
  data: Evento;
}

export function EventCard({ data }: EventCardProps) {
  const router = useRouter();

  let status = "pendiente";
  if (data.estatus === "cancelado") {
    status = "cancelada";
  } else {
    const act = new Date() >= new Date(data.fecha_inicio) && new Date() <= new Date(data.fecha_fin);
    status = act ? "activa" : (new Date() > new Date(data.fecha_fin) ? "vencida" : "pendiente");
  }

  // Formatting date YYYY/MM/DD
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const isoDate = dateStr.split("T")[0];
    return isoDate.replace(/-/g, "/");
  };

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "activa":
        return "bg-green-100 text-green-700";
      case "vencida":
        return "bg-red-100 text-red-700";
      case "cancelada":
        return "bg-neutral-100 text-neutral-500";
      default:
        return "bg-blue-50 text-blue-600";
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/events/${data._id}` as any)}
      className="border rounded-2xl p-4 mb-3 shadow-sm active:opacity-80 bg-indigo-50 border-indigo-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="font-bold text-lg text-neutral-900" numberOfLines={1}>
            {data.nombre_evento}
          </Text>
          <Text className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5" numberOfLines={1}>
            Evento
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${getStatusColor(status)}`}>
          <Text className="text-xs font-bold capitalize">{status}</Text>
        </View>
      </View>

      <View className="space-y-1 mt-1">
        <View className="flex-row items-center">
          <Text className="text-neutral-500 text-sm w-16">Fecha:</Text>
          <Text className="text-neutral-800 text-sm font-medium">
            {`${formatDate(data.fecha_inicio)}`}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Text className="text-neutral-500 text-sm w-16">Cupos:</Text>
          <Text className="text-neutral-800 text-sm font-medium">
            {data.max_invitados === 0 ? "Ilimitados" : `${data.invitados_registrados || 0} / ${data.max_invitados}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
