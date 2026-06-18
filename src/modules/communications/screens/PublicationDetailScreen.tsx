import { useRouter, Stack } from "expo-router";
import { 
  Pressable, 
  ScrollView, 
  Text, 
  View, 
  ActivityIndicator, 
  Share, 
  Alert,
  Dimensions,
  Platform
} from "react-native";
import { useEffect, useMemo } from "react";
import { usePublications } from "../hooks/usePublications";
import { usePublicationById } from "../hooks/usePublicationsById";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function PublicationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { publication } = usePublicationById();
  const { refresh, loading } = usePublications();

  useEffect(() => {
    if (!publication) {
      refresh();
    }
  }, [publication, refresh]);

  // Colores dinámicos según el tipo de publicación
  const theme = useMemo(() => {
    if (!publication) return { main: "#f3f4f6", secondary: "#e5e7eb", text: "#374151", bg: "bg-neutral-50" };
    
    switch (publication.tipo) {
      case 'emergencia':
        return { main: "#ef4444", secondary: "#fee2e2", text: "#991b1b", bg: "bg-red-50", icon: "alert-decagram" };
      case 'anuncio':
        return { main: "#3b82f6", secondary: "#dbeafe", text: "#1e40af", bg: "bg-blue-50", icon: "bullhorn" };
      case 'evento_comunidad':
        return { main: "#8b5cf6", secondary: "#ede9fe", text: "#5b21b6", bg: "bg-purple-50", icon: "calendar-star" };
      default:
        return { main: "#10b981", secondary: "#d1fae5", text: "#065f46", bg: "bg-emerald-50", icon: "newspaper-variant-outline" };
    }
  }, [publication]);

  const onShare = async () => {
    if (!publication) return;
    try {
      const result = await Share.share({
        title: publication.titulo,
        message: `${publication.titulo}\n\n${publication.contenido}\n\nEnviado desde Condominio App`,
        url: publication.adjunto_url || undefined,
      });
      if (result.action === Share.sharedAction) {
        // compartido
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo compartir el contenido");
    }
  };

  if (loading && !publication) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ title: "Comunicado" }} />
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-neutral-500 mt-4 font-medium">Cargando...</Text>
      </View>
    );
  }

  if (!publication) {
    return (
      <View className="flex-1 bg-white px-5 items-center justify-center">
        <Stack.Screen options={{ title: "Comunicado" }} />
        <Text className="text-xl font-bold text-neutral-800 mb-2">Publicación no encontrada</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-black px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const dateObj = new Date(publication.fecha_publicacion);
  const dayName = dateObj.toLocaleDateString("es-MX", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("es-MX", { month: "short" });
  const time = dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  const hasImage = !!publication.adjunto_url && 
    (publication.adjunto_url.endsWith('.jpg') || publication.adjunto_url.endsWith('.png') || publication.adjunto_url.endsWith('.jpeg'));

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{ 
          title: "",
          headerTransparent: true,
          headerTintColor: "#fff", // Siempre blanco para contrastar con imagen o fondo de color
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              className="ml-2 p-2 rounded-full bg-black/20"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={onShare} 
              className="mr-2 p-2 rounded-full bg-black/20"
            >
              <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
            </Pressable>
          )
        }} 
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Hero */}
        <View className="relative w-full h-[320px] overflow-hidden">
          {hasImage ? (
            <ExpoImage 
              source={{ uri: publication.adjunto_url }} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View 
              style={{ backgroundColor: theme.main }} 
              className="w-full h-full items-center justify-center"
            >
              <MaterialCommunityIcons name={theme.icon as any} size={120} color="rgba(255,255,255,0.2)" />
              <View className="absolute inset-0 bg-black/10" />
            </View>
          )}

          {/* Type Badge on Image */}
          <View 
            className="absolute bottom-6 left-6 px-4 py-2 rounded-2xl flex-row items-center space-x-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <MaterialCommunityIcons name={theme.icon as any} size={18} color={theme.main} />
            <Text className="font-bold text-[13px] uppercase tracking-wider" style={{ color: theme.main }}>
              {publication.tipo.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Content Container */}
        <View 
          className="flex-1 bg-white -mt-6 rounded-t-[32px] px-6 pt-8"
          style={{ minHeight: Dimensions.get('window').height - 200 }}
        >
          {/* Metadata Row */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="bg-neutral-100 p-3 rounded-2xl items-center justify-center mr-4 w-[60px]">
                <Text className="text-[10px] text-neutral-400 font-bold uppercase">{dayName}</Text>
                <Text className="text-xl font-bold text-neutral-900">{dayNum}</Text>
                <Text className="text-[10px] text-neutral-400 font-bold uppercase">{monthName}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-neutral-900">Comunicado Oficial</Text>
                <View className="flex-row items-center mt-0.5">
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#9ca3af" />
                  <Text className="text-sm text-neutral-400 ml-1 font-medium">{time} • {publication.prioridad}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-extrabold text-neutral-900 mb-6 leading-9">
            {publication.titulo}
          </Text>

          {/* Content */}
          <View className="mb-10">
            <Text className="text-lg text-neutral-600 leading-8">
              {publication.contenido}
            </Text>
          </View>

          {/* Author Card */}
          <View className="p-5 bg-neutral-50 rounded-[28px] border border-neutral-100 mb-10">
            <View className="flex-row items-center">
              <View 
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.secondary }}
              >
                <Text className="font-bold text-xl" style={{ color: theme.main }}>
                  {typeof publication.usuario_id === 'object' 
                    ? (publication.usuario_id as any).nombre?.charAt(0).toUpperCase() 
                    : 'A'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Publicado por</Text>
                <Text className="text-lg font-bold text-neutral-900">
                  {typeof publication.usuario_id === 'object' 
                    ? `${(publication.usuario_id as any).nombre} ${(publication.usuario_id as any).apellido || ''}` 
                    : "Administración"}
                </Text>
              </View>
            </View>
          </View>

          {/* Extra Documents if any (not image) */}
          {publication.adjunto_url && !hasImage && (
            <Pressable 
              onPress={() => Share.share({ url: publication.adjunto_url! })}
              className="flex-row items-center p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-10"
            >
              <View className="bg-blue-600 p-2 rounded-xl mr-4">
                <MaterialCommunityIcons name="file-document-outline" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-blue-900">Documento Adjunto</Text>
                <Text className="text-sm text-blue-700">Toca para abrir o descargar</Text>
              </View>
              <MaterialCommunityIcons name="download" size={20} color="#2563eb" />
            </Pressable>
          )}

          <View style={{ height: insets.bottom + 40 }} />
        </View>
      </ScrollView>

      {/* Bottom Action (Optional) */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white/80 border-t border-neutral-100 p-6 flex-row items-center justify-between"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Text className="text-neutral-400 text-sm font-medium">¿Leíste este comunicado?</Text>
        <Pressable 
          onPress={() => router.back()}
          className="bg-black px-6 py-3 rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-bold">Entendido</Text>
        </Pressable>
      </View>
    </View>
  );
}
