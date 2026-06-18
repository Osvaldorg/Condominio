import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  interpolateColor,
  Extrapolation,
  SharedValue
} from "react-native-reanimated";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import { useAuthStore } from "../../auth/store/auth.store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  scrollY: SharedValue<number>;
}

export function HomeHeader({ scrollY }: HomeHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();

  const displayName = user?.nombre
    ? `${user.nombre} ${user.apellido ?? ""}`.trim()
    : "Residente";

  // En una app real, el nombre de la calle/torre vendría del objeto domicilio o una búsqueda por ID
  // Si la referencia contiene " - ", la dividimos en Residencial y Calle
  const fullRef = user?.residente?.domicilio?.referencia || "Condominio";
  const [resName, streetPart] = fullRef.includes(" - ") 
    ? fullRef.split(" - ") 
    : [fullRef, "Calle Principal"];

  const unitNumber = user?.residente?.domicilio?.numero || "S/N";
  const streetAndUnit = `${streetPart} • Unidad ${unitNumber}`;

  // Animations
  const headerContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 50],
      ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"]
    );

    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 0.12],
      Extrapolation.CLAMP
    );

    const paddingTop = interpolate(
      scrollY.value,
      [0, 50],
      [insets.top + 35, insets.top + 12],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor,
      paddingTop,
      shadowOpacity,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      elevation: scrollY.value > 50 ? 6 : 0,
    };
  });

  const greetingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP);
    const height = interpolate(scrollY.value, [0, 40], [72, 0], Extrapolation.CLAMP); // Ajustado para unificar con la dirección
    const marginBottom = interpolate(scrollY.value, [0, 40], [0, 0], Extrapolation.CLAMP); // Eliminado para efecto de párrafo único

    return {
      opacity,
      height,
      marginBottom,
    };
  });

  // El "Hola," ahora es más grande pero se queda visible de forma compacta
  const holaStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 50], [18, 12], Extrapolation.CLAMP);
    const marginBottom = interpolate(scrollY.value, [0, 50], [2, 0], Extrapolation.CLAMP);

    return {
      fontSize,
      marginBottom,
    };
  });

  const resNameStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 50], [18, 16], Extrapolation.CLAMP);
    const color = interpolateColor(scrollY.value, [0, 50], ["#475569", "#171717"]);

    return {
      fontSize,
      color,
      marginBottom: interpolate(scrollY.value, [0, 50], [2, 0], Extrapolation.CLAMP),
    };
  });

  const streetUnitStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 50], [16, 14], Extrapolation.CLAMP);
    const color = interpolateColor(scrollY.value, [0, 50], ["#64748b", "#737373"]);

    return {
      fontSize,
      color,
    };
  });

  return (
    <Animated.View 
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 15, zIndex: 100 },
        headerContainerStyle
      ]}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Animated.View style={[{ overflow: 'hidden' }, greetingStyle]}>
            <Animated.Text 
              style={[
                { color: '#64748b', fontWeight: '700' },
                holaStyle
              ]}
            >
              Hola,
            </Animated.Text>
            <Text className="text-[30px] font-extrabold text-neutral-900 leading-none">
              {displayName}
            </Text>
          </Animated.View>
          
          <View className="flex-col">
            <Animated.Text 
              numberOfLines={1}
              style={[{ fontWeight: '800', letterSpacing: -0.6 }, resNameStyle]}
            >
              {resName}
            </Animated.Text>
            <Animated.Text 
              numberOfLines={1}
              style={[{ fontWeight: '600', letterSpacing: -0.3 }, streetUnitStyle]}
            >
              {streetAndUnit}
            </Animated.Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/account")}
          className="w-11 h-11 rounded-full bg-blue-100 border border-blue-200 items-center justify-center active:opacity-70 ml-4"
          style={{ 
            shadowColor: '#2563eb', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.15, 
            shadowRadius: 10,
            elevation: 2
          }}
        >
          <Text className="text-base font-bold text-blue-700">
             {displayName[0]?.toUpperCase() || "R"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
