import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PaymentHistoryComprobante } from "../../../api/types/finances";
import { usePaymentHistory } from "../hooks/usePaymentHistory";

interface MyPaymentsListProps {
  payments: PaymentHistoryComprobante[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function MyPaymentsList({ payments, isRefreshing = false, onRefresh }: MyPaymentsListProps) {
  const router = useRouter();
  const { loadMore, loadingMore, hasMore } = usePaymentHistory();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  const getStatusColor = (status: PaymentHistoryComprobante["estatus"]) => {
    switch (status.toLowerCase()) {
      case "aprobado": return { bg: "bg-green-100", text: "text-green-700", icon: "check-circle", color: "#10B981" };
      case "pendiente": return { bg: "bg-orange-100", text: "text-orange-700", icon: "clock-outline", color: "#F59E0B" };
      case "rechazado": return { bg: "bg-red-100", text: "text-red-700", icon: "close-circle", color: "#EF4444" };
      default: return { bg: "bg-neutral-100", text: "text-neutral-700", icon: "file-document", color: "#6B7280" };
    }
  };

  const renderItem = ({ item }: { item: PaymentHistoryComprobante }) => {
    const statusStyle = getStatusColor(item.estatus);
    
    // Extraer inteligentemente el nombre real desde el payload backend
    const chargeName = item.pagos_aplicados && item.pagos_aplicados.length > 0 
      ? item.pagos_aplicados[0]?.cargo?.nombre 
      : item.cargo_domicilio_id?.cargo_id?.nombre || "Pago de comprobante";
    
    return (
      <Pressable 
        onPress={() => router.push({ pathname: "/payments/payment-detail", params: { id: item._id } } as any)}
        className="bg-white p-4 rounded-2xl mb-3 border border-neutral-100 shadow-sm elevation-1 active:bg-neutral-50"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-neutral-800 font-semibold text-base mb-1" numberOfLines={1}>
              {chargeName}
            </Text>
            <Text className="text-neutral-500 text-xs">
              {new Date(item.fecha_pago).toLocaleDateString()}
            </Text>
          </View>
          <Text className="text-neutral-900 font-bold text-lg">
            {formatCurrency(item.monto_total)}
          </Text>
        </View>
        
        <View className={`self-start flex-row items-center px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
          <MaterialCommunityIcons name={statusStyle.icon as any} size={14} color={statusStyle.color} />
          <Text className={`text-[11px] font-bold ml-1 ${statusStyle.text} uppercase`}>
            {item.estatus}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#171717" colors={["#171717"]} />
        ) : undefined
      }
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#171717" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-10">
          <View className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="receipt" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-neutral-800 font-medium text-base mb-1">Aún no hay pagos</Text>
          <Text className="text-neutral-500 text-sm">Aquí verás tu historial de pagos realizados</Text>
        </View>
      }
    />
  );
}
