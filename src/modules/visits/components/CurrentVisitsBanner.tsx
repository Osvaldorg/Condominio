import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useVisitsStore } from "../store/visits.store";

export function CurrentVisitsBanner() {
  const currentVisits = useVisitsStore((s) => s.currentVisits);
  const fetchCurrentVisits = useVisitsStore((s) => s.fetchCurrentVisits);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchCurrentVisits();
      setLoading(false);
    };
    init();
    // Auto refresh every 30 seconds
    const int = setInterval(fetchCurrentVisits, 30000);
    return () => clearInterval(int);
  }, []);

  if (loading || currentVisits.length === 0) return null;

  return (
    <View className="mx-5 mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-200">
      <View className="flex-row items-center mb-2">
        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
        <Text className="font-semibold text-blue-900">
          {currentVisits.length === 1 ? "1 Visita adentro" : `${currentVisits.length} Visitas adentro`}
        </Text>
      </View>
      
      {currentVisits.map((v) => (
        <View key={v.registro_id} className="mt-1 flex-row justify-between items-center">
          <Text className="text-sm text-blue-800 font-medium">{v.nombre_visitante}</Text>
          <Text className="text-xs text-blue-600">{v.tiempo_dentro.texto}</Text>
        </View>
      ))}
    </View>
  );
}
