import React, { useEffect, useRef } from "react";
import { Text, View, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Authorization } from "../../../api/types/visits";
import { getVisitTypeLabel } from "../utils/visitFormatters";

interface VisitCardProps {
  data: Authorization;
  /** Si true, muestra el badge "DENTRO" animado (para visitas en pestaña Activas) */
  isInsideComplex?: boolean;
}

export function VisitCard({ data, isInsideComplex = false }: VisitCardProps) {
  const router = useRouter();
  const isUnique = data.es_visita_unica;
  const status = data.estado ?? "unknown";

  // Animación del punto parpadeante del badge "DENTRO"
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isInsideComplex) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isInsideComplex, pulseAnim]);

  // Helper to format date -> YYYY/MM/DD
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
      case "usada":
        return "bg-neutral-100 text-neutral-500";
      default:
        return "bg-blue-50 text-blue-600";
    }
  };

  const resolvedName = data.nombre_visitante
    || data.proveedor_id?.nombre
    || data.personal_id?.nombre
    || "Visita Registrada";

  const backendKey = data.tipo_visita_id?.nombre;
  const badgeLabel = getVisitTypeLabel(backendKey);

  return (
    <Pressable
      onPress={() => router.push(`/visits/${data._id}` as any)}
      className="border rounded-2xl p-4 mb-3 shadow-sm active:opacity-80 bg-white border-neutral-200"
    >
      {/* Header: Name + Badges */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-t1 font-bold" numberOfLines={1}>
            {resolvedName}
          </Text>
          <Text className="text-c1 mt-0.5" numberOfLines={1}>
            {badgeLabel}
          </Text>
        </View>

        <View className="flex-col items-end gap-1">
          {/* Badge DENTRO (solo cuando el visitante está dentro del complejo) */}
          {isInsideComplex && (
            <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-full">
              <Animated.View
                style={{ opacity: pulseAnim }}
                className="w-2 h-2 rounded-full bg-emerald-500 mr-1"
              />
              <Text className="text-emerald-700 text-[10px] font-bold">DENTRO</Text>
            </View>
          )}

          {/* Badge de estado normal */}
          <View className={`px-2 py-1 rounded-md ${getStatusColor(status)}`}>
            <Text className="text-xs font-bold capitalize">{status}</Text>
          </View>
        </View>
      </View>

      {/* Body: Info Rows */}
      <View className="space-y-1 mt-1">
        {/* Fechas de vigencia */}
        <View className="flex-row items-center">
          <Text className="text-[13px] font-medium text-neutral-400 w-16">Fecha:</Text>
          <Text className="text-b1 font-bold">
            {isUnique
              ? formatDate(data.fecha_visita_unica)
              : `${formatDate(data.fecha_inicio_vigencia)} - ${formatDate(data.fecha_fin_vigencia)}`}
          </Text>
        </View>

        {data.codigo_acceso && (
          <View className="flex-row items-center mt-1">
            <Text className="text-[13px] font-medium text-neutral-400 w-16">Código:</Text>
            <Text className="text-b1 font-bold font-mono bg-neutral-100 px-1 rounded">
              {data.codigo_acceso}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
