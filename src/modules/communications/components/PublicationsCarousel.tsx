import { useSafeRouter } from "../../../hooks/useSafeRouter";

import { useEffect } from "react";
import { FlatList, RefreshControl, Text, View, Dimensions } from "react-native";
import { usePublications } from "../hooks/usePublications";
import { PublicationCard } from "./PublicationCard";

// Para el efecto de paginación (snap), tomamos el ancho declarado de la tarjeta (w-[320px] -> 320) + márgenes laterales (mx-2.5 -> 10*2 = 20)
const CARD_WIDTH_WITH_MARGIN = 340; 

export function PublicationsCarousel() {
  const router = useSafeRouter();
  const { items, loading, error, fetchList, refresh } = usePublications();

  useEffect(() => {
    if (items.length === 0) fetchList(1);
  }, [items.length, fetchList]);

  if (error) {
    return (
      <View className="px-5">
        <Text className="text-sm text-red-600">{error}</Text>
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View className="px-5">
        <Text className="text-sm text-neutral-500">No hay boletines por el momento.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i._id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
      snapToInterval={CARD_WIDTH_WITH_MARGIN}
      snapToAlignment="start"
      decelerationRate="fast"
      renderItem={({ item }) => (
        <PublicationCard
          item={item}
          onPress={() =>
            router.push({
              pathname: "/home/publications/[id]",
              params: { id: item._id },
            })
          }
        />
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    />
  );
}
