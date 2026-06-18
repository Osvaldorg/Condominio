import {
  View,
  Text,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import type { BankAccount, MetodoPago, PaymentFormValues } from "../../../api/types/finances";

const METODOS_PAGO: { label: string; value: MetodoPago }[] = [
  { label: "Transferencia", value: "transferencia" },
  { label: "Depósito", value: "deposito" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Tarjeta", value: "tarjeta" },
  { label: "Cheque", value: "cheque" },
];

interface PaymentFormProps {
  values: PaymentFormValues;
  onChange: <K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) => void;
  bankAccounts: BankAccount[];
  disabled?: boolean;
}

/**
 * PaymentForm
 *
 * Componente controlado que renderiza todos los campos del formulario de pago:
 *  - Fecha del pago (DateTimePicker)
 *  - Método de pago (chips)
 *  - Institución bancaria
 *  - Referencia / folio
 *  - Cuenta de destino (selector)
 *  - Observaciones
 *  - Comprobante (file picker)
 *
 * Recibe `values` y `onChange` del padre — no gestiona estado propio.
 * El padre (RegisterPaymentScreen / RetryPaymentScreen) es dueño del estado
 * via `usePaymentForm` y se encarga del envío.
 */
export function PaymentForm({ values, onChange, bankAccounts, disabled = false }: PaymentFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        onChange("file", result.assets[0]);
      }
    } catch (err) {
      console.warn("Error al seleccionar archivo:", err);
    }
  };

  return (
    <View>
      {/* ── Fecha del pago ────────────────────────────────────────────────── */}
      <Text className="text-sm font-semibold mb-2 text-neutral-800">Fecha del pago *</Text>
      <Pressable
        onPress={() => !disabled && setShowDatePicker(true)}
        className="bg-white border border-neutral-300 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
      >
        <Text className="text-neutral-900 font-semibold">
          {values.fechaPago.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={values.fechaPago}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) onChange("fechaPago", selectedDate);
          }}
        />
      )}

      {/* ── Método de pago ────────────────────────────────────────────────── */}
      <Text className="text-sm font-semibold mb-2 text-neutral-800">Método de pago *</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {METODOS_PAGO.map((m) => {
          const isSelected = values.metodoPago === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => !disabled && onChange("metodoPago", m.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isSelected
                  ? "bg-black border-black"
                  : "bg-white border-neutral-300 active:bg-neutral-50"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? "text-white" : "text-neutral-700"
                }`}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Institución bancaria ──────────────────────────────────────────── */}
      <Text className="text-sm font-semibold mb-2 text-neutral-800">
        Institución bancaria{" "}
        <Text className="text-neutral-400 font-normal">(opcional)</Text>
      </Text>
      <TextInput
        placeholder="Ej. BBVA, Banamex, HSBC"
        value={values.institucion}
        onChangeText={(v) => onChange("institucion", v)}
        editable={!disabled}
        className="bg-white border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900 font-semibold"
      />

      {/* ── Referencia / Folio ────────────────────────────────────────────── */}
      <Text className="text-sm font-semibold mb-2 text-neutral-800">
        Referencia / Folio{" "}
        <Text className="text-neutral-400 font-normal">(opcional)</Text>
      </Text>
      <TextInput
        placeholder="Ej. 12345678"
        value={values.referencia}
        onChangeText={(v) => onChange("referencia", v)}
        editable={!disabled}
        className="bg-white border border-neutral-300 rounded-xl px-4 py-3 mb-4 text-neutral-900 font-semibold"
      />

      {/* ── Cuenta de destino ─────────────────────────────────────────────── */}
      {bankAccounts.length > 0 && (
        <>
          <Text className="text-sm font-semibold mb-2 text-neutral-800">
            Cuenta de destino{" "}
            <Text className="text-neutral-400 font-normal">(opcional)</Text>
          </Text>
          <View className="mb-5">
            {bankAccounts.map((cuenta) => {
              const isSelected = values.cuentaDestino === cuenta._id;
              return (
                <Pressable
                  key={cuenta._id}
                  onPress={() =>
                    !disabled && onChange("cuentaDestino", isSelected ? "" : cuenta._id)
                  }
                  className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                    isSelected
                      ? "bg-neutral-900 border-neutral-900"
                      : "bg-white border-neutral-300 active:bg-neutral-50"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      isSelected ? "border-white" : "border-neutral-300"
                    }`}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={12} color="white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-white" : "text-neutral-800"
                      }`}
                    >
                      {cuenta.banco}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {cuenta.nombre_cuenta} · {cuenta.numero_cuenta}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* ── Observaciones ─────────────────────────────────────────────────── */}
      <Text className="text-sm font-semibold mb-2 text-neutral-800">
        Observaciones{" "}
        <Text className="text-neutral-400 font-normal">(opcional)</Text>
      </Text>
      <TextInput
        placeholder="Ej. Pago correspondiente a marzo"
        value={values.observaciones}
        onChangeText={(v) => onChange("observaciones", v)}
        editable={!disabled}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="bg-white border border-neutral-300 rounded-xl px-4 py-3 mb-6 text-neutral-900 font-semibold"
      />

      {/* ── Comprobante ───────────────────────────────────────────────────── */}
      <Text className="font-semibold text-neutral-800 text-sm mb-1">
        Comprobante de pago *
      </Text>
      <Text className="text-neutral-500 text-xs mb-3">
        {values.file ? "Archivo seleccionado. Toca para cambiar." : "PDF, JPG o PNG · máx. 10 MB"}
      </Text>
      <Pressable
        onPress={pickDocument}
        disabled={disabled}
        className={`border-2 border-dashed rounded-2xl p-6 items-center justify-center mb-6 h-40 ${
          values.file
            ? "border-green-400 bg-green-50"
            : "border-neutral-300 bg-neutral-50 active:bg-neutral-100"
        }`}
      >
        <MaterialCommunityIcons
          name={values.file ? "file-check-outline" : "cloud-upload-outline"}
          size={40}
          color={values.file ? "#10B981" : "#9CA3AF"}
        />
        <Text
          className={`font-medium text-base mt-3 ${
            values.file ? "text-green-700" : "text-neutral-700"
          }`}
        >
          {values.file ? "Cambiar comprobante" : "Seleccionar archivo"}
        </Text>
        {values.file && (
          <Text className="text-neutral-500 text-xs mt-1 text-center" numberOfLines={1}>
            {values.file.name}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
