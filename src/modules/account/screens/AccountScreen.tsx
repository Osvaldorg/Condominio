import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth/store/auth.store";
import { residentsApi } from "../../../api/endpoints/residents.api";
import { useSecondaryResidents } from "../hooks/useSecondaryResidents";
import { SecondaryResidentCard } from "../components/SecondaryResidentCard";
import { AddResidentModal } from "../components/AddResidentModal";
import { ChangePasswordModal } from "../components/ChangePasswordModal";

export default function AccountScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  
  const [loading, setLoading] = useState(true);
  const [receptionStatus, setReceptionStatus] = useState<any>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Hook para residentes secundarios
  const { residents, isLoading: loadingResidents, toggleStatus, addResident } = useSecondaryResidents();

  const isPrincipal = user?.residente?.es_principal;

  useEffect(() => {
    if (user?.id) {
      residentsApi.getReceptionStatus(user.id).then((res) => {
        if (res.success && res.data?.estado_recepcion) {
          setReceptionStatus(res.data.estado_recepcion);
        } else {
          // Si es 404 o error, asumimos configuración por defecto (todo activo)
          setReceptionStatus({ recibiendo_visitas: true, recibiendo_personal: true });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const toggleReceptionParams = async (key: 'personal' | 'visitas', value: boolean) => {
    if (!receptionStatus) return;
    setSavingStatus(true);
    
    // Optimistic update
    const newStatus = { ...receptionStatus };
    if (key === 'personal') newStatus.recibiendo_personal = value;
    else newStatus.recibiendo_visitas = value;

    setReceptionStatus(newStatus);

    const res = await residentsApi.updateReceptionStatus(
      newStatus.recibiendo_personal, 
      newStatus.recibiendo_visitas
    );

    if (!res.success) {
      Alert.alert("Error", res.message || "No se pudo actualizar la configuración.");
      // Rollback opcional si falla
    }
    setSavingStatus(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, salir", style: "destructive", onPress: () => {
             logout();
             router.replace("/(auth)/login");
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-5 py-8 mb-2 border-b border-neutral-100 items-center">
          <View className="w-24 h-24 bg-neutral-900 rounded-full items-center justify-center mb-4 shadow-xl">
            <Text className="text-4xl font-bold text-white">
              {user?.nombre?.[0]?.toUpperCase() || "R"}
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight">{user?.nombre || "Residente"}</Text>
          <Text className="text-neutral-500 font-medium">{user?.email}</Text>
          
          <View className="bg-neutral-100 rounded-full px-5 py-2 mt-4">
            <Text className="text-neutral-700 font-bold text-[10px] uppercase tracking-wider">
              {isPrincipal ? "Residente Principal" : "Residente Secundario"}
            </Text>
          </View>
        </View>

        {/* Sección de Preferencias / Recepción */}
        <View className="bg-white border-y border-neutral-100 mb-6 py-2 shadow-sm shadow-neutral-100">
          <View className="px-5 py-4 flex-row justify-between items-center border-b border-neutral-50 mb-1">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-2xl bg-emerald-50 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <Text className="text-lg font-extrabold text-neutral-900 tracking-tight">Estado de Recepción</Text>
            </View>
            {savingStatus && <ActivityIndicator size="small" color="#10b981" />}
          </View>

          {loading ? (
             <ActivityIndicator className="my-6" />
          ) : (
            <>
              <View className="px-5 py-4 flex-row justify-between items-center bg-white border-b border-neutral-50">
                <View className="pr-4 flex-1">
                  <Text className="text-base font-bold text-neutral-800 mb-0.5">Recibir Personal</Text>
                  <Text className="text-xs font-medium text-neutral-500">Autorizar entrada de empleados o servicios</Text>
                </View>
                <Switch 
                  value={receptionStatus?.recibiendo_personal}
                  onValueChange={(val) => toggleReceptionParams('personal', val)}
                  trackColor={{ false: "#E5E5E5", true: "#10b981" }}
                  thumbColor="#fff"
                />
              </View>
 
              <View className="px-5 py-4 flex-row justify-between items-center bg-white">
                <View className="pr-4 flex-1">
                  <Text className="text-base font-bold text-neutral-800 mb-0.5">Recibir Visitas</Text>
                  <Text className="text-xs font-medium text-neutral-500">Autorizar paso a visitas no registradas</Text>
                </View>
                <Switch 
                  value={receptionStatus?.recibiendo_visitas}
                  onValueChange={(val) => toggleReceptionParams('visitas', val)}
                  trackColor={{ false: "#E5E5E5", true: "#10b981" }}
                  thumbColor="#fff"
                />
              </View>
            </>
          )}
        </View>

        {/* Mi Unidad (Solo Principal) */}
        {isPrincipal && (
          <View className="bg-white border-y border-neutral-100 mb-6 py-2 shadow-sm shadow-neutral-100">
            <View className="px-5 py-4 flex-row justify-between items-center border-b border-neutral-50 mb-1">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-2xl bg-indigo-50 items-center justify-center mr-3">
                  <MaterialCommunityIcons name="home-group" size={20} color="#4f46e5" />
                </View>
                <Text className="text-lg font-extrabold text-neutral-900 tracking-tight">Mi Unidad</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                className="bg-neutral-900 px-4 py-2 rounded-full active:bg-neutral-800"
              >
                <Text className="text-white font-bold text-xs tracking-wide">AGREGAR</Text>
              </TouchableOpacity>
            </View>

            {loadingResidents ? (
              <ActivityIndicator className="my-8" color="#000" />
            ) : residents.length > 0 ? (
              residents.map((r) => (
                <SecondaryResidentCard 
                  key={r._id} 
                  resident={r} 
                  onToggle={toggleStatus} 
                />
              ))
            ) : (
              <View className="px-5 py-6 bg-white border-t border-neutral-100 items-center">
                <Text className="text-neutral-400 text-sm font-medium">No hay residentes registrados.</Text>
              </View>
            )}
          </View>
        )}

        {/* Seguridad */}
        <View className="bg-white border-y border-neutral-100 mb-6 py-2 shadow-sm shadow-neutral-100">
           <View className="px-5 py-4 flex-row items-center border-b border-neutral-50 mb-1">
              <View className="w-9 h-9 rounded-2xl bg-amber-50 items-center justify-center mr-3">
                <Ionicons name="shield-half" size={20} color="#d97706" />
              </View>
              <Text className="text-lg font-extrabold text-neutral-900 tracking-tight">Seguridad</Text>
           </View>
          <Pressable 
            onPress={() => setPasswordModalVisible(true)}
            className="px-5 py-4 flex-row items-center active:bg-neutral-50"
          >
             <Text className="text-base font-bold text-neutral-800 flex-1">Cambiar Contraseña</Text>
             <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
          </Pressable>
        </View>

        {/* Sesión */}
        <View className="bg-white border-y border-neutral-100 mb-20 py-2 shadow-sm shadow-neutral-100">
          <Pressable 
            onPress={handleLogout}
            className="px-5 py-4 flex-row items-center active:bg-neutral-50"
          >
             <View className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center mr-3">
               <Ionicons name="log-out-outline" size={18} color="#EF4444" />
             </View>
             <Text className="text-base font-bold text-red-500 flex-1">Cerrar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal para agregar residente */}
      <AddResidentModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onAdd={addResident} 
      />

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal 
        visible={passwordModalVisible} 
        onClose={() => setPasswordModalVisible(false)} 
      />
    </View>
  );
}

