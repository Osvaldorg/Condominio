import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { VISIT_TYPES, VisitTypeKey } from "../constants/visitTypes";
import { useVisitsStore } from "../store/visits.store";
import { visitsApi } from "../../../api/endpoints/visits.api";

export default function VisitTypeScreen() {
  const router = useSafeRouter();
  const setType = useVisitsStore((s) => s.setType);
  
  const [dbTypes, setDbTypes] = useState<{ _id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const res = await visitsApi.getVisitTypes();
      if (res.success && res.tipos) {
        setDbTypes(res.tipos);
      }
    } catch (e) {
      console.error("Error al cargar tipos de visita:", e);
      Alert.alert("Error", "No se pudieron cargar los tipos de visita, verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const choose = (key: VisitTypeKey) => {
    const targetName = VISIT_TYPES[key].nombre;
    const foundType = dbTypes.find(t => t.nombre === targetName);
    
    if (!foundType) {
      Alert.alert("Error interno", `El tipo de visita '${targetName}' no está registrado en el sistema base de datos.`);
      return;
    }

    setType(key, foundType._id);
    
    if (key === "proveedor") {
      router.push("/visits/create/provider");
    } else if (key === "personal") {
      router.push("/visits/create/personal");
    } else if (key === "evento") {
      router.push("/visits/create/event-data");
    } else {
      router.push("/visits/create/data");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-500">Cargando tipos de visita...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Nuevo acceso" }} />
      <Text className="text-xl font-semibold mb-4 text-neutral-800">Selecciona el tipo de acceso</Text>

      <Pressable
        onPress={() => choose("vip")}
        className="rounded-2xl border border-neutral-200 p-4 mb-3"
      >
        <Text className="font-semibold">{VISIT_TYPES.vip.label}</Text>
        <Text className="text-neutral-600 mt-1">Acceso con vigencia (inicio/fin)</Text>
      </Pressable>

      <Pressable
        onPress={() => choose("unicaVez")}
        className="rounded-2xl border border-neutral-200 p-4 mb-3"
      >
        <Text className="font-semibold">{VISIT_TYPES.unicaVez.label}</Text>
        <Text className="text-neutral-600 mt-1">Acceso solo para una fecha</Text>
      </Pressable>

      <Pressable
        onPress={() => choose("proveedor")}
        className="rounded-2xl border border-neutral-200 p-4 mb-3"
      >
        <Text className="font-semibold">{VISIT_TYPES.proveedor.label}</Text>
        <Text className="text-neutral-600 mt-1">Acceso para técnicos y servicios</Text>
      </Pressable>

      <Pressable
        onPress={() => choose("personal")}
        className="rounded-2xl border border-neutral-200 p-4 mb-3"
      >
        <Text className="font-semibold">{VISIT_TYPES.personal.label}</Text>
        <Text className="text-neutral-600 mt-1">Acceso permanente o recurrente para personal</Text>
      </Pressable>

      <Pressable
        onPress={() => choose("evento")}
        className="rounded-2xl bg-black p-4 shadow-sm"
      >
        <Text className="font-semibold text-white">{VISIT_TYPES.evento.label}</Text>
        <Text className="text-neutral-400 mt-1">Crea un QR compartido para fiestas y reuniones</Text>
      </Pressable>
    </View>
  );
}
