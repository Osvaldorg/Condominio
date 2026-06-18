import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFinances } from "../hooks/useFinances";
import { useState } from "react";
import { api } from "../../../api/client";
import { PaymentForm } from "../components/PaymentForm";
import { usePaymentForm } from "../hooks/usePaymentForm";

export default function RegisterPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pendingCharges, bankAccounts, fetchFinances } = useFinances();
  const { values, setField, buildFormData } = usePaymentForm();
  const [uploading, setUploading] = useState(false);

  const charge = pendingCharges.find((c) => c.id === id);

  if (!charge) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-5">
        <Stack.Screen options={{ title: "Registrar pago" }} />
        <Text className="text-lg text-neutral-500 mb-4">Cuota no encontrada</Text>
        <Pressable onPress={() => router.back()} className="bg-black px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const submitPayment = async () => {
    if (!values.file) {
      Alert.alert("Comprobante requerido", "Debes seleccionar un comprobante de pago.");
      return;
    }
    setUploading(true);
    try {
      const formData = buildFormData();
      // Campos específicos de este flujo (no viven en PaymentForm)
      formData.append("cargo_domicilio_id", charge.id);
      formData.append("monto_total", charge.saldo_pendiente.toString());

      const res = await api.post("/finances/resident/upload-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        await fetchFinances();
        Alert.alert(
          "¡Comprobante enviado!",
          "Tu pago fue registrado y está pendiente de revisión.",
          [{ text: "Ver mis pagos", onPress: () => router.replace("/(tabs)/payments") }]
        );
      }
    } catch (e: any) {
      const backendMsg = e.response?.data?.message;
      const backendErrors = e.response?.data?.errors;
      // Log detallado para depuración
      console.error("[RegisterPayment] Error:", {
        status: e.response?.status,
        message: backendMsg,
        errors: backendErrors,
        raw: e.response?.data,
      });
      const displayMsg = backendErrors?.length
        ? backendErrors.join("\n")
        : backendMsg || "Ocurrió un error al subir el comprobante.";
      Alert.alert("Error", displayMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Registrar pago", headerBackTitle: "Atrás" }} />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Resumen del cargo */}
        <View className="bg-neutral-50 rounded-2xl p-5 mb-6 border border-neutral-100">
          <Text className="text-center font-semibold text-neutral-600 text-sm mb-1">
            Monto a pagar
          </Text>
          <Text className="text-center font-bold text-neutral-900 text-3xl">
            {formatCurrency(charge.saldo_pendiente)}
          </Text>
          <Text className="text-center text-neutral-500 text-sm mt-1">{charge.nombre}</Text>
        </View>

        {/* Formulario compartido */}
        <PaymentForm
          values={values}
          onChange={setField}
          bankAccounts={bankAccounts}
          disabled={uploading}
        />

        <Text className="text-xs text-neutral-400 text-center mb-8">
          Tu comprobante será revisado por la administración en un plazo de 24 a 48 horas hábiles.
        </Text>
      </ScrollView>

      {/* Botón enviar */}
      <View className="px-5 py-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={submitPayment}
          disabled={uploading}
          className={`py-4 rounded-2xl items-center flex-row justify-center ${
            uploading ? "bg-neutral-400" : "bg-black active:bg-neutral-800 shadow-sm"
          }`}
        >
          {uploading ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-base ml-2">Enviando...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">Enviar comprobante</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
