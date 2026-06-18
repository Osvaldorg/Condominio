import React from "react";
import { View, Text } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler 
} from "react-native-reanimated";
import { PublicationsCarousel } from "../../communications/components/PublicationsCarousel";
import { HomeHeader } from "../components/HomeHeader";
import { HomeQuickActions } from "../components/HomeQuickActions";
import { HomeFinances } from "../../finances/components/HomeFinances";
import { ReceptionStatusCard } from "../components/ReceptionStatusCard";

export default function HomeScreen() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View className="flex-1 bg-white">
      <HomeHeader scrollY={scrollY} />
      
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 60,
          paddingTop: 190 // Aumentado para dar cabida al nuevo padding expandido del header (antes 160)
        }}
      >
        {/* Finanzas Section */}
        <HomeFinances />

        {/* Reception Status Section */}
        <View className="px-5 mb-3 mt-4">
          <Text className="text-h2">Estado de recepción</Text>
        </View>
        <ReceptionStatusCard />

        <HomeQuickActions />

        <View className="px-5 flex-row items-center justify-between mb-3 mt-4">
          <Text className="text-h2">Novedades</Text>
        </View>

        <PublicationsCarousel />
      </Animated.ScrollView>
    </View>
  );
}
