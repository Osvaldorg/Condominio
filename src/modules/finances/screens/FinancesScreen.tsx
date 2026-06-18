import { useState, useCallback } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { useFinances } from "../hooks/useFinances";
import { FinancesSummary } from "../components/FinancesSummary";
import { FinancesTabs, FinancesTabType } from "../components/FinancesTabs";
import { PendingQuotasList } from "../components/PendingQuotasList";
import { MyPaymentsList } from "../components/MyPaymentsList";

export default function FinancesScreen() {
  const { balance, pendingCharges, paymentHistory, loading, error, fetchFinances } = useFinances();
  const [activeTab, setActiveTab] = useState<FinancesTabType>("PENDING");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto refresh cuando el usuario navega voluntariamente entre pestañas
  const handleTabChange = useCallback(async (tab: FinancesTabType) => {
    setActiveTab(tab);
    // Solicitamos carga silenciosa al cambiar de pestaña para refrescar el contenido
    await fetchFinances();
  }, [fetchFinances]);

  // Auto refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFinances();
    }, [fetchFinances])
  );

  // Manual pull-to-refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchFinances();
    setIsRefreshing(false);
  }, [fetchFinances]);

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="flex-1">
        {/* Header Title */}
        <View className="px-5 mb-6 mt-2">
          <Text className="text-[32px] font-extrabold text-neutral-900 tracking-tight">Finanzas</Text>
        </View>

        {loading && balance === 0 && !isRefreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#171717" size="large" />
          </View>
        ) : error && balance === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-red-500">{error}</Text>
          </View>
          ) : (
          <View className="flex-1">
            <View className="px-5">
              <FinancesSummary balance={balance} pendingCharges={pendingCharges} />
              <FinancesTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </View>
            
            <View className="flex-1 mt-4 px-5">
              {activeTab === "PENDING" ? (
                <PendingQuotasList 
                  charges={pendingCharges} 
                  isRefreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              ) : (
                <MyPaymentsList 
                  payments={paymentHistory} 
                  isRefreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
