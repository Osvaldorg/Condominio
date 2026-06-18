import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { visitsApi } from "../../../api/endpoints/visits.api";
import { Personal } from "../../../api/types/visits";
import { useVisitsStore } from "../store/visits.store";
import CreatePersonalModal from "../components/CreatePersonalModal";

export default function SelectPersonalScreen() {
  const router = useRouter();
  const setPersonalId = useVisitsStore((s) => s.setPersonalId);
  const setNombre = useVisitsStore((s) => s.setNombre);

  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getPersonal();
      if (res.success && res.personal) {
        setPersonalList(res.personal);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo obtener el personal registrado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
  }, []);

  const selectPersonal = (p: Personal) => {
    setPersonalId(p._id);
    setNombre(p.nombre);
    router.push("/visits/create/data");
  };

  const handleCreatedPersonal = (p: Personal) => {
    setModalVisible(false);
    setPersonalList((prev) => [p, ...prev]);
    selectPersonal(p);
  };

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Personal" }} />
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-neutral-800">Selecciona el personal</Text>
        <Pressable onPress={() => setModalVisible(true)} className="bg-neutral-100 p-2 rounded-xl">
          <MaterialCommunityIcons name="plus" size={24} color="#171717" />
        </Pressable>
      </View>

      <Text className="text-neutral-500 mb-6 text-sm">
        Elige personal de servicio registrado previamente o agrega uno nuevo.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#171717" className="mt-10" />
      ) : (
        <FlatList
          data={personalList}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-10">
              <MaterialCommunityIcons name="account-group-outline" size={48} color="#D4D4D8" />
              <Text className="text-neutral-500 mt-4 text-center">
                No hay personal registrado aún.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectPersonal(item)}
              className="flex-row items-center border border-neutral-200 rounded-2xl p-4 mb-3"
            >
              <View className="w-12 h-12 bg-neutral-100 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons name="badge-account-outline" size={24} color="#52525B" />
              </View>
              <View className="flex-1 border-r border-transparent">
                <Text className="font-semibold text-neutral-900 text-base" numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text className="text-neutral-500 text-sm mt-0.5" numberOfLines={1}>
                  {item.tipo_servicio}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#A1A1AA" />
            </Pressable>
          )}
        />
      )}

      <CreatePersonalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={handleCreatedPersonal}
      />
    </View>
  );
}
