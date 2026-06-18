import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text, RefreshControl, Pressable } from "react-native";
import { useSafeRouter } from "../../../hooks/useSafeRouter";

import { usePackages } from "../hooks/usePackages";
import { PackageCard } from "../components/PackageCard";
import { PackageListEmpty } from "../components/PackageListEmpty";
import { PackageStatus } from "../../../api/types/packages";

type FilterTab = {
  id: PackageStatus | "all";
  label: string;
};

const FILTERS: FilterTab[] = [
  { id: "all", label: "Todos" },
  { id: "por_retirar", label: "Por retirar" },
  { id: "retirado", label: "Entregados" },
];

export function PackagesScreen() {
  const router = useSafeRouter();
  const [activeFilter, setActiveFilter] = useState<PackageStatus | "all">("all");
  
  const { 
    packages, 
    loading, 
    error, 
    isRefreshing, 
    isFetchingMore, 
    refresh, 
    fetchMore, 
    fetchInitial 
  } = usePackages(activeFilter === "all" ? undefined : activeFilter);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial, activeFilter]);

  const handlePressPackage = (id: string) => {
    router.push(`/home/packages/${id}`);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="bg-white pt-2 pb-3 px-4 border-b border-neutral-100 mb-3 shadow-sm z-10">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.id;
            return (
              <Pressable
                onPress={() => setActiveFilter(item.id)}
                className={`px-4 py-2 rounded-full border ${
                  isActive 
                    ? "bg-neutral-800 border-neutral-800" 
                    : "bg-white border-neutral-200"
                }`}
              >
                <Text 
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-neutral-600"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8, flexGrow: 1 }}
        renderItem={({ item }) => (
          <PackageCard 
            item={item} 
            onPress={() => handlePressPackage(item._id)} 
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading && !isRefreshing ? (
            <ActivityIndicator size="large" color="#1F2937" className="mt-10" />
          ) : (
            <PackageListEmpty />
          )
        }
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="small" color="#1F2937" className="my-4" />
          ) : null
        }
      />
    </View>
  );
}
