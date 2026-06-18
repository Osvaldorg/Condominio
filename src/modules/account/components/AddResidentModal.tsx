import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface AddResidentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (userData: any) => Promise<{ success: boolean; message?: string }>;
}

export function AddResidentModal({ visible, onClose, onAdd }: AddResidentModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdd = async () => {
    // Basic validation
    if (!form.nombre || !form.apellido || !form.email || !form.username || !form.password) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos marcados con *");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onAdd(form);
      if (res.success) {
        Alert.alert("Éxito", "Usuario residente creado exitosamente");
        setForm({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          username: '',
          password: ''
        });
        onClose();
      } else {
        Alert.alert("Error", res.message || "No se pudo crear el usuario");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-[40px] pt-6 pb-10 shadow-2xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4 mt-2 px-6">
            <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight">Agregar Residente</Text>
            <TouchableOpacity onPress={onClose} className="bg-neutral-100 p-2.5 rounded-full active:bg-neutral-200">
              <Ionicons name="close" size={22} color="#171717" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView 
            bottomOffset={62} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          >
            <View className="gap-y-4">
              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Nombre completo *</Text>
                <TextInput 
                  className="border border-neutral-300 py-3 px-4 rounded-xl text-neutral-900"
                  placeholder="Ej: Juan"
                  placeholderTextColor="#A1A1AA"
                  value={form.nombre}
                  onChangeText={(val) => setForm(f => ({ ...f, nombre: val }))}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Apellido paterno *</Text>
                <TextInput 
                  className="border border-neutral-300 py-3 px-4 rounded-xl text-neutral-900"
                  placeholder="Ej: Pérez"
                  placeholderTextColor="#A1A1AA"
                  value={form.apellido}
                  onChangeText={(val) => setForm(f => ({ ...f, apellido: val }))}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Correo electrónico *</Text>
                <TextInput 
                  className="border border-neutral-300 py-3 px-4 rounded-xl text-neutral-900"
                  placeholder="mail@ejemplo.com"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(val) => setForm(f => ({ ...f, email: val }))}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Teléfono de contacto</Text>
                <TextInput 
                  className="border border-neutral-300 py-3 px-4 rounded-xl text-neutral-900"
                  placeholder="10 dígitos"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="phone-pad"
                  value={form.telefono}
                  onChangeText={(val) => setForm(f => ({ ...f, telefono: val }))}
                />
              </View>

              <View className="h-[1px] bg-neutral-100 my-1" />

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Nombre de Usuario *</Text>
                <TextInput 
                  className="border border-neutral-300 py-3 px-4 rounded-xl text-neutral-900"
                  placeholder="Para el login"
                  placeholderTextColor="#A1A1AA"
                  autoCapitalize="none"
                  value={form.username}
                  onChangeText={(val) => setForm(f => ({ ...f, username: val }))}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Contraseña Inicial *</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl pr-4">
                  <TextInput 
                    className="flex-1 py-3 px-4 text-neutral-900"
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(val) => setForm(f => ({ ...f, password: val }))}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#71717A" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={handleAdd}
                disabled={isSubmitting}
                className="bg-black py-4 rounded-2xl mt-4 flex-row justify-center items-center shadow-sm"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">Crear Acceso</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}
