import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { systemApi } from "../../../api/endpoints/system.api";
import { SystemNotification } from "../../../api/types/system";
import { useNotificationNav } from "../hooks/useNotificationNav";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { handleNotificationTap } = useNotificationNav();

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await systemApi.getNotifications(currentPage, 20); // Cambiado a bloques de a 20
      
      if (res.success) {
        if (isRefresh) {
          setNotifications(res.notificaciones);
          setPage(2); // Próxima página será la 2
        } else {
          setNotifications(prev => [...prev, ...res.notificaciones]);
          setPage(prev => prev + 1);
        }
        
        // Determinar si hay más viendo la info de paginación del backend
        if (res.pagination) {
            setHasMore(res.pagination.page < res.pagination.totalPages);
        } else {
            setHasMore(res.notificaciones.length === 20);
        }
      }
    } catch (e) {
      console.warn("Error fetching notifs", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page]);

  // Se enlazará al pull-to-refresh y al entrar al tab
  const onRefresh = useCallback(() => {
    setHasMore(true);
    fetchNotifications(true);
  }, [fetchNotifications]);
  // Re-fetch cada vez que el usuario navega a este tab
  useFocusEffect(
    useCallback(() => {
      // Siempre forzamos un refresh limpio al entrar
      onRefresh();
    }, [onRefresh]),
  );

  const fetchMore = () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchNotifications(false);
  };

  const handlePress = async (item: SystemNotification) => {
    // Marcar como leída en background
    if (!item.leida) {
      systemApi.markAsRead(item._id).then(() => {
        setNotifications(prev => 
          prev.map(n => n._id === item._id ? { ...n, leida: true } : n)
        );
      });
    }

    // Mapear el 'data' del modelo MongoDB al formato payload esperado por FCM
    // FCM usualmente recibe todo como string, pero pasamos el record.
    const payload = {
      tipo: item.data_json?.tipo,
      accion_tipo: item.accion_tipo || item.data_json?.action || item.data_json?.accion_tipo,
      accion_data: item.accion_data || item.data_json, 
    };
    
    // Para simplificar, en useNotificationNav, si accion_data es string lo parsea, 
    // pero si ya es objeto desde MongoDB, debemos mandarlo pre-formateado.
    const fcmMock = {
      tipo: payload.tipo,
      accion_tipo: payload.accion_tipo,
      accion_data: JSON.stringify(payload.accion_data)
    };

    handleNotificationTap(fcmMock);
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "paquete": return { name: "cube-outline", color: "#F59E0B", bg: "bg-amber-100" }; // amber
      case "visita":
      case "visita_esperada":
      case "visita_llegada": return { name: "people-outline", color: "#3B82F6", bg: "bg-blue-100" }; // blue
      case "pago":
      case "cargo_generado":
      case "cargo_vencido": return { name: "card-outline", color: "#EF4444", bg: "bg-red-100" }; // red
      case "comprobante_aprobado":
      case "comprobante_rechazado": return { name: "receipt-outline", color: "#10B981", bg: "bg-green-100" }; // green
      case "chat":
      case "nuevo_mensaje": return { name: "chatbubble-outline", color: "#8B5CF6", bg: "bg-purple-100" }; // purple
      default: return { name: "notifications-outline", color: "#6B7280", bg: "bg-neutral-100" }; // gray
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const renderItem = ({ item }: { item: SystemNotification }) => {
    const visualType = item.data_json?.tipo || "general";
    const iconBase = getIconForType(visualType);
    return (
      <Pressable 
        onPress={() => handlePress(item)}
        className={`flex-row px-5 py-4 border-b border-neutral-200 ${item.leida ? "bg-white opacity-75" : "bg-blue-50/40"}`}
      >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${iconBase.bg} mt-0.5`}>
          {/* @ts-ignore */}
          <Ionicons name={iconBase.name} size={24} color={iconBase.color} />
        </View>
        <View className="flex-1 justify-start">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`flex-1 text-t1 ${!item.leida && "font-extrabold"}`} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text className={`text-c1 ml-2 ${item.leida ? "text-neutral-400" : "text-neutral-500 font-bold"}`}>
              {formatDate(item.createdAt || item.fecha_creacion)}
            </Text>
          </View>
          <Text className={`text-b1 leading-5 ${!item.leida && "font-medium text-neutral-700"}`} numberOfLines={2}>
            {item.mensaje}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 pb-4 border-b border-neutral-100 flex-row justify-between items-end">
        <Text className="text-h1 mt-2">
          Notificaciones
        </Text>
        <Pressable 
          className="pb-2"
          onPress={() => {
            systemApi.markAllAsRead().then(() => fetchNotifications());
          }}
        >
          <Text className="text-blue-600 font-medium">Marcar leídas</Text>
        </Pressable>
      </View>
      
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-5">
            <Ionicons name="notifications-off-outline" size={36} color="#9CA3AF" />
          </View>
          <Text className="text-neutral-800 font-semibold text-lg mb-2 text-center">
            No tienes notificaciones
          </Text>
          <Text className="text-neutral-500 text-sm text-center leading-5">
            Las alertas sobre tus paquetes, visitas y cargos aparecerán aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" color="#3b82f6" /> : null}
        />
      )}
    </View>
  );
}
