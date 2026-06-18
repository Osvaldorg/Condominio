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
import { useEffect, useState } from "react";
import { useRetryPayment } from "../hooks/useRetryPayment";
import { useFinances } from "../hooks/useFinances";
import { usePaymentForm } from "../hooks/usePaymentForm";
import { PaymentForm } from "../components/PaymentForm";
import type { MetodoPago } from "../../../api/types/finances";

/**
 * RetryPaymentScreen
 *
 * Permite al residente corregir y reenviar un comprobante rechazado.
 * Pre-llena el formulario con los datos del intento anterior vía prefill().
 * La lógica visual del formulario vive en <PaymentForm />.
 */
export default function RetryPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { comprobante, loading, submitting, error, loadComprobante, resubmit } =
    useRetryPayment();
  const { bankAccounts, fetchFinances } = useFinances();
  const { values, setField, prefill, buildFormData } = usePaymentForm();

  // ── Cargar comprobante rechazado al montar ────────────────────────────────
  useEffect(() => {
    if (id) loadComprobante(id);
  }, [id]);

  // Pre-llenar el formulario cuando llegan los datos del comprobante
  useEffect(() => {
    if (!comprobante) return;
    const VALID_METHODS: MetodoPago[] = [
      "transferencia", "deposito", "efectivo", "tarjeta", "cheque",
    ];
    prefill({
      metodoPago: VALID_METHODS.includes(comprobante.metodo_pago as MetodoPago)
        ? (comprobante.metodo_pago as MetodoPago)
        : "transferencia",
      fechaPago: comprobante.fecha_pago ? new Date(comprobante.fecha_pago) : new Date(),
      institucion: comprobante.institucion_bancaria ?? "",
      referencia: comprobante.numero_referencia ?? "",
      cuentaDestino: comprobante.cuenta_destino ?? "",
      observaciones: comprobante.observaciones ?? "",
    });
  }, [comprobante]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const handleSubmit = async () => {
    if (!values.file) {
      Alert.alert("Comprobante requerido", "Debes seleccionar un nuevo comprobante de pago.");
      return;
    }
    const formData = buildFormData();
    const success = await resubmit(id, formData);
    if (success) {
      await fetchFinances();
      Alert.alert(
        "Comprobante reenviado",
        "Tu comprobante está de nuevo en revisión. Recibirás una notificación cuando sea procesado.",
        [{ text: "Ver mis pagos", onPress: () => router.replace("/(tabs)/payments") }]
      );
    }
  };

  // ── Estados de carga / error fatal ───────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-neutral-500 mt-3 font-medium">Cargando datos...</Text>
      </View>
    );
  }

  if (!comprobante && error) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-5">
        <Stack.Screen options={{ title: "Reintentar pago" }} />
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-neutral-700 text-base font-semibold mt-3 text-center">{error}</Text>
        <Pressable onPress={() => router.back()} className="mt-6 bg-black px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Regresar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Reintentar pago" }} />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>

        {/* Banner motivo de rechazo */}
        {comprobante?.motivo_rechazo && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-start">
            <MaterialCommunityIcons name="close-circle" size={20} color="#DC2626" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-red-800 font-semibold text-sm mb-1">Motivo de rechazo</Text>
              <Text className="text-red-700 text-sm">{comprobante.motivo_rechazo}</Text>
            </View>
          </View>
        )}

        {/* Resumen del cargo */}
        {comprobante && (
          <View className="bg-neutral-50 rounded-2xl p-5 mb-6 border border-neutral-100">
            <Text className="text-center font-semibold text-neutral-600 text-sm mb-1">
              Monto a pagar
            </Text>
            <Text className="text-center font-bold text-neutral-900 text-3xl">
              {formatCurrency(comprobante.monto_total)}
            </Text>
            <Text className="text-center text-neutral-500 text-sm mt-1">
              {comprobante.cargo?.nombre ?? "Cuota de mantenimiento"}
            </Text>
            <View className="mt-4 pt-4 border-t border-neutral-200 flex-row justify-between">
              <Text className="text-neutral-500 text-xs">Folio original</Text>
              <Text className="text-neutral-700 text-xs font-medium">{comprobante.folio}</Text>
            </View>
          </View>
        )}

        {/* Formulario compartido */}
        <PaymentForm
          values={values}
          onChange={setField}
          bankAccounts={bankAccounts}
          disabled={submitting}
        />

        {/* Error de envío */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-red-700 text-sm text-center">{error}</Text>
          </View>
        )}

        <Text className="text-xs text-neutral-400 text-center mb-8">
          Tu comprobante será revisado por la administración en un plazo de 24 a 48 horas hábiles.
        </Text>
      </ScrollView>

      {/* Botón de envío */}
      <View className="px-5 py-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`py-4 rounded-2xl items-center flex-row justify-center ${
            submitting ? "bg-neutral-400" : "bg-black active:bg-neutral-800 shadow-sm"
          }`}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-base ml-2">Enviando...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">Reenviar comprobante</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
