import { useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, Image } from "react-native";
import { visitsApi } from "../../../api/endpoints/visits.api";
import type { Authorization } from "../../../api/types/visits";
import { shareQrImage } from "../../../utils/shareUtils";
import { getVisitTypeLabel } from "../utils/visitFormatters";

export default function VisitDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [auth, setAuth] = useState<Authorization | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await visitsApi.getAuthorizationById(id);
      if (res.success) {
        setAuth(res.autorizacion);
      } else {
        setError("No se pudo cargar la visita.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = () => {
    Alert.alert(
      "Cancelar visita",
      "¿Estás seguro que deseas cancelar esta visita? El código QR dejará de ser válido.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setCanceling(true);
            try {
              const res = await visitsApi.cancelAuthorization(id, "Cancelada por el residente");
              if (res.success) {
                Alert.alert("Éxito", "Visita cancelada", [
                  { text: "OK", onPress: () => router.back() }
                ]);
              } else {
                throw new Error("No se pudo cancelar.");
              }
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "No se pudo cancelar la visita.");
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!auth?.qr_code) return;

    const backendKey = auth.tipo_visita_id?.nombre;
    const authType = auth.es_evento ? "Evento" : getVisitTypeLabel(backendKey);
                   
    const resolvedName = auth.nombre_visitante 
                   || auth.proveedor_id?.nombre 
                   || auth.personal_id?.nombre 
                   || "Visita Registrada";
    
    const textTemplate = `¡Hola! 👋\nEsta es una invitación para: *${authType}*\nVisitante: *${resolvedName}*\n\nPor favor muestra la Imagen de Código QR anexa en la caseta del condominio para registrar tu ingreso.\nTu código de acceso manual de respaldo es: *${auth.codigo_acceso ?? "N/A"}*.\n\n¡Te esperamos!`;

    await shareQrImage(auth.qr_code, textTemplate);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !auth) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Stack.Screen options={{ title: "Detalle de Visita", headerBackTitle: "Atrás" }} />
        <Text className="text-red-500 text-center">{error}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-neutral-200 rounded-lg">
          <Text>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const isActive = auth.estado === "activa" || auth.estado === "pendiente";
  const formatDate = (ds?: string | null) => {
    if (!ds) return "—";
    return ds.split("T")[0].replace(/-/g, "/");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Detalle de Visita", headerBackTitle: "Atrás" }} />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
        {/* Header Options */}
        <View className="flex-row items-center justify-end mb-6">

        {isActive && (
          <Pressable 
            disabled={canceling}
            onPress={handleCancel}
            className="px-4 py-2 bg-red-100 rounded-lg"
          >
            <Text className="text-red-700 font-semibold">{canceling ? "Cancelando..." : "Cancelar Visita"}</Text>
          </Pressable>
        )}
      </View>

      {/* Main Info */}
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-center mb-2">
          {auth.nombre_visitante 
           || auth.proveedor_id?.nombre 
           || auth.personal_id?.nombre 
           || "Visita Registrada"}
        </Text>
        <View className="px-3 py-1 bg-neutral-100 rounded-full">
          <Text className="text-sm font-medium uppercase tracking-widest text-neutral-600">
            {auth.estado}
          </Text>
        </View>
      </View>

      {/* QR Code Section */}
      {isActive && auth.qr_code && (
        <View className="items-center bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm mb-8">
          <Image
            source={{ uri: auth.qr_code }}
            className="w-56 h-56 rounded-xl"
            resizeMode="contain"
          />
          <Text className="mt-4 text-center text-sm text-neutral-500 max-w-[200px]">
            Comparte este código QR con el visitante
          </Text>
          {auth.codigo_acceso && (
            <View className="mt-4 pt-4 border-t border-neutral-200 w-full items-center">
              <Text className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Código de Texto</Text>
              <Text className="text-xl font-mono font-bold tracking-[0.2em]">{auth.codigo_acceso}</Text>
            </View>
          )}
        </View>
      )}

      {/* Share Button */}
      {isActive && auth.qr_code && (
        <Pressable 
          onPress={handleShare}
          className="bg-indigo-600 rounded-xl py-4 items-center mb-8 shadow-sm flex-row justify-center space-x-2"
        >
          <Text className="font-bold text-white text-base">Compartir Imagen QR</Text>
        </Pressable>
      )}

      {/* Details List */}
      <View className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
        <Text className="font-semibold text-lg mb-4">Detalles del acceso</Text>

        <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
          <Text className="text-neutral-500">Tipo</Text>
          <Text className="font-medium text-right capitalize">
            {auth.es_evento ? "Evento" : getVisitTypeLabel(auth.tipo_visita_id?.nombre)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
          <Text className="text-neutral-500">Vigencia</Text>
          <Text className="font-medium text-right">
            {auth.es_visita_unica 
              ? formatDate(auth.fecha_visita_unica) 
              : `${formatDate(auth.fecha_inicio_vigencia)} a ${formatDate(auth.fecha_fin_vigencia)}`}
          </Text>
        </View>

        {!auth.es_visita_unica && (
          <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
            <Text className="text-neutral-500">Accesos</Text>
            <Text className="font-medium text-right">
              {auth.accesos_ilimitados ? "Ilimitados" : "1"}
            </Text>
          </View>
        )}

      </View>

      </ScrollView>
    </>
  );
}
