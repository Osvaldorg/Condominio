import { useSafeRouter } from "../../../../hooks/useSafeRouter";

import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const router = useSafeRouter();
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  return (
    <View className="p-4 pb-5">
      <Text className="text-neutral-500 text-sm font-medium mb-1">
        Pagos pendientes
      </Text>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-[32px] font-bold text-neutral-900 tracking-tight mr-2">
            {showBalance ? formatCurrency(balance) : "$ •,•••.•0"}
          </Text>
          <Pressable onPress={() => setShowBalance(!showBalance)} className="p-1 active:opacity-50">
            <MaterialCommunityIcons 
              name={showBalance ? "eye-outline" : "eye-off-outline"} 
              size={22} 
              color="#171717" 
            />
          </Pressable>
        </View>

        <Pressable 
          onPress={() => router.push("/(tabs)/payments" as any)}
          className="bg-[#1A1A1A] py-2 px-4 rounded-xl flex-row items-center active:bg-black active:opacity-80"
        >
          <Text className="text-white font-medium text-[13px] mr-1">Pagar</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
