import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View, Switch, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useVisitsStore } from "../store/visits.store";

const isYYYYMMDD = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export default function VisitDataScreen() {
  const router = useSafeRouter();
  const draft = useVisitsStore((s) => s.draft);
  const setNombre = useVisitsStore((s) => s.setNombre);
  const setVipDates = useVisitsStore((s) => s.setVipDates);
  const setIsMultiDay = useVisitsStore((s) => s.setIsMultiDay);
  const setUnicaVezDate = useVisitsStore((s) => s.setUnicaVezDate);
  const setDiasSemana = useVisitsStore((s) => s.setDiasSemana);

  const isVip = draft.typeKey === "vip";
  const isUnica = draft.typeKey === "unicaVez";
  const isProveedor = draft.typeKey === "proveedor";
  const isPersonal = draft.typeKey === "personal";
  const showVipDates = isVip || isProveedor || isPersonal;

  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [showUnica, setShowUnica] = useState(false);

  const parseDateString = (ds?: string | null) => {
    if (!ds) return undefined;
    const parts = ds.split("-").map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]); // local date
    }
    return undefined;
  };

  const toYYYYMMDD = (d: Date) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  };

  const canContinue = (() => {
    if (!draft.nombre_visitante.trim()) return false;

    if (showVipDates) {
      if (draft.isMultiDay || isPersonal) {
        const a = draft.fecha_inicio_vigencia ?? "";
        const b = draft.fecha_fin_vigencia ?? "";
        return isYYYYMMDD(a) && isYYYYMMDD(b) && a <= b;
      } else {
        const a = draft.fecha_inicio_vigencia ?? "";
        return isYYYYMMDD(a);
      }
    }

    if (isUnica) {
      const d = draft.fecha_visita_unica ?? "";
      return isYYYYMMDD(d);
    }

    return false;
  })();

  return (
    <View className="flex-1 bg-white pt-6 px-5">
      <Stack.Screen options={{ title: "Datos de acceso" }} />
      <Text className="text-xl font-semibold mb-4 text-neutral-800">Información del visitante</Text>

      <Text className="text-sm font-semibold mb-2 text-neutral-800">Nombre</Text>
      <TextInput
        className="border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900"
        value={draft.nombre_visitante}
        onChangeText={setNombre}
        placeholder="Ej. Juan Pérez"
      />

      {showVipDates ? (
        <>
          {!isPersonal && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-semibold text-neutral-800">¿Visita de varios días?</Text>
              <Switch
                value={draft.isMultiDay}
                onValueChange={setIsMultiDay}
                trackColor={{ false: "#d4d4d8", true: "#000" }}
                thumbColor={"#fff"}
              />
            </View>
          )}

          <Text className="text-sm font-semibold mb-2 text-neutral-800">
            {(draft.isMultiDay || isPersonal) ? "Fecha inicio" : "Fecha de la visita"}
          </Text>
          <Pressable
            onPress={() => setShowInicio(true)}
            className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
          >
            <Text className={draft.fecha_inicio_vigencia ? "text-neutral-900" : "text-neutral-400"}>
              {draft.fecha_inicio_vigencia ? parseDateString(draft.fecha_inicio_vigencia)?.toLocaleDateString() : "Seleccionar fecha"}
            </Text>
          </Pressable>

          {showInicio && (
            <DateTimePicker
              value={parseDateString(draft.fecha_inicio_vigencia) || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowInicio(Platform.OS === 'ios');
                if (selectedDate) {
                  const dStr = toYYYYMMDD(selectedDate);
                  if (draft.isMultiDay || isPersonal) {
                    setVipDates(dStr, draft.fecha_fin_vigencia ?? "");
                  } else {
                    setVipDates(dStr, dStr);
                  }
                }
              }}
            />
          )}

          {(draft.isMultiDay || isPersonal) && (
            <>
              <Text className="text-sm font-semibold mb-2 text-neutral-800">Fecha fin</Text>
              <Pressable
                onPress={() => setShowFin(true)}
                className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
              >
                <Text className={draft.fecha_fin_vigencia ? "text-neutral-900" : "text-neutral-400"}>
                  {draft.fecha_fin_vigencia ? parseDateString(draft.fecha_fin_vigencia)?.toLocaleDateString() : "Seleccionar fecha final"}
                </Text>
              </Pressable>

              {showFin && (
                <DateTimePicker
                  value={parseDateString(draft.fecha_fin_vigencia) || parseDateString(draft.fecha_inicio_vigencia) || new Date()}
                  mode="date"
                  minimumDate={parseDateString(draft.fecha_inicio_vigencia) || new Date()}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowFin(Platform.OS === 'ios');
                    if (selectedDate) {
                      setVipDates(draft.fecha_inicio_vigencia ?? "", toYYYYMMDD(selectedDate));
                    }
                  }}
                />
              )}
              
              <Text className="text-xs text-neutral-500 -mt-2 mb-4">
                Nota: la fecha fin debe ser posterior o igual a la fecha inicio.
              </Text>
            </>
          )}
        </>
      ) : null}

      {isPersonal && (
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-neutral-800">Días de Asistencia</Text>
          <Text className="text-xs text-neutral-500 mb-3 -mt-1">Si no seleccionas ningún día, se asume que asiste todos los días.</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { label: 'D', value: 0 },
              { label: 'L', value: 1 },
              { label: 'M', value: 2 },
              { label: 'Mi', value: 3 },
              { label: 'J', value: 4 },
              { label: 'V', value: 5 },
              { label: 'S', value: 6 },
            ].map(dia => {
              const isSelected = draft.diasSemana?.includes(dia.value);
              return (
                <Pressable
                  key={dia.value}
                  onPress={() => {
                    const next = draft.diasSemana || [];
                    if (next.includes(dia.value)) {
                      setDiasSemana(next.filter(d => d !== dia.value));
                    } else {
                      setDiasSemana([...next, dia.value]);
                    }
                  }}
                  className={`w-10 h-10 items-center justify-center rounded-full border ${
                    isSelected 
                      ? 'bg-neutral-800 border-neutral-800' 
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <Text className={isSelected ? 'text-white font-bold' : 'text-neutral-600 font-medium'}>
                    {dia.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      )}

      {isUnica ? (
        <>
          <Text className="text-sm font-semibold mb-2 text-neutral-800">Fecha de la visita</Text>
          <Pressable
            onPress={() => setShowUnica(true)}
            className="border border-neutral-300 rounded-xl px-4 py-3 mb-2"
          >
            <Text className={draft.fecha_visita_unica ? "text-neutral-900" : "text-neutral-400"}>
              {draft.fecha_visita_unica ? parseDateString(draft.fecha_visita_unica)?.toLocaleDateString() : "Seleccionar fecha"}
            </Text>
          </Pressable>

          {showUnica && (
            <DateTimePicker
              value={parseDateString(draft.fecha_visita_unica) || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowUnica(Platform.OS === 'ios');
                if (selectedDate) setUnicaVezDate(toYYYYMMDD(selectedDate));
              }}
            />
          )}

          <Text className="text-xs text-neutral-500 mb-4 mt-2">
            Solo necesitas esta fecha. La app genera automáticamente la vigencia para el backend.
          </Text>
        </>
      ) : null}

      <Pressable
        disabled={!canContinue}
        onPress={() => router.push("/visits/create/preview")}
        className={`rounded-2xl py-4 items-center mt-2 ${canContinue ? "bg-black" : "bg-neutral-300"}`}
      >
        <Text className={`font-semibold ${canContinue ? "text-white" : "text-neutral-600"}`}>
          Continuar
        </Text>
      </Pressable>
    </View>
  );
}
