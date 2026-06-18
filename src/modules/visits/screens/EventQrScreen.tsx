import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useVisitsStore } from "../store/visits.store";
import { shareQrImage } from "../../../utils/shareUtils";

export default function EventQrScreen() {
  const router = useSafeRouter();
  const generated = useVisitsStore((s) => s.generated);
  const resetDraft = useVisitsStore((s) => s.resetDraft);

  if (!generated) {
    return (
      <View className="flex-1 bg-white pt-14 px-5">
        <Text className="text-lg font-semibold">No hay evento generado</Text>
        <Pressable onPress={() => router.replace("/(tabs)/home/events")} className="mt-4">
          <Text className="text-black">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const raw = generated.qr_code ?? "";
  const qrUri = raw
    ? raw.startsWith("data:image")
      ? raw
      : `data:image/png;base64,${raw}`
    : null;

  const onShare = async () => {
    const textTemplate = `🎉 ¡Estás invitado! 🎉\nEvento: *${generated.nombre_visitante}*\n\nPor favor, guarda la imagen adjunta a este mensaje. Deberás presentar el Código QR en la entrada para que el personal de seguridad te permita el acceso.\n\n¡Nos vemos pronto!`;

    await shareQrImage(generated.qr_code, textTemplate);
  };

  const finish = () => {
    resetDraft();
    router.replace("/(tabs)/home/events");
  };

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Código compartido" }} />
      <Text className="text-xl font-semibold mb-4 text-neutral-800">Invitación al evento</Text>

      <View className="border border-neutral-200 rounded-2xl p-4 mb-4">
        <Text className="font-semibold text-lg">{generated.nombre_visitante}</Text>
        <Text className="text-neutral-600 mt-1 pb-3">QR Compartido</Text>

        {qrUri ? (
          <View className="items-center mt-4">
            <Image source={{ uri: qrUri }} style={{ width: 220, height: 220 }} />
          </View>
        ) : (
          <Text className="text-neutral-600 mt-4 text-center py-10">QR no disponible aún. Revísalo en tu historial de eventos.</Text>
        )}
      </View>

      <Text className="text-center text-sm text-neutral-500 mb-6">
        Este QR es de {generated.limite_ingresos === 0 ? "uso ilimitado" : `hasta ${generated.limite_ingresos} ingresos`}.
      </Text>

      <Pressable onPress={onShare} className="bg-neutral-100 rounded-xl py-4 items-center mb-3">
        <Text className="font-semibold text-neutral-900">Compartir QR</Text>
      </Pressable>

      <Pressable onPress={finish} className="bg-black rounded-xl py-4 items-center">
        <Text className="text-white font-semibold">Finalizar y volver a Eventos</Text>
      </Pressable>
    </View>
  );
}
