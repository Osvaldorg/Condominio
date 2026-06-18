import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function PackageListEmpty() {
  return (
    <View className="flex-1 items-center justify-center p-8 mt-10">
      <View className="w-20 h-20 rounded-full bg-neutral-100 items-center justify-center mb-4">
        <MaterialCommunityIcons name="package-variant" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-bold text-neutral-800 mb-2">
        Sin paquetes pendientes
      </Text>
      <Text className="text-center text-neutral-500">
        Cuando recibas un nuevo paquete en caseta, aparecerá aquí.
      </Text>
    </View>
  );
}
