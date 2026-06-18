import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCreateVisit } from "../hooks/useCreateVisit";
import { useVisitsStore } from "../store/visits.store";
import { VISIT_TYPES } from "../constants/visitTypes";

export default function VisitPreviewScreen() {
  const router = useSafeRouter();
  const draft = useVisitsStore((s) => s.draft);
  const { submit, loading, error } = useCreateVisit();

  const confirm = async () => {
    await submit();
    router.replace("/visits/create/qr");
  };

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Resumen" }} />
      <Text className="text-xl font-semibold mb-6 text-neutral-800">Confirma los datos</Text>

      <View className="border border-neutral-200 rounded-2xl p-4 mb-3">
        <Text className="font-semibold">Nombre</Text>
        <Text className="text-neutral-700 mt-1">{draft.nombre_visitante || "—"}</Text>

        <Text className="font-semibold mt-4">Tipo</Text>
        <Text className="text-neutral-700 mt-1 capitalize">
          {VISIT_TYPES[draft.typeKey as keyof typeof VISIT_TYPES]?.label || "Visita Autorizada"}
        </Text>

        {draft.typeKey === "vip" ? (
          <>
            <Text className="font-semibold mt-4">Vigencia</Text>
            <Text className="text-neutral-700 mt-1">
              {draft.fecha_inicio_vigencia} → {draft.fecha_fin_vigencia}
            </Text>
          </>
        ) : null}

        {draft.typeKey === "unicaVez" ? (
          <>
            <Text className="font-semibold mt-4">Fecha visita</Text>
            <Text className="text-neutral-700 mt-1">{draft.fecha_visita_unica}</Text>
          </>
        ) : null}
      </View>

      {error ? (
        <View className="p-3 rounded-xl bg-red-50 mb-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={confirm}
        disabled={loading}
        className="bg-black rounded-xl py-4 items-center"
      >
        <Text className="text-white font-semibold">
          {loading ? "Creando..." : "Confirmar"}
        </Text>
      </Pressable>
    </View>
  );
}
