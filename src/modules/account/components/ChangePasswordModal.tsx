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
import { authApi } from '../../../api/endpoints/auth.api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos de contraseña.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Error", "La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (form.newPassword.length < 6) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      if (res.success) {
        Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente.", [
          { text: "Entendido", onPress: () => handleClose() }
        ]);
      } else {
        Alert.alert("Error", res.message || "No se pudo actualizar la contraseña.");
      }
    } catch (e) {
      Alert.alert("Error", "Ocurrió un problema al cambiar la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-[40px] pt-6 pb-10 shadow-2xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 mt-2 px-6">
            <View>
              <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight">Cambiar Contraseña</Text>
              <Text className="text-sm font-medium text-neutral-500 mt-1">Asegura tu cuenta de residente.</Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="bg-neutral-100 p-2.5 rounded-full active:bg-neutral-200">
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
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Contraseña Actual *</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl pr-4">
                  <TextInput 
                    className="flex-1 py-3 px-4 text-neutral-900"
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showCurrentPassword}
                    value={form.currentPassword}
                    onChangeText={(val) => setForm(f => ({ ...f, currentPassword: val }))}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} className="p-2">
                    <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#71717A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Nueva Contraseña *</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl pr-4">
                  <TextInput 
                    className="flex-1 py-3 px-4 text-neutral-900"
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showNewPassword}
                    value={form.newPassword}
                    onChangeText={(val) => setForm(f => ({ ...f, newPassword: val }))}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="p-2">
                    <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#71717A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold mb-2 text-neutral-800">Confirmar Nueva *</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl pr-4">
                  <TextInput 
                    className="flex-1 py-3 px-4 text-neutral-900"
                    placeholder="Vuelve a escribir la nueva"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showNewPassword}
                    value={form.confirmPassword}
                    onChangeText={(val) => setForm(f => ({ ...f, confirmPassword: val }))}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="bg-black py-4 rounded-2xl mt-4 flex-row justify-center items-center shadow-sm"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">Actualizar Contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}
