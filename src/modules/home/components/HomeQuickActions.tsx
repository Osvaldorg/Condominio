import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ActionItem = {
  key: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  to: string;
};

export function HomeQuickActions() {
  const router = useSafeRouter();

  const actions: ActionItem[] = [
    {
      key: "incidents",
      title: "Incidencias",
      subtitle: "Reportar",
      iconName: "construct-outline",
      color: "#f97316", // orange-500
      bgColor: "bg-orange-50",
      to: "/home/incidents",
    },
    {
      key: "eventos",
      title: "Eventos",
      subtitle: "Ir a mis eventos",
      iconName: "calendar-outline",
      color: "#8b5cf6", // violet-500
      bgColor: "bg-violet-50",
      to: "/home/events",
    },
    {
      key: "packages",
      title: "Paquetes",
      subtitle: "Recoger envíos",
      iconName: "cube-outline",
      color: "#f59e0b", // amber-500
      bgColor: "bg-amber-50",
      to: "/home/packages",
    },
    {
      key: "receipts",
      title: "Recibos",
      subtitle: "Ver estado",
      iconName: "receipt-outline",
      color: "#10b981", // emerald-500
      bgColor: "bg-emerald-50",
      to: "/(tabs)/payments",
    },
  ];

  return (
    <View className="px-5 mt-5">
      <Text className="text-h2 mb-3 tracking-tight">Acciones rápidas</Text>

      <View className="flex-row flex-wrap justify-between">
        {actions.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => router.push(a.to as Href)}
            className="w-[48%] flex-row items-center rounded-2xl bg-white border border-gray-100 p-3.5 mb-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]"
            style={{ elevation: 1 }}
          >
            <View className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${a.bgColor}`}>
              <Ionicons name={a.iconName} size={22} color={a.color} />
            </View>
            <View className="flex-1">
              <Text className="text-t1 leading-tight" numberOfLines={1}>
                {a.title}
              </Text>
              <Text className="text-[12.5px] font-medium text-neutral-400 mt-1 leading-tight" numberOfLines={1}>
                {a.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
