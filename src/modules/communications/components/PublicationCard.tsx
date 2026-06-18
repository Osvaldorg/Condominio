import { Pressable, Text, View } from "react-native";
import type { Publication } from "../../../api/types/publications";


type Props = {
  item: Publication;
  onPress?: () => void;
};

export function PublicationCard({ item, onPress }: Props) {
  const dateLabel = new Date(item.fecha_publicacion).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgente": return "bg-red-100 text-red-700 border-red-200";
      case "alta": return "bg-orange-100 text-orange-700 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };
  
  // Extraer nombre de autor de forma segura asumiendo que el backend lo pobla (populate)
  const authorData: any = item.usuario_id;
  const authorName = authorData && typeof authorData === 'object' && authorData.nombre 
    ? `${authorData.nombre} ${authorData.apellido || ''}`.trim()
    : "Administración";

  return (
    <Pressable onPress={onPress} className="w-[320px] mx-2.5 active:opacity-90">
      <View className="border border-neutral-100 rounded-3xl p-5 bg-white shadow-sm elevation-2 min-h-[190px] h-[190px] flex-col justify-between">
        <View className="flex-1 overflow-hidden">
          {/* Header: Priority & Date */}
          <View className="flex-row justify-between items-center mb-3">
            <View className={`px-2.5 py-1 rounded-full border ${getPriorityColor(String(item.prioridad))}`}>
              <Text className="text-[10px] font-bold uppercase tracking-wider">
                {String(item.prioridad)}
              </Text>
            </View>
            <Text className="text-xs text-neutral-400 font-medium">{dateLabel}</Text>
          </View>

          {/* Content */}
          <Text className="text-t1 mb-1.5 leading-tight" numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text className="text-b1 leading-relaxed" numberOfLines={3}>
            {item.contenido}
          </Text>
        </View>

        {/* Footer: Author Info */}
        <View className="flex-row items-center border-t border-neutral-100 pt-3 mt-2 h-[42px]">
          <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
            <Text className="text-blue-600 font-bold text-sm">
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-neutral-700" numberOfLines={1}>
              {authorName}
            </Text>
            <Text className="text-c1 font-medium capitalize" numberOfLines={1}>
              Administración
            </Text>
          </View>
          <View className="bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100 ml-1">
            <Text className="text-[10px] text-neutral-500 font-bold uppercase" numberOfLines={1}>
              {String(item.tipo)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
