import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCreateEvent } from "../hooks/useCreateEvent";

export default function EventDataScreen() {
  const router = useSafeRouter();
  const { submit, loading } = useCreateEvent();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [maxInvitados, setMaxInvitados] = useState("0");

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const isValid = nombre.trim() !== "" && fechaInicio && fechaFin && fechaFin >= fechaInicio;

  const handleCreate = async () => {
    if (!isValid) return;

    // Set end date boundary to the end of the selected day
    const end = new Date(fechaFin!);
    end.setHours(23, 59, 59, 999);

    const success = await submit({
      nombre_evento: nombre,
      descripcion,
      ubicacion,
      fecha_inicio: fechaInicio!.toISOString(),
      fecha_fin: end.toISOString(),
      max_invitados: parseInt(maxInvitados) || 0,
    });

    if (success) {
      router.push("/visits/create/event-qr");
    } else {
      Alert.alert("Error", "Ocurrió un problema creando el evento");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Evento" }} />
      <Text className="text-xl font-semibold mb-4 text-neutral-800">Detalles de la reunión</Text>

      <Text className="text-sm font-semibold mb-2">Nombre del Evento *</Text>
      <TextInput
        placeholder="Ej. Cumpleaños de Ana"
        value={nombre}
        onChangeText={setNombre}
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
      />

      <Text className="text-sm font-semibold mb-2">Descripción (opcional)</Text>
      <TextInput
        placeholder="Ej. Traer traje de baño"
        value={descripcion}
        onChangeText={setDescripcion}
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
        multiline
      />

      <Text className="text-sm font-semibold mb-2">Ubicación (opcional)</Text>
      <TextInput
        placeholder="Ej. Casa club, Asador 2"
        value={ubicacion}
        onChangeText={setUbicacion}
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
      />

      <Text className="text-sm font-semibold mb-2">Límite de Invitados</Text>
      <Text className="text-xs text-neutral-500 mb-2 -mt-1">0 significa ilimitados</Text>
      <TextInput
        placeholder="0"
        value={maxInvitados}
        onChangeText={text => setMaxInvitados(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
      />

      <Text className="text-sm font-semibold mb-2">Fecha Inicio *</Text>
      <Pressable
        onPress={() => setShowStartPicker(true)}
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
      >
        <Text className={fechaInicio ? "text-neutral-900" : "text-neutral-400"}>
          {fechaInicio ? fechaInicio.toLocaleDateString() : "Seleccionar fecha de inicio"}
        </Text>
      </Pressable>

      {showStartPicker && (
        <DateTimePicker
          value={fechaInicio || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) setFechaInicio(selectedDate);
          }}
        />
      )}

      <Text className="text-sm font-semibold mb-2">Fecha Fin *</Text>
      <Pressable
        onPress={() => setShowEndPicker(true)}
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-6"
      >
        <Text className={fechaFin ? "text-neutral-900" : "text-neutral-400"}>
          {fechaFin ? fechaFin.toLocaleDateString() : "Seleccionar fecha final"}
        </Text>
      </Pressable>

      {showEndPicker && (
        <DateTimePicker
          value={fechaFin || fechaInicio || new Date()}
          mode="date"
          display="default"
          minimumDate={fechaInicio || new Date()}
          onChange={(event, selectedDate) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) setFechaFin(selectedDate);
          }}
        />
      )}

      <Pressable
        disabled={!isValid || loading}
        onPress={handleCreate}
        className={`rounded-2xl py-4 items-center mb-10 ${
          isValid && !loading ? "bg-black" : "bg-neutral-300"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className={`font-semibold ${isValid ? "text-white" : "text-neutral-500"}`}>
            Generar QR Compartido
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
