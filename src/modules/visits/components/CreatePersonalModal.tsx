import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { visitsApi } from "../../../api/endpoints/visits.api";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (personal: any) => void;
};

export default function CreatePersonalModal({ visible, onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [servicio, setServicio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = nombre.trim() !== "" && servicio.trim() !== "";

  const submit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await visitsApi.createPersonal({
        nombre: nombre.trim(),
        tipo_servicio: servicio.trim(),
        telefono: telefono.trim(),
      });
      if (res.success) {
        onCreated(res.personal);
        setNombre("");
        setServicio("");
        setTelefono("");
      } else {
        Alert.alert("Error", res.message || "No se pudo crear el personal");
      }
    } catch (error: any) {
        // En caso de error que no tiene respuesta estándar
        console.error("Error completo CreatePersonalModal", error);
        if (error.response?.data?.message) {
             Alert.alert("Error", error.response?.data?.message);
        } else {
             Alert.alert("Error", "Ocurrió un error al crear al personal.");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl pt-6 px-5 pb-10 max-h-[90%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold">Nuevo Personal</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2">
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>
          
          <KeyboardAwareScrollView 
            bottomOffset={62}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-sm font-semibold mb-2 text-neutral-800">Nombre completo *</Text>
            <TextInput
                className="border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900"
                placeholder="Ej. María López"
                value={nombre}
                onChangeText={setNombre}
            />

            <Text className="text-sm font-semibold mb-2 text-neutral-800">Puesto / Servicio *</Text>
            <TextInput
                className="border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900"
                placeholder="Ej. Limpieza, Jardinería, Niñera"
                value={servicio}
                onChangeText={setServicio}
            />

            <Text className="text-sm font-semibold mb-2 text-neutral-800">Teléfono (Opcional)</Text>
            <TextInput
                className="border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900"
                placeholder="Ej. 5512345678"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
            />

            <Pressable
                disabled={!isValid || loading}
                onPress={submit}
                className={`rounded-2xl py-4 items-center flex-row justify-center mt-2 ${
                isValid ? "bg-black shadow-sm" : "bg-neutral-300"
                }`}
            >
                {loading ? (
                  <ActivityIndicator color="white" className="mr-2" size="small" />
                ) : null}
                <Text className={`font-semibold ${isValid ? "text-white" : "text-neutral-600"}`}>
                {loading ? "Guardando..." : "Guardar Personal"}
                </Text>
            </Pressable>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}
