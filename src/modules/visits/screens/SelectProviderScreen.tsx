import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { visitsApi } from "../../../api/endpoints/visits.api";
import { Provider } from "../../../api/types/visits";
import { useVisitsStore } from "../store/visits.store";
import CreateProviderModal from "../components/CreateProviderModal";

export default function SelectProviderScreen() {
  const router = useRouter();
  const setProveedorId = useVisitsStore((s) => s.setProveedorId);
  const setNombre = useVisitsStore((s) => s.setNombre);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getProviders();
      if (res.success) {
        setProviders(res.proveedores);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudieron obtener los proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const selectProvider = (p: Provider) => {
    setProveedorId(p._id);
    setNombre(p.nombre);
    router.push("/visits/create/data");
  };

  const handleCreatedProvider = (p: Provider) => {
    setModalVisible(false);
    // Add to list or just select it directly
    setProviders((prev) => [p, ...prev]);
    selectProvider(p);
  };

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Proveedores" }} />
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-neutral-800">Selecciona el proveedor</Text>
        <Pressable onPress={() => setModalVisible(true)} className="bg-neutral-100 p-2 rounded-xl">
          <MaterialCommunityIcons name="plus" size={24} color="#171717" />
        </Pressable>
      </View>

      <Text className="text-neutral-500 mb-6 text-sm">
        Elige un proveedor frecuente o crea uno nuevo para tu visita.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#171717" className="mt-10" />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10">
              <MaterialCommunityIcons name="toolbox-outline" size={48} color="#D4D4D8" />
              <Text className="text-neutral-500 mt-4 text-center">
                No hay proveedores registrados aún.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectProvider(item)}
              className="flex-row items-center border border-neutral-200 rounded-2xl p-4 mb-3"
            >
              <View className="w-12 h-12 bg-neutral-100 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons name="briefcase-outline" size={24} color="#52525B" />
              </View>
              <View className="flex-1 border-r border-transparent">
                <Text className="font-semibold text-neutral-900 text-base" numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text className="text-neutral-500 text-sm mt-0.5" numberOfLines={1}>
                  {item.servicio} {item.empresa ? `• ${item.empresa}` : ""}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#A1A1AA" />
            </Pressable>
          )}
        />
      )}

      <CreateProviderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={handleCreatedProvider}
      />
    </View>
  );
}
