import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { usePackages } from "../hooks/usePackages";
import { PackageStatusBadge } from "../components/PackageStatusBadge";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Package } from "../../../api/types/packages";

// Helper simple para formatear fecha de ISO a DD/MM/YYYY
const formatDate = (isoString?: string) => {
  if (!isoString) return "No disponible";
  const date = new Date(isoString);
  return date.toLocaleDateString("es-MX", { 
    day: "2-digit", month: "long", year: "numeric", 
    hour: "2-digit", minute: "2-digit" 
  });
};

export function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { packages, fetchInitial } = usePackages();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Forzar refresco al montar para capturar paquetes entrantes vía Push
  useEffect(() => {
    const refreshData = async () => {
      try {
        await fetchInitial();
      } catch (error) {
        console.error("Error refreshing package detail:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    refreshData();
  }, [id, fetchInitial]);

  // Buscar el paquete en el store actual
  const pkg: Package | undefined = packages.find(p => p._id === id);

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-4">
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  if (!pkg) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-4">
        <MaterialCommunityIcons name="package-variant-closed" size={64} color="#9CA3AF" />
        <Text className="text-lg font-bold text-neutral-800 mt-4 mb-2 text-center">
          Paquete no encontrado
        </Text>
        <Text className="text-neutral-500 text-center">
          Es posible que haya sido eliminado o no tengas acceso.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* 1. Hero Header */}
      <View className="items-center py-8 bg-neutral-50 px-5 border-b border-neutral-100">
        <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center mb-4">
          <Ionicons name="cube-outline" size={40} color="#F59E0B" />
        </View>
        <Text className="text-2xl font-extrabold text-neutral-900 mb-2 text-center" numberOfLines={2}>
          {pkg.empresa_paqueteria || "Paquete sin marca"}
        </Text>
        <PackageStatusBadge status={pkg.estado} />
      </View>

      {/* 2. Micro-cards (Info Principal) */}
      <View className="px-5 py-6">
        {(pkg.numero_guia || pkg.descripcion) && (
          <View className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm mb-8">
            {pkg.numero_guia && (
              <View className="mb-1">
                <Text className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Número de Guía
                </Text>
                <Text className="text-base text-neutral-800 font-mono tracking-wide font-semibold">
                  {pkg.numero_guia}
                </Text>
              </View>
            )}
            
            {pkg.numero_guia && pkg.descripcion && <View className="h-[1px] bg-neutral-100 my-3" />}

            {pkg.descripcion && (
              <View>
                <Text className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Descripción
                </Text>
                <Text className="text-sm text-neutral-700 leading-5">
                  {pkg.descripcion}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 3. Timeline de Rastreo */}
        <Text className="text-lg font-bold text-neutral-900 mb-5 px-1">Historial del envío</Text>
        <View className="px-2">
          {/* Nodo 1: Recepción */}
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className="w-4 h-4 rounded-full bg-blue-500 z-10" />
              <View className="w-0.5 h-16 bg-blue-100" />
            </View>
            <View className="flex-1 pb-6 mt-[-3px]">
              <Text className="text-[15px] font-bold text-neutral-900">Recibido en caseta</Text>
              <Text className="text-sm text-neutral-500 mt-1">{formatDate(pkg.fecha_recepcion)}</Text>
            </View>
          </View>

          {/* Nodo 2: Notificado */}
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className={`w-4 h-4 rounded-full z-10 ${pkg.fecha_notificacion ? 'bg-blue-500' : 'bg-neutral-200'}`} />
              <View className={`w-0.5 h-16 ${pkg.fecha_notificacion && pkg.fecha_retiro ? 'bg-blue-100' : 'bg-neutral-100'}`} />
            </View>
            <View className="flex-1 pb-6 mt-[-3px]">
              <Text className={`text-[15px] font-bold ${pkg.fecha_notificacion ? 'text-neutral-900' : 'text-neutral-400'}`}>Notificado</Text>
              <Text className="text-sm text-neutral-500 mt-1">
                {pkg.fecha_notificacion ? formatDate(pkg.fecha_notificacion) : "Aún no visualizado"}
              </Text>
            </View>
          </View>

          {/* Nodo 3: Retiro */}
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className={`w-4 h-4 rounded-full z-10 ${pkg.fecha_retiro ? 'bg-green-500' : 'bg-neutral-200'}`} />
            </View>
            <View className="flex-1 mt-[-3px]">
              <Text className={`text-[15px] font-bold ${pkg.fecha_retiro ? 'text-green-600' : 'text-neutral-400'}`}>Entregado al residente</Text>
              <Text className={`text-sm mt-1 ${pkg.fecha_retiro ? 'text-green-600/80 font-medium' : 'text-neutral-500'}`}>
                {pkg.fecha_retiro ? formatDate(pkg.fecha_retiro) : "Esperando retiro"}
              </Text>
            </View>
          </View>
        </View>

        {pkg.observaciones && (
          <View className="mt-8 bg-orange-50 p-4 rounded-xl border border-orange-100">
             <View className="flex-row items-center mb-2">
                 <Ionicons name="warning" size={16} color="#C2410C" />
                 <Text className="ml-2 text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Notas de Caseta
                 </Text>
             </View>
             <Text className="text-sm text-orange-900 leading-5">
               {pkg.observaciones}
             </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
