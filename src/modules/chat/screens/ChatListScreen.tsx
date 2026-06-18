import React, { useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useChat } from "../hooks/useChat";
import { useSafeRouter } from "../../../hooks/useSafeRouter";

import { Conversation } from "../types/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ChatListScreen() {
  const { conversations, storeLoading, storeError, fetchConversations, initChatCaseta, initChatAdmin } = useChat();
  const router = useSafeRouter();

  useEffect(() => {
    fetchConversations();

    const intervalId = setInterval(() => {
      fetchConversations(undefined, false); // Polling silent load
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  const onRefresh = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleCreateChat = async (tipo: 'caseta' | 'administrador') => {
    try {
      if (tipo === 'caseta') {
        const res = await initChatCaseta({ mensaje: 'Hola, necesito ayuda desde caseta.' });
        if (res.success && res.conversacion_id) {
          router.push(`/chat/${res.conversacion_id}?title=caseta` as any);
        }
      } else {
        const res = await initChatAdmin({ mensaje: 'Hola, tengo una consulta para administración.' });
        if (res.success && res.conversacion_id) {
          router.push(`/chat/${res.conversacion_id}?title=administrador` as any);
        }
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        "Chat no disponible", 
        e.message || `No se pudo iniciar el chat con ${tipo === 'caseta' ? 'la caseta' : 'la administración'}. Es posible que aún no haya personal asignado a este rol.`
      );
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const isCaseta = item.tipo === 'caseta';
    const hasUnread = item.mensajes_no_leidos > 0;
    
    return (
      <TouchableOpacity 
        className="flex-row items-center bg-white p-4 mb-3 mx-4 rounded-xl shadow-sm border border-gray-100"
        onPress={() => router.push(`/chat/${item._id}?title=${item.tipo}` as any)}
      >
        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
          <Ionicons 
            name={isCaseta ? "shield-checkmark" : "business"} 
            size={24} 
            color="#2563eb" 
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-t1 capitalize">
              {item.tipo}
            </Text>
            <Text className="text-c1">
              {item.ultimo_mensaje_at ? format(new Date(item.ultimo_mensaje_at), "dd MMM HH:mm", { locale: es }) : ''}
            </Text>
          </View>
          <Text className="text-b1 truncate" numberOfLines={1}>
            {item.asunto || "Chat activo"}
          </Text>
        </View>
        {hasUnread && (
          <View className="bg-red-500 w-5 h-5 rounded-full items-center justify-center ml-2">
            <Text className="text-white text-xs font-bold">{item.mensajes_no_leidos}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const hasCaseta = conversations.some(c => c.tipo === 'caseta');
  const hasAdmin = conversations.some(c => c.tipo === 'administrador');

  if (storeLoading && conversations.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-14">
      <View className="px-5 mb-4 mt-2">
        <Text className="text-h1">Mensajes</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={storeLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          storeError ? (
            <Text className="text-red-500 text-center p-4">{storeError}</Text>
          ) : null
        }
        ListEmptyComponent={
          !storeLoading ? (
            <View className="items-center justify-center p-10">
              <Ionicons name="chatbubbles-outline" size={60} color="#cbd5e1" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                No tienes conversaciones activas.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Flotadores para nuevos chats si no existen */}
      <View className="absolute bottom-6 left-0 right-0 px-6 space-y-3">
        {!hasCaseta && (
          <TouchableOpacity 
            className="bg-blue-600 flex-row justify-center items-center py-4 rounded-xl shadow-md"
            onPress={() => handleCreateChat('caseta')}
          >
            <Ionicons name="shield-checkmark" size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-base ml-2">Iniciar chat con Caseta</Text>
          </TouchableOpacity>
        )}
        {!hasAdmin && (
          <TouchableOpacity 
            className="bg-gray-800 flex-row justify-center items-center py-4 rounded-xl shadow-md mt-3"
            onPress={() => handleCreateChat('administrador')}
          >
            <Ionicons name="business" size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-base ml-2">Iniciar chat con Administración</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
