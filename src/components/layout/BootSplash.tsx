import { ActivityIndicator, Image, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export function BootSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      {/* Animated Logo Container */}
      <Animated.View 
        entering={FadeIn.duration(1000)}
        className="items-center justify-center mb-8"
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 120, height: 120, borderRadius: 24 }}
          resizeMode="contain"
          accessibilityLabel="Logo de la aplicación"
        />
        
        <Animated.View entering={FadeInDown.delay(300).duration(800)}>
          <Text className="text-2xl font-bold text-neutral-900 mt-6 tracking-tight">
            App Condominio
          </Text>
          <Text className="text-neutral-500 text-sm mt-1 font-medium">
            Gestiona tu hogar fácil y rápido
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View 
        entering={FadeIn.delay(800).duration(500)}
        className="absolute bottom-20 items-center"
      >
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-xs text-neutral-400 mt-3 font-medium tracking-wide border-t border-neutral-100 pt-3">
          Cargando recursos...
        </Text>
      </Animated.View>
    </View>
  );
}
