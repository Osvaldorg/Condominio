import React, { useRef, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Platform, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { KeyboardToolbar, useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useChatMessages } from "../hooks/useChatMessages";
import { Message } from "../types/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuthStore } from "../../auth/store/auth.store";

export function ChatDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();

  // Reanimated shared value to track keyboard height frame by frame
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet';
        height.value = Math.max(event.height, 0);
      },
    },
    []
  );

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -Math.abs(height.value) }],
    };
  }, []);
  const { 
    messages, 
    conversation, 
    loading, 
    loadingMore, 
    sending, 
    handleLoadMore, 
    handleSendMessage 
  } = useChatMessages(id as string);

  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Si el usuario subió más de 150 pixeles (en inverted list, offset > 150) mostramos el botón
    setShowScrollButton(offsetY > 150);
  };

  const onSend = async () => {
    const success = await handleSendMessage(inputText);
    if (success) {
      setInputText('');
      scrollToBottom();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Cuando el mensaje recién se envía, el remitente_id viene como string del backend.
    // Cuando se cargan con Get, viene poblado como un objeto con _id.
    const remitenteIdStr = typeof item.remitente_id === 'string' ? item.remitente_id : item.remitente_id?._id;
    const isMe = remitenteIdStr === user?.id;
    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-br-sm' : 'bg-white rounded-bl-sm border border-gray-100 shadow-sm'}`}>
          <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {item.mensaje}
          </Text>
        </View>
        {/* Mensajes listados al inicio */}
        <Text className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {format(new Date(item.createdAt), "HH:mm", { locale: es })}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: conversation ? `${conversation.tipo.charAt(0).toUpperCase() + conversation.tipo.slice(1)}` : (title ? `${title.charAt(0).toUpperCase() + title.slice(1)}` : "Chat"),
        }} 
      />

      <View className="flex-1 flex-col">
        {loading && messages.length === 0 && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-gray-50/50">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          inverted={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-2">
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            ) : null
          }
          className="flex-1"
        />

        <View className="p-4 bg-white border-t border-gray-100 flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-base mr-3 text-gray-800"
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
            onPress={onSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="white" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Botón Flotante para regresar al final (novedades) */}
        {showScrollButton && (
          <Animated.View style={[fabStyle, { position: 'absolute', bottom: 85, right: 16, zIndex: 10 }]}>
            <TouchableOpacity
              onPress={scrollToBottom}
              className="w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center border border-gray-200"
              style={{ elevation: 5 }}
            >
              <Ionicons name="chevron-down" size={20} color="#2563eb" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Este bloque invisible empuja la caja de texto hacia arriba sincronizándose con la animación del teclado nativo */}
        <Animated.View style={fakeView} />
      </View>
      {Platform.OS === "ios" && <KeyboardToolbar doneText="Listo"/>}
    </View>
  );
}
