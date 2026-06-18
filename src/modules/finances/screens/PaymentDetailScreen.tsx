import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFinances } from "../hooks/useFinances";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState, useEffect } from "react";
import { ENV } from "../../../config/env";
import { getToken } from "../../../services/storage/secureStorage";

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { paymentHistory, fetchFinances, loading: financesLoading } = useFinances();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Forzar refresco de datos al montar (para capturar cambios de estatus recientes)
  useEffect(() => {
    const refreshData = async () => {
      try {
        await fetchFinances();
      } catch (error) {
        console.error("Error refreshing payment detail:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    refreshData();
  }, [id, fetchFinances]);

  const payment = paymentHistory.find(p => p._id === id);

  // Evitar el "parpadeo" de datos obsoletos: si estamos cargando inicialmente, mostramos el spinner
  // sin importar si ya hay datos en memoria local.
  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ title: "Verificando estatus..." }} />
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-5">
        <Stack.Screen options={{ title: "Detalle del pago" }} />
        <Text className="text-lg text-neutral-500 mb-4">Pago no encontrado</Text>
        <Pressable onPress={() => router.back()} className="bg-black px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const status = payment.estatus.toLowerCase();

  const handleDownloadReceipt = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No se encontró sesión iniciada.");
        return;
      }
      // @ts-ignore
      const fileUri = `${FileSystem.documentDirectory}Recibo_${payment.folio || payment._id}.pdf`;
      const downloadRes = await FileSystem.downloadAsync(
        `${ENV.API_BASE_URL}/finances/comprobantes/${payment._id}/download`,
        fileUri,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (downloadRes.status !== 200) throw new Error("No se pudo descargar el recibo.");
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Descargar Recibo",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Error", "No se puede compartir o guardar el archivo en este dispositivo.");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Alert.alert("Error", "Ocurrió un problema al intentar descargar el recibo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const conceptos =
    payment.pagos_aplicados && payment.pagos_aplicados.length > 0
      ? payment.pagos_aplicados
          .map(pago => pago.cargo?.nombre || pago.cargo_domicilio_id?.cargo_id?.nombre || "Pago a cuota")
          .join(", ")
      : payment.cargo_domicilio_id?.cargo_id?.nombre || "Pago de comprobante";

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Detalle del pago" }} />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View className="items-center mb-8">
          {status === "aprobado" && (
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
            </View>
          )}
          {status === "pendiente" && (
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons name="clock-outline" size={32} color="#F59E0B" />
            </View>
          )}
          {status === "rechazado" && (
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons name="close-circle" size={32} color="#EF4444" />
            </View>
          )}
          <Text className="text-2xl font-bold text-neutral-900 capitalize">
            {status === "aprobado"
              ? "Pago aprobado"
              : status === "pendiente"
              ? "En revisión"
              : "Pago rechazado"}
          </Text>
          <Text className="text-neutral-500 font-medium text-sm mt-1">
            {new Date(payment.fecha_pago).toLocaleDateString()}
          </Text>
        </View>

        {/* Details Card */}
        <View className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 mb-6">
          <View className="flex-row justify-between mb-4">
            <Text className="text-neutral-500">Monto</Text>
            <Text className="text-neutral-900 font-bold">{formatCurrency(payment.monto_total)}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-neutral-500">Concepto</Text>
            <Text className="text-neutral-900 font-medium w-48 text-right flex-wrap" numberOfLines={2}>
              {conceptos}
            </Text>
          </View>
          {payment.folio && (
            <View className="flex-row justify-between mb-4">
              <Text className="text-neutral-500">Referencia/Folio</Text>
              <Text className="text-neutral-900 font-medium">{payment.folio}</Text>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-neutral-500">Método de pago</Text>
            <Text className="text-neutral-900 font-medium capitalize">
              {payment.metodo_pago || "Transferencia"}
            </Text>
          </View>
        </View>

        {/* Motivo de rechazo */}
        {status === "rechazado" && (payment.motivo_rechazo || payment.observaciones) && (
          <View className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
            <Text className="text-red-800 font-semibold mb-1">Motivo de rechazo</Text>
            <Text className="text-red-700 text-sm">
              {payment.motivo_rechazo || payment.observaciones}
            </Text>
          </View>
        )}

        {/* Botón reintentar pago (solo rechazados) */}
        {status === "rechazado" && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/payments/retry-payment",
                params: { id: payment._id },
              })
            }
            className="mb-10 flex-row items-center justify-center p-4 rounded-xl bg-black active:bg-neutral-800"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Reintentar pago</Text>
          </Pressable>
        )}

        {/* Descargar recibo (solo aprobados) */}
        {status === "aprobado" && (
          <Pressable
            onPress={handleDownloadReceipt}
            disabled={isDownloading}
            className={`mt-4 mb-10 flex-row items-center justify-center p-4 rounded-xl ${
              isDownloading ? "bg-neutral-200" : "bg-black active:bg-neutral-800"
            }`}
          >
            {isDownloading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="download" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Descargar Recibo PDF</Text>
              </>
            )}
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
