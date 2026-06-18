import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, TouchableOpacity } from "react-native";
import { useLogin } from "../hooks/useLogin";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loading, error } = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    if (!username || !password) return;
    const success = await login(username.trim(), password);
    if (success) {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView 
        bottomOffset={62}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 32, 
          justifyContent: 'center', 
          paddingBottom: 40,
          paddingTop: insets.top > 0 ? insets.top + 20 : 40 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Brand Section */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-neutral-900 rounded-[20px] items-center justify-center shadow-lg rotate-3 mb-4">
            <MaterialCommunityIcons name="shield-home-outline" size={32} color="white" />
          </View>
          <Text className="text-2xl font-extrabold text-neutral-900 tracking-tighter">Condominio</Text>
          <Text className="text-neutral-400 font-medium text-sm mt-1">Gestión Residencial Premium</Text>
        </View>

        <View className="gap-y-4">
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-800">Usuario o Email</Text>
            <View className="flex-row items-center border border-neutral-300 rounded-xl px-4">
              <Ionicons name="person-outline" size={18} color="#A1A1AA" />
              <TextInput
                className="flex-1 py-3 px-2 text-neutral-900"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#A1A1AA"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-800">Contraseña</Text>
            <View className="flex-row items-center border border-neutral-300 rounded-xl px-4">
              <Ionicons name="lock-closed-outline" size={18} color="#A1A1AA" />
              <TextInput
                className="flex-1 py-3 px-2 text-neutral-900"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#A1A1AA"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#71717A" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View className="bg-red-50 p-3.5 rounded-xl flex-row items-center border border-red-100">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-600 ml-2 font-bold text-xs flex-1">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={`py-4 rounded-2xl items-center mt-2 ${username && password ? 'bg-black shadow-sm' : 'bg-neutral-300'}`}
            onPress={onSubmit}
            disabled={loading || !username || !password}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold text-base">Ingresar al Sistema</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity className="mt-2 items-center">
             <Text className="text-neutral-400 text-xs font-medium">¿Olvidaste tu acceso? Contacta a administración</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
