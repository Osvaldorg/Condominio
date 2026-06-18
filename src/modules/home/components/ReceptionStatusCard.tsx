import React, { useState, useEffect } from "react";
import { View, Text, Switch, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../../api/client";
import { useAuthStore } from "../../auth/store/auth.store";

interface ReceptionStatus {
  recibiendo_visitas: boolean;
  recibiendo_personal: boolean;
}

export function ReceptionStatusCard() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<ReceptionStatus>({
    recibiendo_visitas: true,
    recibiendo_personal: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReceptionStatus();
  }, []);

  const fetchReceptionStatus = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/residents/mobile/reception-status/${user.id}`);
      if (data.success && data.estado_recepcion) {
        setStatus({
          recibiendo_visitas: data.estado_recepcion.recibiendo_visitas,
          recibiendo_personal: data.estado_recepcion.recibiendo_personal,
        });
      }
    } catch (error) {
      console.error("Error al obtener estado de recepción:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (field: keyof ReceptionStatus, newValue: boolean) => {
    try {
      setIsUpdating(true);
      // Optimistic update
      setStatus((prev) => ({ ...prev, [field]: newValue }));

      const payload = { [field]: newValue };
      const { data } = await api.put("/residents/mobile/reception-status", payload);
      
      if (!data.success) {
        throw new Error("No se pudo actualizar");
      }
    } catch (error) {
      console.error("Error actualizando recepción:", error);
      Alert.alert("Error", "No pudimos actualizar tu estado de recepción. Intenta nuevamente.");
      // Rollback
      setStatus((prev) => ({ ...prev, [field]: !newValue }));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View className="mx-5 mb-6 bg-white rounded-3xl p-5 shadow-sm shadow-neutral-200/50 border border-neutral-100 flex-row items-center justify-center h-40">
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  return (
    <View className="mx-5 mb-6 bg-white rounded-3xl p-5 shadow-sm shadow-neutral-200/50 border border-neutral-100">
      <View className="flex-col gap-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-col">
            <Text className="text-t1">Recibir Visitas</Text>
            <Text className="text-[13px] font-medium text-neutral-400 mt-0.5">Autoriza la entrada de visitantes</Text>
          </View>
          <Switch
            value={status.recibiendo_visitas}
            onValueChange={(val) => toggleStatus("recibiendo_visitas", val)}
            trackColor={{ false: "#E5E5E5", true: "#000000" }}
            thumbColor={"#FFFFFF"}
            disabled={isUpdating}
          />
        </View>

        <View className="h-[1px] bg-neutral-100" />

        <View className="flex-row items-center justify-between">
          <View className="flex-col">
            <Text className="text-t1">Recibir Personal</Text>
            <Text className="text-[13px] font-medium text-neutral-400 mt-0.5">Empleados domésticos o servicios</Text>
          </View>
          <Switch
            value={status.recibiendo_personal}
            onValueChange={(val) => toggleStatus("recibiendo_personal", val)}
            trackColor={{ false: "#E5E5E5", true: "#000000" }}
            thumbColor={"#FFFFFF"}
            disabled={isUpdating}
          />
        </View>
      </View>
    </View>
  );
}
