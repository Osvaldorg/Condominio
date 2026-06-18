import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View, Alert } from "react-native";
import { eventsApi } from "../../../api/endpoints/events.api";
import { Evento } from "../../../api/types/events";
import { shareQrImage } from "../../../utils/shareUtils";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [capacidad, setCapacidad] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const res = await eventsApi.getEventById(id as string);
      if (res.success) {
        setEvento(res.evento);
        setCapacidad(res.capacidad);
      }
    } catch (error) {
      console.log("Error cargando evento", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!evento?.codigo_qr_evento) return;
    const textTemplate = `🎉 ¡Estás invitado! 🎉\nEvento: *${evento.nombre_evento}*\nUbicación: ${evento.ubicacion || "Área asignada"}\n\nPor favor, guarda la imagen adjunta a este mensaje. Deberás presentar el Código QR en la entrada para que el personal de seguridad te permita el acceso.\n\n¡Nos vemos pronto!`;
    
    await shareQrImage(evento.codigo_qr_evento, textTemplate);
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancelar evento",
      "¿Estás seguro que deseas cancelar este evento? Todos los códigos generados serán anulados permanentemente.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, cancelar", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await eventsApi.cancelEvent(id as string, "Cancelado desde la aplicación móvil");
              if (res.success) {
                Alert.alert("Evento Cancelado", "El evento y sus accesos han sido revocados existosamente.", [
                  { text: "OK", onPress: () => router.back() }
                ]);
              }
            } catch (error: any) {
              Alert.alert("Error", error?.response?.data?.message || "Hubo un problema procesando la cancelación.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!evento) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Stack.Screen options={{ title: "Detalle del evento" }} />
        <Text className="text-lg font-bold">Evento no encontrado</Text>
        <Pressable className="mt-4 px-4 py-2 bg-neutral-200 rounded-lg" onPress={() => router.back()}>
          <Text className="font-semibold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const raw = evento.codigo_qr_evento ?? "";
  const qrUri = raw
    ? raw.startsWith("data:image")
      ? raw
      : `data:image/png;base64,${raw}`
    : null;

  const formatDate = (ds?: string | null) => {
    if (!ds) return "—";
    return ds.split("T")[0].replace(/-/g, "/");
  };

  const isVencido = new Date() > new Date(evento.fecha_fin);
  const isCanceled = evento.estatus === "cancelado";
  const isInactive = isCanceled || isVencido;

  return (
    <>
      <Stack.Screen options={{ title: "Detalle del evento" }} />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      {/* Header Options */}
      <View className="flex-row justify-end mt-4 mb-6">
        {!isInactive && (
          <Pressable 
            onPress={handleCancel}
            className="px-4 py-2 bg-red-100 rounded-lg"
          >
            <Text className="text-red-700 font-semibold">Cancelar Evento</Text>
          </Pressable>
        )}
      </View>

      {/* Main Info */}
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-center mb-2">{evento.nombre_evento}</Text>
        {isCanceled ? (
          <View className="px-3 py-1 bg-red-50 border border-red-100 rounded-full">
            <Text className="text-sm font-medium uppercase tracking-widest text-red-700">
              Evento Cancelado
            </Text>
          </View>
        ) : isVencido ? (
          <View className="px-3 py-1 bg-red-50 border border-red-100 rounded-full">
            <Text className="text-sm font-medium uppercase tracking-widest text-red-700">
              Evento Vencido
            </Text>
          </View>
        ) : (
          <View className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
            <Text className="text-sm font-medium uppercase tracking-widest text-indigo-700">
              Evento Compartido
            </Text>
          </View>
        )}
      </View>

      {/* QR Code Section */}
      {!isInactive && (
        <View className="items-center bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm mb-6">
          {qrUri ? (
            <Image
              source={{ uri: qrUri }}
              className="w-56 h-56 rounded-xl"
              resizeMode="contain"
            />
          ) : (
            <View className="h-56 w-56 bg-neutral-100 items-center justify-center rounded-xl">
              <Text className="text-neutral-500 text-center">QR no disponible</Text>
            </View>
          )}
          <Text className="mt-4 text-center text-sm text-neutral-500 max-w-[200px]">
            Muestra/comparte este código con tus invitados.
          </Text>
        </View>
      )}

      {/* Acciones */}
      {qrUri && !isInactive && (
        <Pressable 
          onPress={handleShare}
          className="bg-indigo-600 rounded-xl py-4 items-center mb-8 shadow-sm flex-row justify-center space-x-2"
        >
          <Text className="font-bold text-white text-base">Compartir QR</Text>
        </Pressable>
      )}

      {/* Details List */}
      <View className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 mb-10">
        <Text className="font-semibold text-lg mb-4">Detalles del acceso</Text>

        <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
          <Text className="text-neutral-500">Capacidad</Text>
          <Text className="font-medium text-right">{capacidad}</Text>
        </View>

        <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
          <Text className="text-neutral-500">Vigencia</Text>
          <Text className="font-medium text-right">
            {`${formatDate(evento.fecha_inicio)} a ${formatDate(evento.fecha_fin)}`}
          </Text>
        </View>

        <View className="flex-row justify-between mb-3 border-b border-neutral-200 pb-3">
           <Text className="text-neutral-500">Ubicación</Text>
           <Text className="font-medium text-right max-w-[150px]">{evento.ubicacion || "No especificada"}</Text>
        </View>

        {evento.descripcion ? (
          <View className="flex-row justify-between mt-1">
             <Text className="text-neutral-500 w-1/3">Descripción</Text>
             <Text className="font-medium text-right w-2/3">{evento.descripcion}</Text>
          </View>
        ) : null}
      </View>

      </ScrollView>
    </>
  );
}
