import { Pressable, Text, View } from "react-native";
import { Package } from "../../../api/types/packages";
import { PackageStatusBadge } from "./PackageStatusBadge";
import { Ionicons } from "@expo/vector-icons";

// Helper simple para formatear fecha de ISO a DD/MM/YYYY o similar
const formatDate = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

interface Props {
  item: Package;
  onPress?: () => void;
}

export function PackageCard({ item, onPress }: Props) {
  const isRetirado = item.estado === 'retirado';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row px-5 py-4 border-b border-neutral-200 ${isRetirado ? "bg-white opacity-75" : "bg-white"}`}
    >
      <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-amber-100 mt-0.5">
        <Ionicons name="cube-outline" size={24} color="#F59E0B" />
      </View>
        <View className="flex-1 justify-start">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`flex-1 text-t1 ${!isRetirado && "font-extrabold"}`} numberOfLines={1}>
              {item.empresa_paqueteria || "Paquete sin empresa"}
            </Text>
            <Text className={`text-c1 ml-2 ${isRetirado ? "text-neutral-400" : "text-neutral-500 font-bold"}`}>
              {formatDate(item.fecha_recepcion)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-0.5">
            <Text className={`flex-1 text-b1 leading-5 mr-3 ${!isRetirado && "font-medium text-neutral-700"}`} numberOfLines={1}>
              {item.descripcion || (item.numero_guia ? `Guía: ${item.numero_guia}` : 'Paquete recibido en caseta')}
            </Text>
            <PackageStatusBadge status={item.estado} />
          </View>
        </View>
    </Pressable>
  );
}
