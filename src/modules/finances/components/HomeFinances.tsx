import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useFinances } from "../hooks/useFinances";
import { BalanceCard } from "./HomeFinances/BalanceCard";
import { BankAccountsList } from "./HomeFinances/BankAccountsList";

export function HomeFinances() {
  const { balance, bankAccounts, loading, error, fetchFinances } = useFinances();

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  if (loading && balance === 0) {
    return (
      <View className="px-5 mb-8 h-32 items-center justify-center">
        <ActivityIndicator color="#171717" />
      </View>
    );
  }

  if (error && balance === 0) {
    return (
      <View className="px-5 mb-8">
        <Text className="text-sm text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="px-5 mb-6 mt-4">
      <View className="bg-white rounded-[20px] overflow-hidden elevation-2 shadow-sm border border-neutral-200">
        <BalanceCard balance={balance} />
        <BankAccountsList accounts={bankAccounts} />
      </View>
    </View>
  );
}
