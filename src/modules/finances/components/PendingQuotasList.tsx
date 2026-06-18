import { View, Text, Pressable, FlatList, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChargeItem } from "../../../api/types/finances";
import { useSafeRouter } from "../../../hooks/useSafeRouter";


interface PendingQuotasListProps {
  charges: ChargeItem[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Lista de cuotas pendientes del residente.
 * Cada card es completamente tocable y navega al detalle del cargo.
 * El desglose de descuentos/recargos vive en ChargeDetailScreen.
 */
export function PendingQuotasList({ charges, isRefreshing = false, onRefresh }: PendingQuotasListProps) {
  const router = useSafeRouter();

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const renderItem = ({ item }: { item: ChargeItem }) => {
    const isVencido = item.estatus === "vencido";

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/payments/charge-detail",
            params: { id: item.id },
          } as any)
        }
        className="bg-white p-4 rounded-2xl mb-3 border border-neutral-100 shadow-sm elevation-1 active:bg-neutral-50"
      >
        <View className="flex-row justify-between items-center">
          {/* Info izquierda */}
          <View className="flex-1 mr-3">
            <Text className="text-neutral-800 font-semibold text-base mb-1" numberOfLines={1}>
              {item.nombre}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="calendar-blank" size={13} color="#6B7280" />
                <Text className="text-neutral-500 text-xs ml-1">
                  Vence: {item.fecha_vencimiento
                    ? new Date(item.fecha_vencimiento).toLocaleDateString()
                    : "No definida"}
                </Text>
              </View>
              {isVencido && (
                <View className="bg-red-100 px-2 py-0.5 rounded-full">
                  <Text className="text-red-600 text-[10px] font-bold uppercase">Vencido</Text>
                </View>
              )}
              {item.total_recargos > 0 && (
                <View className="bg-orange-50 px-2 py-0.5 rounded-full">
                  <Text className="text-orange-600 text-[10px] font-semibold">+Recargo</Text>
                </View>
              )}
            </View>
          </View>

          {/* Monto + flecha */}
          <View className="flex-row items-center">
            <Text className={`font-bold text-lg mr-2 ${isVencido ? "text-red-600" : "text-neutral-900"}`}>
              {formatCurrency(item.saldo_pendiente)}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={charges}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#171717" colors={["#171717"]} />
        ) : undefined
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-10">
          <View className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="check-circle-outline" size={32} color="#10B981" />
          </View>
          <Text className="text-neutral-800 font-medium text-base mb-1">¡Todo al día!</Text>
          <Text className="text-neutral-500 text-sm">No tienes cuotas pendientes por pagar</Text>
        </View>
      }
    />
  );
}
