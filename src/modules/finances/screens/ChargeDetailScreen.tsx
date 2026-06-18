import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFinances } from "../hooks/useFinances";
import { useState, useEffect } from "react";

/**
 * ChargeDetailScreen
 *
 * Detalle completo de un cargo pendiente: desglose de monto base,
 * descuentos, recargos, abonos previos y saldo final a pagar.
 *
 * Es el paso intermedio entre la lista de pendientes y RegisterPaymentScreen.
 * Recibe `id` (cargo_domicilio_id) como search-param desde expo-router.
 */
export default function ChargeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pendingCharges, fetchFinances, loading: financesLoading } = useFinances();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Forzar refresco al montar para capturar cargos nuevos (Push Notifications)
  useEffect(() => {
    const refreshData = async () => {
      try {
        await fetchFinances();
      } catch (error) {
        console.error("Error refreshing charge detail:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    refreshData();
  }, [id, fetchFinances]);

  // Buscamos el cargo en la lista: el id que viene de la notificación puede ser 
  // el id del CargoDomicilio o el id del Cargo padre. Soportamos ambos.
  const charge = pendingCharges.find((c) => c.id === id || c.cargo_id === id);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  // Mientras validamos datos con el servidor, mostramos carga (evita el error 'Cargo no encontrado')
  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ title: "Verificando estatus..." }} />
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!charge) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-5">
        <Stack.Screen options={{ title: "Resumen de cuota" }} />
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-neutral-500 text-base font-medium mt-3 text-center">
          Cargo no encontrado
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-black px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const isVencido = charge.estatus === "vencido";
  const hasModifiers = charge.total_descuentos > 0 || charge.total_recargos > 0 || charge.ya_pagado > 0;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Resumen de cuota", headerBackTitle: "Atrás" }} />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>

        {/* Banner vencido */}
        {isVencido && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex-row items-center">
            <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
            <Text className="text-red-700 text-sm font-semibold ml-2">
              Este cargo está vencido · {charge.dias_vencido} día{charge.dias_vencido !== 1 ? "s" : ""} de atraso
            </Text>
          </View>
        )}

        {/* Header del cargo */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-neutral-900 mb-1">{charge.nombre}</Text>
          {charge.descripcion ? (
            <Text className="text-neutral-500 text-sm">{charge.descripcion}</Text>
          ) : null}
          <View className="flex-row items-center mt-2">
            <MaterialCommunityIcons name="calendar-blank" size={14} color="#6B7280" />
            <Text className="text-neutral-500 text-xs ml-1">
              Vence:{" "}
              {charge.fecha_vencimiento
                ? new Date(charge.fecha_vencimiento).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "No definida"}
            </Text>
          </View>
          {charge.tipo_nombre && (
            <View className="mt-2 self-start bg-neutral-100 px-3 py-1 rounded-full">
              <Text className="text-neutral-600 text-xs font-medium">{charge.tipo_nombre}</Text>
            </View>
          )}
        </View>

        {/* Desglose de montos */}
        <View className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 mb-6">
          <Text className="text-neutral-600 text-sm font-semibold mb-4 uppercase tracking-wide">
            Desglose
          </Text>

          {/* Monto base */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-neutral-500 text-sm">Monto base</Text>
            <Text className="text-neutral-800 font-medium text-sm">
              {formatCurrency(charge.monto_original)}
            </Text>
          </View>

          {/* Descuentos */}
          {charge.total_descuentos > 0 && (
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="tag-outline" size={14} color="#10B981" />
                <Text className="text-green-600 text-sm font-medium ml-1">Descuentos</Text>
              </View>
              <Text className="text-green-600 font-semibold text-sm">
                -{formatCurrency(charge.total_descuentos)}
              </Text>
            </View>
          )}

          {/* Recargos */}
          {charge.total_recargos > 0 && (
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
                <Text className="text-red-500 text-sm font-medium ml-1">Recargos por mora</Text>
              </View>
              <Text className="text-red-500 font-semibold text-sm">
                +{formatCurrency(charge.total_recargos)}
              </Text>
            </View>
          )}

          {/* Abonos anteriores */}
          {charge.ya_pagado > 0 && (
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="cash-check" size={14} color="#3B82F6" />
                <Text className="text-blue-600 text-sm font-medium ml-1">Abonos realizados</Text>
              </View>
              <Text className="text-blue-600 font-semibold text-sm">
                -{formatCurrency(charge.ya_pagado)}
              </Text>
            </View>
          )}

          {/* Línea separadora si hubo modificadores */}
          {hasModifiers && <View className="h-[1px] bg-neutral-200 my-2" />}

          {/* Total a pagar */}
          <View className="flex-row justify-between items-center">
            <Text className="text-neutral-900 font-bold text-base">Total a pagar</Text>
            <Text className={`font-bold text-2xl ${isVencido ? "text-red-600" : "text-neutral-900"}`}>
              {formatCurrency(charge.saldo_pendiente)}
            </Text>
          </View>
        </View>

        {/* Detalle de descuentos individuales */}
        {charge.descuentos?.length > 0 && (
          <View className="mb-6">
            <Text className="text-neutral-600 text-sm font-semibold mb-3 uppercase tracking-wide">
              Descuentos aplicados
            </Text>
            {charge.descuentos.map((d: any, i: number) => (
              <View key={i} className="flex-row justify-between items-center py-2 border-b border-neutral-100">
                <View className="flex-1 mr-3">
                  <Text className="text-neutral-700 text-sm font-medium">{d.nombre}</Text>
                  {d.motivo ? (
                    <Text className="text-neutral-400 text-xs mt-0.5">{d.motivo}</Text>
                  ) : null}
                </View>
                <Text className="text-green-600 font-semibold text-sm">
                  -{formatCurrency(d.monto_descontado)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Detalle de recargos individuales */}
        {charge.recargos?.length > 0 && (
          <View className="mb-6">
            <Text className="text-neutral-600 text-sm font-semibold mb-3 uppercase tracking-wide">
              Recargos aplicados
            </Text>
            {charge.recargos.map((r: any, i: number) => (
              <View key={i} className="flex-row justify-between items-center py-2 border-b border-neutral-100">
                <View className="flex-1 mr-3">
                  <Text className="text-neutral-700 text-sm font-medium">{r.nombre}</Text>
                  {r.fecha ? (
                    <Text className="text-neutral-400 text-xs mt-0.5">
                      Aplicado: {new Date(r.fecha).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-red-500 font-semibold text-sm">
                  +{formatCurrency(r.monto_recargo)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mb-8" />
      </ScrollView>

      {/* Botón Pagar */}
      <View className="px-5 py-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/payments/register-payment",
              params: { id: charge.id },
            } as any)
          }
          className="py-4 rounded-xl items-center bg-black active:bg-neutral-800 flex-row justify-center"
        >
          <MaterialCommunityIcons name="cash-fast" size={20} color="white" />
          <Text className="text-white font-bold text-base ml-2">Pagar esta cuota</Text>
        </Pressable>
      </View>
    </View>
  );
}
