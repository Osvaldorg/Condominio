import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useVisitsStore } from "../store/visits.store";
import { shareQrImage } from "../../../utils/shareUtils";

export default function VisitQrScreen() {
  const router = useSafeRouter();
  const generated = useVisitsStore((s) => s.generated);
  const resetDraft = useVisitsStore((s) => s.resetDraft);

  if (!generated) {
    return (
      <View className="flex-1 bg-white pt-14 px-5">
        <Text className="text-lg font-semibold">No hay visita generada</Text>
        <Pressable onPress={() => router.replace("/(tabs)/visits")} className="mt-4">
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
    const textTemplate = `¡Hola! 👋\nEsta es una invitación de acceso para: *${generated.nombre_visitante}*.\n\nPor favor muestra este Código QR en la caseta del condominio para registrar tu ingreso.\nTu código de acceso manual (en caso de que el QR no lea) es: *${generated.codigo_acceso ?? "N/A"}*.\n\n¡Te esperamos!`;
    
    await shareQrImage(generated.qr_code, textTemplate);
  };

  const finish = () => {
    resetDraft();
    router.replace("/(tabs)/visits");
  };

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Código de acceso" }} />
      <Text className="text-xl font-semibold mb-4 text-neutral-800">Cortesía de acceso</Text>

      <View className="border border-neutral-200 rounded-2xl p-4 mb-4">
        <Text className="font-semibold">{generated.nombre_visitante}</Text>
        <Text className="text-neutral-600 mt-1">Código: {generated.codigo_acceso ?? "—"}</Text>

        {qrUri ? (
          <View className="items-center mt-4">
            <Image source={{ uri: qrUri }} style={{ width: 220, height: 220 }} />
          </View>
        ) : (
          <Text className="text-neutral-600 mt-4">QR no disponible</Text>
        )}
      </View>

      <Pressable onPress={onShare} className="bg-neutral-100 rounded-xl py-4 items-center mb-3">
        <Text className="font-semibold">Compartir</Text>
      </Pressable>

      <Pressable onPress={finish} className="bg-black rounded-xl py-4 items-center">
        <Text className="text-white font-semibold">Finalizar</Text>
      </Pressable>
    </View>
  );
}
