import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChargeItem } from "../../../api/types/finances";

interface FinancesSummaryProps {
  balance: number;
  pendingCharges: ChargeItem[];
}

export function FinancesSummary({ balance, pendingCharges }: FinancesSummaryProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  // Find the next due charge, if any
  const nextCharge = pendingCharges.length > 0 ? pendingCharges[0] : null;

  return (
    <View className="bg-white rounded-[20px] p-5 mb-5 elevation-2 shadow-sm border border-neutral-200">
      <View className="mb-4">
        <Text className="text-neutral-500 text-sm font-medium mb-1">Adeudo total</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-[32px] font-bold text-neutral-900 tracking-tight">
            {showBalance ? formatCurrency(balance) : "$ •,•••.•0"}
          </Text>
          <Pressable onPress={() => setShowBalance(!showBalance)} className="p-2 active:opacity-50">
            <MaterialCommunityIcons 
              name={showBalance ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color="#A3A3A3" 
            />
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center bg-neutral-50 rounded-xl p-3 border border-neutral-100">
        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
          <MaterialCommunityIcons name="calendar-clock" size={20} color="#007AFF" />
        </View>
        <View className="flex-1">
          <Text className="text-neutral-500 text-xs font-medium">Próximo vencimiento</Text>
          <Text className="text-neutral-800 font-semibold mt-0.5">
            {nextCharge 
              ? `${formatCurrency(nextCharge.saldo_pendiente)} • ${new Date(nextCharge.fecha_vencimiento || Date.now()).toLocaleDateString()}` 
              : "Sin próximos vencimientos"}
          </Text>
        </View>
      </View>

      {/* Example for Saldo a favor if balance < 0 or we had a specific field for it */}
      {balance < 0 && (
        <View className="flex-row items-center bg-green-50 rounded-xl p-3 mt-3 border border-green-100">
          <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
            <MaterialCommunityIcons name="cash-plus" size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-green-600 text-xs font-medium">Saldo a favor</Text>
            <Text className="text-green-700 font-semibold mt-0.5">
              {showBalance ? formatCurrency(Math.abs(balance)) : "$ •,•••.•0"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
