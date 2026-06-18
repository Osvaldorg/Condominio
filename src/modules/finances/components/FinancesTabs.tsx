import { Pressable, Text, View } from "react-native";

export type FinancesTabType = "PENDING" | "HISTORY";

interface FinancesTabsProps {
  activeTab: FinancesTabType;
  onTabChange: (tab: FinancesTabType) => void;
}

export function FinancesTabs({ activeTab, onTabChange }: FinancesTabsProps) {
  return (
    <View className="flex-row bg-neutral-100 p-1 mb-5 rounded-2xl mx-1">
      <Pressable
        onPress={() => onTabChange("PENDING")}
        className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
          activeTab === "PENDING" ? "bg-white shadow-sm elevation-1" : ""
        }`}
      >
        <Text
          className={`text-sm font-semibold tracking-wide ${
            activeTab === "PENDING" ? "text-neutral-900" : "text-neutral-500"
          }`}
        >
          Pendientes
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onTabChange("HISTORY")}
        className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
          activeTab === "HISTORY" ? "bg-white shadow-sm elevation-1" : ""
        }`}
      >
        <Text
          className={`text-sm font-semibold tracking-wide ${
            activeTab === "HISTORY" ? "text-neutral-900" : "text-neutral-500"
          }`}
        >
          Mis pagos
        </Text>
      </Pressable>
    </View>
  );
}
